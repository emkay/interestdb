var Writable = require('stream').Writable;
var levelup = require('levelup');
var incr = require('level-incr');

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

    self.db = incr(levelup('./interestdb'));
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
                var namespace = [self.key, like, 'count'].join(':');
                self.db.incr(namespace);
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

    var rs = self.db.createReadStream();
    return rs;
};

module.exports = Interest;
