// Advanced Instagram matching system with sophisticated scoring and debug logging

module.exports = async (req, res) => {
  try {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, x-search-engine-id');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { 
      businessName, 
      address, 
      city, 
      state, 
      phone,
      website,
      thresholdAccept = 0.50,
      thresholdReview = 0.30
    } = req.method === 'GET' ? req.query : req.body;

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY || process.env.GOOGLE_API_KEY || req.headers['x-api-key'];
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || process.env.GOOGLE_CSE_CX || req.headers['x-search-engine-id'];

    // Initialize debug log
    const debugLog = {
      timestamp: new Date().toISOString(),
      input: { businessName, address, city, state, phone, website },
      queries_tried: [],
      raw_api_responses: [],
      top_candidates: [],
      chosen_candidate: null,
      final_decision: null
    };

    console.log('=== ADVANCED INSTAGRAM SEARCH DEBUG ===');
    console.log('Business:', businessName);
    console.log('Location:', city, state);
    console.log('Thresholds:', { accept: thresholdAccept, review: thresholdReview });

    if (!apiKey || !searchEngineId) {
      debugLog.error = 'Missing API credentials';
      return res.status(400).json({ 
        error: 'missing_api_credentials', 
        message: 'Google Custom Search API key and Search Engine ID are required',
        debugLog
      });
    }

    if (!businessName) {
      debugLog.error = 'Missing business name';
      return res.status(400).json({ 
        error: 'missing_params', 
        message: 'businessName is required',
        debugLog
      });
    }

    // Helper functions
    const normalizeText = (text) => {
      if (!text) return '';
      return text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\b(the|inc|llc|ltd|corp|corporation|company|co)\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    };

    const calculateSimilarity = (str1, str2) => {
      if (!str1 || !str2) return 0;
      const longer = str1.length > str2.length ? str1 : str2;
      const shorter = str1.length > str2.length ? str2 : str1;
      const editDistance = levenshteinDistance(longer, shorter);
      if (longer.length === 0) return 1.0;
      return (longer.length - editDistance) / longer.length;
    };

    const levenshteinDistance = (str1, str2) => {
      const matrix = [];
      for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
          if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[str2.length][str1.length];
    };

    const isValidInstagramProfile = (link) => {
      // Must be instagram.com domain
      if (!link.includes('instagram.com')) {
        return false;
      }
      
      // Must be HTTPS Instagram URL
      if (!link.match(/^https?:\/\/(www\.)?instagram\.com\//)) {
        return false;
      }
      
      // Reject non-profile URLs
      const rejectSegments = ['/p/', '/explore/', '/tags/', '/reel/', '/stories/', '/share/', '/search/', '/tv/'];
      return !rejectSegments.some(segment => link.includes(segment));
    };

    const extractUsername = (link) => {
      // Strict Instagram profile URL matching
      const match = link.match(/^https?:\/\/(www\.)?instagram\.com\/([^/?#]+)\/?$/);
      if (match) {
        const username = match[2].toLowerCase();
        const blacklist = ['p', 'explore', 'tags', 'stories', 'reel', 'tv', 'about', 'help', 'privacy', 'terms'];
        if (username.length >= 2 && !blacklist.includes(username)) {
          return username;
        }
      }
      return null;
    };

    const isFanPage = (title, snippet) => {
      const fanIndicators = ['fan', 'fanpage', 'fans', 'unofficial', 'tribute'];
      const text = (title + ' ' + snippet).toLowerCase();
      return fanIndicators.some(indicator => text.includes(indicator));
    };

    // Search strategy using exact format with fallbacks for better results
    const buildSearchQueries = (name, city, state) => {
      const queries = [];
      
      // Strategy 1: Exact format as requested (BUSINESS NAME + CITY + STATE + Instagram)
      if (name && city && state) {
        queries.push(`${name} ${city} ${state} Instagram site:instagram.com`);
      }
      
      // Strategy 2: Business name + city + Instagram (if state missing)
      if (name && city) {
        queries.push(`${name} ${city} Instagram site:instagram.com`);
      }
      
      // Strategy 3: Business name + Instagram only
      if (name) {
        queries.push(`${name} Instagram site:instagram.com`);
      }
      
      // Strategy 4: Quoted business name for exact matches (fallback)
      if (name && city && state) {
        queries.push(`"${name}" "${city}" "${state}" Instagram site:instagram.com`);
      }
      
      // Strategy 5: Quoted business name only (fallback)
      if (name) {
        queries.push(`"${name}" Instagram site:instagram.com`);
      }
      
      return queries;
    };

    // Exponential backoff for API rate limits
    const makeApiRequestWithBackoff = async (url, maxRetries = 3) => {
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const response = await fetch(url);
          if (response.status === 429) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            console.log(`Rate limited, waiting ${delay}ms before retry ${attempt + 1}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          return response;
        } catch (error) {
          if (attempt === maxRetries - 1) throw error;
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Request failed, retrying in ${delay}ms:`, error.message);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    };

    // Improved scoring algorithm - more lenient for better detection
    const scoreCandidate = (candidate, businessName, city, state, phone, website) => {
      const { username, title, snippet, link } = candidate;
      const fullText = (title + ' ' + snippet).toLowerCase();
      const businessLower = businessName.toLowerCase();
      const normalizedBusinessName = normalizeText(businessName);
      
      // Base score for finding any Instagram profile (gives 0.3 baseline)
      let baseScore = 0.30;
      
      // Component 1: Name similarity (weight 0.40) - check multiple variations
      let nameScore = 0;
      
      // Check exact business name match
      if (fullText.includes(businessLower)) nameScore = Math.max(nameScore, 0.9);
      
      // Check individual words from business name
      const businessWords = businessLower.split(/\s+/).filter(word => word.length > 2);
      let wordMatches = 0;
      businessWords.forEach(word => {
        if (fullText.includes(word)) wordMatches++;
      });
      if (businessWords.length > 0) {
        nameScore = Math.max(nameScore, (wordMatches / businessWords.length) * 0.8);
      }
      
      // Traditional similarity scoring as backup
      const titleSimilarity = calculateSimilarity(normalizedBusinessName, normalizeText(title));
      const snippetSimilarity = calculateSimilarity(normalizedBusinessName, normalizeText(snippet));
      nameScore = Math.max(nameScore, Math.max(titleSimilarity, snippetSimilarity));
      
      // Component 2: Username similarity (weight 0.20)
      let usernameScore = calculateSimilarity(normalizedBusinessName, username);
      
      // Check if username contains business words
      businessWords.forEach(word => {
        if (username.includes(word)) usernameScore = Math.max(usernameScore, 0.6);
      });
      
      // Component 3: Location score (weight 0.15)
      let locationScore = 0;
      if (city && fullText.includes(city.toLowerCase())) locationScore += 0.5;
      if (state && fullText.includes(state.toLowerCase())) locationScore += 0.5;
      locationScore = Math.min(locationScore, 1.0);
      
      // Component 4: Contact score (weight 0.15)
      let contactScore = 0;
      if (phone && fullText.includes(phone.replace(/\D/g, ''))) contactScore += 0.5;
      if (website && fullText.includes(website.replace(/https?:\/\/(www\.)?/, ''))) contactScore += 0.5;
      contactScore = Math.min(contactScore, 1.0);
      
      // Calculate final weighted score with base score
      const componentScore = (0.4 * nameScore) + (0.2 * usernameScore) + (0.15 * locationScore) + (0.15 * contactScore);
      const finalScore = Math.min(baseScore + componentScore, 1.0);
      
      return {
        finalScore,
        components: {
          baseScore,
          nameScore,
          usernameScore,
          locationScore,
          contactScore
        }
      };
    };

    // Main search execution
    const searchQueries = buildSearchQueries(businessName, city, state);
    const allCandidates = [];

    console.log('Executing progressive search strategy...');
    console.log('Queries to try:', searchQueries);

    for (let queryIndex = 0; queryIndex < searchQueries.length; queryIndex++) {
      const query = searchQueries[queryIndex];
      debugLog.queries_tried.push(query);
      
      console.log(`\n--- Query ${queryIndex + 1}: ${query} ---`);
      
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}&num=10`;
      
      try {
        const response = await makeApiRequestWithBackoff(searchUrl);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Query ${queryIndex + 1} failed:`, errorText);
          debugLog.raw_api_responses.push({ query, error: errorText, status: response.status });
          continue;
        }
        
        const searchData = await response.json();
        debugLog.raw_api_responses.push({ query, response: searchData });
        
        console.log(`Query ${queryIndex + 1} returned ${searchData.items ? searchData.items.length : 0} results`);
        
        if (!searchData.items || searchData.items.length === 0) {
          console.log('No results for this query, trying next...');
          continue;
        }
        
        // Process results for this query
        for (let i = 0; i < searchData.items.length; i++) {
          const item = searchData.items[i];
          console.log(`\n  Result ${i + 1}:`);
          console.log(`    Title: ${item.title}`);
          console.log(`    Link: ${item.link}`);
          console.log(`    Snippet: ${item.snippet || 'N/A'}`);
          
          // Strict Instagram URL validation - must contain instagram.com
          if (!item.link.includes('instagram.com')) {
            console.log('    ❌ Rejected: URL does not contain instagram.com');
            continue;
          }
          
          if (!isValidInstagramProfile(item.link)) {
            console.log('    ❌ Rejected: Not a valid Instagram profile');
            continue;
          }
          
          const username = extractUsername(item.link);
          if (!username) {
            console.log('    ❌ Rejected: Could not extract valid username');
            continue;
          }
          
          if (isFanPage(item.title || '', item.snippet || '')) {
            console.log('    ❌ Rejected: Appears to be a fan page');
            continue;
          }
          
          // This is a valid candidate - score it
          const candidate = {
            username,
            link: item.link,
            title: item.title || '',
            snippet: item.snippet || '',
            query: query,
            queryIndex: queryIndex + 1
          };
          
          const scoring = scoreCandidate(candidate, businessName, city, state, phone, website);
          candidate.score = scoring.finalScore;
          candidate.scoreComponents = scoring.components;
          
          console.log(`    ✅ Valid candidate: @${username}`);
          console.log(`    📊 Score: ${scoring.finalScore.toFixed(3)} (base:${scoring.components.baseScore.toFixed(2)} name:${scoring.components.nameScore.toFixed(2)} user:${scoring.components.usernameScore.toFixed(2)} loc:${scoring.components.locationScore.toFixed(2)} contact:${scoring.components.contactScore.toFixed(2)})`);
          
          allCandidates.push(candidate);
        }
        
        // If we found good candidates, we can stop searching
        if (allCandidates.length > 0 && Math.max(...allCandidates.map(c => c.score)) >= thresholdAccept) {
          console.log('Found high-confidence candidate, stopping search');
          break;
        }
        
      } catch (error) {
        console.error(`Query ${queryIndex + 1} error:`, error.message);
        debugLog.raw_api_responses.push({ query, error: error.message });
      }
    }

    // Sort candidates by score (highest first)
    allCandidates.sort((a, b) => b.score - a.score);
    debugLog.top_candidates = allCandidates.slice(0, 5); // Keep top 5 for debugging

    console.log('\n=== FINAL DECISION ===');
    console.log(`Total candidates found: ${allCandidates.length}`);
    
    if (allCandidates.length === 0) {
      debugLog.final_decision = {
        status: 'no_instagram',
        reason: 'No valid Instagram candidates found',
        match_confidence: 0.0
      };
      
      console.log('🚫 RESULT: No Instagram Found - No valid candidates');
      
      return res.json({
        instagram_handle: 'No Instagram found',
        instagram_url: 'No Instagram found',
        match_confidence: 0.0,
        match_status: 'no_instagram',
        debug_info: {
          queries_tried: debugLog.queries_tried.length,
          candidates_found: 0,
          reason: 'No valid Instagram candidates found'
        },
        debugLog: debugLog
      });
    }
    
    // Get the best candidate
    const bestCandidate = allCandidates[0];
    debugLog.chosen_candidate = bestCandidate;
    
    console.log(`Best candidate: @${bestCandidate.username} (score: ${bestCandidate.score.toFixed(3)})`);
    
    // Apply stricter decision rules - only return high confidence matches
    let matchStatus, reason;
    if (bestCandidate.score >= thresholdAccept) {
      matchStatus = 'accepted';
      reason = `High confidence match (score: ${bestCandidate.score.toFixed(3)} >= ${thresholdAccept})`;
      console.log('✅ RESULT: ACCEPTED - High confidence match');
    } else {
      // For cleaner results, treat medium and low confidence as "No Instagram found"
      matchStatus = 'no_instagram';
      reason = `Insufficient confidence (score: ${bestCandidate.score.toFixed(3)} < ${thresholdAccept})`;
      console.log('🚫 RESULT: NO INSTAGRAM - Insufficient confidence for reliable match');
    }
    
    debugLog.final_decision = {
      status: matchStatus,
      reason: reason,
      match_confidence: bestCandidate.score,
      chosen_candidate: {
        username: bestCandidate.username,
        url: bestCandidate.link,
        title: bestCandidate.title,
        score: bestCandidate.score,
        score_components: bestCandidate.scoreComponents
      }
    };
    
    // Format response with proper handle extraction
    const response = {
      instagram_handle: matchStatus === 'no_instagram' ? 'No Instagram found' : `@${bestCandidate.username}`,
      instagram_url: matchStatus === 'no_instagram' ? 'No Instagram found' : bestCandidate.link,
      match_confidence: parseFloat(bestCandidate.score.toFixed(3)),
      match_status: matchStatus,
      debug_info: {
        queries_tried: debugLog.queries_tried.length,
        candidates_found: allCandidates.length,
        best_score: bestCandidate.score.toFixed(3),
        score_components: bestCandidate.scoreComponents,
        reason: reason
      },
      debugLog: debugLog
    };
    
    console.log('Final response:', {
      handle: response.instagram_handle,
      url: response.instagram_url,
      confidence: response.match_confidence,
      status: response.match_status
    });
    
    return res.json(response);

  } catch (error) {
    console.error('Instagram search error:', error);
    res.status(500).json({ 
      error: 'internal_error', 
      message: error.message,
      debugLog: debugLog || {}
    });
  }
};
