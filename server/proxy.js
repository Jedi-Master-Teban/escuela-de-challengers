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

// CORS: accept localhost dev + any configured production origin(s)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  ...ALLOWED_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, '')), // strip trailing slash
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Render health checks, etc.)
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    // Accept exact matches OR any Vercel preview URL for this project
    const isVercelPreview = normalized.match(/^https:\/\/escuela-de-challengers.*\.vercel\.app$/) ||
                            normalized.match(/^https:\/\/.*jedi-master-tebans-projects\.vercel\.app$/);
    if (allowedOrigins.includes(normalized) || isVercelPreview) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
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

// Health check endpoint — useful for verifying Render is alive
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    hasRiotKey: !!RIOT_API_KEY,
    allowedOrigins,
    uptime: process.uptime()
  });
});


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
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu']
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

// 6. Scrape Builds (U.GG) — axios-first (fast, bypasses bot detection), Puppeteer fallback
app.get('/api/scrape-builds/:champion/:role?', async (req, res) => {
  req.setTimeout(120000);
  res.setTimeout(120000);
  const { champion, role } = req.params;
  const url = role
    ? `https://u.gg/lol/champions/${champion}/build/${role}`
    : `https://u.gg/lol/champions/${champion}/build`;
  console.log(`[SCRAPE BUILD] ${champion}/${role || 'default'} → ${url}`);

  // ── Helpers (shared between axios and Puppeteer paths) ──────────────────

  // Extract window.__SSR_DATA__ JSON blob from raw HTML string
  const extractSSRFromHTML = (html) => {
    const marker = 'window.__SSR_DATA__ =';
    const idx = html.indexOf(marker);
    if (idx === -1) { console.log('[SCRAPE BUILD] No __SSR_DATA__ in HTML'); return null; }
    let braceCount = 0, jsonStart = -1, jsonEnd = -1;
    for (let i = idx + marker.length; i < html.length; i++) {
      if (html[i] === '{') { if (braceCount === 0) jsonStart = i; braceCount++; }
      else if (html[i] === '}') { braceCount--; if (braceCount === 0) { jsonEnd = i + 1; break; } }
    }
    if (jsonStart === -1 || jsonEnd === -1) return null;
    try {
      const jsonStr = html.substring(jsonStart, jsonEnd);
      console.log(`[SCRAPE BUILD] SSR JSON length: ${jsonStr.length}`);
      return JSON.parse(jsonStr);
    } catch (e) { console.error('[SCRAPE BUILD] SSR JSON parse error:', e.message); return null; }
  };

  const BOOT_IDS = [1001, 3006, 3009, 3020, 3047, 3111, 3117, 3158];

  // Convert a parsed SSR object into { runeIds, items, itemIds, winrate, role }
  const extractBuildFromSSR = (parsed, requestedRole) => {
    const keys = Object.keys(parsed);
    const buildKey = keys.find(k =>
      k.includes('overview') && k.includes('ranked_solo_5x5') &&
      !k.includes('ap-overview') && !k.includes('ad-overview')
    );
    if (!buildKey || !parsed[buildKey]?.data) {
      console.log('[SCRAPE BUILD] No suitable SSR key. Available:', keys.slice(0, 5));
      return null;
    }
    console.log('[SCRAPE BUILD] SSR key:', buildKey);
    const dynKeys = Object.keys(parsed[buildKey].data);
    if (!dynKeys.length) return null;
    const inner = parsed[buildKey].data[dynKeys[0]];

    // Items
    let finalCore = [], finalBoots = [], allItems = [];
    if (inner.rec_core_items?.ids) {
      allItems = [...inner.rec_core_items.ids];
      finalCore = [...inner.rec_core_items.ids];
    }
    if (inner.rec_boots?.ids?.length) {
      const bootId = inner.rec_boots.ids[0];
      if (!allItems.includes(bootId)) { allItems.push(bootId); finalBoots.push(bootId); }
    }
    ['item_options_1', 'item_options_2', 'item_options_3', 'situational_items'].forEach(key => {
      const opts = inner[key];
      if (opts?.ids) opts.ids.forEach(id => { if (!allItems.includes(id)) allItems.push(id); });
    });
    allItems = [...new Set(allItems)].filter(id => id > 1000);

    // Auto-detect boots in core if boots array is empty
    if (!finalBoots.length) {
      finalBoots = finalCore.filter(id => BOOT_IDS.includes(id));
      finalCore  = finalCore.filter(id => !BOOT_IDS.includes(id));
    }

    // Runes
    let runes = [];
    if (inner.rec_runes?.active_perks)     runes = [...inner.rec_runes.active_perks];
    if (inner.stat_shards?.active_shards)  runes = [...runes, ...inner.stat_shards.active_shards];
    runes = runes.map(Number).filter(id => !isNaN(id));

    const winrate = inner.win_rate ?? inner.rec_core_items?.win_rate ?? 'N/A';
    const roleMap = { top:'Top', jungle:'Jungle', mid:'Mid', middle:'Mid', adc:'Adc', support:'Support', bot:'Adc', supp:'Support' };
    const roleFromKey = buildKey.match(/build\/([a-z_-]+)/i)?.[1] ?? null;
    const detectedRole = requestedRole || (roleFromKey ? (roleMap[roleFromKey.toLowerCase()] ?? roleFromKey) : null);

    return {
      runeIds: runes,
      items: { core: [...new Set(finalCore)].filter(id => id > 1000).slice(0, 6), boots: finalBoots, situational: [] },
      itemIds: allItems,
      winrate: winrate !== 'N/A' ? `${winrate}% WR` : 'N/A',
      role: detectedRole,
    };
  };

  // ── Strategy 1: Fast axios fetch (no Chrome, ~2-5s) ─────────────────────
  try {
    console.log('[SCRAPE BUILD] Trying axios...');
    const htmlRes = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Cache-Control': 'max-age=0',
      },
      timeout: 20000,
      maxRedirects: 5,
    });

    const html = typeof htmlRes.data === 'string' ? htmlRes.data : JSON.stringify(htmlRes.data);
    console.log(`[SCRAPE BUILD] Axios OK. HTML length: ${html.length}`);

    const parsed = extractSSRFromHTML(html);
    if (parsed) {
      const buildData = extractBuildFromSSR(parsed, role);
      if (buildData?.runeIds?.length) {
        console.log('[SCRAPE BUILD] Axios success:', JSON.stringify(buildData).substring(0, 200));
        return res.json(buildData);
      }
      console.log('[SCRAPE BUILD] SSR found but extraction empty — trying Puppeteer');
    } else {
      console.log('[SCRAPE BUILD] No SSR in axios response — trying Puppeteer');
    }
  } catch (axiosErr) {
    console.warn('[SCRAPE BUILD] Axios failed:', axiosErr.message, '— trying Puppeteer');
  }

  // ── Strategy 2: Puppeteer fallback (executes JS, ~30-60s) ────────────────
  let browser;
  try {
    console.log('[SCRAPE BUILD] Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
      defaultViewport: { width: 1920, height: 1080 },
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() =>
        (window.__SSR_DATA__ && Object.keys(window.__SSR_DATA__).length > 0) ||
        document.querySelectorAll('img[src*="item"]').length > 3,
        { timeout: 20000 }
      );
      // Short settle wait
      await new Promise(r => setTimeout(r, 2000));
    } catch (navErr) {
      console.error('[SCRAPE BUILD] Puppeteer navigation failed:', navErr.message);
      await browser.close();
      return res.status(500).json({ error: 'Failed to load build page' });
    }

    // Extract SSR data from the live DOM
    const html = await page.content();
    await browser.close();

    const parsed = extractSSRFromHTML(html);
    if (parsed) {
      const buildData = extractBuildFromSSR(parsed, role);
      if (buildData?.runeIds?.length) {
        console.log('[SCRAPE BUILD] Puppeteer success:', JSON.stringify(buildData).substring(0, 200));
        return res.json(buildData);
      }
    }

    console.log('[SCRAPE BUILD] Both strategies failed to extract build data');
    return res.status(500).json({ error: 'No build data found' });

  } catch (error) {
    console.error('[SCRAPE BUILD] Puppeteer error:', error.message);
    if (browser) await browser.close();
    return res.status(500).json({ error: 'Scraping failed' });
  }
}); // end app.get('/api/scrape-builds/...')

app.listen(PORT, () => {
  console.log(`[PROXY] Server running on http://localhost:${PORT}`);
  console.log(`[PROXY] Allowed CORS origin: ${ALLOWED_ORIGIN}`);
});
