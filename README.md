<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [z/OS Connect Node.js client](#zos-connect-nodejs-client)
  - [Installing](#installing)
  - [Usage](#usage)
    - [Connecting to z/OS Connect](#connecting-to-zos-connect)
    - [Retrieve a list of services](#retrieve-a-list-of-services)
    - [Get a service](#get-a-service)
    - [Invoke a service](#invoke-a-service)
    - [Get the request schema](#get-the-request-schema)
    - [Get the response schema](#get-the-response-schema)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## z/OS Connect Node.js client

A wrapper service for z/OS Connect, enabling node applications to discover and access zSystems resources 
that are service enabled by z/OS Connect. 

Services are identified by name that is unique within the scope of the target z/OS Connect instance 
(or cluster). The node application uses pre-existing knowledge of the service name, or discovers it 
dynamically by retrieving a list of available services. The z/OS Connect node wrapper provides access 
to JSON request and response schemas for the specific z/OS Conenct service, enabling the node 
application to invoke that service and process the response.

### Installing

```
npm install zosconnect-node
```

### Usage

#### Connecting to z/OS Connect

```js
var ZosConnect = require('zosconnect-node');
var options = {
   uri:'http://mainframe:8080', /*required*/
   user:'username',             /*optional*/
   password:'password',         /*optional*/
   certFile:'client.crt',       /*optional*/
   keyFile:'client.key',        /*optional*/
   caFile:'ca.cert.pem',        /*optional*/
   keyPass:'password'           /*optional*/
}
var zosconnect = new ZosConnect(options);
```

#### Retrieve a list of services

```js
zosconnect.getServices(function(error, services){
    console.log(services);
});
```

#### Get a service

```js
zosconnect.getService('dateTimeService', function(error, service){
    console.log(service);
    //normally this would then go on and work with the service
});
```

#### Invoke a service

```js
zosconnect.getService('dateTimeService', function(error, service){
    service.invoke(JSON.stringify({input:'data'}), function(error, response, body){
        if(error){
            console.log(error);
        } else if(response.statusCode != 200) {
            console.log('Invoke failed with respCode = ' + response.statusCode);
        } else {
            console.log(body);
        }
    });
});
```

#### Get the request schema

```js
zosconnect.getService('dateTimeService', function(error, service){
    service.getRequestSchema(function(error, schema){
        if(error){
            console.log(error);
        } else {
            console.log(schema);
        }
    });
});
```

#### Get the response schema

```js
zosconnect.getService('dateTimeService', function(error, service){
    service.getResponseSchema(function(error, schema){
        if(error){
            console.log(error);
        } else {
            console.log(schema);
        }
    });
});
```
