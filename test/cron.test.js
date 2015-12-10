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
var si
var jobid

var counter = 0
var counterPauseSnaphot = 0

describe('cron', {timeout: 35 * 1000}, function () {


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

    it('I can add, stop and restart a task', function (done) {

        si.act({
            role: 'cron', cmd: 'addjob', time: '* * * * * *', act: incrementTick, after: afterAct, timezone: null
        }, function (err, res) {

            expect(err).to.not.exist()
            jobid = res.id
            si.log.debug('job created', jobid)
            setTimeoutTests()

        })
        // MAYBE: use async instead!
        function setTimeoutTests() {
            // stop after 10s
            setTimeout(function () {

                si.log.debug('exit');
                si.act({role: 'cron', cmd: 'stopjob', id: jobid}, function (err, res) {
                    expect(err).to.not.exist()
                    expect(res.id).to.equal(jobid)
                    si.log.debug('stop cron job', jobid)
                })
            }, (10 * 1000));

            // test counter value
            setTimeout(function () {

                si.log.debug('test counter value. Cron job was stopped please wait...');
                expect(counter).to.be.above(7)
                counterPauseSnaphot = counter
            }, (11 * 1000));

            // test counter stops from sec 10
            setTimeout(function () {

                si.log.debug('test counter was stopped');
                expect(counter).to.be.equal(counterPauseSnaphot)
            }, (19 * 1000));

            setTimeout(function () {

                si.log.debug('start again the job', jobid);
                si.act({role: 'cron', cmd: 'startjob', id: jobid}, function (err, res) {
                    si.log.debug('start cron job', jobid)
                    expect(err).to.not.exist()
                })
            }, (20 * 1000));

            // test counter increase value
            setTimeout(function () {

                si.log.debug('test counter was restarted');
                expect(counterPauseSnaphot).to.be.below(counter)
            }, (25 * 1000));

            setTimeout(function () {

                si.log.debug('exit');
                si.act({role: 'cron', cmd: 'close'}, function (err, res) {
                    si.log.debug('cron plugin closed')
                    expect(err).to.not.exist()
                    si.close(done)
                })
            }, (30 * 1000));
        }
    })
})

