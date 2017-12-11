/**
 * Copyright 2016 IBM Corp. All Rights Reserved.
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
const url = require('url');

module.exports = function API(options, apiName, basePath, documentation) {
  this.options = options;
  this.apiName = apiName;
  this.basePath = basePath;
  this.documentation = documentation;

  this.getApiDoc = (type) => {
    let opOptions = {};
    const documentationUri = documentation[type];
    if (documentationUri === undefined) {
      return Promise.reject('Documentation not available');
    }
    const docUrl = url.parse(documentationUri);
    const apiUrl = url.parse(this.basePath);
    opOptions = extend(opOptions, this.options);
    opOptions.uri = `${apiUrl.protocol}//${apiUrl.host}${docUrl.pathname}`;
    return new Promise(((resolve, reject) => {
      request.get(opOptions, (error, response, body) => {
        if (error !== null) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(`Unable to retrieve API documentation (${response.statusCode})`);
        } else {
          resolve(body);
        }
      });
    }));
  };

  this.invoke = (resource, method, content) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri = `${basePath}/${resource}`;
    opOptions.method = method;
    if (content !== null) {
      opOptions.body = content;
    }

    opOptions.json = true;
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

  this.start = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '?status=started';
    opOptions.method = 'PUT';
    delete opOptions.body;
    return new Promise(((resolve, reject) => {
      request(opOptions, (error, response) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(response.statusCode);
        } else {
          resolve();
        }
      });
    }));
  };

  this.stop = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.uri += '?status=stopped';
    opOptions.method = 'PUT';
    delete opOptions.body;
    return new Promise(((resolve, reject) => {
      request(opOptions, (error, response) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(response.statusCode);
        } else {
          resolve();
        }
      });
    }));
  };

  this.update = (aarFile) => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    return this.stop().then(() => new Promise(((resolve, reject) => {
      opOptions.method = 'PUT';
      opOptions.uri += '?status=started';
      opOptions.body = aarFile;
      opOptions.headers = {
        'Content-Type': 'application/zip',
      };
      request(opOptions, (error, response, body) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(new Error(`Unable to update API (${response.statusCode})`));
        } else {
          const json = JSON.parse(body);
          this.basePath = json.apiUrl;
          this.documentation = json.documentation;
          resolve();
        }
      });
    })));
  };

  this.delete = () => {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    opOptions.method = 'DELETE';
    return new Promise(((resolve, reject) => {
      request(opOptions, (error, response) => {
        if (error) {
          reject(error);
        } else if (response.statusCode !== 200) {
          reject(`Unable to delete API (${response.statusCode})`);
        } else {
          resolve();
        }
      });
    }));
  };
};
