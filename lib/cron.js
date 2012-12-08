/* Copyright (c) 2012 Mircea Alexandru */

var common  = require('seneca/lib/common');
var _       = common._;
var uuid    = common.uuid;
var cronJob = require('cron').CronJob;

function CronPlugin() {
  var self   = {}
  self.name  = 'cron'
  var si
  var opts
  var cronJobs = {}

  self.init = function( init_si, init_opts, cb ){
    si = init_si
    opts = init_opts

    si.add({role:self.name,cmd:'addjob'},function(args,cb){
      var cron_time = args.time
      var action = args.act
      var after = args.after
      var timezone = args.timezone

      si.log('setting cron for', args, action, after)

      var job = new cronJob(cron_time, action, after, true, timezone);
      var id = uuid()
      cronJobs[id] = job

      cb(null, id)
    });

    si.add({role:self.name,cmd:'stopjob'},function(args,cb){
      var id = args.id

      si.log('stop cron job', id)
      if ( _.isUndefined(cronJobs[id]) ){
        si.log('cannot stop job, job not found', id)
        cb(new Error('invalid cron job ' + id))
      }
      else{
        var job = cronJobs[id]
        job.stop();
        cb()
      }
    });

    si.add({role:self.name,cmd:'startjob'},function(args,cb){
      var id = args.id

      si.log('start cron job', id)
      if ( _.isUndefined(cronJobs[id]) ){
        si.log('cannot start job, job not found', id)
        cb(new Error('invalid cron job ' + id))// here I must report error
      }
      else{
        var job = cronJobs[id]
        job.start();
        cb()
      }
    });

    si.add({role:self.name,cmd:'closejob'},function(args,cb){
      var id = args.id

      si.log('close cron job', id)
      if ( _.isUndefined(cronJobs[id]) ){
        si.log('cannot close job, job not found', id)
        cb(new Error('invalid cron job ' + id))// here I must report error
      }
      else{
        var job = cronJobs[id]
        delete cronJobs[id]
        job.stop();
        cb()
      }
    });

    si.add({role:self.name,cmd:'close'},function(args,cb){
      si.log('close cron jobs')
      for (var id in cronJobs) {
        var job = cronJobs[id];
        si.log('close cron job', id)
        job.stop();
      }
      cb()
    })

    cb()
  }

  return self;
}

module.exports = new CronPlugin()
