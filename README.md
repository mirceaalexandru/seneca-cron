![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) cron storage plugin

# seneca-cron
[![npm version][npm-badge]][npm-url] 
[![Build Status][travis-badge]][travis-url]
[![Coverage Status](https://coveralls.io/repos/mirceaalexandru/seneca-cron/badge.svg?branch=master&service=github)](https://coveralls.io/github/mirceaalexandru/seneca-cron?branch=master)


Cron plugin for Seneca framework.

For a gentle introduction to Seneca itself, see the
[senecajs.org](http://senecajs.org) site.

If you're using this plugin module, feel free to contact me on twitter if you
have any questions! :) [@Alexandru_M](https://twitter.com/Alexandru_M)

## Install
To install, simply use npm. Remember you will need to install [Seneca.js](http://senecajs.org) separately.

```
npm install seneca
npm install seneca-mysql-store
```

## Test
To run tests, simply use npm:

```
npm run test
```

## Quick Example
```js
var seneca = require('seneca')()
seneca.use('cron')
var jobid

function someAction() {
    si.log.debug('tick-tick');
}

si.act({ role: 'cron', cmd: 'addjob', time: '* * * * * *', act: someAction(), after: null, timezone: null }, function (err, res) {
  jobid = res.id
})
```

## Actions

### Add cron job

 * role:name, cmd:'addjob'
 * parameters: 
   * time - Cron [pattern](http://crontab.org/) - see bellow
   * act - Function to be executed on cron
   * after - Function to be executed when the job stops
   * timezone - Specify the timezone for the execution. This will modify the actual time relative to your timezone
 * callback with usual node error-first callback structure - (err, response) where response is JSON:
   * id: job id
   * status: 'added'

### Start a cron job

 * role:name, cmd:'startjob'
 * parameters: 
   * id - id of job to be started
 * callback with usual node error-first callback structure - (err, response) where response is JSON:
   * id: job id
   * status: 'started'

### Stop a cron job

 * role:name, cmd:'stopjob'
 * parameters: 
   * id - id of job to be stopped
 * callback with usual node error-first callback structure - (err, response) where response is JSON:
   * id: job id
   * status: 'stopped'

### Close a cron job - it will remove completely the specified job

 * role:name, cmd:'closejob'
 * parameters: 
   * id - id of job to be closed
 * callback with usual node error-first callback structure - (err, response) where response is JSON:
   * id: job id
   * status: 'closed'

### Close all cron jobs - it will remove completely all jobs

 * role:name, cmd:'close'
 * callback with usual node error-first callback structure - (err, response)


## Cron patterns

[Here](http://crontab.org/) are presented information regarding the cron job patterns.

### Cron Ranges
When specifying your cron values you'll need to make sure that your values fall within the ranges.

Supported ranges specifiers:

 * Asterisk. E.g. *
 * Ranges. E.g. 1-3,5
 * Steps. E.g. */2

Supported ranges types:

 * Seconds: 0-59
 * Minutes: 0-59
 * Hours: 0-23
 * Day of Month: 1-31
 * Months: 0-11
 * Day of Week: 0-6


## Contributing

The [Senecajs](http://senecajs.org) org encourage open participation. 
If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.


[travis-badge]: https://api.travis-ci.org/mirceaalexandru/seneca-cron.svg
[travis-url]: https://travis-ci.org/mirceaalexandru/seneca-cron
[npm-badge]: https://badge.fury.io/js/seneca-cron.svg
[npm-url]: https://badge.fury.io/js/seneca-cron
