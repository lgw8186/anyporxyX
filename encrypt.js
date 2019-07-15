var fs = require('fs')
var NodeRSA = require('node-rsa')

function encrypt() {
 fs.readFile('./pem/private.pem', function (err, data) {
 var key = new NodeRSA(data);
 var source = fs.readFileSync('./app/rule_mock.js', 'utf8');
 console.log(source);
 let encryptSource = key.encryptPrivate(source, 'base64');
 console.log(encryptSource);
 fs.writeFileSync('./app/mock_rule.js',encryptSource);
 console.log('encrypt success');
 });
}
//generator();
encrypt();