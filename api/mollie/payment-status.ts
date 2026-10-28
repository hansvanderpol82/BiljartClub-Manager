export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const id = req.query?.id;
    const apiKey = process.env.MOLLIE_API_KEY;

    if (!id) {
      return res.status(400).json({ error: 'Payment ID ontbreekt' });
    }

    if (!apiKey) {
      return res.status(500).json({
        error:
          'MOLLIE_API_KEY ontbreekt in de server-omgevingsvariabelen (Environment Variables).',
      });
    }

    const response = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(String(id))}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || 'Fout bij ophalen Mollie status',
      });
    }

    return res.status(200).json({ status: data.status });
  } catch (error: any) {
    console.error('Mollie status error:', error);
    return res.status(500).json({
      error: error.message || 'Interne serverfout bij ophalen betalingsstatus',
    });
  }
}
