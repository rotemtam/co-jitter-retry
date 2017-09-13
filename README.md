### co-jitter-retry

Retry generators, with full jitter.


### Why

When :poop: hits the fan, and a service you're depending on fails, you want
to implement a retry mechanism. The most common decision here is to implement
Exponential Backoff.  Well, turns out it isn't the wisest decision, and adding
jitter to your backoff strategy can help you a lot. Read more
about it here: https://www.awsarchitectureblog.com/2015/03/backoff.html.

### Updates

Version 2.0.0:
- Changed max argument name to "max_attempts". It now counts total runs of function instead of total retries.
- Retrier.run() will now throw the last error in case the last attempts doesn't succeed. 

### Install

```bash
npm install co-jitter-retry
```

### Usage

```js
const Retrier = require('co-jitter-retry')
 , co = require('co');

function *getSomethingFromDB(param1, param2) {
  // ...
}

function *main() {
  let runner = new Retrier(getSomethingFromDB, ['Hello', 'World']);  
  yield runner.run()
}

co(main).then(console.log).catch(console.error);
```

### Methods

__Retrier.constructor(method, args, opts)__

Returns an object with a `.run()` generator method.

__Parameters__

- __method__ - The generator to retry
- __args__ - Array of arguments to pass to the generator, which will be called with `.method.apply()`
- __opts__ - A config object with these optional parameters:
  - max - integer. maximum number of times to retry
  - step - step size in milliseconds
  - logger - an object with a `.error(msg)` function. (probably `console`). Information
  about retries and errors will be logged here. For debug purposes.
  - shouldRetry - a function which receives an error thrown by the generator and decides
  whether or not it should retry. For example, you might want to retry an HTTP request
  if the status code is 500 or higher, in order to ignore errors caused by bad requests
  on your side. In which case you could pass: ```js (err) => err.status > 499 ```
 - __ctx__  - Context object.
 
Example:

```js
{
  max: 10, // maximum 10 retries
  step: 1000, // step size of 1 second
  logger: console,
  shouldRetry: (err) => err.status > 499
}
```
