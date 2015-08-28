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
var ZosConnect = require('zosconnect-node');
var zosconnect = new ZosConnect('http://mainframe:8080');
```

#### Retrieve a list of services

```
zosconnect.getServices(function(error, services){
    console.log(services);
});
```

#### Get a service

```
zosconnect.getService('dateTimeService', function(error, service){
    console.log(service);
    //normally this would then go on and work with the service
}
```

#### Invoke a service

```
zosconnect.getService('dateTimeService', function(error, service){
    service.invoke(JSON.stringify({input:'data'}), function(error, response){
        if(error){
            console.log(error);
        } else
            console.log(response);
    });
);
```
