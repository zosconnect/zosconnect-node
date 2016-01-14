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
var extend = require('extend');

module.exports = function(options, apiName, basePath) {
  this.options = options;
  this.apiName = apiName;
  this.basePath = basePath;

  this.getApiDoc = function(callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri = basePath + '/api-docs';
    request.get(options, function(error, response, body) {
      if (error != null) {
        callback(error, null);
      } else if (response.statusCode != 200) {
        callback(new Error('Unable to retrieve Swagger document (' + response.statusCode + ')'), null);
      } else {
        callback(null, body);
      }
    });
  };

  this.invoke = function(resource, method, content, callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri = basePath + '/' + resource;
    options.method = method;
    if (content != null) {
      options.body = content;
    }

    options.json = true;
    request(options, callback);
  };
};
