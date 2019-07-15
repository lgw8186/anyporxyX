var fs = require('fs')
var NodeRSA = require('node-rsa')
function decrypt() {
 fs.readFile('./pem/public.pem', function (err, data) {
 var key = new NodeRSA(data);
 var encryptSource = fs.readFileSync('./app/mock_rule.js', 'utf8');
 //console.log(encryptSource);
 let source = key.decryptPublic(encryptSource, 'utf8');
 //console.log(source);
 return source
 });
}
var source = decrypt();
console.log(source);

eval(''+ source +'');