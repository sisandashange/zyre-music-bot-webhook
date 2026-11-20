const express = require("express");
const { verifyMetaSignature } = require("./webhook-security");

const app = express();
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const metaAppSecret = process.env.META_APP_SECRET;

app.use(express.json({
  limit: "1mb",
  verify: (req, res, buffer) => {
    req.rawBody = Buffer.from(buffer);
  },
}));

app.get("/", (req, res) => {
  if (!verifyToken) {
    return res.status(503).send("Webhook verification is not configured.");
  }

  const mode = req.query["hub.mode"];
  const challenge = req.query["hub.challenge"];
  const token = req.query["hub.verify_token"];

  if (mode === "subscribe" && typeof token === "string" && token === verifyToken) {
    console.log("Meta webhook verification completed.");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

app.post("/", (req, res) => {
  if (!metaAppSecret) {
    return res.status(503).json({ error: "Webhook signature verification is not configured." });
  }

  const signature = req.get("x-hub-signature-256");
  if (!verifyMetaSignature(req.rawBody, signature, metaAppSecret)) {
    return res.sendStatus(401);
  }

  const timestamp = new Date().toISOString();
  const entryCount = Array.isArray(req.body?.entry) ? req.body.entry.length : 0;
  console.log(`Verified Meta webhook received at ${timestamp} (${entryCount} entries).`);

  return res.sendStatus(200);
});

app.get("/health", (req, res) => {
  const ready = Boolean(verifyToken && metaAppSecret);
  return res.status(ready ? 200 : 503).json({
    status: ready ? "ok" : "configuration_required",
  });
});

app.listen(port, () => {
  console.log(`ZYRE MUSIC BOT webhook listening on port ${port}`);
});
