[![Build status](https://travis-ci.org/zosconnect/zosconnect-node.svg?branch=master)](https://travis-ci.org/zosconnect/zosconnect-node)
[![codecov.io](https://codecov.io/github/zosconnect/zosconnect-node/coverage.svg?branch=master)](http://codecov.io/github/zosconnect/zosconnect-node?branch=master)
[![Dependencies](https://david-dm.org/zosconnect/zosconnect-node.svg)](https://david-dm.org/zosconnect/zosconnect-node)
[![Module LTS Adopted'](https://img.shields.io/badge/Module%20LTS-Adopted-brightgreen.svg?style=flat)](http://github.com/CloudNativeJS/ModuleLTS)

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Node zosconnect](#node-zosconnect)
  - [Installing](#installing)
  - [Usage](#usage)
    - [Connecting to z/OS Connect](#connecting-to-zos-connect)
      - [HTTPs Support](#https-support)
      - [Basic Authentication](#basic-authentication)
    - [Managing Items](#managing-items)
  - [Module Long Term Support Policy](#module-long-term-support-policy)
  - [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Node zosconnect

A wrapper service for z/OS&reg; Connect EE, enabling node applications to manage z/OS Connect EE APIs, Services and API Requesters. Version 3 of this module pre-reqs z/OS Connect EE V3.0.14 or later.

### Installing

```
npm install @zosconnect/zosconnect-node
```

### Usage

#### Connecting to z/OS Connect

```js
var options = {
  uri:'http://mainframe:8080'
}
var zosconnect = new ZosConnect(options);
```
The `options` object matches exactly the options described by the [request/request](https://github.com/request/request) module. The uri parameter must be specified.

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

#### Managing Items
APIs, Services and API Requesters can be retrieved and managed either by getting a list of all the installed items, or by getting a particular item by name. Once the application as an Object representing that item it can be further managed by calling methods on that Object.

### Module Long Term Support Policy
  This module adopts the [Module Long Term Support (LTS)](http://github.com/CloudNativeJS/ModuleLTS) policy, with the following End Of Life (EOL) dates:

  | Module Version   | Release Date | Minimum EOL | EOL With     | Status  |
  |------------------|--------------|-------------|--------------|---------|
  | 3.x.x         | Nov 2018     | Apr 2021    | | Current |
  | 2.x.x         | Jul 2018     | Apr 2021    | Node 10      | LTS |
  | 1.x.x	        | Jul 2017     | Dec 2019    | Node 8       | LTS |
  
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
