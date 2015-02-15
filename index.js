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

    self.stats = new Stats();
    self.db = sublevel(levelup(dbName));
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
                sub.incr(like);
            }
        });
        next();
    };
    return self._ws;
};

Interest.prototype.createReadStream = function () {
    var self = this;
    if (!self.key) {
        throw new Error('Key must be set');
    }

    var rs = self.db.sublevel(self.key).createReadStream();
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

Interest.prototype.like = function (v) {
    var self = this;
    if (!self.key || !self.value) {
        throw new Error('Key and Value must be set');
    }

    var sub = self.db.sublevel(self.key);
    sub.incr(self.value);
};
module.exports = Interest;
