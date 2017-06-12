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

var request = require('request');
var extend = require('extend');

module.exports = function (options, apiName, basePath, documentation) {
  this.options = options;
  this.apiName = apiName;
  this.basePath = basePath;
  this.documentation = documentation;

  this.getApiDoc = function (type) {
    var options = {};
    var documentationUri = documentation[type];
    if (documentationUri === undefined) {
      return Promise.reject('Documentation not available');
    } else {
      options = extend(options, this.options);
      options.uri = documentationUri;
      return new Promise(function (resolve, reject) {
        request.get(options, function (error, response, body) {
          if (error !== null) {
            reject(error);
          } else if (response.statusCode != 200) {
            reject('Unable to retrieve API documentation (' + response.statusCode + ')');
          } else {
            resolve(body);
          }
        });
      });
    }
  };

  this.invoke = function (resource, method, content) {
    var options = {};
    options = extend(options, this.options);
    options.uri = basePath + '/' + resource;
    options.method = method;
    if (content !== null) {
      options.body = content;
    }

    options.json = true;
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, data) {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  };

  this.start = function () {
    var options = {};
    options = extend(options, this.options);
    options.uri += '?status=started';
    options.method = 'PUT';
    delete options.body;
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(response.statusCode);
        } else {
          resolve();
        }
      });
    });
  };

  this.stop = function () {
    var options = {};
    options = extend(options, this.options);
    options.uri += '?status=stopped';
    options.method = 'PUT';
    delete options.body;
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject(response.statusCode);
        } else {
          resolve();
        }
      });
    });
  };

  this.update = function (aarFile) {
    var options = {};
    options = extend(options, this.options);
    return this.stop().then(function (results) {
      return new Promise(function (resolve, reject) {
        options.method = 'PUT';
        options.uri += '?status=started';
        options.body = aarFile;
        options.headers = {
          'Content-Type': 'application/zip',
        };
        request(options, function (error, response, body) {
          if (error) {
            reject(error);
          } else if (response.statusCode != 200) {
            reject(new Error('Unable to update API (' + response.statusCode + ')'));
          } else {
            var json = JSON.parse(body);
            this.basePath = json.apiUrl;
            this.documentation = json.documentation;
            resolve();
          }
        });
      });
    });
  };

  this.delete = function (callback) {
    var options = {};
    options = extend(options, this.options);
    options.method = 'DELETE';
    return new Promise(function (resolve, reject) {
      request(options, function (error, response, body) {
        if (error) {
          reject(error);
        } else if (response.statusCode != 200) {
          reject('Unable to delete API (' + response.statusCode + ')');
        } else {
          resolve();
        }
      });
    });
  };
};
