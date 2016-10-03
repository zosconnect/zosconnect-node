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

  this.getApiDoc = function (type, callback) {
    var options = {};
    var documentationUri = documentation[type];
    if (documentationUri == undefined) {
      callback(new Error('Documentation not available'), null);
    } else {
      options = extend(options, this.options);
      options.uri = documentationUri;
      request.get(options, function (error, response, body) {
        if (error != null) {
          callback(error, null);
        } else if (response.statusCode != 200) {
          callback(new Error('Unable to retrieve Swagger document (' + response.statusCode + ')'),
                   null);
        } else {
          callback(null, body);
        }
      });
    }
  };

  this.invoke = function (resource, method, content, callback) {
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

  this.start = function (callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '?status=started';
    options.method = 'PUT';
    delete options.body;
    request(options, function (error, response, body) {
      if (error) {
        callback(error);
      } else if (response.statusCode != 200) {
        callback(response.statusCode);
      } else {
        callback(null);
      }
    });
  };

  this.stop = function (callback) {
    var options = {};
    options = extend(options, this.options);
    options.uri += '?status=stopped';
    options.method = 'PUT';
    delete options.body;
    request(options, function (error, response, body) {
      if (error) {
        callback(error);
      } else if (response.statusCode != 200) {
        callback(response.statusCode);
      } else {
        callback(null);
      }
    });
  };

  this.update = function (aarFile, callback) {
    var options = {};
    options = extend(options, this.options);
    this.stop(function (error) {
      if (error != null) {
        if (error instanceof Error) {
          callback(error);
        } else {
          callback(new Error('Unable to stop API'));
        }
      } else {
        options.method = 'PUT';
        options.uri += '?status=started';
        options.body = aarFile;
        options.headers = {
          'Content-Type': 'application/zip',
        };
        request(options, function (error, response, body) {
          if (error) {
            callback(error);
          } else if (response.statusCode != 200) {
            callback(new Error('Unable to create API (' + response.statusCode + ')'));
          } else {
            var json = JSON.parse(body);
            this.basePath = json.apiUrl;
            this.documentation = json.documentation;
            callback(null);
          }
        });
      }
    });
  };

  this.delete = function (callback) {
    var options = {};
    options = extend(options, this.options);
    options.method = 'DELETE';
    request(options, function (error, response, body) {
      if (error) {
        callback(error);
      } else if (response.statusCode != 200) {
        callback(new Error('Unable to delete API (' + response.statusCode + ')'));
      } else {
        callback(null);
      }
    });
  };
};
