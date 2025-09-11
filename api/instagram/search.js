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
      confidenceThreshold = 80 
    } = req.method === 'GET' ? req.query : req.body;

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY || req.headers['x-api-key'];
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID || req.headers['x-search-engine-id'];

    console.log('=== Instagram Search Debug Info ===');
    console.log('Business Name:', businessName);
    console.log('City:', city);
    console.log('State:', state);
    console.log('API Key present:', !!apiKey);
    console.log('Search Engine ID present:', !!searchEngineId);

    if (!apiKey || !searchEngineId) {
      console.error('Missing API credentials');
      return res.status(400).json({ 
        error: 'missing_api_credentials', 
        message: 'Google Custom Search API key and Search Engine ID are required',
        debug: {
          hasApiKey: !!apiKey,
          hasSearchEngineId: !!searchEngineId
        }
      });
    }

    if (!businessName) {
      console.error('Missing business name');
      return res.status(400).json({ 
        error: 'missing_params', 
        message: 'businessName is required' 
      });
    }

    // Format query exactly as requested: "<Business Name> <City> <State> site:instagram.com"
    let searchQuery = businessName.trim();
    
    if (city && city.trim()) {
      searchQuery += ` ${city.trim()}`;
    }
    
    if (state && state.trim()) {
      searchQuery += ` ${state.trim()}`;
    }
    
    searchQuery += ' site:instagram.com';
    
    console.log('Final search query:', searchQuery);

    // Build Google Custom Search API URL
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`;
    
    console.log('API Request URL:', searchUrl.replace(apiKey, 'API_KEY_HIDDEN'));

    try {
      const response = await fetch(searchUrl);
      
      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Search API error response:', errorText);
        return res.status(response.status).json({ 
          error: 'search_api_error', 
          message: 'Google Custom Search API request failed',
          status: response.status,
          details: errorText,
          query: searchQuery
        });
      }

      const searchData = await response.json();
      
      console.log('Raw API Response:');
      console.log(JSON.stringify(searchData, null, 2));

      // Check if we have search results
      if (!searchData.items || !Array.isArray(searchData.items) || searchData.items.length === 0) {
        console.log('No search results found');
        return res.json({
          instagramHandle: 'No Instagram Found',
          instagramUrl: 'No Instagram Found',
          confidenceScore: 0,
          status: 'not_found',
          reason: 'No search results returned from Google Custom Search API',
          query: searchQuery,
          debug: {
            hasItems: !!searchData.items,
            itemsCount: searchData.items ? searchData.items.length : 0
          }
        });
      }
      
      console.log(`Found ${searchData.items.length} search results`);

      // Process search results - take the first valid Instagram URL
      let foundInstagramUrl = null;
      let foundHandle = null;

      console.log('Processing search results...');
      
      for (let i = 0; i < searchData.items.length; i++) {
        const item = searchData.items[i];
        const link = item.link;
        
        console.log(`Result ${i + 1}:`);
        console.log(`  Title: ${item.title}`);
        console.log(`  Link: ${link}`);
        console.log(`  Snippet: ${item.snippet}`);
        
        // Check if this is a valid Instagram URL
        if (!link || !link.includes('instagram.com')) {
          console.log(`  Skipped: Not an Instagram URL`);
          continue;
        }
        
        // Extract username from Instagram URL
        const handleMatch = link.match(/instagram\.com\/([a-zA-Z0-9._]+)\/?/);
        if (!handleMatch) {
          console.log(`  Skipped: Could not extract username from URL`);
          continue;
        }
        
        const handle = handleMatch[1];
        
        // Skip Instagram story, post, reel, or IGTV URLs - we want profile URLs only
        if (handle.includes('stories') || handle.includes('p') || handle.includes('reel') || handle.includes('tv')) {
          console.log(`  Skipped: Not a profile URL (${handle})`);
          continue;
        }
        
        // Skip common non-business paths
        if (handle.includes('explore') || handle.includes('accounts') || handle.includes('hashtag')) {
          console.log(`  Skipped: Non-business path (${handle})`);
          continue;
        }
        
        // Skip extremely short handles (likely truncated)
        if (handle.length < 2) {
          console.log(`  Skipped: Handle too short (${handle})`);
          continue;
        }
        
        // This looks like a valid Instagram profile URL
        foundInstagramUrl = link;
        foundHandle = handle;
        console.log(`  \u2713 Valid Instagram profile found: @${handle}`);
        console.log(`  \u2713 Instagram URL: ${link}`);
        break; // Take the first valid result
      }

      // Return the result
      if (foundInstagramUrl && foundHandle) {
        console.log('=== FINAL RESULT: Instagram Found ===');
        console.log('Instagram Handle:', `@${foundHandle}`);
        console.log('Instagram URL:', foundInstagramUrl);
        
        return res.json({
          instagramHandle: `@${foundHandle}`,
          instagramUrl: foundInstagramUrl,
          status: 'found',
          query: searchQuery
        });
      } else {
        console.log('=== FINAL RESULT: No Instagram Found ===');
        console.log('Reason: No valid Instagram profile URLs found in search results');
        
        return res.json({
          instagramHandle: 'No Instagram Found',
          instagramUrl: 'No Instagram Found',
          status: 'not_found',
          reason: 'No valid Instagram profile URLs found in search results',
          query: searchQuery
        });
      }

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return res.status(500).json({
        error: 'fetch_error',
        message: 'Failed to fetch from Google Custom Search API',
        details: fetchError.message,
        query: searchQuery
      });
    }

  } catch (error) {
    console.error('Instagram search error:', error);
    res.status(500).json({ 
      error: 'internal_error', 
      message: error.message 
    });
  }
};
