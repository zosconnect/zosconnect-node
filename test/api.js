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
var Api = require('../api.js');

describe('api', function () {
  var api = new Api({ uri: 'http://test:9080/zosConnect/apis/dateApi' }, 'healthApi',
                    'http://test:9080/dateTime',
                    { swagger: 'http://test:9080/dateTime/api-docs' });
  describe('#getApiDoc', function () {
    it('should retrieve the Swagger Doc', function (done) {
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
      api.getApiDoc('swagger', function (error, doc) {
        should.not.exist(error);
        should.exist(doc);
        done();
      });
    });

    it('should return a security error', function (done) {
      nock('http://test:9080')
          .get('/dateTime/api-docs')
          .reply(401);
      api.getApiDoc('swagger', function (error, doc) {
        should.exist(error);
        should.not.exist(doc);
        done();
      });
    });

    it('should return an error', function (done) {
      nock('http://test:9080')
          .get('/dateTime/api-docs')
          .replyWithError('something fatal happened');
      api.getApiDoc('swagger', function (error, doc) {
        should.exist(error);
        should.not.exist(doc);
        done();
      });
    });

    it('should return an error for unknown doc-type', function (done) {
      api.getApiDoc('raml', function (error, doc) {
        should.exist(error);
        should.not.exist(doc);
        done();
      });
    });
  });

  describe('#invoke', function () {
    it('should invoke the API', function (done) {
      nock('http://test:9080')
          .get('/dateTime/info')
          .reply(200, { time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' });
      api.invoke('info', 'GET', null, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(200);
        should.exist(body);
        done();
      });
    });

    it('should return a security error', function (done) {
      nock('http://test:9080')
          .get('/dateTime/info')
          .reply(401);
      api.invoke('info', 'GET', null, function (error, response, body) {
        should.not.exist(error);
        response.statusCode.should.equal(401);
        should.not.exist(body);
        done();
      });
    });

    it('should return an error', function (done) {
      nock('http://test:9080')
          .post('/dateTime/info')
          .replyWithError('something fatal happened');
      api.invoke('info', 'POST', '{}', function (error, response, body) {
        should.exist(error);
        should.not.exist(response);
        should.not.exist(body);
        done();
      });
    });
  });

  describe('#start', function () {
    it('should start the api', function (done) {
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
      api.start(function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('should return not found', function (done) {
      nock('http://test:9080')
          .put('/zosConnect/apis/dateApi')
          .query({ status: 'started' })
          .reply(404);
      api.start(function (error) {
        error.should.equal(404);
        done();
      });
    });

    it('should return an error', function (done) {
      nock('http://test:9080')
          .put('zosConnect/apis/dateApi')
          .query({ status: 'started' })
          .replyWithError('somthing fatal happened');
      api.start(function (error) {
        should.exist(error);
        done();
      });
    });
  });

  describe('#stop', function () {
    it('should stop the api', function (done) {
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
      api.stop(function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('should return not found', function (done) {
      nock('http://test:9080')
          .put('/zosConnect/apis/dateApi')
          .query({ status: 'stopped' })
          .reply(404);
      api.stop(function (error) {
        error.should.equal(404);
        done();
      });
    });

    it('should return an error', function (done) {
      nock('http://test:9080')
          .put('zosConnect/apis/dateApi')
          .query({ status: 'stopped' })
          .replyWithError('somthing fatal happened');
      api.stop(function (error) {
        should.exist(error);
        done();
      });
    });
  });

  describe('#update', function () {
    it('should update the API', function (done) {
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
      api.update('foo', function (error) {
        should.not.exist(error);
        done();
      });
    });

    it('should fail to stop the API', function (done) {
      nock('http://test:9080')
          .put('/zosConnect/apis/dateApi')
          .query({ status: 'stopped' })
          .reply(404);
      api.update('foo', function (error) {
        error.message.should.equal('Unable to stop API');
        done();
      });
    });

    it('should fail to stop the API due to error', function (done) {
      nock('http://test:9080')
          .put('/zosConnect/apis/dateApi')
          .query({ status: 'stopped' })
          .replyWithError('something fatal happened');
      api.update('foo', function (error) {
        error.message.should.equal('something fatal happened');
        done();
      });
    });

    it('should fail the update', function (done) {
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
      api.update('foo', function (error) {
        should.exist(error);
        done();
      });
    });

    it('should fail the update due to error', function (done) {
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
      api.update('foo', function (error) {
        should.exist(error);
        done();
      });
    });
  });
});
