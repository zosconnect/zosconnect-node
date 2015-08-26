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

```
var zosconnect = require('zosconnect-node')('http://mainframe:8080');
```

#### Retrieve a list of services

```
var services = zosconnect.getServices();
```

#### Get a service

```
var service = zosconnect.getService('serviceName');
```

### Invoke a service

```
var service = zosconnect.getService('serviceName');
service.invoke({action: 'PUT', JSON.stringify({firstName:'Joe',lastName:'Bloggs'}), function(data, err){
        if(err){
           console.log(err);
        } else {
           //do nothing as update was successful
        }
});
```
