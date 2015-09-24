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

require('mocha-jscs')();

var assert = require('assert');
var nock = require('nock');
var should = require('should');

var ZosConnect = require('../index.js');

describe('zosconnect', function() {
  describe('#ctor', function() {
    it('should throw an error', function(done) {
      (function() {new ZosConnect({});}).should.throw(new Error('Required uri not specified'));
      done();
    });
  });

  describe('#getservices', function() {
    it('should return a list of services', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
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
      zosconnect.getServices(function(error, services) {
        services[0].should.equal('dateTimeService');
        done(error);
      });
    });

    it('should return an error for a security problem', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
      nock('http://test:9080')
          .get('/zosConnect/services')
          .reply(403);
      zosconnect.getServices(function(error, services) {
        error.should.not.be.null;
        should(services).be.null;
        done();
      });
    });

    it('should return an error', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
      nock('http://test:9080')
          .get('/zosConnect/services')
          .replyWithError('bad things occurred');
      zosconnect.getServices(function(error, services) {
        error.should.not.be.null;
        should(services).be.null;
        done();
      });
    });
  });

  describe('#getservice', function() {
    it('should return a service', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
                .reply(200, {
                  dateTimeService: {
                    configParm: '',
                  },
                  zosConnect: {
                    dataXformProvider: 'DATA_UNAVAILABLE',
                    serviceDescription: 'Get the date and time from the server',
                    serviceInvokeURL: 'http://test:9080/zosConnect/services/dateTimeService?action=invoke',
                    serviceName: 'dateTimeService',
                    serviceProvider: 'zOSConnect Reference Service Provider',
                    serviceURL: 'http://test:9080/zosConnect/services/dateTimeService',
                  },
                }
            );
      zosconnect.getService('dateTimeService', function(error, service) {
        service.should.not.be.null;
        done(error);
      });
    });

    it('should return an error for unknown service', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
      nock('http://test:9080')
          .get('/zosConnect/services/unknown')
          .reply(404);
      zosconnect.getService('unknown', function(error, service) {
        should(service).be.null;
        error.should.not.be.null;
        done();
      });
    });

    it('should return an error for network error', function(done) {
      var zosconnect = new ZosConnect({uri:'http://test:9080'});
      nock('http://test:9080')
          .get('/zosConnect/services/dateTimeService')
          .replyWithError('something fatal occurred');
      zosconnect.getService('dateTimeService', function(error, service) {
        should(service).be.null;
        error.should.not.be.null;
        done();
      });
    });
  });
});
