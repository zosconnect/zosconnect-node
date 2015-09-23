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

var request = require('request');
var async = require('async');
var extend = require('extend');
var Service = require('./service.js');

var defaultOptions = {
  strictSSL: true,
};

module.exports = function(options) {
  if (options.uri == null) {
    throw new Error('Required uri not specified');
  }

  this.options = extend(defaultOptions, options);

  this.getServices = function(callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/services';
    request.get(options, function(error, response, body) {
      if (error) {
        callback(error, null);
      } else if (response.statusCode != 200) {
        callback(new Error('Failed to get list of services (' + response.statusCode + ')'), null);
      } else {
        var json = JSON.parse(body);
        var services = [];
        var asyncTasks = [];
        json.zosConnectServices.forEach(function(service) {
          asyncTasks.push(function(asyncCallback) {
            services.push(service.ServiceName);
            asyncCallback();
          });
        });

        async.parallel(asyncTasks, function() {
          callback(null, services);
        });
      }
    });
  };

  this.getService = function(serviceName, callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/services/' + serviceName;
    request.get(options, function(error, response, body) {
      if (error) {
        callback(error, null);
      } else if (response.statusCode != 200) {
        callback(new Error('Unable to get service (' + response.statusCode + ')'), null);
      } else {
        var serviceData = JSON.parse(body);
        callback(null, new Service(options, serviceName, serviceData.zosConnect.serviceInvokeURL));
      }
    });
  };
};
