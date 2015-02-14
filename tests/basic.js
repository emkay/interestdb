var test = require('tape');
var InterestDb = require('..');

var db;

test('db setup', function (t) {
    t.plan(1);
    db = InterestDb({dbName: __dirname + '/testdb'});
    t.ok(db);
});

