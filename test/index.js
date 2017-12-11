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

require('assert');
const nock = require('nock');
const url = require('url');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
chai.should();

const ZosConnect = require('../index.js');

describe('zosconnect', () => {
  describe('#ctor', () => {
    it('should throw an error for no object', () => { (() => { ZosConnect(); }).should.Throw(); });

    it('should throw an error if no uri or url specified', () => { (() => { ZosConnect({}); }).should.Throw(); });
  });

  describe('#getservices', () => {
    it('should return a list of services', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/services')
        .reply(200, {
          zosConnectServices: [
            {
              ServiceDescription: 'Get the date and time from the server',
              ServiceName: 'dateTimeService',
              ServiceProvider: 'zOSConnect Reference Service Provider',
              ServiceURL: 'http://192.168.99.100:9080/zosConnect/services/dateTimeService',
            },
          ],
        });
      return zosconnect.getServices().should.eventually.have.members(['dateTimeService']);
    });

    it('should return a list of services (url in ctor)', () => {
      const zosconnect = new ZosConnect({ url: url.parse('http://test:9080') });
      nock('http://test:9080')
        .get('/zosConnect/services')
        .reply(200, {
          zosConnectServices: [
            {
              ServiceDescription: 'Get the date and time from the server',
              ServiceName: 'dateTimeService',
              ServiceProvider: 'zOSConnect Reference Service Provider',
              ServiceURL: 'http://192.168.99.100:9080/zosConnect/services/dateTimeService',
            },
          ],
        });
      return zosconnect.getServices().should.eventually.have.members(['dateTimeService']);
    });

    it('should return an error for a security problem', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/services')
        .reply(403);
      return zosconnect.getServices().should.be.rejectedWith(403);
    });

    it('should return an error', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/services')
        .replyWithError('bad things occurred');
      return zosconnect.getServices().should.be.rejectedWith('bad things occurred');
    });
  });

  describe('#getservice', () => {
    it('should return a service', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
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
        }
        );
      return zosconnect.getService('dateTimeService').should.eventually.be.a('Object');
    });

    it('should return an error for unknown service', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/services/unknown')
        .reply(404);
      return zosconnect.getService('unknown').should.be.rejectedWith('Unable to get service (404)');
    });

    it('should return an error for network error', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/services/dateTimeService')
        .replyWithError('something fatal occurred');
      return zosconnect.getService('dateTimeService').should.be
        .rejectedWith('something fatal occurred');
    });
  });

  describe('#getApis', () => {
    it('should return a list of APIs', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/apis')
        .reply(200, {
          apis: [
            {
              adminUrl: 'http://winmvs24:19080/zosConnect/apis/healthApi',
              description: 'Health API',
              name: 'healthApi',
              version: '1.0.0',
            },
          ],
        });
      return zosconnect.getApis().should.eventually.have.members(['healthApi']);
    });

    it('should return an error for a security problem', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/apis')
        .reply(403);
      return zosconnect.getApis().should.be.rejectedWith('Unable to get list of APIs (403)');
    });

    it('should return an error', () => {
      const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
      nock('http://test:9080')
        .get('/zosConnect/apis')
        .replyWithError('bad things occurred');
      return zosconnect.getApis().should.be.rejectedWith('bad things occurred');
    });
  });

  describe('#getApi', () => {
    const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
    it('should return an API', () => {
      nock('http://test:9080')
        .get('/zosConnect/apis/healthApi')
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/health',
          description: 'Health API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/health/api-docs',
          },
          name: 'healthApi',
          status: 'started',
          version: '1.0.0',
        });
      return zosconnect.getApi('healthApi').should.eventually.be.a('Object');
    });

    it('should return an error for a security problem', () => {
      nock('http://test:9080')
        .get('/zosConnect/apis/healthApi')
        .reply(403);
      zosconnect.getApi('healthApi').should.be.rejectedWith('Unable to get API information (403)');
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .get('/zosConnect/apis/healthApi')
        .replyWithError('bad things occurred');
      zosconnect.getApi('healthApi').should.be.rejectedWith('bad things occurred');
    });
  });

  describe('#createApi', () => {
    const zosconnect = new ZosConnect({ uri: 'http://test:9080' });
    it('should install an API', () => {
      nock('http://test:9080')
        .post('/zosConnect/apis')
        .reply(201, {
          apiUrl: 'http://192.168.99.100:9080/health',
          description: 'Health API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/health/api-docs',
          },
          name: 'healthApi',
          status: 'started',
          version: '1.0.0',
        });
      return zosconnect.createApi('foo').should.eventually.be.a('Object');
    });

    it('should return an error for a conflict problem', () => {
      nock('http://test:9080')
        .post('/zosConnect/apis')
        .reply(409);
      return zosconnect.createApi('apiPackage').should.be
        .rejectedWith('Unable to create API (409)');
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .post('/zosConnect/apis')
        .replyWithError('bad things occurred');
      return zosconnect.createApi('apiPackage').should.be.rejectedWith('bad things occurred');
    });
  });
});
