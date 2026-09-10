const dns = require('dns');
const net = require('net');
const https = require('https');
const fs = require('fs');

const raw = fs.readFileSync('.env', 'utf8');
const m = raw.match(/^MONGODB_URI=(.+)$/m);
const uri = m ? m[1].trim() : '';
const host = uri.replace('mongodb+srv://', '').split('@')[1].split('/')[0].split('?')[0];

function dnsQueryDoh(name, type) {
  return new Promise((resolve, reject) => {
    https.get('https://cloudflare-dns.com/dns-query?name=' + encodeURIComponent(name) + '&type=' + type,
      { headers: { accept: 'application/dns-json' } }, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('bad json')); } });
      }).on('error', reject).setTimeout(8000, () => reject(new Error('timeout')));
  });
}

function buildQuery(name, type) {
  const transactionId = Math.floor(Math.random() * 65536);
  const flags = 0x0100;
  const header = Buffer.alloc(12);
  header.writeUInt16BE(transactionId, 0);
  header.writeUInt16BE(flags, 2);
  header.writeUInt16BE(1, 4); // qdcount
  header.writeUInt16BE(0, 6); // ancount
  header.writeUInt16BE(0, 8); // nscount
  header.writeUInt16BE(0, 10); // arcount
  
  const nameBytes = [];
  for (const label of name.split('.')) {
    nameBytes.push(Buffer.from([label.length]));
    nameBytes.push(Buffer.from(label));
  }
  nameBytes.push(Buffer.from([0]));
  
  const qbuf = Buffer.alloc(4);
  qbuf.writeUInt16BE(type, 0);
  qbuf.writeUInt16BE(1, 2); // IN class
  
  return Buffer.concat([header, Buffer.concat(nameBytes), qbuf]);
}

function parseName(buf, offset) {
  const labels = [];
  const originalOffset = offset;
  let jumped = false;
  while (true) {
    if (offset >= buf.length) throw new Error('DNS parse: offset exceeded');
    const len = buf[offset];
    if (len === 0) { offset++; break; }
    if ((len & 0xC0) === 0xC0) {
      const ptr = ((len & 0x3F) << 8) | buf[offset + 1];
      if (!jumped) { offset += 2; }
      offset = ptr;
      jumped = true;
      continue;
    }
    offset++;
    if (offset + len > buf.length) throw new Error('DNS parse: label exceeds');
    labels.push(buf.slice(offset, offset + len).toString('ascii'));
    offset += len;
  }
  return { name: labels.join('.'), offset: jumped ? originalOffset + 2 : offset };
}

function parseResponse(buf) {
  if (buf.length < 12) throw new Error('Response too short');
  const ancount = buf.readUInt16BE(6);
  let offset = 12;
  for (let i = 0; i < 1; i++) { // 1 question
    ({ offset } = parseName(buf, offset));
    offset += 4;
  }
  const answers = [];
  for (let i = 0; i < ancount; i++) {
    const { name, offset: newOffset } = parseName(buf, offset);
    offset = newOffset;
    const type = buf.readUInt16BE(offset); offset += 2;
    buf.readUInt16BE(offset); offset += 2; // class
    buf.readUInt32BE(offset); offset += 4; // ttl
    const rdlen = buf.readUInt16BE(offset); offset += 2;
    const rdata = buf.slice(offset, offset + rdlen);
    offset += rdlen;
    
    let data = null;
    if (type === 1 && rdata.length >= 4) {
      data = rdata[0] + '.' + rdata[1] + '.' + rdata[2] + '.' + rdata[3];
    } else if (type === 28 && rdata.length >= 16) {
      const parts = [];
      for (let i = 0; i < 16; i += 2) parts.push(rdata[i].toString(16) + rdata[i+1].toString(16));
      data = parts.join(':');
    } else if (type === 2 || type === 5) {
      ({ name: data } = parseName(rdata, 0));
    } else if (type === 6 && rdata.length >= 6) {
      const priority = rdata.readUInt16BE(0);
      const weight = rdata.readUInt16BE(2);
      const port = rdata.readUInt16BE(4);
      ({ name: target } = parseName(rdata, 6));
      data = { priority, weight, port, target };
    } else if (type === 16) {
      let s = '';
      let idx = 0;
      while (idx < rdata.length) {
        const len = rdata[idx]; idx++;
        s += rdata.slice(idx, idx + len).toString('ascii');
        idx += len;
      }
      data = s;
    }
    answers.push({ name, type, data });
  }
  return answers;
}

