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
    })
})
