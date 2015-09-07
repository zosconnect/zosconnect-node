var assert = require('assert');
var nock = require('nock');
var should = require('should');
var url = require('url');

var service = require('../service.js');
describe('service', function(){
    var dateTimeService = new service(url.parse('http://test:9080/zosConnect/services/dateTimeService'), 'dateTimeService', 'http://test:9080/zosConnect/services/dateTimeService?action=invoke');
    describe('#invoke', function(){
        it('should invoke the service', function(done){
            nock('http://test:9080')
                .put('/zosConnect/services/dateTimeService')
                .query({"action":"invoke"})
                .reply(200, {"time":"2:32:01 PM","config":"","date":"Sep 4, 2015"});
            dateTimeService.invoke('', function(error, response, body){
                should.not.exist(error);
                response.statusCode.should.equal(200);
                should.exist(body);
                done();
            })
        })
    })
    describe('#getRequestSchema', function(){
        it('should retrieve the request schema', function(done){
            nock('http://test:9080')
                .get('/zosConnect/services/dateTimeService')
                .query({"action":"getRequestSchema"})
                .reply(200, {});
            dateTimeService.getRequestSchema(function(error, schema){
                should.not.exist(error);
                should.exist(schema);
                done();
            })
        })
    })
    describe('#getResponseSchema', function(){
        it('should retrieve the response schema', function(done){
            nock('http://test:9080')
                .get('/zosConnect/services/dateTimeService')
                .query({"action":"getResponseSchema"})
                .reply(200, {"title":"Reference Schema","properties":{"time":{"type":"string"},"date":{"type":"string"}},"required":["date","time"],"type":"object"});
            dateTimeService.getResponseSchema(function(error, schema){
                should.not.exist(error);
                should.exist(schema);
                done();
            })
        })
    })
})
