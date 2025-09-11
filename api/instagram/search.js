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
    
    // Build comprehensive search query with location context for better accuracy
    let searchQuery = `"${cleanBusinessName}"`;
    
    // Add location context to improve search accuracy
    if (city && state) {
      searchQuery += ` "${city}" OR "${state}"`;
    } else if (city) {
      searchQuery += ` "${city}"`;
    } else if (state) {
      searchQuery += ` "${state}"`;
    }
    
    // Add address if available for more precision
    if (address && address.trim()) {
      const cleanAddress = address.replace(/[^\w\s]/g, '').trim();
      if (cleanAddress) {
        searchQuery += ` "${cleanAddress}"`;
      }
    }
    
    searchQuery += ' site:instagram.com';
    
    console.log('Enhanced search query:', searchQuery);

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

    // Process search results and identify official business accounts
    let bestMatch = null;
    let highestScore = 0;

    for (const item of searchData.items) {
      const instagramUrl = item.link;
      
      // Extract Instagram handle from URL
      const handleMatch = instagramUrl.match(/instagram\.com\/([^\/\?]+)/);
      if (!handleMatch) continue;
      
      const handle = handleMatch[1];
      
      // Skip Instagram story, post, reel, or IGTV URLs - we want profile URLs only
      if (handle.includes('stories') || handle.includes('p/') || handle.includes('reel/') || handle.includes('tv/')) continue;
      
      // Skip common non-business handles
      if (handle.includes('explore') || handle.includes('accounts') || handle.includes('hashtag')) continue;
      
      // Skip extremely short handles (likely truncated or invalid) - minimum 2 characters
      if (handle.length < 2) continue;
      
      // Skip single letter handles (like @p) which are definitely not business accounts
      if (handle.length === 1) continue;
      
      // Skip handles that are just numbers or very generic patterns
      if (/^\d+$/.test(handle) || /^[a-z]$/.test(handle)) continue;

      const title = (item.title || '').toLowerCase();
      const snippet = (item.snippet || '').toLowerCase();
      const displayLink = (item.displayLink || '').toLowerCase();
      const fullText = (title + ' ' + snippet).toLowerCase();

      const lowerBusinessName = cleanBusinessName.toLowerCase();
      const businessWords = lowerBusinessName.split(' ').filter(word => word.length > 2);

      let score = 0;
      let reasons = [];

      // Primary: Exact business name match in title or handle
      const handleLower = handle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const businessNameClean = lowerBusinessName.replace(/[^a-z0-9]/g, '');
      
      // Check for exact match first
      if (title.includes(lowerBusinessName)) {
        score += 60;
        reasons.push('Exact business name in title');
      } else if (handleLower.includes(businessNameClean) && businessNameClean.length > 2) {
        score += 50;
        reasons.push('Business name in handle');
      }

      // Enhanced business name matching
      const titleWordsMatchCount = businessWords.filter(word => fullText.includes(word)).length;
      const handleWordsMatchCount = businessWords.filter(word => handleLower.includes(word.replace(/[^a-z0-9]/g, ''))).length;
      
      // All business words must be present for high confidence
      if (titleWordsMatchCount === businessWords.length && businessWords.length > 0) {
        score += 40;
        reasons.push('All business name words in text');
      } else if (handleWordsMatchCount === businessWords.length && businessWords.length > 0) {
        score += 35;
        reasons.push('All business name words in handle');
      } else if (titleWordsMatchCount > 0 || handleWordsMatchCount > 0) {
        const maxMatch = Math.max(titleWordsMatchCount, handleWordsMatchCount);
        score += (maxMatch / businessWords.length) * 25;
        reasons.push(`${maxMatch}/${businessWords.length} business words found`);
      }
      
      // Boost score significantly if business name is uncommon/unique
      if (businessWords.length > 1 && businessWords.some(word => word.length > 6)) {
        score += 10;
        reasons.push('Unique business name detected');
      }

      // Location relevance (if provided)
      if (city && (fullText.includes(city.toLowerCase()) || fullText.includes(state.toLowerCase()))) {
        score += 15;
        reasons.push('Location mentioned');
      }

      // Phone number match (strong indicator)
      if (phone && snippet.includes(phone.replace(/\D/g, ''))) {
        score += 25;
        reasons.push('Phone number match');
      }

      // Business indicators
      const businessIndicators = ['official', 'verified', 'business', 'company', 'corp', 'llc', 'inc'];
      if (businessIndicators.some(indicator => fullText.includes(indicator))) {
        score += 10;
        reasons.push('Business account indicators');
      }

      // Penalties for non-official accounts
      const nonOfficialIndicators = ['fan', 'news', 'update', 'blog', 'gossip', 'celebrity', 'review', 'meme'];
      if (nonOfficialIndicators.some(indicator => fullText.includes(indicator))) {
        score -= 20;
        reasons.push('Non-official account indicators detected');
      }

      // Penalty for overly generic handles with many underscores or numbers
      const underscoreCount = (handle.match(/_/g) || []).length;
      const numberCount = (handle.match(/\d/g) || []).length;
      if (underscoreCount > 2 || numberCount > 3) {
        score -= 15;
        reasons.push('Generic handle pattern penalty');
      }

      console.log(`Instagram handle: @${handle}, Score: ${score}, URL: ${instagramUrl}`);
      console.log(`Reasons: ${reasons.join(', ')}`);

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

    // Return only one Instagram account per business as requested
    // Use a higher minimum threshold to ensure quality results
    const minThreshold = Math.max(confidenceThreshold, 40); // Minimum 40% confidence
    
    if (bestMatch && bestMatch.confidenceScore >= minThreshold) {
      return res.json({
        instagramHandle: bestMatch.instagramHandle,
        instagramUrl: bestMatch.instagramUrl,
        confidenceScore: bestMatch.confidenceScore,
        status: 'found'
      });
    } else {
      return res.json({
        instagramHandle: 'No Instagram found',
        instagramUrl: null,
        confidenceScore: bestMatch ? bestMatch.confidenceScore : 0,
        status: 'not_found',
        reason: bestMatch ? `Confidence score ${bestMatch.confidenceScore} below threshold ${minThreshold}` : 'No official business Instagram account found'
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
