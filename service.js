/*
Copyright 2015 IBM Corp. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var request = require('request');

module.exports = function(uri, serviceName, invokeUri){
    this.uri = uri;
    this.serviceName = serviceName;
    this.invokeUri = invokeUri;

    this.invoke = function(data, callback){
        request(
            { method: 'PUT'
            , uri: this.invokeUri
            , json: true
            , body: data
            }, callback)
    }

    this.getRequestSchema = function(callback){
        request.get(this.uri.href + '?action=getRequestSchema', function(error, response, body){
            if(error) {
                callback(error, null)
            } else if(response.statusCode != 200){
                callback(new Error('Failed to get schema (' + response.statusCode + ')'), null);
            } else {
                callback(null, body);
            }
        })
    }

    this.getResponseSchema = function(callback){
        request.get(this.uri.href + '?action=getResponseSchema', function(error, response, body){
            if(error){
                callback(error, null);
            } else if(response.statusCode != 200){
                callback(new Error('Failed to get schema (' + response.statusCode + ')'), null);
            } else {
                callback(null, body);
            }
        })
    }
}
