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

'use strict';

const nock = require('nock');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const Service = require('../service.js');
const ZosConnect = require('../index.js');

describe('service', () => {
  const dateTimeService = new Service({ uri: 'http://test:9080/zosConnect/services/dateTimeService' },
    'dateTimeService',
    'http://test:9080/zosConnect/services/dateTimeService?action=invoke');
  describe('#invoke', () => {
    it('should invoke the service', () => {
      nock('http://test:9080')
        .put('/zosConnect/services/dateTimeService')
        .query({ action: 'invoke' })
        .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      return dateTimeService.invoke('').should.eventually.have.property('body',
        "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .put('/zosConnect/services/dateTimeService')
        .query({ action: 'invoke' })
        .reply(401);
      return dateTimeService.invoke('').should.eventually.have.property('statusCode', 401);
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .put('/zosConnect/services/dateTimeService')
        .query({ action: 'invoke' })
        .replyWithError('something fatal happened');
      return dateTimeService.invoke('').should.be.rejectedWith('something fatal happened');
    });

    it('should work when invoked via a proxy', () => {
      nock('http://testproxy:80')
        .get('/zosConnect/services/dateTimeService')
        .reply(200, {
          dateTimeService: {
            configParm: '',
          },
          zosConnect: {
            dataXformProvider: 'DATA_UNAVAILABLE',
            serviceDescription: 'Get the date and time from the server',
            serviceInvokeURL:
                      'http://test:9080/zosConnect/services/dateTimeService?action=invoke',
            serviceName: 'dateTimeService',
            serviceProvider: 'zOSConnect Reference Service Provider',
            serviceURL: 'http://test:9080/zosConnect/services/dateTimeService',
          },
        });
      const proxyZConn = new ZosConnect({ uri: 'http://testproxy:80' });
      nock('http://testproxy:80')
        .put('/zosConnect/services/dateTimeService')
        .query({ action: 'invoke' })
        .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      proxyZConn.getService('dateTimeService').then((service) => {
        service.invoke('').should.eventually.have.property('body',
          "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      });
    });
  });

  describe('#getRequestSchema', () => {
    it('should retrieve the request schema', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getRequestSchema' })
        .reply(200, {});
      return dateTimeService.getRequestSchema().should.eventually.equal('{}');
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getRequestSchema' })
        .reply(401);
      return dateTimeService.getRequestSchema().should.be
        .rejectedWith('Failed to get schema (401)');
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getRequestSchema' })
        .replyWithError('something fatal happened');
      return dateTimeService.getRequestSchema().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#getResponseSchema', () => {
    it('should retrieve the response schema', () => {
      const schema = {
        title: 'Reference Schema',
        properties: {
          time: { type: 'string' },
          date: { type: 'string' },
        },
        required: ['date', 'time'],
        type: 'object',
      };
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getResponseSchema' })
        .reply(200, schema);
      return dateTimeService.getResponseSchema().should.eventually.equal(JSON.stringify(schema));
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getResponseSchema' })
        .reply(401);
      return dateTimeService.getResponseSchema().should.be
        .rejectedWith('Failed to get schema (401)');
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'getResponseSchema' })
        .replyWithError('something fatal happened');
      return dateTimeService.getResponseSchema().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#getStatus', () => {
    it('should return the status', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'status' })
        .reply(200, {
          zosConnect: {
            dataXformProvider: 'DATA_UNAVAILABLE',
            serviceDescription: 'Get the date and time from the server',
            serviceInvokeURL:
                'http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke',
            serviceName: 'dateTimeService',
            serviceProvider: 'zOSConnect Reference Service Provider',
            serviceStatus: 'Started',
            serviceURL: 'http://192.168.99.100:9080/zosConnect/services/dateTimeService',
          },
        });
      return dateTimeService.getStatus().should.eventually.equal('Started');
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'status' })
        .reply(401);
      return dateTimeService.getStatus().should.be.rejectedWith('Failed to get status (401)');
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .query({ action: 'status' })
        .replyWithError('something fatal happened');
      return dateTimeService.getStatus().should.be.rejectedWith('something fatal happened');
    });
  });
});
