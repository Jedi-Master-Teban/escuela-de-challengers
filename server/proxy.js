const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
// Ensure CWD is the server directory so log files are written here, not in project root (which triggers Vite)
try {
  process.chdir(__dirname);
  console.log(`[PROXY] Changed CWD to: ${process.cwd()}`);
} catch (err) {
  console.error('[PROXY] Failed to change CWD:', err);
}

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: restrict to the local dev frontend or a configurable production origin
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: false,
}));
app.use(express.json());

const RIOT_API_KEY = process.env.RIOT_API_KEY;

// Region to Routing Platform Mapping
const PLATFORM_ROUTING = {
  'americas': ['na1', 'br1', 'la1', 'la2'],
  'asia': ['kr', 'jp1'],
  'europe': ['eun1', 'euw1', 'tr1', 'ru']
};

const getCluster = (tagLine) => {
  const tag = tagLine.toLowerCase();
  if (['euw', 'eune', 'tr', 'ru', 'eu'].some(t => tag.includes(t))) return 'europe';
  if (['kr', 'jp', 'tw', 'ph', 'sg', 'th', 'vn'].some(t => tag.includes(t))) return 'asia';
  return 'americas'; // Default
};

// Middleware to check Key
const checkKey = (req, res, next) => {
  if (!RIOT_API_KEY) {
    return res.status(500).json({ error: 'Riot API Key not configured in server' });
  }
  next();
};

