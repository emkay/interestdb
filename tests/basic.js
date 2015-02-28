var test = require('tape');
var rimraf = require('rimraf');
var fs = require('fs');
var InterestDb = require('..');
var db;

test('db setup', function (t) {
    t.plan(1);
    db = InterestDb({
        dbName: __dirname + '/testdb',
        memdown: true
    });
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

test('keys and values', function (t) {
    t.plan(3);

    db().keys(function (err, keys) {
        t.deepEqual(keys, ['cats', 'mutton'], 'keys should equal');
    });

    db().values(function (err, values) {
        t.deepEqual(values, ['1', '2'], 'values should equal');
    });

    db().keysAndValues(function (err, keysAndValues) {
        t.deepEqual(keysAndValues, [{key: 'cats', value: '1'}, {key: 'mutton', value: '2'}], 'keysAndValues should equal');
    });
});

test('stddev', function (t) {
    t.plan(1);

    db().stddev(function (err, value) {
        t.equal(value, 0.5);
    });
});

test('zscore', function (t) {
    t.plan(1);

    db().zscore(5, function (err, value) {
        t.equal(value, 7, 'zscore should be correct');
    });
});
