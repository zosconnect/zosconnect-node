[![Build status](https://travis-ci.org/zosconnect/zosconnect-node.svg?branch=master)](https://travis-ci.org/zosconnect/zosconnect-node)
[![codecov.io](http://codecov.io/github/zosconnect/zosconnect-node/coverage.svg?branch=master)](http://codecov.io/github/zosconnect/zosconnect-node?branch=master)
[![Dependencies](https://david-dm.org/zosconnect/zosconnect-node.svg)](https://david-dm.org/zosconnect/zosconnect-node)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Node zosconnect](#node-zosconnect)
  - [Installing](#installing)
  - [Usage](#usage)
    - [Connecting to z/OS Connect](#connecting-to-zos-connect)
      - [HTTPs Support](#https-support)
      - [Basic Authentication](#basic-authentication)
    - [APIs](#apis)
      - [Retrieve a list of APIs](#retrieve-a-list-of-apis)
      - [Get an API](#get-an-api)
      - [Create an API](#create-an-api)
      - [Call an API](#call-an-api)
      - [Get the Swagger document for an API](#get-the-swagger-document-for-an-api)
      - [Start or Stop an API](#start-or-stop-an-api)
      - [Update an API](#update-an-api)
    - [Services](#services)
      - [Retrieve a list of services](#retrieve-a-list-of-services)
      - [Get a service](#get-a-service)
      - [Invoke a service](#invoke-a-service)
      - [Get the request schema](#get-the-request-schema)
      - [Get the response schema](#get-the-response-schema)
      - [Get the status of the service](#get-the-status-of-the-service)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Node zosconnect

A wrapper service for z/OS&reg; Connect, enabling node applications to discover and access zSystems resources
that are service enabled by z/OS&reg; Connect.

Services are identified by name that is unique within the scope of the target z/OS&reg; Connect instance
(or cluster). The node application uses pre-existing knowledge of the service name, or discovers it
dynamically by retrieving a list of available services. The z/OS&reg; Connect node wrapper provides access
to JSON request and response schemas for the specific z/OS&reg; Connect service, enabling the node
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
  uri:'http://mainframe:8080'
}
var zosconnect = new ZosConnect(options);
```
The `options` object matches exactly the options described by the [request/request](https://github.com/request/request) module. The uri or url parameter must be specified.

##### HTTPs Support
Create the options object with locations for the CA certificate file and optionally the client certificate and client private key (if using client authentication). If the strictSSL option is set to false then invalid SSL certificates can be used which may be of use in development environments.
```js
var fs = require('fs');
var path = require('path');
var caFile = path.resolve(__dirname, 'ca.pem');
var certFile = path.resolve(__dirname, 'cert.pem');
var keyFile = path.resolve(__dirname, 'key.pem');
var options = {
  uri:'https://mainframe:9443',
  ca: fs.readFileSync(caFile),
  cert: fs.readFileSync(certFile),
  key: fs.readFileSync(keyFile),
  passphrase: 'passw0rd',
  strictSSL: true
}
```

##### Basic Authentication
Add the authentication credentials to the options object.
```js
var options = {
  uri: 'http://mainframe:9080',
  auth: {
    user: 'userId',
    pass: 'password'
  }
}
```

#### APIs

##### Retrieve a list of APIs

```js
zosconnect.getApis().then(console.log);
```

##### Get an API

```js
zosconnect.getApi('healthApi').then(console.log);
```

##### Create an API

```js
zosconnect.createApi(fs.readFileSync('api.aar')).then(console.log);
```

##### Call an API

```js
zosconnect.getApi('healthApi').then((api) => {
  api.invoke('patient/12345', 'GET', null).then((response) => {
    if(response.statusCode != 200) {
      console.log('Invoke failed with respCode = ' + response.statusCode);
    } else {
      console.log(response.body);
    }
  }).catch(console.log);
});
```

##### Get the Swagger document for an API

```js
zosconnect.getApi('healthApi').then((api) => {
  api.getApiDoc('swagger').then(console.log);
});
```

##### Start or Stop an API

```js
zosconnect.getApi('healthApi', function(error, api){
  api.stop().catch(console.log);
  api.start().catch(console.log);
})
```

##### Update an API

```js
zosconnect.getApi('healthApi').then((api) => {
  api.update(fs.readFileSync('healthApi.aar')).catch(console.log);
});
```

##### Delete an API

```js
zosconnect.getApi('healthApi').then((api) => {
  api.delete().catch(console.log);
})
```

#### Services

##### Retrieve a list of services

```js
zosconnect.getServices().then(console.log);
```

##### Get a service

```js
zosconnect.getService('dateTimeService').then(console.log);
//normally this would then go on and work with the service
```

##### Invoke a service

```js
zosconnect.getService('dateTimeService').then((service) => {
  service.invoke({input:'data'}).then((response) => {
    if(response.statusCode != 200) {
      console.log('Invoke failed with respCode = ' + response.statusCode);
    } else {
      console.log(response.body);
    }
  }).catch(console.log);
});
```

##### Get the request schema

```js
zosconnect.getService('dateTimeService').then((service) => {
  service.getRequestSchema().then(console.log).catch(console.log);
});
```

##### Get the response schema

```js
zosconnect.getService('dateTimeService').then((service) => {
  service.getResponseSchema().then(console.log).catch(console.log);;
});
```

##### Get the status of the service

```js
zosconnect.getService('dateTimeService').then((service) => {
  service.getStatus().then(console.log).catch(console.log);
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
