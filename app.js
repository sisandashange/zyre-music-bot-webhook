const express = require('express');

const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

app.get('/', (req, res) => {
const mode = req.query['hub.mode'];
const challenge = req.query['hub.challenge'];
const token = req.query['hub.verify_token'];

if (mode === 'subscribe' && token === verifyToken) {
console.log('WEBHOOK VERIFIED');
return res.status(200).send(challenge);
}

return res.sendStatus(403);
});

app.post('/', (req, res) => {
const timestamp = new Date().toISOString();

console.log("Webhook received: ${timestamp}");
console.log(JSON.stringify(req.body, null, 2));

res.sendStatus(200);
});

app.get('/health', (req, res) => {
res.status(200).send('ZYRE MUSIC BOT webhook is running.');
});

app.listen(port, () => {
console.log("ZYRE MUSIC BOT webhook listening on port ${port}");
});