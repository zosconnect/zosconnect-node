/**
 * Copyright 2015, 2016 IBM Corp. All Rights Reserved.
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
var extend = require('extend');
var Service = require('./service.js');
var Api = require('./api.js');

var defaultOptions = {
  strictSSL: true,
};

module.exports = function (options) {
  if (options === null || options === undefined) {
    throw new Error('An options object is required');
  }

  if (options.uri === undefined && options.url === undefined) {
    throw new Error('Required uri or url not specified');
  }

  if (options.uri === undefined) {
    var uri = options.url.protocol;
    uri += '//';
    uri += options.url.host;
    options.uri = uri;
  }

  this.options = extend(defaultOptions, options);

  this.getServices = function () {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/services';

    return new Promise(function (resolve, reject) {
      request.get(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(new Error('Failed to get list of services (' + response.statusCode + ')'));
        } else {
          var json = JSON.parse(body);
          var services = [];
          for (let service of json.zosConnectServices) {
            services.push(service.ServiceName);
          }

          resolve(services);
        }
      });
    });
  };

  this.getService = function (serviceName) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/services/' + serviceName;

    return new Promise(function (resolve, reject) {
      request.get(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(new Error('Unable to get service (' + response.statusCode + ')'));
        } else {
          var serviceData = JSON.parse(body);
          resolve(new Service(options, serviceName, serviceData.zosConnect.serviceInvokeURL));
        }
      });
    });
  };

  this.getApis = function () {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/apis';
    return new Promise(function (resolve, reject) {
      request.get(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(new Error('Unable to get list of APIs (' + response.statusCode + ')'));
        } else {
          var json = JSON.parse(body);
          var apis = [];
          for (let api of json.apis) {
            apis.push(api.name);
          }

          resolve(apis);
        }
      });
    });
  };

  this.getApi = function (apiName) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/apis/' + apiName;
    return new Promise(function (resolve, reject) {
      request.get(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(new Error('Unable to get API information (' + response.statusCode + ')'));
        } else {
          var json = JSON.parse(body);
          resolve(new Api(options, apiName, json.apiUrl, json.documentation));
        }
      });
    });
  };

  this.createApi = function (aarFile) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '/zosConnect/apis';
    options.method = 'POST';
    options.body = aarFile;
    options.headers = {
      'Content-Type': 'application/zip',
    };
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 201) {
          reject(new Error('Unable to create API (' + response.statusCode + ')'));
        } else {
          var json = JSON.parse(body);
          resolve(new Api(options, json.name, json.apiUrl, json.documentation));
        }
      });
    });
  };
};
