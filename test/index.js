var assert = require('assert');
var nock = require('nock');
var should = require('should');

var ZosConnect = require('../index.js');

describe('zosconnect', function(){
    describe('#getservices', function(){
        it('should return a list of services', function(done){
            zosconnect = new ZosConnect('http://test:9080');
            nock('http://test:9080')
                .get('/zosConnect/services')
                .reply(200, {
                    "zosConnectServices": [
                        {
                            "ServiceDescription": "Get the date and time from the server",
                            "ServiceName": "dateTimeService",
                            "ServiceProvider": "zOSConnect Reference Service Provider",
                            "ServiceURL": "http://192.168.99.100:9080/zosConnect/services/dateTimeService"
                        }
                    ]
                });
            zosconnect.getServices(function(error, services){
                services[0].should.equal('dateTimeService');
                done(error);
            })
        })
        it('should return an error', function(done){
            zosconnect = new ZosConnect('http://test:9080');
            nock('http://test:9080')
                .get('zosConnect/services')
                .reply(403);
            zosconnect.getServices(function(error, services){
                error.should.not.be.null;
                should(services).be.null;
                done();
            })
        })
    })
    describe('#getservice', function(){
        it('should return a service', function(done){
            zosconnect = new ZosConnect('http://test:9080');
            nock('http://test:9080')
                .get('/zosConnect/services/dateTimeService')
                .reply(200, {
                    "dateTimeService": {
                        "configParm": ""
                    },
                    "zosConnect": {
                        "dataXformProvider": "DATA_UNAVAILABLE",
                        "serviceDescription": "Get the date and time from the server",
                        "serviceInvokeURL": "http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke",
                        "serviceName": "dateTimeService",
                        "serviceProvider": "zOSConnect Reference Service Provider",
                        "serviceURL": "http://192.168.99.100:9080/zosConnect/services/dateTimeService"
                    }
                }
            );
            zosconnect.getService('dateTimeService', function(error, service){
                service.should.not.be.null;
                done(error);
            });
        })
        it('should return an error', function(){
            zosconnect = new ZosConnect('http://test:9080');
            nock('http://test:9080')
                .get('/zosConnect/services/unknown')
                .reply(404);
            zosconnect.getService('unknown', function(error, service){
                should(service).be.null;
                error.should.not.be.null;
                done();
            })
        })
    })
})
