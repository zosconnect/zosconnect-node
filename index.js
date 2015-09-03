var request = require('request');
var async = require('async');
var Service = require('./service.js');

module.exports = function(options){
    if(options.uri == null){
        throw new Error('Required uri not specified');
    }
    this.options = options;

    this.getServices = function(callback){
        request.get(this.options.uri + '/zosConnect/services', function(error, response, body){
            if(error){
                callback(error, null);
            } else if(response.statusCode != 200){
                callback(new Error('Failed to get list of services (' + response.statusCode + ')'), null);
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
        request.get(this.options.uri + '/zosConnect/services/' + serviceName, function(error, response, body){
            if(error){
                callback(error, null);
            } else if(response.statusCode != 200){
                callback(new Error('Unable to get service (' + response.statusCode + ')'), null);
            } else {
                var serviceData = JSON.parse(body);
                callback(null, new Service(this.uri, serviceName, serviceData.zosConnect.serviceInvokeURL));
            }
        })
    }
}
