export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { amount, description } = body || {};
    const apiKey = process.env.MOLLIE_API_KEY;
    const redirectUrl =
      process.env.MOLLIE_REDIRECT_URL ||
      req.headers?.origin ||
      'https://biljartclub.hans-apps.com';

    if (!apiKey) {
      return res.status(500).json({
        error:
          'MOLLIE_API_KEY ontbreekt in de server-omgevingsvariabelen (Environment Variables).',
      });
    }

    const formattedAmount = (Number(amount) / 100).toFixed(2);

    const response = await fetch('https://api.mollie.com/v2/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: {
          currency: 'EUR',
          value: formattedAmount,
        },
        description: description || 'Club contributie / inleg',
        redirectUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.detail || 'Fout bij aanmaken Mollie betaling',
      });
    }

    return res.status(200).json({
      paymentId: data.id,
      checkoutUrl: data._links?.checkout?.href,
    });
  } catch (error: any) {
    console.error('Mollie create error:', error);
    return res.status(500).json({
      error: error.message || 'Interne serverfout bij aanmaken betaling',
    });
  }
}
