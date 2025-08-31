module.exports = (req, res) => {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    const crypto = require('crypto');
    const hash = (v) => (v ? crypto.createHash('sha256').update(v).digest('hex').slice(0, 12) : null);

    let urlHost = null;
    try { urlHost = url ? new URL(url).host : null; } catch {}

    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(JSON.stringify({
      present: { url: !!url, anon: !!anon },
      urlHost,
      urlHash: hash(url),
      anonHash: hash(anon)
    }));
  } catch (e) {
    res.status(500).json({ error: 'fingerprint_error', message: e.message });
  }
};

