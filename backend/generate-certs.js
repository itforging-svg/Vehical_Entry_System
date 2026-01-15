const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

fs.writeFileSync(path.join(__dirname, 'key.pem'), pems.private);
fs.writeFileSync(path.join(__dirname, 'cert.pem'), pems.cert);

console.log('SSL Certificates generated successfully: key.pem, cert.pem');
