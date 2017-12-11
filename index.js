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

'use strict';

const request = require('request');
const extend = require('extend');
const Service = require('./service.js');
const Api = require('./api.js');
const url = require('url');

const defaultOptions = {
  strictSSL: true,
};

module.exports = function ZosConnect(options) {
  if (options === null || options === undefined) {
    throw new Error('An options object is required');
  }

  if (options.uri === undefined && options.url === undefined) {
    throw new Error('Required uri or url not specified');
  }

  this.options = extend(defaultOptions, options);

  if (options.uri === undefined) {
    let uri = options.url.protocol;
    uri += '//';
    uri += options.url.host;
    this.options.uri = uri;
  }

  this.getServices = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '/zosConnect/services';

    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Failed to get list of services (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          const services = [];
          for (const service of json.zosConnectServices) {
            services.push(service.ServiceName);
          }

          resolve(services);
        }
      });
    }));
  };

  this.getService = (serviceName) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/services/${serviceName}`;

    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Unable to get service (${response.statusCode})`));
        } else {
          const serviceData = JSON.parse(body);
          const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
          resolve(new Service(opOptions, serviceName,
            this.options.uri + invokeUrl.pathname + invokeUrl.search));
        }
      });
    }));
  };

  this.getApis = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '/zosConnect/apis';
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Unable to get list of APIs (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          const apis = [];
          for (const api of json.apis) {
            apis.push(api.name);
          }
          resolve(apis);
        }
      });
    }));
  };

  this.getApi = (apiName) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/apis/${apiName}`;
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Unable to get API information (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          const apiUrl = url.parse(json.apiUrl);
          resolve(new Api(opOptions, apiName, this.options.uri + apiUrl.pathname,
            json.documentation));
        }
      });
    }));
  };

  this.createApi = (aarFile) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '/zosConnect/apis';
    opOptions.method = 'POST';
    opOptions.body = aarFile;
    opOptions.headers = {
      'Content-Type': 'application/zip',
    };
    return new Promise(((resolve, reject) => {
      request(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 201) {
          reject(new Error(`Unable to create API (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          const apiUrl = url.parse(json.apiUrl);
          resolve(new Api(opOptions, json.name, this.options.uri + apiUrl.pathname,
            json.documentation));
        }
      });
    }));
  };
};
