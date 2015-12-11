/* Copyright (c) 2012 Mircea Alexandru */

var seneca = require('seneca')
var cron = require('../lib/cron')

var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
const expect = Code.expect;

var senecaOpts = {"log": "print"}
var si, jobid, counter, counterPauseSnaphot

describe('cron', {timeout: 10 * 1000}, function () {


    function afterAct() {
        si.log.debug('Now I will end');
    }

    function incrementTick() {
        si.log.debug('tick-tick', counter++);
    }

    lab.beforeEach(function initSeneca(done) {
        si = seneca(senecaOpts)
        si.log.debug('start');
        si.use(cron, {})
        counter = 0
        counterPauseSnaphot = 0
        done()
    })

    it('trigger an error when I try to stop a job that do not exist', function (done) {
        si.act({role: 'cron', cmd: 'stopjob', id: 'non-existent-job'}, function (err, res) {

            expect(err).to.exist()
            done()
        })
    })

    it('trigger an error when I try to start a job that do not exist', function (done) {
        si.act({role: 'cron', cmd: 'startjob', id: 'non-existent-job'}, function (err, res) {

            expect(err).to.exist()
            done()
        })
    })


    it('can add cron task and remove it', function (done) {

        si.act({
            role: 'cron', cmd: 'addjob', time: '* * * * * *', act: incrementTick(), after: afterAct, timezone: null
        }, function (err, res) {
            expect(err).to.not.exist()
            jobid = res.id

            si.act({role: 'cron', cmd: 'stopjob', id: jobid}, function (err, res) {

                expect(err).to.not.exist()
                expect(res.id).to.equal(jobid)
                si.log.debug('stop cron job', jobid)

                si.close(done)
            })
        })
    })

    it('really start task and stop them', function (done) {

        si.act({
            role: 'cron', cmd: 'addjob', time: '* * * * * *', act: incrementTick, after: afterAct, timezone: null
        }, function (err, res) {

            expect(err).to.not.exist()
            jobid = res.id
            si.log.debug('job created', jobid)

            setTimeout(function () {

                si.act({role: 'cron', cmd: 'stopjob', id: jobid}, function (err, res) {
                    expect(err).to.not.exist()
                    expect(res.id).to.equal(jobid)
                    expect(counter).to.be.equal(4)
                    si.log.debug('stop cron job', jobid)

                    setTimeout(function () {
                        expect(counter).to.be.equal(4)
                        si.close(done)
                    }, (1500));
                })
            }, (4 * 1000 + 100));
        })
    })

    it('I can add, stop and restart a task', function (done) {

        si.act({
            role: 'cron', cmd: 'addjob', time: '* * * * * *', act: incrementTick, after: afterAct, timezone: null
        }, function (err, res) {

            expect(err).to.not.exist()
            jobid = res.id
            si.log.debug('job created', jobid)

            setTimeout(function () {

                si.log.debug('stop the task');
                si.act({role: 'cron', cmd: 'stopjob', id: jobid}, function (err, res) {
                    expect(err).to.not.exist()
                    expect(res.id).to.equal(jobid)
                    expect(counter).to.be.equal(2)
                    counterPauseSnaphot = counter
                })
            }, (2 * 1000 +100));

            setTimeout(function () {

                expect(counter).to.be.equal(counterPauseSnaphot)
                si.log.debug('restart the task');
                si.act({role: 'cron', cmd: 'startjob', id: jobid}, function (err, res) {
                    expect(err).to.not.exist()
                    expect(res.id).to.equal(jobid)
                })
            }, (4 * 1000 + 100));

            setTimeout(function () {

                si.log.debug('test counter was restarted');
                expect(counterPauseSnaphot).to.be.below(counter)
                si.act({role: 'cron', cmd: 'close'}, function (err, res) {
                    si.log.debug('cron plugin closed')
                    expect(err).to.not.exist()
                    si.close(done)
                })
            }, (6 * 1000 + 100));

        })
    })
})

