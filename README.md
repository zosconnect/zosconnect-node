## z/OS Connect Node.js client

Wrapper to use services defined in z/OS Connect.

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
service.invoke('PUT', JSON.stringify({'firstName':'Joe','lastName':'Bloggs'}), function(data, err){
        if(err){
           console.log(err);
        } else {
           //do nothing as update was successful 
        }
});
```
