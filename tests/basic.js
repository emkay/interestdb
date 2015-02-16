var test = require('tape');
var rimraf = require('rimraf');
var fs = require('fs');
var InterestDb = require('..');

var db = InterestDb({dbName: __dirname + '/testdb'});

test('db setup', function (t) {
    t.plan(1);
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

test('streams', function (t) {
    t.plan(1);

    var ws = db('arjan').createWriteStream();
    var rs = db('arjan').createReadStream();
    rs.on('data', function (data) {
        t.deepEqual(data, {key: 'mutton', value: '1'}, 'read mutton stream');
    });

    ws.write('mutton');
});

test('keys', function (t) {
    t.plan(1);
    db().keys(function (err, keys) {
        t.deepEqual(keys, ['cats', 'mutton'], 'keys should equal');
    });
});

rimraf(__dirname + '/testdb', function () {});
