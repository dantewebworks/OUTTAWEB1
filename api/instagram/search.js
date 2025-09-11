module.exports = async (req, res) => {
  try {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');

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

    if (!apiKey || !searchEngineId) {
      return res.status(400).json({ 
        error: 'missing_api_credentials', 
        message: 'Google Custom Search API key and Search Engine ID are required' 
      });
    }

    if (!businessName || !city || !state) {
      return res.status(400).json({ 
        error: 'missing_params', 
        message: 'businessName, city, and state are required' 
      });
    }

    // Clean and format the business name for searching
    const cleanBusinessName = businessName.replace(/[^\w\s]/g, '').trim();
    const searchQuery = `"${cleanBusinessName}" "${city}" "${state}" Instagram site:instagram.com`;

    console.log('Instagram search query:', searchQuery);

    // Google Custom Search API request
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}&num=5`;

    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Search API error:', errorText);
      return res.status(response.status).json({ 
        error: 'search_api_error', 
        message: 'Google Custom Search API request failed',
        status: response.status,
        details: errorText
      });
    }

    const searchData = await response.json();

    if (!searchData.items || searchData.items.length === 0) {
      return res.json({
        instagramHandle: 'No Instagram Found',
        instagramUrl: null,
        confidenceScore: 0,
        reason: 'No Instagram profiles found in search results'
      });
    }

    // Process search results and calculate confidence scores
    let bestMatch = null;
    let highestScore = 0;

    for (const item of searchData.items) {
      const instagramUrl = item.link;
      
      // Extract Instagram handle from URL
      const handleMatch = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
      if (!handleMatch) continue;
      
      const handle = handleMatch[1];
      
      // Skip Instagram story or post URLs, we want profile URLs only
      if (handle.includes('stories') || handle.includes('p/') || handle.includes('reel/')) continue;

      const title = (item.title || '').toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      const displayLink = (item.displayLink || '').toLowerCase();

      const lowerBusinessName = cleanBusinessName.toLowerCase();
      const lowerCity = city.toLowerCase();
      const lowerState = state.toLowerCase();

      let score = 0;
      let reasons = [];

      // Exact business name match in title (highest weight)
      if (title.includes(lowerBusinessName)) {
        score += 40;
        reasons.push('Business name found in title');
      }

      // Partial business name match
      const businessWords = lowerBusinessName.split(' ').filter(word => word.length > 2);
      const titleWordsMatchCount = businessWords.filter(word => title.includes(word)).length;
      if (titleWordsMatchCount > 0) {
        score += (titleWordsMatchCount / businessWords.length) * 25;
        reasons.push(`${titleWordsMatchCount}/${businessWords.length} business name words match`);
      }

      // City match
      if (title.includes(lowerCity) || snippet.includes(lowerCity)) {
        score += 20;
        reasons.push('City mentioned');
      }

      // State match
      if (title.includes(lowerState) || snippet.includes(lowerState)) {
        score += 15;
        reasons.push('State mentioned');
      }

      // Business name in snippet/description
      if (snippet.includes(lowerBusinessName)) {
        score += 15;
        reasons.push('Business name in description');
      }

      // Phone number match (if provided)
      if (phone && snippet.includes(phone.replace(/\D/g, ''))) {
        score += 25;
        reasons.push('Phone number match');
      }

      // Bonus for verified accounts or business indicators
      if (title.includes('verified') || snippet.includes('verified') || snippet.includes('business')) {
        score += 10;
        reasons.push('Verified or business account indicators');
      }

      // Penalty for generic or spam-like accounts
      if (handle.includes('_') && handle.split('_').length > 3) {
        score -= 10;
        reasons.push('Generic handle pattern penalty');
      }

      console.log(`Instagram handle: @${handle}, Score: ${score}, Reasons: ${reasons.join(', ')}`);

      if (score > highestScore) {
        highestScore = score;
        bestMatch = {
          instagramHandle: `@${handle}`,
          instagramUrl: instagramUrl,
          confidenceScore: Math.round(score),
          reasons: reasons,
          title: item.title,
          snippet: item.snippet
        };
      }
    }

    // Return the best match if it meets the confidence threshold
    if (bestMatch && bestMatch.confidenceScore >= confidenceThreshold) {
      return res.json(bestMatch);
    } else {
      return res.json({
        instagramHandle: 'No Instagram Found',
        instagramUrl: null,
        confidenceScore: bestMatch ? bestMatch.confidenceScore : 0,
        reason: bestMatch ? `Confidence score ${bestMatch.confidenceScore} below threshold ${confidenceThreshold}` : 'No suitable matches found'
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
