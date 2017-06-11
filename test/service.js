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

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
var should = chai.should();
var url = require('url');

var Service = require('../service.js');
describe('service', function () {
  var dateTimeService = new Service({ uri: 'http://test:9080/zosConnect/services/dateTimeService' },
                              'dateTimeService',
                              'http://test:9080/zosConnect/services/dateTimeService?action=invoke');
  describe('#invoke', function () {
    it('should invoke the service', function () {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({ action:'invoke' })
          .reply(200, { time:'2:32:01 PM', config:'', date:'Sep 4, 2015' });
      return dateTimeService.invoke('').should.eventually.have.deep.property('body',
        { time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' });
    });

    it('should return a security error', function () {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({ action:'invoke' })
          .reply(401);
      return dateTimeService.invoke('').should.eventually.have.property('statusCode', 401);
    });

    it('should return an error', function () {
      nock('http://test:9080')
          .put('/zosConnect/services/dateTimeService')
          .query({ action:'invoke' })
          .replyWithError('something fatal happened');
      return dateTimeService.invoke('').should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#getRequestSchema', function () {
    it('should retrieve the request schema', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getRequestSchema' })
          .reply(200, {});
      return dateTimeService.getRequestSchema().should.eventually.equal('{}');
    });

    it('should return a security error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getRequestSchema' })
          .reply(401);
      return dateTimeService.getRequestSchema().should.be.
        rejectedWith('Failed to get schema (401)');
    });

    it('should return an error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getRequestSchema' })
          .replyWithError('something fatal happened');
      return dateTimeService.getRequestSchema().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#getResponseSchema', function () {
    it('should retrieve the response schema', function () {
      var schema = {
            title:'Reference Schema',
            properties:{
              time:{ type:'string' },
              date:{ type:'string' },
            },
            required:['date', 'time'],
            type:'object',
          };
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getResponseSchema' })
          .reply(200, schema);
      return dateTimeService.getResponseSchema().should.eventually.equal(JSON.stringify(schema));
    });

    it('should return a security error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getResponseSchema' })
          .reply(401);
      return dateTimeService.getResponseSchema().should.be.
        rejectedWith('Failed to get schema (401)');
    });

    it('should return an error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'getResponseSchema' })
          .replyWithError('something fatal happened');
      return dateTimeService.getResponseSchema().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#getStatus', function () {
    it('should return the status', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'status' })
          .reply(200, {
            zosConnect:{
              dataXformProvider:'DATA_UNAVAILABLE',
              serviceDescription:'Get the date and time from the server',
              serviceInvokeURL:
                'http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke',
              serviceName:'dateTimeService',
              serviceProvider:'zOSConnect Reference Service Provider',
              serviceStatus:'Started',
              serviceURL:'http://192.168.99.100:9080/zosConnect/services/dateTimeService',
            },
          });
      return dateTimeService.getStatus().should.eventually.equal('Started');
    });

    it('should return a security error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'status' })
          .reply(401);
      return dateTimeService.getStatus().should.be.rejectedWith('Failed to get status (401)');
    });

    it('should return an error', function () {
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .query({ action:'status' })
          .replyWithError('something fatal happened');
      return dateTimeService.getStatus().should.be.rejectedWith('something fatal happened');
    });
  });
});