async function queryTcp(nsIp, nsPort, name, type) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(nsPort, nsIp, () => {
      console.log('  TCP connected to', nsIp + ':' + nsPort);
      const query = buildQuery(name, type);
      console.log('  Sending query, length:', query.length, 'bytes');
      console.log('  Query hex:', query.toString('hex'));
      socket.write(query);
      console.log('  Query sent successfully');
    });
    let allData = Buffer.alloc(0);
    socket.on('data', (data) => {
      console.log('  DATA event, length:', data.length);
      console.log('  First 200 bytes hex:', data.slice(0, Math.min(200, data.length)).toString('hex'));
      console.log('  First 200 bytes raw:', data.slice(0, Math.min(200, data.length)).toString('binary'));
      allData = Buffer.concat([allData, data]);
    });
    socket.on('error', (err) => {
      console.log('  ERROR event:', err.message, 'code:', err.code);
    });
    socket.on('close', (hadError) => {
      console.log('  CLOSE event. hadError:', hadError, 'totalBytes:', allData.length);
      if (allData.length > 0) {
        console.log('  Full data hex:', allData.toString('hex'));
      }
    });
    socket.setTimeout(10000, () => {
      console.log('  TIMEOUT')
      socket.destroy();
      reject(new Error('timeout'));
    });
  });
}

async function test() {
  // Get NS servers
  const nsRes = await dnsQueryDoh('mongodb.net', 2);
  const nsServers = (nsRes.Answer || []).filter(a => a.type === 2).map(a => a.data.replace(/\.$/, ''));
  console.log('NS servers:', nsServers.join(', '));
  
  // Resolve NS IPs via DoH
  for (const ns of nsServers) {
    console.log('\nResolving', ns, '...');
    for (let i = 0; i < 3; i++) {
      try {
        const r = await dnsQueryDoh(ns, 1);
        const ips = (r.Answer || []).filter(a => a.type === 1).map(a => a.data);
        if (ips.length > 0) {
          console.log('  IP:', ips.join(', '));
          break;
        }
      } catch(e) { console.log('  Attempt', i+1, 'failed:', e.message); if (i<2) await new Promise(r=>setTimeout(r,1000)); }
    }
  }
  
  // Now try SRV via raw TCP to each NS
  const srvName = '_mongodb._tcp.' + host;
  console.log('\n\nSRV query:', srvName);
  for (const ns of nsServers) {
    console.log('\nTrying', ns, '...');
    // Get NS IP
    let nsIp = null;
    for (let i = 0; i < 3; i++) {
      try {
        const r = await dnsQueryDoh(ns, 1);
        const ips = (r.Answer || []).filter(a => a.type === 1).map(a => a.data);
        if (ips.length > 0) { nsIp = ips[0]; break; }
      } catch(e) { if (i<2) await new Promise(r=>setTimeout(r,1000)); }
    }
    if (!nsIp) { console.log('  Could not resolve NS IP'); continue; }
    console.log('  NS IP:', nsIp);
    
    for (let i = 0; i < 3; i++) {
      try {
        const answers = await queryTcp(nsIp, 53, srvName, 6);
        console.log('  Answers:', JSON.stringify(answers, null, 2));
        if (answers.length > 0) return answers;
      } catch(e) {
        console.log('  Attempt', i+1, 'failed:', e.message);
        if (i<2) await new Promise(r=>setTimeout(r,1000));
      }
    }
  }
}

test().catch(e => console.error('FATAL:', e.message));
