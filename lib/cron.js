/* Copyright (c) 2012 Mircea Alexandru */

var _       = require('underscore');
var uuid    = require('uuid');
var cronJob = require('cron').CronJob;

module.exports = function( options ) {
  var seneca = this
  var name  = 'cron'
  var cronJobs = {}

  seneca.add({role:name, cmd:'addjob'},function(msg, respond){
    var cron_time = msg.time
    var action = msg.act
    var after = msg.after
    var timezone = msg.timezone

    seneca.log.debug('setting cron for', msg, action, after)

    var job = new cronJob(cron_time, action, after, true, timezone);
    var id = uuid()
    cronJobs[id] = job

    respond(null, id)
  });

  seneca.add({role:name, cmd:'stopjob'},function(msg, respond){
    var id = msg.id

    seneca.log.debug('stop cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      seneca.log.debug('cannot stop job, job not found', id)
      respond(new Error('invalid cron job ' + id))
    }
    else{
      var job = cronJobs[id]
      job.stop();
      respond()
    }
  });

  seneca.add({role:name, cmd:'startjob'},function(msg, respond){
    var id = msg.id

    seneca.log.debug('start cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      seneca.log.debug('cannot start job, job not found', id)

      respond(new Error('invalid cron job ' + id))// here I must report error
    }
    else{
      var job = cronJobs[id]
      job.start();
      respond()
    }
  });

  seneca.add({role:name, cmd:'closejob'}, function(msg, respond){
    var id = msg.id

    seneca.log.debug('close cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      seneca.log.debug('cannot close job, job not found', id)
      respond(new Error('invalid cron job ' + id))// here I must report error
    }
    else{
      var job = cronJobs[id]
      delete cronJobs[id]
      job.stop();
      respond()
    }
  });

  seneca.add({cmd:'close'}, function(msg, respond){
    seneca.log.debug('close cron jobs')
    for (var id in cronJobs) {
      var job = cronJobs[id];
      seneca.log.debug('close cron job', id)
      job.stop();
    }
    respond()
  })

  return name;
}
