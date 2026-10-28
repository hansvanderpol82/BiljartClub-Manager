import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Create Mollie Payment
  app.post("/api/mollie/create-payment", async (req, res) => {
    try {
      const { amount, description } = req.body;
      const apiKey = process.env.MOLLIE_API_KEY;
      const redirectUrl = process.env.MOLLIE_REDIRECT_URL || 'https://hans-apps.com';

      if (!apiKey) {
        throw new Error('MOLLIE_API_KEY environment variable is missing');
      }

      // amount is in cents, Mollie expects a string with 2 decimals, e.g. "10.00"
      const formattedAmount = (amount / 100).toFixed(2);

      const response = await fetch('https://api.mollie.com/v2/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: {
            currency: 'EUR',
            value: formattedAmount,
          },
          description: description,
          redirectUrl: redirectUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Fout bij aanmaken Mollie betaling');
      }

      res.json({
        paymentId: data.id,
        checkoutUrl: data._links.checkout.href,
      });
    } catch (error: any) {
      console.error("Mollie create error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Check Mollie Payment Status (supports both /api/mollie/payment-status?id=... and /api/mollie/payment-status/:id)
  const handlePaymentStatus = async (req: express.Request, res: express.Response) => {
    try {
      const id = (req.params as any).id || req.query.id;
      const apiKey = process.env.MOLLIE_API_KEY;

      if (!id) {
        return res.status(400).json({ error: 'Payment ID is missing' });
      }

      if (!apiKey) {
        throw new Error('MOLLIE_API_KEY environment variable is missing');
      }

      const response = await fetch(`https://api.mollie.com/v2/payments/${encodeURIComponent(String(id))}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Fout bij ophalen Mollie status');
      }

      res.json({ status: data.status }); // status can be 'open', 'paid', 'canceled', 'expired', 'failed'
    } catch (error: any) {
      console.error("Mollie status error:", error);
      res.status(500).json({ error: error.message });
    }
  };

  app.get("/api/mollie/payment-status", handlePaymentStatus);
  app.get("/api/mollie/payment-status/:id", handlePaymentStatus);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
