[![Build status](https://travis-ci.org/zosconnect/zosconnect-node.svg?branch=master)](https://travis-ci.org/zosconnect/zosconnect-node)
[![codecov.io](http://codecov.io/github/zosconnect/zosconnect-node/coverage.svg?branch=master)](http://codecov.io/github/zosconnect/zosconnect-node?branch=master)
[![Dependencies](https://david-dm.org/zosconnect/zosconnect-node.svg)](https://david-dm.org/zosconnect/zosconnect-node)

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
  - [License](#license)

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
    service.invoke({input:'data'}, function(error, response, body){
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

### License
```
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
