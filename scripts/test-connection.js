var fs = require('fs');
var dns = require('dns').promises;
dns.setServers(['8.8.8.8', '1.1.1.1']);
var { MongoClient } = require('mongodb');

async function test() {
  var c = fs.readFileSync('.env.local', 'utf8');
  var m = c.match(/MONGODB_URI[=:]\s*(.+)/);
  var uri = m[1].replace(/[\r\n"']/g, '').trim();
  
  var body = uri.replace('mongodb+srv://', '');
  var atIndex = body.indexOf('@');
  var credentials = body.substring(0, atIndex);
  var afterAt = body.substring(atIndex + 1);
  var slashIndex = afterAt.indexOf('/');
  var hostPart = afterAt.substring(0, slashIndex);
  var restOfUri = afterAt.substring(slashIndex);
  
  var srv = await dns.resolveSrv('_mongodb._tcp.' + hostPart);
  var hosts = srv.map(function(r) { return r.name + ':' + r.port; }).join(',');
  
  var directUri = 'mongodb://' + credentials + '@' + hosts + restOfUri + '&tls=true';
  
  var user = credentials.split(':')[0];
  var pass = decodeURIComponent(credentials.split(':').slice(1).join(':'));
  console.log('User:', user);
  console.log('Pass length:', pass.length);
  console.log('Pass char codes:', [...pass].map(function(c) { return c.charCodeAt(0); }));
  
  var client = new MongoClient(directUri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
    retryWrites: true,
    w: 'majority',
  });
  try {
    await client.connect();
    var db = client.db('hrms');
    var users = await db.collection('users').find({}).toArray();
    console.log('CONNECTED! Users:', users.length);
    users.forEach(function(u) {
      console.log('  -', u.email, '| role:', u.role);
    });
    await client.close();
  } catch(err) {
    console.log('FAILED:', err.message.substring(0, 200));
  }
}
test();
