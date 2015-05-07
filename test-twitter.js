request = require('request-json');

var client = request.createClient('http://localhost:8080/');

var data = {
	name : 'motos',
	query : 'Valentino Rossi'
};
/*
var data2 = {
	name : 'futbol',
	query : 'Messi'
};

client.post('/stream', data, function(err, res, body){
	return console.log(res.body);
});
*/
client.put('/stream/motos', data, function(err, res, body){
	return console.log(res.body);
});
/*
client.post('/stream', data2, function(err, res, body){
	return console.log(res.body);
});
*/