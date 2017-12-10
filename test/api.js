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
const Api = require('../api.js');
const ZosConnect = require('../index.js');

describe('api', () => {
  const api = new Api({ uri: 'http://test:9080/zosConnect/apis/dateApi' }, 'healthApi',
    'http://test:9080/dateTime',
    { swagger: 'http://test:9080/dateTime/api-docs' });
  describe('#getApiDoc', () => {
    it('should retrieve the Swagger Doc', () => {
      nock('http://test:9080')
        .get('/dateTime/api-docs')
        .reply(200, { swagger: '2.0',
          info: {
            version: '1.0.0',
            title: 'Date Time API',
            description: 'API to return date and time',
          },
          host: 'test:9080',
          basePath: '/dateTime',
          schemes: ['http', 'https'],
          produces: ['application/json'],
          paths: {
            '/': {
              get: {
                description: 'Get current date and time',
                operationId: 'getDateTime',
                responses: {
                  200: {
                    description: 'normal response',
                    schema: {
                      $ref: '#/definitions/getDateTimeOutput',
                    },
                  },
                  default: {
                    description: 'unexpected error',
                    schema: {
                      $ref: '#/definitions/errorModel',
                    },
                  },
                },
              },
            },
          },
          definitions: {
            getDateTimeOutput: {
              required: ['date', 'time'],
              properties: {
                date: {
                  maxLength: 10,
                  type: 'string',
                },
                time: {
                  maxLength: 10,
                  type: 'string',
                },
              },
            },
            errorModel: {
              required: ['code', 'message'],
              properties: {
                code: {
                  type: 'integer',
                  format: 'int32',
                },
                message: {
                  type: 'string',
                },
              },
            },
          },
        });
      return api.getApiDoc('swagger').should.be.fulfilled;
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .get('/dateTime/api-docs')
        .reply(401);
      api.getApiDoc('swagger').should.be.rejectedWith(401);
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .get('/dateTime/api-docs')
        .replyWithError('something fatal happened');
      api.getApiDoc('swagger').should.be.rejectedWith('something fatal happened');
    });

    it('should return an error for unknown doc-type', () => {
      api.getApiDoc('raml').should.be.rejectedWith('Documentation not available');
    });

    it('should return Swagger for z/OS Connect accessed via proxy', () => {
      const proxyApi = new Api({ uri: 'http://test:9080/zosConnect/apis/dateApi' }, 'healthApi',
        'http://test:9080/dateTime',
        { swagger: 'http://hiddenhost:9080/dateTime/api-docs' });
      nock('http://test:9080')
        .get('/dateTime/api-docs')
        .reply(200, {});
      return proxyApi.getApiDoc('swagger').should.be.fulfilled;
    });
  });

  describe('#invoke', () => {
    it('should invoke the API', () => {
      nock('http://test:9080')
        .get('/dateTime/info')
        .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      return api.invoke('info', 'GET', null).should.eventually.have.deep.property('body',
        "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
    });

    it('should return a security error', () => {
      nock('http://test:9080')
        .get('/dateTime/info')
        .reply(401);
      return api.invoke('info', 'GET', null).should.eventually.have.property('statusCode', 401);
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .post('/dateTime/info')
        .replyWithError('something fatal happened');
      return api.invoke('info', 'POST', '{}').should.be.rejectedWith('something fatal happened');
    });

    it('should invoke the API when accessed via proxy', () => {
      const zosconn = new ZosConnect({ uri: 'http://testproxy:80' });
      nock('http://testproxy:80')
        .get('/zosConnect/apis/dateTime')
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'started',
          version: '1.0.0',
        });
      zosconn.getApi('dateTime').then((dateTimeApi) => {
        nock('http://testproxy:80')
          .get('/dateTime/info')
          .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
        return dateTimeApi.invoke('info', 'GET', null).should.eventually.have.deep.property('body',
          "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      });
    });
  });

  describe('#start', () => {
    it('should start the api', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'started',
          version: '1.0.0',
        });
      return api.start().should.be.fulfilled;
    });

    it('should return not found', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .reply(404);
      return api.start().should.be.rejectedWith(404);
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .replyWithError('something fatal happened');
      return api.start().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#stop', () => {
    it('should stop the api', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'stopped',
          version: '1.0.0',
        });
      return api.stop().should.be.fulfilled;
    });

    it('should return not found', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(404);
      api.stop().should.be.rejectedWith(404);
    });

    it('should return an error', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .replyWithError('something fatal happened');
      api.stop().should.be.rejectedWith('something fatal happened');
    });
  });

  describe('#update', () => {
    it('should update the API', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'stopped',
          version: '1.0.0',
        });
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'stopped',
          version: '1.0.0',
        });
      return api.update('foo').should.be.fulfilled;
    });

    it('should fail to stop the API', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(404);
      api.update('foo').should.be.rejectedWith(404);
    });

    it('should fail to stop the API due to error', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .replyWithError('something fatal happened');
      api.update('foo').should.be.rejectedWith('something fatal happened');
    });

    it('should fail the update', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'stopped',
          version: '1.0.0',
        });
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .reply(404);
      api.update('foo').should.be.rejectedWith(404);
    });

    it('should fail the update due to error', () => {
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'stopped' })
        .reply(200, {
          apiUrl: 'http://192.168.99.100:9080/dateTime',
          description: 'Date Time API',
          documentation: {
            swagger: 'http://192.168.99.100:9080/dateTime/api-docs',
          },
          name: 'dateTime',
          status: 'stopped',
          version: '1.0.0',
        });
      nock('http://test:9080')
        .put('/zosConnect/apis/dateApi')
        .query({ status: 'started' })
        .replyWithError('Something fatal happened');
      api.update('foo').should.be.rejectedWith('Something fatal happened');
    });
  });

  describe('#delete', () => {
    it('should delete the api', () => {
      nock('http://test:9080')
        .delete('/zosConnect/apis/dateApi')
        .reply(200, {
          name: 'dateTime',
        });
      return api.delete().should.be.fulfilled;
    });

    it('should fail the delete', () => {
      nock('http://test:9080')
        .delete('/zosConnect/apis/dateApi')
        .reply(403);
      api.delete().should.be.rejectedWith(403);
    });

    it('should fail due to error', () => {
      nock('http://test:9080')
        .delete('/zosConnect/apis/dateApi')
        .replyWithError('Something fatal happened');
      api.delete().should.be.rejectedWith('Something fatal happened');
    });
  });
});
