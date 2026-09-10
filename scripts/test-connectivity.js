const https = require('https');
const dns = require('dns');

function dnsQueryDoh(name, type) {
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

async function test() {
  const queries = [
    // The cluster hostname itself with type A
    { name: 'cluster0.qgcsfty.mongodb.net', type: 1, label: 'cluster0 A (doh)' },
    // mongodb.net zone
    { name: 'mongodb.net', type: 2, label: 'mongodb.net NS (doh)' },
    // Try the exact SRV target pattern that Atlas uses
    { name: '_mongodb._tcp.cluster0.qgcsfty.mongodb.net', type: 6, label: 'SRV (doh)' },
    // Sometimes Atlas uses a different sub-domain structure
    { name: 'cluster0-shard-00-00.cluster0.qgcsfty.mongodb.net', type: 5, label: 'shard0 CNAME (doh)' },
    // Try the cluster hostname with type ANY (not supported by Cloudflare, but try)
    // Try system DNS for the cluster hostname
  ];

  for (const q of queries) {
    console.log('\n--- ' + q.label + ' ---');
    try {
      const r = await dnsQueryDoh(q.name, q.type);
      console.log(JSON.stringify(r, null, 2));
    } catch(e) {
      console.log('ERROR:', e.message);
    }
    // Also try system DNS for A records
    if (q.type === 1) {
      await new Promise(r => setTimeout(r, 300));
      dns.resolve(q.name, 'A', (err, addresses) => {
        if (err) console.log('  [system DNS] ERROR:', err.code, err.message);
        else console.log('  [system DNS] A:', addresses.join(', '));
      });
    }
  }
}

test().catch(e => console.error('FATAL:', e));
