// Faux fournisseur OAuth2 (type Discord) pour les tests e2e : aucun appel réseau réel.
// GET /authorize : approuve et renvoie vers redirect_uri (ou refuse si /__deny a été appelé, une seule fois).
// POST /token : renvoie un jeton factice. GET /userinfo : renvoie un profil fixe.
const http = require('node:http');

const port = Number(process.env.MOCK_OAUTH_PORT || 9100);
let denyNext = false;

const profile = {
  id: 'e2e-discord-1',
  username: 'aventurier',
  global_name: 'Aventurier',
  avatar: null,
  email: null,
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname === '/health') {
    res.end('ok');
  } else if (url.pathname === '/__deny') {
    denyNext = true;
    res.end('ok');
  } else if (url.pathname === '/authorize') {
    const redirect = new URL(url.searchParams.get('redirect_uri'));
    if (denyNext) {
      denyNext = false;
      redirect.searchParams.set('error', 'access_denied');
    } else {
      redirect.searchParams.set('code', 'mock-code');
    }
    redirect.searchParams.set('state', url.searchParams.get('state') ?? '');
    res.writeHead(302, { Location: redirect.toString() });
    res.end();
  } else if (url.pathname === '/token') {
    req.resume();
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ access_token: 'mock-token', token_type: 'Bearer', expires_in: 3600, scope: 'identify email' }));
    });
  } else if (url.pathname === '/userinfo') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(profile));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => console.log(`Mock OAuth listening on ${port}`));
