/* Copyright (c) 2012 Mircea Alexandru */

var _       = require('underscore');
var uuid    = require('uuid');
var cronJob = require('cron').CronJob;

module.exports = function (options, register) {
  var name  = 'cron'
  var seneca = this
  var opts
  var cronJobs = {}

  seneca.add({role:name,cmd:'addjob'},function(args,cb){
    var cron_time = args.time
    var action = args.act
    var after = args.after
    var timezone = args.timezone

    console.log('setting cron for', args, action, after)

    var job = new cronJob(cron_time, action, after, true, timezone);
    var id = uuid()
    cronJobs[id] = job

    cb(null, id)
  });

  seneca.add({role:name,cmd:'stopjob'},function(args,cb){
    var id = args.id

    console.log('stop cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      console.log('cannot stop job, job not found', id)
      cb(new Error('invalid cron job ' + id))
    }
    else{
      var job = cronJobs[id]
      job.stop();
      cb()
    }
  });

  seneca.add({role:name,cmd:'startjob'},function(args,cb){
    var id = args.id

    console.log('start cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      console.log('cannot start job, job not found', id)
      cb(new Error('invalid cron job ' + id))// here I must report error
    }
    else{
      var job = cronJobs[id]
      job.start();
      cb()
    }
  });

  seneca.add({role:name,cmd:'closejob'},function(args,cb){
    var id = args.id

    console.log('close cron job', id)
    if ( _.isUndefined(cronJobs[id]) ){
      console.log('cannot close job, job not found', id)
      cb(new Error('invalid cron job ' + id))// here I must report error
    }
    else{
      var job = cronJobs[id]
      delete cronJobs[id]
      job.stop();
      cb()
    }
  });

  seneca.add({cmd:'close'},function(args,cb){
    console.log('close cron jobs')
    for (var id in cronJobs) {
      var job = cronJobs[id];
      console.log('close cron job', id)
      job.stop();
    }
    cb()
  })
  register()
}
