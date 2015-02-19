var Writable = require('stream').Writable;
var levelup = require('levelup');
var sublevel = require('level-sublevel');
var incr = require('level-incr');
var Stats = require('fast-stats').Stats;

function Interest(options) {
    var self = this;

    if (!(self instanceof Interest)) {
        return new Interest(options);
    }
    if (!options) {
        self.options = {};
    } else {
        self.options = options;
    }

    self.options.sep = self.options.sep || '\n';
    var dbName = self.options.dbName || 'interestdb';

    self.db = incr(sublevel(levelup(dbName)));
    self._ws = Writable();

    return function thing(k, v) {
        if (k) {
            self.key = k;
        }

        if (v) {
            self.value = v;
        }
        return self;
    };
}

Interest.prototype.createWriteStream = function () {
    var self = this;

    if (!self.key) {
        throw new Error('Key must be set');
    }

    self._ws._write = function (chunk, enc, next) {
        var likes = chunk.toString().split(self.options.sep);
        likes.forEach(function (like) {
            if (like) {
                var sub = incr(self.db.sublevel(self.key));
                sub.incr(like, function (err, c) {
                    self.db.put(like, c);
                });
            }
        });
        next();
    };
    return self._ws;
};

Interest.prototype.createReadStream = function () {
    var self = this;
    var rs;
    if (!self.key) {
        rs = self.db.createReadStream();
    } else {
        rs = self.db.sublevel(self.key).createReadStream();
    }
    return rs;
};

Interest.prototype.count = function (v, cb) {
    var self = this;
    if (typeof v === 'function') {
        cb = v;
    } else {
        self.value = v;
    }

    if (!self.key || !self.value) {
        throw new Error('Key and Value must be set');
    }
    var sub = self.db.sublevel(self.key);
    sub.get(self.value, cb);
};

Interest.prototype.likes = function (v, cb) {
    var self = this;
    if (typeof v === 'function') {
        cb = v;
    } else {
        self.value = v;
    }
    if (!self.key || !self.value) {
        throw new Error('Key and Value must be set');
    }

    var sub = incr(self.db.sublevel(self.key));
    sub.incr(self.value, function (err, c) {
        self.db.put(self.value, c, cb);
    });
};

Interest.prototype.keys = function (cb) {
    var self = this;
    var keys = [];
    var rs = self.db.createReadStream();
    rs.on('data', function (data) {
        keys.push(data.key);
    });
    rs.on('end', function () {
        cb(null, keys);
    });
};

Interest.prototype.keysAndValues = function (cb) {
    var self = this;
    var keysAndValues = [];
    var rs = self.db.createReadStream();
    rs.on('data', function (data) {
        keysAndValues.push(data);
    });
    rs.on('end', function () {
        cb(null, keysAndValues);
    });
};

Interest.prototype.values = function (cb) {
    var self = this;
    var values = [];
    var rs = self.db.createReadStream();
    rs.on('data', function (data) {
        values.push(data.value);
    });
    rs.on('end', function () {
        cb(null, values);
    });
};


Interest.prototype.close = function (cb) {
    var self = this;
    cb = cb || function(){};
    self.db.close(cb);
};

Interest.prototype.stddev = function (cb) {
    var self = this;
    var stats = new Stats();
    self.values(function (err, data) {
        data.forEach(function (value) {
            stats.push(Number(value));
        });
        cb(null, stats.stddev());
    });
};

Interest.prototype.zscore = function (x, cb) {
    var self = this;
    var stats = new Stats();
    self.values(function (err, data) {
        data.forEach(function (value) {
            stats.push(Number(value));
        });
        var z = (x - stats.amean()) / stats.stddev();
        cb(null, z);
    });
};

module.exports = Interest;
