import { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces matching Riot API structure
export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummoner {
  id: string; // Encrypted Summoner ID
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RiotRank {
  leagueId: string;
  queueType: string; // RANKED_SOLO_5x5
  tier: string;      // GOLD
  rank: string;      // IV
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface MatchData {
  id: string;
  championName: string;
  championId: string;
  role: 'TOP' | 'JUNGLE' | 'MID' | 'ADC' | 'SUPPORT';
  win: boolean;
  kda: { k: number; d: number; a: number };
  cs: number;
  csPerMin: number;
  visionScore: number;
  gameDuration: number;
  timestamp: number;
  items: number[];
  damageDealt?: number;
  goldEarned?: number;
}

export function useRiotApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize state from localStorage if available
  const [account, setAccount] = useState<RiotAccount | null>(() => {
    const saved = localStorage.getItem('riot_account');
    return saved ? JSON.parse(saved) : null;
  });
  const [summoner, setSummoner] = useState<RiotSummoner | null>(() => {
    const saved = localStorage.getItem('riot_summoner');
    return saved ? JSON.parse(saved) : null;
  });
  const [ranks, setRanks] = useState<RiotRank[]>([]);
  const [matches, setMatches] = useState<MatchData[]>([]);

  // Persist account/summoner changes
  useEffect(() => {
    if (account) localStorage.setItem('riot_account', JSON.stringify(account));
    else localStorage.removeItem('riot_account');
  }, [account]);

  useEffect(() => {
    if (summoner) localStorage.setItem('riot_summoner', JSON.stringify(summoner));
    else localStorage.removeItem('riot_summoner');
  }, [summoner]);

  const PROXY_URL = 'http://localhost:3001/api';

  // Helper to transform Riot Match DTO to our Dashboard MatchData
  const transformMatchData = (riotMatch: any, puuid: string): MatchData | null => {
    const participant = riotMatch.info.participants.find((p: any) => p.puuid === puuid);
    if (!participant) return null;

    const durationMin = riotMatch.info.gameDuration / 60;
    const cs = participant.totalMinionsKilled + participant.neutralMinionsKilled;
    
    // Simple Role Mapping
    let role: any = 'MID';
    const pRole = participant.teamPosition;
    if (pRole === 'TOP') role = 'TOP';
    else if (pRole === 'JUNGLE') role = 'JUNGLE';
    else if (pRole === 'MIDDLE') role = 'MID';
    else if (pRole === 'BOTTOM') role = 'ADC';
    else if (pRole === 'UTILITY') role = 'SUPPORT';

    return {
      id: riotMatch.metadata.matchId,
      championName: participant.championName,
      championId: participant.championName, // Using name as ID for now
      role: role,
      win: participant.win,
      kda: { 
        k: participant.kills, 
        d: participant.deaths, 
        a: participant.assists 
      },
      cs: cs,
      csPerMin: parseFloat((cs / durationMin).toFixed(1)),
      visionScore: participant.visionScore,
      gameDuration: riotMatch.info.gameDuration,
      timestamp: riotMatch.info.gameEndTimestamp,
      items: [
        participant.item0, participant.item1, participant.item2,
        participant.item3, participant.item4, participant.item5, participant.item6
      ],
      damageDealt: participant.totalDamageDealtToChampions,
      goldEarned: participant.goldEarned
    };
  };

  const fetchSummonerData = async (gameName: string, tagLine: string) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get Account (PUUID)
      const accRes = await axios.get(`${PROXY_URL}/account/${gameName}/${tagLine}`);
      const accData = accRes.data;
      setAccount(accData);

      // Infer Region from Tag
      let region = 'la1';
      const tagLower = tagLine.toLowerCase();
      if (tagLower.includes('euw')) region = 'euw1';
      else if (tagLower.includes('kr')) region = 'kr';
      else if (tagLower.includes('na')) region = 'na1';
      else if (tagLower.includes('lan')) region = 'la1';
      else if (tagLower.includes('las')) region = 'la2';
      else if (tagLower.includes('br')) region = 'br1';

      // 2. Get Summoner (ID + Level + Icon from Fallback)
      const sumRes = await axios.get(`${PROXY_URL}/summoner/${accData.puuid}?region=${region}`);
      const sumData = sumRes.data;
      setSummoner(sumData);

      // 3. Get Rank (Graceful Fallback + Scraping)
      let fetchedRanks: RiotRank[] = [];
      if (sumData.id) {
        try {
            const rankRes = await axios.get(`${PROXY_URL}/rank/${sumData.id}?region=${region}`);
            fetchedRanks = rankRes.data;
        } catch (e) {
            console.warn('Rank fetch failed, continuing...');
        }
      }

      // FALLBACK: If API says Unranked but Level is high (>30), try Scraping
      // Riot Dev Key often hides Master+ players
      const hasRankedData = fetchedRanks.some(r => r.queueType === 'RANKED_SOLO_5x5');
      if (!hasRankedData && sumData.summonerLevel > 30) {
        console.log('[FALLBACK] High level unranked detected, attempting scrape...');
        try {
            // Need generic region code for scraping (na1 -> na)
            const scrapeRes = await axios.get(`${PROXY_URL}/scrape-rank/${region}/${accData.gameName}/${accData.tagLine}`);
            if (scrapeRes.data && scrapeRes.data.length > 0) {
                console.log('[FALLBACK] Scrape success:', scrapeRes.data);
                const scrapedData = scrapeRes.data[0];
                fetchedRanks = [...fetchedRanks, scrapedData];
                
                // Update Summoner Level if scraped
                if (scrapedData.scrapedLevel && scrapedData.scrapedLevel > 0) {
                    setSummoner(prev => prev ? ({ ...prev, summonerLevel: scrapedData.scrapedLevel }) : prev);
                }
            }
        } catch (scrapeErr) {
            console.warn('[FALLBACK] Scrape failed:', scrapeErr);
        }
      }

      // 4. Get Match History
      let validMatches: MatchData[] = [];
      try {
        const matchesRes = await axios.get(`${PROXY_URL}/matches/${accData.puuid}?region=${region}`);
        const rawMatches = matchesRes.data;
        validMatches = rawMatches
            .map((m: any) => transformMatchData(m, accData.puuid))
            .filter((m: any) => m !== null) as MatchData[];
        
        setMatches(validMatches);
      } catch (e) {
        console.warn('Match history fetch failed', e);
      }

      // 5. Calculate Advanced Stats from ALL 20 Matches
      if (validMatches.length > 0) {
        const totalGames = validMatches.length;
        const totalWins = validMatches.filter(m => m.win).length;
        
        let totalK = 0, totalD = 0, totalA = 0;
        let totalCS = 0, totalVision = 0;
        let totalDamage = 0, totalGold = 0, totalDuration = 0; // Duration in minutes
        
        validMatches.forEach(m => {
            totalK += m.kda.k;
            totalD += m.kda.d;
            totalA += m.kda.a;
            totalCS += m.cs;
            totalVision += m.visionScore;
            totalDamage += m.damageDealt || 0;
            totalGold += m.goldEarned || 0;
            totalDuration += (m.gameDuration / 60);
        });

        // Safe Division
        const avgD = totalD === 0 ? 1 : totalD;
        const avgDuration = totalDuration === 0 ? 1 : totalDuration;

        const calculatedStats = {
            kdaRatio: ((totalK + totalA) / avgD).toFixed(2),
            kda: `${(totalK/totalGames).toFixed(1)} / ${(totalD/totalGames).toFixed(1)} / ${(totalA/totalGames).toFixed(1)}`,
            winrate: Math.round((totalWins / totalGames) * 100),
            csPerMin: (totalCS / avgDuration).toFixed(1),
            visionPerMin: (totalVision / avgDuration).toFixed(1),
            damagePerMin: Math.round(totalDamage / avgDuration),
            goldPerMin: Math.round(totalGold / avgDuration),
            // Mock KP for now as obtaining Team Kills requires full participant analysis
            // But we can approximate using K+A vs typical game kills or just user participation
            kp: Math.round(((totalK + totalA) / (totalK + totalA + (totalD * 1.5))) * 100) // Rough Heuristic fallback
        };

        // Fallback Rank Object (If Rank API Failed or Unranked)
        if (fetchedRanks.length === 0 || fetchedRanks.some(r => r.tier === 'UNRANKED')) {
             // Remove existing unranked if any
             fetchedRanks = fetchedRanks.filter(r => r.tier !== 'UNRANKED');
             
             fetchedRanks.push({
                leagueId: 'calculated-stats',
                queueType: 'RANKED_SOLO_5x5',
                tier: 'UNRANKED', 
                rank: '',
                summonerId: sumData.id,
                summonerName: accData.gameName,
                leaguePoints: 0,
                wins: totalWins,
                losses: totalGames - totalWins,
                veteran: false,
                inactive: false,
                freshBlood: false,
                hotStreak: calculatedStats.winrate > 60,
                // Attach our calculated stats to the rank object for UI consumption
                // @ts-ignore
                stats: calculatedStats 
            });
        } else {
             // Attach stats to existing rank if valid
             // @ts-ignore
             fetchedRanks[0].stats = calculatedStats;
        }
      }

      setRanks(fetchedRanks);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch Riot data');
    } finally {
      setLoading(false);
    }
  };

  const getSoloQueueRank = () => {
    return ranks.find(r => r.queueType === 'RANKED_SOLO_5x5');
  };

  return {
    loading,
    error,
    account,
    summoner,
    ranks,
    matches: matches.slice(0, 5), // Only expose top 5 for history list
    getSoloQueueRank,
    fetchSummonerData,
    disconnect: () => {
      setAccount(null);
      setSummoner(null);
      setRanks([]);
      setMatches([]);
      setError(null);
    }
  };
}
