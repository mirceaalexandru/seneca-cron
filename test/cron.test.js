/* Copyright (c) 2012 Mircea Alexandru */

var seneca   = require('seneca')
var cron     = require('../lib/cron')

var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
const expect = Code.expect;

var senecaOpts = {"log":"print"}
var si
var jobid

var counter = 0
var counterPauseSnaphot = 0

describe('cron', { timeout: 35 *1000 }, function () {

  lab.beforeEach(function initSeneca(done){
    si = seneca(senecaOpts)
    si.log('start');
    si.use(cron, {})
    done()
  })

  lab.it('can add cron task and remove them', function(done){


    function afterAct(){
      si.log('Now I will end');
    }
// FIXME: check syntax-> ho pass action
   si.act({role:'cron',cmd:'addjob', time:'* * * * * *', act: function incrementTick(){
     si.log('tick-tick', counter++);
   }, after: afterAct, timezone: null}, function(err, res){
      expect(err).to.not.exist()
      jobid = res.id
      si.log('job created', jobid)
      setTimeoutTests()
    })


    function setTimeoutTests(){
      si.act({role:'cron', cmd:'stopjob', id: 'non-existent-job'}, function(err, res){

        expect(err).to.exist()
      })

      si.act({role:'cron', cmd:'startjob', id: 'non-existent-job'}, function(err, res){

        expect(err).to.exist()
      })

      // stop after 10s
      setTimeout(function(){

        si.log('exit');
        si.act({role:'cron',cmd:'stopjob', id: jobid}, function(err, res){
          expect(err).to.not.exist()
          expect(res.id).to.equal(jobid)
          si.log('stop cron job', jobid)
        })
      },(10*1000));

      // test counter value
      setTimeout(function(){

        si.log('test counter value. Cron job was stopped please wait...');
        expect(counter).to.be.above(7)
        counterPauseSnaphot = counter
      },(11*1000));

      // test counter stops from sec 10
      setTimeout(function(){

        si.log('test counter was stopped');
        expect(counter).to.be.equal(counterPauseSnaphot)
      },(19*1000));

      setTimeout(function(){

        si.log('start again the job', jobid);
        si.act({role:'cron',cmd:'startjob', id: jobid}, function(err, res){
          si.log('start cron job', jobid)
          expect(err).to.not.exist()
        })
      },(20*1000));

      // test counter increase value
      setTimeout(function(){

        si.log('test counter was restarted');
        expect(counterPauseSnaphot).to.be.below(counter)
      },(25*1000));

      setTimeout(function(){

        si.log('exit');
        si.act({role:'cron', cmd: 'close'}, function(err, res){
          si.log('cron plugin closed')
          expect(err).to.not.exist()
          si.close(done)
        })
      },(30*1000));
    }
  })
})

