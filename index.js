var request = require('request');
var async = require('async');
var Service = require('./service.js');

module.exports = function(uri){
    this.uri = uri;

    this.getServices = function(callback){
        request.get(this.uri + '/zosConnect/services', function(error, response, body){
            if(error || response.statusCode != 200){
                callback(error, null);
            } else {
                var json = JSON.parse(body);
                var services = [];
                var asyncTasks = [];
                json.zosConnectServices.forEach(function(service){
                    asyncTasks.push(function(asyncCallback){
                        services.push(service.ServiceName);
                        asyncCallback();
                    })
                })
                async.parallel(asyncTasks, function(){
                    callback(null, services);
                })
            }
        })
    }

    this.getService = function(serviceName, callback){
        request.get(this.uri + '/zosConnect/services/' + serviceName, function(error, response, body){
            if(error || response.statusCode != 200){
                callback(error, null);
            } else {
                var serviceData = JSON.parse(body);
                callback(null, new Service(this.uri, serviceName, serviceData.zosConnect.serviceInvokeURL));
            }
        })
    }
}
