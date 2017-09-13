'use strict';

const MAX_ATTEMPTS = 5
    , STEP = 1000
    , sleep = require('co-sleep')
    ;

module.exports = class Retrier {

    constructor(method, args, opts, ctx) {
        opts = opts || {};
        this.method = method;
        this.args = args;
        this.attempt = 0;
        this.max_attempts = opts.max_attempts || MAX_ATTEMPTS;
        this.step = opts.step || STEP;
        this.sleep = opts.sleep || sleep;
        this.logger = opts.logger || { error: function(){} };
        this.shouldRetry = opts.shouldRetry || (() => true);
        if (ctx == undefined) {
          this.ctx=null
        } else {
          this.ctx=ctx
        }
    }

    *_attempt() {
        return (yield this.method.apply(this.ctx, this.args));
    }

    _calc_sleep() {
        return Math.random() * (Math.pow(2, this.attempt) * this.step);
    }

    *run() {
        let lastError;
        for(let i = 0; i < this.max_attempts; i++) {
            try {
                return (yield this._attempt())
            } catch(err) {
              lastError = err;
              if( ! this.shouldRetry(err) ) {
                throw lastError;
              } else {
                this.attempt++;
                let slp = this._calc_sleep();
                this.logger.error(err);
                this.logger.error('Retrying', this.attempt, slp, 'ms');
                yield this.sleep(slp)
              }
            }
        }
        throw lastError
    }
}
