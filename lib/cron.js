/* Copyright (c) 2012 Mircea Alexandru */

function CronPlugin() {
  var self   = {}
  self.name  = 'cron'
  var si
  var opts
  var cronJobs = []

    self.init = function( init_si, init_opts, cb ){
    si = init_si
    opts = init_opts

    si.add({role:self.name,cmd:'configure'},function(args,cb){
      var cron_time = args.time
      var action = args.act
      var after = args.after
      var timezone = args.timezone

      si.log('setting cron for', args, action, after)

      var cronJob = require('cron').CronJob;
      var job = new cronJob(cron_time, action, after, true, timezone);
      cronJobs.push(job)
    });

    cb()
  }

  self.close = function( cb ){
    si.log('close cron jobs')
    for(var i=0; i<cronJobs.length; i++) {
      var job = cronJobs[i];
      si.log('close cron job', job)
      job.stop();
    }
  }

  return self
}

module.exports = new CronPlugin()
