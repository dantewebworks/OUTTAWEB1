module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const query = url.searchParams.get('query');
    const near = url.searchParams.get('near');
    const ll = url.searchParams.get('ll');
    const limit = url.searchParams.get('limit') || '50';

    const key = process.env.FOURSQUARE_API_KEY || req.headers['x-fsq-key'] || url.searchParams.get('key');
    if (!key) {
      return res.status(400).json({ error: 'missing_api_key', message: 'Foursquare API key not provided' });
    }
    if (!query) {
      return res.status(400).json({ error: 'missing_param', message: 'query is required' });
    }
    if (!near && !ll) {
      return res.status(400).json({ error: 'missing_param', message: 'near or ll is required' });
    }

    const params = new URLSearchParams();
    params.set('query', query);
    params.set('sort', 'RELEVANCE');
    params.set('limit', String(limit));
    // Ask for useful fields up front to avoid details round-trips when possible
    params.set('fields', 'fsq_id,name,location,website,tel,rating,categories');
    if (near) params.set('near', near);
    if (ll) params.set('ll', ll);

    const fsqUrl = `https://api.foursquare.com/v3/places/search?${params.toString()}`;

    const resp = await fetch(fsqUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': key
      }
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(resp.status).json({ error: 'fsq_error', status: resp.status, body: text });
    }

    const data = await resp.json();
    // Normalize to an object with results array for client convenience
    const results = Array.isArray(data.results) ? data.results : data;
    res.json({ results });
  } catch (e) {
    console.error('Foursquare search error:', e);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
};
