var fs = require('fs');
var InterestDb = require('..');
var db = InterestDb();

var likes = fs.createReadStream(__dirname + '/likes.txt');
var dbStream = db('mike').createWriteStream();
likes.pipe(dbStream);

var counts = db('mike').createReadStream();
counts.on('data', function (data) {
    console.log(data);
});
