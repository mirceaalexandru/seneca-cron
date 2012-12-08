/* Copyright (c) 2012 Mircea Alexandru */

var seneca   = require('seneca')
var cron     = require('../lib/cron')

var si
var jobid

function initSeneca(){
  si = seneca({"log":"print"})
  si.log('start');
  si.use(cron, {})
}

function doConfig(){
  si.act({role:'cron',cmd:'addjob', time:'* * * * * *', act: function(){
    si.log('tick-tick');
  }, after: function(){
    si.log('Now I will end');
  }, timezone: null}, function(error, id){
    jobid = id
    si.log('job created', jobid)
    setTimeoutTests()
  })

  function setTimeoutTests(){
    setTimeout(function(){
      si.log('exit');
      si.act({role:'cron',cmd:'stopjob', id: jobid}, function(){
        si.log('stop cron job', jobid)
        si.close();
      })

    },(10*1000));

    setTimeout(function(){
      si.log('exit');
      si.act({role:'cron',cmd:'startjob', id: jobid}, function(){
        si.log('start cron job', jobid)
        si.close();
      })

    },(20*1000));

    setTimeout(function(){
      si.log('exit');
      si.act({role:'cron',cmd:'close'}, function(){
        si.log('cron plugin closed')
        si.close();
      })

    },(30*1000));
  }
}

initSeneca();
doConfig();
