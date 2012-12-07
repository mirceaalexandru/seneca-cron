/* Copyright (c) 2012 Mircea Alexandru */

var seneca   = require('seneca')
var cron     = require('../lib/cron')

var si

function initSeneca(){
  si = seneca({"log":"print"})
  si.log('start');
  si.use(cron, {})
}

function doConfig(){
  si.act({role:'cron',cmd:'configure', time:'* * * * * *', act: function(){
    si.log('tick-tick');
  }, after: function(){
    si.log('Now I will end');
  }, timezone: null}, function(err,req){


  }, function(){})

  setTimeout(function(){
    si.log('exit');
    si.close();
  },(2*1000));
}

initSeneca();
doConfig();
