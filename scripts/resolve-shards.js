const https = require('https');
function dnsQuery(name, type) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      'https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(name) + '&type=' + type,
      { headers: { accept: 'application/dns-json' } },
      (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('bad json')); } });
      }
    );
    req.on('error', reject);
    req.setTimeout(8000, () => { req.destroy(); reject(new Error('timeout')); });
  });
}
const host = 'cluster0.qgcsfty.mongodb.net';
(async () => {
  const shards = [
    'cluster0-shard-00-00.' + host,
    'cluster0-shard-00-01.' + host,
    'cluster0-shard-00-02.' + host,
  ];
  for (const s of shards) {
    try {
      const r = await dnsQuery(s, 1);
      console.log(s + ' =>', JSON.stringify(r.Answer));
    } catch(e) {
      console.log(s + ' => ERROR:', e.message);
    }
  }
})().catch(e => console.error('ERR:', e.message));
