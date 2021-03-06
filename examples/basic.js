var fs = require('fs');
var InterestDb = require('..');
var db = InterestDb();

var likes = fs.createReadStream(__dirname + '/likes.txt');
var dbStream = db('mike').createWriteStream();
likes.pipe(dbStream);

db().keys(console.log);

db('mike').count('cats', function (err, data) {
    console.log(data);
});

var rs = db('mike').createReadStream();
rs.on('data', function (data) {
    console.log(data);
});

db('sara').likes('cats');
db().stddev(console.log);