// 1. Get Account by Riot ID -> Returns PUUID
app.get('/api/account/:gameName/:tagLine', checkKey, async (req, res) => {
  try {
    const { gameName, tagLine } = req.params;
    const cluster = getCluster(tagLine); // Dynamic Cluster
    console.log(`Fetching Account for ${gameName}#${tagLine} from ${cluster}`);
    
    const response = await axios.get(
      `https://${cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching account:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch account' });
  }
});

const fs = require('fs');

// Helper to get Cluster from Platform (Region)
const getClusterFromRegion = (region) => {
  if (['euw1', 'eun1', 'tr1', 'ru'].includes(region)) return 'europe';
  if (['kr', 'jp1'].includes(region)) return 'asia';
  return 'americas';
};

// 2. Get Summoner by PUUID
app.get('/api/summoner/:puuid', checkKey, async (req, res) => {
  try {
    const { puuid } = req.params;
    const region = req.query.region || 'la1'; 
    
    // 1. Try Standard Summoner-V4
    let summonerData;
    try {
      const response = await axios.get(
        `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        { headers: { 'X-Riot-Token': RIOT_API_KEY } }
      );
      summonerData = response.data;
    } catch (e) {
      // If 404, throwing is correct. If 403, maybe Key issue.
      throw e;
    }

    // 2. Fallback: If ID is missing, try Match-V5
    if (!summonerData.id) {
      console.log('ID missing in Summoner-V4, trying Match-V5 fallback...');
      try {
        const cluster = getClusterFromRegion(region);
        
        // Get Last Match ID
        const matchIdsRes = await axios.get(
          `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=1`,
          { headers: { 'X-Riot-Token': RIOT_API_KEY } }
        );
        const matchId = matchIdsRes.data[0];

        if (matchId) {
           // Get Match Details
           const matchRes = await axios.get(
             `https://${cluster}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
             { headers: { 'X-Riot-Token': RIOT_API_KEY } }
           );
           
           // Find Participant
           const participant = matchRes.data.info.participants.find(p => p.puuid === puuid);
           if (participant) {
             if (participant.summonerId) {
                console.log('Recovered Summoner ID:', participant.summonerId);
                summonerData.id = participant.summonerId;
             }
             // Recover other fields if missing/redacted
             if (!summonerData.summonerLevel) summonerData.summonerLevel = participant.summonerLevel;
             if (!summonerData.profileIconId) summonerData.profileIconId = participant.profileIcon;
           }
        }
      } catch (err) {
        console.error('Fallback failed:', err.message);
      }
    }

    res.json(summonerData);

  } catch (error) {
    console.error('Error fetching summoner:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Failed to fetch summoner' });
  }
});

// 3. Get Rank by Summoner ID (Graceful Failure)
app.get('/api/rank/:encryptedSummonerId', checkKey, async (req, res) => {
  try {
    const { encryptedSummonerId } = req.params;
    const region = req.query.region || 'la1';
    const response = await axios.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${encryptedSummonerId}`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    res.json(response.data);
  } catch (error) {
    // Log error to file for debugging
    const encId = req.params.encryptedSummonerId;
    const reg = req.query.region || 'la1';
    const errorMsg = `[RANK ERROR] ${new Date().toISOString()} - ${encId} (${reg}): ${error.response?.status} ${JSON.stringify(error.response?.data)}\n`;
    // fs.appendFileSync('proxy.log', errorMsg); // DISABLED: Triggers Vite Reload
    
    console.error('Error fetching rank:', error.response?.data || error.message);
    res.json([]); 
  }
});

// 4. Get Match History by PUUID
app.get('/api/matches/:puuid', checkKey, async (req, res) => {
  try {
    const { puuid } = req.params;
    const region = req.query.region || 'la1';
    const cluster = getClusterFromRegion(region);

    // 1. Get List of Match IDs (Reduced to 10 for Dev Key safety)
    const idsRes = await axios.get(
      `https://${cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`,
      { headers: { 'X-Riot-Token': RIOT_API_KEY } }
    );
    const matchIds = idsRes.data;

    // 2. Fetch Details SEQUENTIALLY to avoid Rate Limits (429)
    // Dev Keys: 20 req/1s. Parallel 20 + overhead causes failures.
    const matches = [];
    for (const id of matchIds) {
        try {
            const r = await axios.get(`https://${cluster}.api.riotgames.com/lol/match/v5/matches/${id}`, { 
                headers: { 'X-Riot-Token': RIOT_API_KEY } 
            });
            matches.push(r.data);
            // Small delay to be safe
            await new Promise(resolve => setTimeout(resolve, 50)); 
        } catch (e) {
             console.error(`Failed to fetch match ${id}:`, e.response?.status || e.message);
        }
    }

    res.json(matches);

  } catch (error) {
    console.error('Error fetching matches:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: 'Failed to fetch matches' });
  }

});

// 5. Scrape Rank Fallback (Puppeteer)
const puppeteer = require('puppeteer');

app.get('/api/scrape-rank/:region/:name/:tag', checkKey, async (req, res) => {
  const { region, name, tag } = req.params;
  // 1. Correct Regional Mapping for OP.GG
  const regionMap = {
    'na1': 'na',
    'euw1': 'euw',
    'eun1': 'eune',
    'kr': 'kr',
    'br1': 'br',
    'jp1': 'jp',
    'ru': 'ru',
    'oc1': 'oce',
    'tr1': 'tr',
    'la1': 'lan',
    'la2': 'las',
    'ph2': 'ph',
    'sg2': 'sg',
    'th2': 'th',
    'tw2': 'tw',
    'vn2': 'vn'
  };

  const opggRegion = regionMap[region.toLowerCase()] || region.replace(/\d+$/, ''); 
  // Force English to ensure "Ranked Solo/Duo" search works
  const url = `https://www.op.gg/summoners/${opggRegion}/${name}-${tag}?hl=en_US`;

  console.log(`[SCRAPE] Starting scraping for ${name}#${tag} at ${url}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    const page = await browser.newPage();
    
    // Set User Agent and Language to English to avoid localization issues
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9'
    });
    
    // Optimizations: Block images/fonts
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log(`[SCRAPE] Page loaded (domcontentloaded): ${page.url()}`);
        
        // Wait for body to ensure basic DOM
        await page.waitForSelector('body', { timeout: 10000 });
        // Slight delay for hydration
        await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
        console.error('[SCRAPE] Navigation failed:', e.message);
        await browser.close();
        res.json([]);
        return;
    }

    // Scrape Data via DOM evaluation (more robust than regex on potentially detached frame content)
    let finalData = null;
    
    // Retry loop to handle "Execution context was destroyed" or hydration delays
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            finalData = await page.evaluate(() => {
                // Helper to find level
                // Verified HTML: <span class="... leading-5 text-white">718</span>
                const levelEl = document.querySelector('span[class*="leading-5"][class*="text-white"]');
                const scrapedLevel = levelEl ? parseInt(levelEl.innerText) : 0;

                // Helper to find Rank Section
                const sections = Array.from(document.querySelectorAll('section'));
                // Find section containing "Ranked Solo/Duo"
                const soloSection = sections.find(s => s.innerText.includes('Ranked Solo/Duo'));
                
                if (!soloSection) return null;

                // Within Solo Section, find Tier (strong tag)
                const tierEl = soloSection.querySelector('strong');
                
                // Find LP: Validates that it's a leaf node to avoid "Gold 1 15 LP" concatenation
                const allLpCandidates = Array.from(soloSection.querySelectorAll('div, span'));
                const lpEl = allLpCandidates.find(el => 
                    el.innerText.includes('LP') && 
                    el.children.length === 0 && // LEAF NODE ONLY
                    el.innerText.length < 10 // "15 LP" is short
                );
                
                // Find Win/Loss
                const winLoseEl = Array.from(soloSection.querySelectorAll('div, span')).find(el => el.innerText.includes('W') && el.innerText.includes('L') && el.innerText.includes('Win rate'));
                
                if (tierEl) {
                    const tierText = tierEl.innerText.trim();
                    
                    // LP Parsing
                    let lp = 0;
                    if (lpEl) {
                        const match = lpEl.innerText.match(/(\d+)\s*LP/i);
                        if (match) {
                           lp = parseInt(match[1]);
                        }
                    }

                    let wins = 0;
                    let losses = 0;
                    if (winLoseEl) {
                        const match = winLoseEl.innerText.match(/(\d+)W\s+(\d+)L/);
                        if (match) {
                            wins = parseInt(match[1]);
                            losses = parseInt(match[2]);
                        }
                    }

                    return {
                        tierText,
                        lp,
                        wins,
                        losses,
                        scrapedLevel
                    };
                }
                return null;
            });
            
            if (finalData) break;
            
        } catch (e) {
            console.log(`[SCRAPE] Evaluate attempt ${attempt} failed:`, e.message);
            // Wait a bit before retrying
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    await browser.close();

    if (!finalData) {
        console.log('[SCRAPE] No data found in evaluate');
        res.json([]);
        return;
    }

    const { tierText, lp, wins, losses, scrapedLevel } = finalData;
    const parts = tierText.toUpperCase().split(' ');
    let tier = parts[0];
    let rank = parts[1] || 'I';

    if (['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(tier)) {
        rank = 'I';
    }

    const data = {
        tier,
        rank,
        leaguePoints: lp,
        wins,
        losses,
        queueType: 'RANKED_SOLO_5x5',
        scrapedLevel
    };

    console.log(`[SCRAPE] Success: ${data.tier} ${data.leaguePoints}LP Level:${data.scrapedLevel}`);
    res.json([data]);

  } catch (error) {
    console.error('[SCRAPE] Error:', error.message);
    const fs = require('fs');
    // fs.appendFileSync('scrape_error.log', `[${new Date().toISOString()}] ${error.message}\n`); // DISABLED: Triggers Vite Reload
    if (browser) await browser.close();
    res.json([]); // Fail silently -> Unranked
  }
});

// DDragon Rune Mapping
let runeIconMap = {}; 

async function loadRuneData() {
    try {
        const response = await axios.get('https://ddragon.leagueoflegends.com/cdn/15.3.1/data/en_US/runesReforged.json');
        const data = response.data;
        
        // Map: "Electrocute.png" -> 8112
        // Better: "Styles/Domination/Electrocute/Electrocute.png" -> 8112
        // The DDragon icon path is usually "perk-images/Styles/..."
        
        const processRune = (rune) => {
            // DDragon icon: "perk-images/Styles/Domination/Electrocute/Electrocute.png"
            const parts = rune.icon.split('/');
            const fileName = parts[parts.length - 1]; // "Electrocute.png"
            runeIconMap[fileName] = rune.id;
        };

        data.forEach(tree => {
            tree.slots.forEach(slot => {
                slot.runes.forEach(rune => processRune(rune));
            });
        });
        
        // Manual Shard Mapping (Shards are not in runesReforged.json usually)
        // Add both PNG and WEBP versions to be safe
        const shards = {
            'StatModsAdaptiveForceIcon': 5008,
            'StatModsAttackSpeedIcon': 5005,
            'StatModsCDRScalingIcon': 5007,
            'StatModsArmorIcon': 5002,
            'StatModsMagicResIcon': 5003,
            'StatModsHealthScalingIcon': 5001
        };
        
        Object.entries(shards).forEach(([key, id]) => {
            runeIconMap[`${key}.png`] = id;
            runeIconMap[`${key}.webp`] = id;
        });

        console.log(`[PROXY] Loaded ${Object.keys(runeIconMap).length} rune mappings.`);
        
    } catch (e) {
        console.error('[PROXY] Failed to load DDragon runes:', e.message);
    }
}
loadRuneData();

// 6. Scrape Builds (U.GG)
app.get('/api/scrape-builds/:champion/:role?', checkKey, async (req, res) => {
  const { champion, role } = req.params;
  const url = role 
    ? `https://u.gg/lol/champions/${champion}/build/${role}`
    : `https://u.gg/lol/champions/${champion}/build`;
  console.log(`[SCRAPE BUILD] Fetching build for ${champion} (${role || 'default'}) from ${url}`);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
      defaultViewport: { width: 1920, height: 1080 }
    });
    const page = await browser.newPage();
    
    // Capture browser logs (filtered)
    page.on('console', msg => {
        const text = msg.text();
        if (text.includes('groupEnd') || text.includes('groupStart') || text.includes('console.clear')) return;
        console.log('[BROWSER]', text);
    });

    // Optimization
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    // await page.setRequestInterception(true);
    // page.on('request', (req) => {
    //   // Block metrics/ads but allow essential scripts/images
    //   const type = req.resourceType();
    //   if (['stylesheet', 'font', 'media'].includes(type)) req.abort();
    //   else req.continue();
    // });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      // Wait for ANY rune image -> implies page loaded enough
      // Wait for build data or script tags to be ready
      await page.waitForFunction(() => {
          return document.querySelectorAll('img[src*="runes"], img[src*="perk-images"], img[src*="item"]').length > 5 || 
                 (window.__SSR_DATA__ && Object.keys(window.__SSR_DATA__).length > 0);
      }, { timeout: 15000 });
      
      // Auto-Scroll Iteratively to trigger lazy loading
      await page.evaluate(async () => {
          for (let i = 0; i < 50; i++) {
              window.scrollBy(0, 300);
              await new Promise(resolve => setTimeout(resolve, 100));
          }
      });
      // Small wait after scroll
      await new Promise(r => setTimeout(r, 2000));
      // Small wait after scroll
      await new Promise(r => setTimeout(r, 1000));

    } catch (e) {
      console.error('[SCRAPE BUILD] Navigation failed:', e.message);
      await browser.close();
      return res.status(500).json({ error: 'Failed to load U.GG' });
    }

    // Dump HTML for debugging (DISABLED: Triggers Vite Reload)
    /*
    try {
        const content = await page.content();
        // require('fs').writeFileSync('debug_page.html', content);
        console.log('[PROXY] Saved debug_page.html');
    } catch (err) {
        console.error('[PROXY] Failed to save debug HTML:', err.message);
    }
    */

    // Extract SSR Data from Script Tag
    const ssrData = await page.evaluate(() => {
        try {
            const scripts = Array.from(document.scripts);
            const targetScript = scripts.find(s => s.textContent && s.textContent.includes('window.__SSR_DATA__ ='));
            
            if (targetScript) {
                const content = targetScript.textContent;
                console.log('Found SSR Script. Length: ' + content.length);
                console.log('Script Start: ' + content.substring(0, 200));
                
                // Regex failed due to nested braces. Use brace counting.
                const startMarker = 'window.__SSR_DATA__ =';
                const idx = content.indexOf(startMarker);
                if (idx !== -1) {
                    let braceCount = 0;
                    let jsonStart = -1;
                    let jsonEnd = -1;
                    
                    for (let i = idx + startMarker.length; i < content.length; i++) {
                        const char = content[i];
                        if (char === '{') {
                            if (braceCount === 0) jsonStart = i;
                            braceCount++;
                        } else if (char === '}') {
                            braceCount--;
                            if (braceCount === 0) {
                                jsonEnd = i + 1;
                                break;
                            }
                        }
                    }
                    
                    
                    if (jsonStart !== -1 && jsonEnd !== -1) {
                        try {
                            const jsonStr = content.substring(jsonStart, jsonEnd);
                            console.log('Extracted JSON length: ' + jsonStr.length);
                            const parsed = JSON.parse(jsonStr);
                            const keys = Object.keys(parsed);
                            console.log('SSR Data Keys Count: ' + keys.length);
                            
                            // Find relevant key for this champion
                            // Key format: overview_emerald_plus_world_recommended::https://stats2.u.gg/lol/1.5/overview/16_3/ranked_solo_5x5/103/1.5.0.json
                            // We need to match the current champion ID from the URL or just find the one with 'overview' and 'ranked_solo_5x5'
                            
                            const buildKey = keys.find(k => k.includes('overview') && k.includes('ranked_solo_5x5') && !k.includes('ap-overview') && !k.includes('ad-overview'));
                            
                            if (buildKey && parsed[buildKey]) {
                                console.log('Found Extractable Build Key: ' + buildKey);
                                const data = parsed[buildKey];
                                
                                // data.data is our target object (regions/roles)
                                if (data.data) {
                                    const dynKeys = Object.keys(data.data);
                                    if (dynKeys.length > 0) {
                                        const inner = data.data[dynKeys[0]];
                                        
                                        // Extract Items
                                        let finalCore = [];
                                        let finalBoots = [];
                                        let ssrItems = []; // Temp collector for uniqueness check
                                        
                                        // 1. Core Items (Highest priority)
                                        if (inner.rec_core_items && inner.rec_core_items.ids) {
                                            console.log('Core Items found:', inner.rec_core_items.ids);
                                            ssrItems = [...inner.rec_core_items.ids];
                                            finalCore = [...inner.rec_core_items.ids];
                                        } else {
                                            console.log('No Core Items found in rec_core_items');
                                        }
                                        
                                        // 2. Boots (Essential)
                                        if (inner.rec_boots && inner.rec_boots.ids && inner.rec_boots.ids.length > 0) {
                                            const bootId = inner.rec_boots.ids[0];
                                            if (!ssrItems.includes(bootId)) {
                                                ssrItems.push(bootId);
                                                finalBoots.push(bootId);
                                            }
                                        }

                                        // 3. Option Sets (Filling up to 6+)
                                        // U.GG usually has item_options_1 (mythic/rush), item_options_2, item_options_3
                                        ['item_options_1', 'item_options_2', 'item_options_3', 'situational_items'].forEach(key => {
                                            const options = inner[key];
                                            if (options && options.ids) {
                                                console.log(`Found options in ${key}:`, options.ids);
                                                options.ids.forEach(id => {
                                                    if (!ssrItems.includes(id)) ssrItems.push(id);
                                                });
                                            } else if (Array.isArray(options)) {
                                                console.log(`Found array options in ${key}:`, options);
                                                // Sometimes it's an array of objects
                                                options.forEach(opt => {
                                                    const id = opt.id || opt;
                                                    if (id && !ssrItems.includes(id)) {
                                                        ssrItems.push(id);
                                                        finalCore.push(id); // Add to core/full build
                                                    }
                                                });
                                            }
                                        });

                                        // Ensure unique and filtered
                                        const beforeFilter = ssrItems.length;
                                        ssrItems = [...new Set(ssrItems)].filter(id => id > 1000); 
                                        console.log(`Items after merge: ${beforeFilter} -> After filter: ${ssrItems.length}`, ssrItems); 

                                        // Extract Runes
                                        let ssrRunes = [];
                                        if (inner.rec_runes && inner.rec_runes.active_perks) {
                                            ssrRunes = [...inner.rec_runes.active_perks];
                                        }
                                        if (inner.stat_shards && inner.stat_shards.active_shards) {
                                            ssrRunes = [...ssrRunes, ...inner.stat_shards.active_shards];
                                        }

                                        // Ensure numeric
                                        ssrRunes = ssrRunes.map(Number).filter(id => !isNaN(id));

                                        // Winrate
                                        let wr = inner.win_rate || (inner.rec_core_items ? inner.rec_core_items.win_rate : 'N/A');

                                        return {
                                            items: {
                                                core: [...new Set(finalCore)].filter(id => id > 1000).slice(0, 6), // Limit to 6 items max for core
                                                boots: finalBoots,
                                                situational: [] // We merged everything into core for "Full Build" view
                                            },
                                            runes: ssrRunes,
                                            winrate: wr
                                        };
                                    }
                                }
                            }
                            return null;
                        } catch (e) {
                            console.error('JSON Parse error:', e.message);
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Failed to parse SSR script:', e);
        }
        return null;
    });

    let finalItems = { core: [], boots: [], situational: [] };
    let finalRuneIds = [];
    let finalWinrate = 'N/A';

    if (ssrData && ssrData.items && ssrData.runes) {
        console.log('[PROXY] Using SSR Data for Build');
        finalItems = ssrData.items; // Already structured as {core, boots, situational}
        finalRuneIds = ssrData.runes;
        finalWinrate = ssrData.winrate ? `${ssrData.winrate}% WR` : 'N/A';
        
        // Post-process: auto-detect boots in core array if boots is empty
        // Known boot item IDs in League of Legends
        const BOOT_IDS = [
            1001, // Boots
            3006, // Berserker's Greaves
            3009, // Boots of Swiftness
            3020, // Sorcerer's Shoes
            3047, // Plated Steelcaps
            3111, // Mercury's Treads
            3117, // Mobility Boots
            3158, // Ionian Boots of Lucidity
        ];
        
        if (finalItems.boots.length === 0) {
            const bootsInCore = finalItems.core.filter(id => BOOT_IDS.includes(id));
            if (bootsInCore.length > 0) {
                finalItems.boots = bootsInCore;
                finalItems.core = finalItems.core.filter(id => !BOOT_IDS.includes(id));
                console.log(`[PROXY] Moved ${bootsInCore.length} boot(s) from core to boots:`, bootsInCore);
            }
        }
    } else {
        console.log('[PROXY] SSR Data missing or incomplete, falling back to DOM (legacy)');
    }
    
    // Legacy DOM Access (only if SSR failed, or to supplement)
    // We will overwrite rawBuildData with SSR data if available
    
    const domBuildData = await page.evaluate(() => {
        // ... (Existing DOM logic, can stay as is for now)
        return {}; // Return empty to prevent conflict if we use SSR
    });

    if (ssrData && ssrData.items) {
          // Detect the actual role from the final page URL
          let detectedRole = role || null;
          try {
            const finalUrl = page.url();
            // U.GG URLs: /lol/champions/{champ}/build/{role}  or  /lol/champions/{champ}/build
            const roleMatch = finalUrl.match(/\/build\/([a-z_-]+)/i);
            if (roleMatch && roleMatch[1]) {
              const roleMap = {
                'top': 'Top', 'jungle': 'Jungle', 'mid': 'Mid', 'middle': 'Mid',
                'adc': 'Adc', 'support': 'Support', 'bot': 'Adc', 'supp': 'Support'
              };
              detectedRole = roleMap[roleMatch[1].toLowerCase()] || roleMatch[1];
            }
          } catch (e) {
            console.warn('[PROXY] Could not detect role from URL');
          }

          const response = {
            runeIds: finalRuneIds,
            items: finalItems,
            itemIds: [...(finalItems.core || []), ...(finalItems.boots || []), ...(finalItems.situational || [])],
            winrate: finalWinrate,
            role: detectedRole,
          };
          console.log('[SCRAPE BUILD] Helper Success (SSR):', response);
          await browser.close();
          return res.json(response);
    }
    
    const rawBuildData = await page.evaluate(() => {
        // --- RUNES ---
        // Robust active check: check element and parents for 'active' or 'perk-active'
        const isNodeActive = (node) => {
            if (!node) return false;
            if (node.classList && (
                node.classList.contains('active') || 
                node.classList.contains('perk-active') || 
                node.classList.contains('rune-active') || 
                node.classList.contains('shard-active') ||
                node.classList.contains('selected-shard')
            )) return true;
            return false;
        };

        const getAllActivePerks = () => {
             // Grab every possible rune image (U.GG uses runes/ or perk-images/)
             const allPerkImages = Array.from(document.querySelectorAll('img[src*="runes"], img[src*="perk-images"], img[src*="/Styles/"], img[src*="Runes"]'));
             
             return allPerkImages.filter(img => {
                 // Check img, parent, grandparent, great-grandparent
                 let curr = img;
                 for (let i = 0; i < 4; i++) {
                     if (isNodeActive(curr)) return true;
                     curr = curr.parentElement;
                     if (!curr) break;
                 }
                 const shardContainer = img.closest('.stat-shards-container') || img.closest('.shards-container');
                 if (shardContainer) {
                     return false; 
                 }
                 return false;
             });
        };
        
        let activePerkImgs = getAllActivePerks();

        // Fallback for Shards if we missed them
        const shardContainer = document.querySelector('.stat-shards-container') || document.querySelector('.shards-container');
        if (shardContainer) {
             const shardImgs = Array.from(shardContainer.querySelectorAll('img'));
             const activeShards = shardImgs.filter(img => {
                 let curr = img;
                 for(let i=0; i<4; i++) {
                     if(curr && isNodeActive(curr)) return true;
                     curr = curr.parentElement;
                 }
                 return false;
             });
             
             if (activeShards.length > 0) {
                 activeShards.forEach(s => {
                     if (!activePerkImgs.includes(s)) activePerkImgs.push(s);
                 });
             }
        }
        
        // Remove duplicates
        activePerkImgs = [...new Set(activePerkImgs)];

        const runeFilenames = activePerkImgs.map(img => {
            const parts = img.src.split('/');
            return parts[parts.length - 1]; 
        });

        // --- ITEMS ---
        const allItemImgs = Array.from(document.querySelectorAll('img[src*="/item/"]'));
        const allItemDivs = Array.from(document.querySelectorAll('div[style*="/item/"]'));

        const extractIdFromSrc = (src) => {
             const match = src.match(/\/item\/(\d+)\.png/);
             return match ? parseInt(match[1]) : null;
        };

        const extractIdFromStyle = (style) => {
             const match = style.match(/\/item\/(\d+)\.png/);
             return match ? parseInt(match[1]) : null;
        };
        
        const STARTING_ITEMS_IDS = [
            1056, // Doran's Ring
            1055, // Doran's Blade
            1054, // Doran's Shield
            2003, // Health Potion
            2031, // Refillable Potion
            2033, // Corrupting Potion
            3340, // Warding Totem
            3364, // Oracle Lens
            3363, // Farsight Alteration
            1083, // Cull
        ];

        const distinctItemIds = new Set();
        const validItems = [];

        // Helper to process element
        const processElement = (el, id) => {
            if (!id) return;
            if (STARTING_ITEMS_IDS.includes(id)) return;

            const box = el.closest('div'); 
            const headerBox = el.closest('.content-section');
            const boxText = (box ? box.innerText : '') + (headerBox ? headerBox.innerText : '');
            
            if (boxText.includes('Starting Items') || boxText.includes('Potions') || boxText.includes('Trinket')) return;
            
            if (!distinctItemIds.has(id)) {
                distinctItemIds.add(id);
                validItems.push(id);
            }
        };

        // Process IMGs
        for (const img of allItemImgs) {
            processElement(img, extractIdFromSrc(img.src));
        }

        // Process DIVs (Background Images)
        console.log('--- START STYLE DEBUG ---');
        console.log('Total DIVs with style*="/item/": ' + allItemDivs.length);
        
        // Debug: Log all divs with background to see patterns
        const dbgDivs = Array.from(document.querySelectorAll('div[style*="background"]'));
        console.log('Total DIVs with background style: ' + dbgDivs.length);
        // Check unfiltered styles
        console.log('--- START UNFILTERED STYLE DEBUG ---');
        for (const div of dbgDivs) {
            const style = div.getAttribute('style');
            if (style) {
                 console.log('Style Attribute: ' + style);
                 const id = extractIdFromStyle(style);
                 if (id) {
                     console.log('Found ID in style: ' + id);
                     processElement(div, id);
                 }
            }
        }
        console.log('--- END UNFILTERED STYLE DEBUG ---');
        
        const uniqueItemIds = validItems.slice(0, 6);

        const winrateEl = document.querySelector('.win-rate .value') || document.querySelector('.win-rate');
        let winrate = winrateEl ? winrateEl.innerText : null;
        if (winrate && winrate.includes('%')) {
            winrate = winrate.trim();
        }

        return {
            runeFilenames,
            itemIds: uniqueItemIds,
            winrate
        };
    });

    await browser.close();

    // Resolve IDs using server-side map
    // Resolve IDs using server-side map + numeric fallback
    const runeIds = (rawBuildData.runeFilenames || []).map(filename => {
        // 1. Try Map
        if (runeIconMap[filename]) return runeIconMap[filename];
        // 2. Try numeric extraction (e.g., "8000.png" -> 8000)
        const numeric = parseInt(filename);
        if (!isNaN(numeric) && numeric > 100) return numeric;
        return undefined;
    }).filter(id => id !== undefined);
    
    const uniqueRuneIds = [...new Set(runeIds)];

    const responseData = {
        runeIds: uniqueRuneIds,
        itemIds: rawBuildData.itemIds,
        winrate: rawBuildData.winrate,
        debugFilenames: rawBuildData.runeFilenames
    };

    console.log('[SCRAPE BUILD] Success:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('[SCRAPE BUILD] Error:', error.message);
    if (browser) await browser.close();
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.listen(PORT, () => {
  console.log(`[PROXY] Server running on http://localhost:${PORT}`);
  console.log(`[PROXY] Allowed CORS origin: ${ALLOWED_ORIGIN}`);
});
