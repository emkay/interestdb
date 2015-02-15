var test = require('tape');
var rimraf = require('rimraf');
var InterestDb = require('..');

var db;

rimraf.sync(__dirname + '/testdb');

test('db setup', function (t) {
    t.plan(1);
    db = InterestDb({dbName: __dirname + '/testdb'});
    t.ok(db);
});

test('likes and counts', function (t) {
    t.plan(2);
    db('arjan').likes('mutton', function () {
        db('arjan').count('mutton', function (err, count) {
            t.equal(count, '1', 'Arjan loves mutton');
        });
    });
    db('sam').likes('cats', function () {
        db('sam').count('cats', function (err, count) {
            t.equal(count, '1', 'Sam loves cats');
        });
    });
});
