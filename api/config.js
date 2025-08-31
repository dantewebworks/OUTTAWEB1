export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript');
  const payload = {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  };
  res.send(`window.__ENV__ = ${JSON.stringify(payload)};`);
}

