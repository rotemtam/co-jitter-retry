'use strict';

const Retrier = require('../src/index')
 , co = require('co');


let i = 0;

function *run(whatToSay) {

  if(i < 5) {
    i++;
    throw new Error('Not 5 yet')
  }

  return whatToSay;
}

function *main() {
   let retrier = new Retrier(run, ['hello, world'], {logger: console, step: 100, max: 10})
  ;

  return (yield retrier.run());
}

co(main).then(console.log).catch(console.error);
