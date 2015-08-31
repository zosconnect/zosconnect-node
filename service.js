var request = require('request');

module.exports = function(uri, serviceName, invokeUri){
    this.uri = uri;
    this.serviceName = serviceName;
    this.invokeUri = invokeUri;

    this.invoke = function(data, callback){
        request(
            { method: 'PUT'
            , uri: this.invokeUri
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
