'use strict';

const expect = require('chai').expect
    , Promise = require('bluebird')
    , sinon = require('sinon');

const Retrier = require('../src/index');

require('co-mocha');
require('sinon-as-promised');

describe('Query retrier', function() {

    let Mock = {
      mock: function *() {}
    };

    describe('calculating sleep', function() {
        let r, step = 1000;

        before(function() {
            r = new Retrier(Mock.mock, [1]);
        });

        it('when attempt is 1 sleep is between 0-200', function() {
            r.attempt = 1;
            expect(r._calc_sleep()).to.be.within(0,2000)
        });

        it('when attempt is 2 sleep is between 0-400', function() {
            r.attempt = 2;
            expect(r._calc_sleep()).to.be.within(0,4000)
        });

        it('when attempt is 3 sleep is between 0-800', function() {
            r.attempt = 3;
            expect(r._calc_sleep()).to.be.within(0,8000)
        });

        it('when attempt is 4 sleep is between 0-1600', function() {
            r.attempt = 4;
            expect(r._calc_sleep()).to.within(0,16000)
        });
    })

    describe('retry mechanism', function() {
        let retrier, res, mock;
        before(function() {
            sinon.stub(Mock, 'mock');
            Mock.mock.onCall(0).rejects(false);
            Mock.mock.onCall(1).rejects(false);
            Mock.mock.onCall(2).rejects(false);
            Mock.mock.onCall(3).rejects(false);
            Mock.mock.onCall(4).resolves(true);
        });

        before(function() {
            retrier = new Retrier(Mock.mock, [1], {'sleep': () => Promise.resolve()});
        });

        before(function *() {
            res = yield retrier.run();
        });

        it('should run 5 times', function() {
          expect(Mock.mock.callCount).to.equal(5);
        });

        it('should return true in the end', function() {
            expect(res).to.equal(true);
        });

        after(function() {
            Mock.mock.restore();
        });
    });

    describe('retry decision', function() {
        let retrier, res, mock, err;
        before(function() {
            sinon.stub(Mock, 'mock');
            Mock.mock.onCall(0).rejects({status: 500});
            Mock.mock.onCall(1).rejects({status: 404});
        });

        before(function() {
            retrier = new Retrier(Mock.mock, [1], {
              'sleep': () => Promise.resolve(),
              'shouldRetry': (err) => err.status > 499
            });
        });

        before(function *() {
          try {
            res = yield retrier.run();
          } catch(error) {
            err = error;
          }
        });

        it('should run 2 times', function() {
          expect(Mock.mock.callCount).to.equal(2);
        });

        it('should throw an error in the end', function() {
            expect(err).to.eql({status: 404});
        });

        after(function() {
            Mock.mock.restore();
        });
    });
});
