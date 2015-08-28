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
            }
        , function(error, response, body){
    if(error || response.statusCode != 200){
        callback(error, null);
    } else {
        callback(null, body);
    }
          }
        )
    }

    this.getRequestSchema = function(callback){
        request.get(this.uri.href + '?action=getRequestSchema', function(error, response, body){
            if(error || response.statusCode != 200){
                callback(error, null);
            } else {
                callback(null, body);
            }
        })
    }

    this.getResponseSchema = function(callback){
        request.get(this.uri.href + '?action=getResponseSchema', function(error, response, body){
            if(error || response.statusCode != 200){
                callback(error, null);
            } else {
                callback(null, body);
            }
        })
    }
}
