/* Copyright (c) 2012 Mircea Alexandru */

var seneca   = require('seneca')
var cron     = require('../lib/cron')
var assert   = require('assert')
var si
var jobid

var counter = 0
var counter2 = 0

function initSeneca(){
  si = seneca({"log":"print"})
  si.log('start');
  si.use(cron, {})
}

function doConfig(){
  si.act({role:'cron',cmd:'addjob', time:'* * * * * *', act: function(){
    si.log('tick-tick', counter++);
  }, after: function(){
    si.log('Now I will end');
  }, timezone: null}, function(err, id){
    assert(!err)
    jobid = id
    si.log('job created', jobid)
    setTimeoutTests()
  })

  function setTimeoutTests(){
    si.act({role:'cron',cmd:'stopjob', id: 'non-existent-job'}, function(err, res){
      assert(err)
    })

    si.act({role:'cron',cmd:'startjob', id: 'non-existent-job'}, function(err, res){
      assert(err)
    })

    // stop after 10s
    setTimeout(function(){
      si.log('exit');
      si.act({role:'cron',cmd:'stopjob', id: jobid}, function(err, res){
        si.log('stop cron job', jobid)
        assert(!err)
      })
    },(10*1000));

    // test counter value
    setTimeout(function(){
      si.log('test counter value. Cron job was stopped please wait...');
      assert(counter > 7)
      counter2 = counter
    },(11*1000));

    // test counter stops from sec 10
    setTimeout(function(){
      si.log('test counter was stopped');
      assert.equal(counter2, counter)
    },(19*1000));

    setTimeout(function(){
      si.log('start again the job', jobid);
      si.act({role:'cron',cmd:'startjob', id: jobid}, function(err, res){
        si.log('start cron job', jobid)
        assert(!err)
      })
    },(20*1000));

    // test counter increase value
    setTimeout(function(){
      si.log('test counter was restarted');
      assert(counter2 < counter)
    },(25*1000));

    setTimeout(function(){
      si.log('exit');
      si.act({role:'cron',cmd:'close'}, function(err, res){
        si.log('cron plugin closed')
        si.close();
        assert(!err)
      })
    },(30*1000));
  }
}

initSeneca();
doConfig();
