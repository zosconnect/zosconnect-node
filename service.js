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

const request = require('request');
const extend = require('extend');

module.exports = function Service(options, serviceName, invokeUri) {
  this.options = options;
  this.serviceName = serviceName;
  this.invokeUri = invokeUri;

  this.invoke = (data) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.method = 'PUT';
    opOptions.uri = this.invokeUri;
    opOptions.json = true;
    opOptions.body = data;
    return new Promise(((resolve, reject) => {
      request(opOptions, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    }));
  };

  this.getRequestSchema = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '?action=getRequestSchema';
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Failed to get schema (${response.statusCode})`));
        } else {
          resolve(body);
        }
      });
    }));
  };

  this.getResponseSchema = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '?action=getResponseSchema';
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Failed to get schema (${response.statusCode})`));
        } else {
          resolve(body);
        }
      });
    }));
  };

  this.getStatus = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '?action=status';
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Failed to get status (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          const status = json.zosConnect.serviceStatus;
          resolve(status);
        }
      });
    }));
  };
};
