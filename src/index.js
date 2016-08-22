'use strict';

const MAX_ATTEMPTS = 5
    , STEP = 1000
    , sleep = require('co-sleep')
    ;

module.exports = class Retrier {

    constructor(method, args, opts) {
        opts = opts || {};
        this.method = method;
        this.args = args;
        this.attempt = 0;
        this.max = opts.max || MAX_ATTEMPTS;
        this.step = opts.step || STEP;
        this.sleep = opts.sleep || sleep;
        this.logger = opts.logger || { error: function(){} };
        this.shouldRetry = opts.shouldRetry || (() => true);
    }

    *_attempt() {
        return yield this.method.apply(null, this.args);
    }

    _calc_sleep() {
        return Math.random() * (Math.pow(2, this.attempt) * this.step);
    }

    *run() {
        for(let i = 0; i <= this.max; i++) {
            try {
                return (yield this._attempt())
            } catch(err) {
              if( ! this.shouldRetry(err) ) {
                throw err;
              } else {
                this.attempt++;
                let slp = this._calc_sleep();
                this.logger.error(err);
                this.logger.error('Retrying', this.attempt, slp, 'ms');
                yield this.sleep(slp)
              }
            }
        }
    }
}
