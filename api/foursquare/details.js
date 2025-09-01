module.exports = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.searchParams.get('id');
    if (!id) return res.status(400).json({ error: 'missing_param', message: 'id (fsq_id) is required' });

    const key = process.env.FOURSQUARE_API_KEY || req.headers['x-fsq-key'] || url.searchParams.get('key');
    if (!key) {
      return res.status(400).json({ error: 'missing_api_key', message: 'Foursquare API key not provided' });
    }

    const fields = url.searchParams.get('fields') || 'website,tel,location,rating';
    const fsqUrl = `https://api.foursquare.com/v3/places/${encodeURIComponent(id)}?fields=${encodeURIComponent(fields)}`;

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
    res.json(data);
  } catch (e) {
    console.error('Foursquare details error:', e);
    res.status(500).json({ error: 'internal_error', message: e.message });
  }
};
