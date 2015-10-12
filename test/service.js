/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var assert = require('assert');
var nock = require('nock');
var should = require('should');
var url = require('url');

var Service = require('../service.js');
describe('service', function() {
  var dateTimeService = new Service({uri: 'http://test:9080/zosConnect/services/dateTimeService'}, 'dateTimeService', 'http://test:9080/zosConnect/services/dateTimeService?action=invoke');
  describe('#invoke', function() {
    it('should invoke the service', function(done) {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({action:'invoke'})
          .reply(200, {time:'2:32:01 PM', config:'', date:'Sep 4, 2015'});
      dateTimeService.invoke('', function(error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        should.exist(body);
        done();
      });
    });

    it('should return a security error', function(done) {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({action:'invoke'})
          .reply(401);
      dateTimeService.invoke('', function(error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        should.not.exist(body);
        done();
      });
    });

    it('should return an error', function(done) {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({action:'invoke'})
          .replyWithError('something fatal happened');
      dateTimeService.invoke('', function(error, response, body) {
        should.exist(error);
        should.not.exist(response);
        should.not.exist(body);
        done();
      });
    });
  });

  describe('#getRequestSchema', function() {
    it('should retrieve the request schema', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getRequestSchema'})
          .reply(200, {});
      dateTimeService.getRequestSchema(function(error, schema) {
        should.not.exist(error);
        should.exist(schema);
        done();
      });
    });

    it('should return a security error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getRequestSchema'})
          .reply(401);
      dateTimeService.getRequestSchema(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });

    it('should return an error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getRequestSchema'})
          .replyWithError('something fatal happened');
      dateTimeService.getRequestSchema(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });
  });

  describe('#getResponseSchema', function() {
    it('should retrieve the response schema', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getResponseSchema'})
          .reply(200, {title:'Reference Schema', properties:{time:{type:'string'}, date:{type:'string'}}, required:['date', 'time'], type:'object'});
      dateTimeService.getResponseSchema(function(error, schema) {
        should.not.exist(error);
        should.exist(schema);
        done();
      });
    });

    it('should return a security error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getResponseSchema'})
          .reply(401);
      dateTimeService.getResponseSchema(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });

    it('should return an error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'getResponseSchema'})
          .replyWithError('something fatal happened');
      dateTimeService.getResponseSchema(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });
  });

  describe('#getStatus', function() {
    it('should return the status', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'status'})
          .reply(200, {zosConnect:{dataXformProvider:'DATA_UNAVAILABLE', serviceDescription:'Get the date and time from the server', serviceInvokeURL:'http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke', serviceName:'dateTimeService', serviceProvider:'zOSConnect Reference Service Provider', serviceStatus:'Started', serviceURL:'http://192.168.99.100:9080/zosConnect/services/dateTimeService'}});
      dateTimeService.getStatus(function(error, status) {
        should.not.exist(error);
        status.should.equal('Started');
        done();
      });
    });

    it('should return a security error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'status'})
          .reply(401);
      dateTimeService.getStatus(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });

    it('should return an error', function(done) {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({action:'status'})
          .replyWithError('something fatal happened');
      dateTimeService.getStatus(function(error, schema) {
        should.exist(error);
        should.not.exist(schema);
        done();
      });
    });
  });
});
