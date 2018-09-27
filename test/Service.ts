/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as nock from "nock";

import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import { Service } from "../src/Service";
import { ZosConnect } from "../src/ZosConnect";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("service", () => {
  const dateTimeService = new Service({ uri: "http://test:9080/zosConnect/services/dateTimeService" },
    "dateTimeService", "Date Time Service", "SampleServiceProvider",
    "http://test:9080/zosConnect/services/dateTimeService?action=invoke");
  describe("#invoke", () => {
    it("should invoke the service", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ action: "invoke" })
        .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      return dateTimeService.invoke("").should.eventually.equal(
        "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
    });

    it("should return a security error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ action: "invoke" })
        .reply(401);
      return dateTimeService.invoke("").should.eventually.be.rejectedWith("401");
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ action: "invoke" })
        .replyWithError("something fatal happened");
      return dateTimeService.invoke("").should.be.rejectedWith("something fatal happened");
    });

    it("should work when invoked via a proxy", () => {
      nock("http://testproxy:80")
        .get("/zosConnect/services/dateTimeService")
        .reply(200, {
          dateTimeService: {
            configParm: "",
          },
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                      "http://test:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceURL: "http://test:9080/zosConnect/services/dateTimeService",
          },
        });
      const proxyZConn = new ZosConnect({ uri: "http://testproxy:80" });
      nock("http://testproxy:80")
        .put("/zosConnect/services/dateTimeService")
        .query({ action: "invoke" })
        .reply(200, "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      proxyZConn.getService("dateTimeService").then((service) => {
        service.invoke("").should.eventually.equal(
          "{ time: '2:32:01 PM', config: '', date: 'Sep 4, 2015' }");
      });
    });
  });

  describe("#getRequestSchema", () => {
    it("should retrieve the request schema", () => {
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/request")
        .reply(200, {});
      return dateTimeService.getRequestSchema().should.eventually.equal("{}");
    });

    it("should return a security error", () => {
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/request")
        .reply(401);
      return dateTimeService.getRequestSchema().should.be
        .rejectedWith("401");
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/request")
        .replyWithError("something fatal happened");
      return dateTimeService.getRequestSchema().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#getResponseSchema", () => {
    it("should retrieve the response schema", () => {
      const schema = {
        title: "Reference Schema",
        properties: {
          time: { type: "string" },
          date: { type: "string" },
        },
        required: ["date", "time"],
        type: "object",
      };
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/response")
        .reply(200, schema);
      return dateTimeService.getResponseSchema().should.eventually.equal(JSON.stringify(schema));
    });

    it("should return a security error", () => {
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/response")
        .reply(401);
      return dateTimeService.getResponseSchema().should.be
        .rejectedWith("401");
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .get("/zosConnect/services/dateTimeService/schemas/response")
        .replyWithError("something fatal happened");
      return dateTimeService.getResponseSchema().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#start", () => {
    it("should start the service", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .reply(200, {
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                "http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceStatus: "Started",
            serviceURL: "http://192.168.99.100:9080/zosConnect/services/dateTimeService",
          },
        });
      return dateTimeService.start().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .reply(404);
      return dateTimeService.start().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .replyWithError("something fatal happened");
      return dateTimeService.start().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#stop", () => {
    it("should stop the service", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(200, {
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                "http://192.168.99.100:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceStatus: "Started",
            serviceURL: "http://192.168.99.100:9080/zosConnect/services/dateTimeService",
          },
        });
      return dateTimeService.stop().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(404);
      return dateTimeService.stop().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      return dateTimeService.stop().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#update", () => {
    it("should update the API", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(200, {
          dateTimeService: {
            configParm: "",
          },
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                      "http://test:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceURL: "http://test:9080/zosConnect/services/dateTimeService",
            serviceStatus: "Stopped",
          },
        });
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .reply(200, {
          dateTimeService: {
            configParm: "",
          },
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                      "http://test:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceURL: "http://test:9080/zosConnect/services/dateTimeService",
            serviceStatus: "Stopped",
          },
        });
      return dateTimeService.update("foo").should.be.fulfilled;
    });

    it("should fail to stop the API", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(404);
      return dateTimeService.update("foo").should.be.rejectedWith(Error);
    });

    it("should fail to stop the API due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      return dateTimeService.update("foo").should.be.rejectedWith("something fatal happened");
    });

    it("should fail the update", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(200, {
          dateTimeService: {
            configParm: "",
          },
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                      "http://test:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceURL: "http://test:9080/zosConnect/services/dateTimeService",
            serviceStatus: "Stopped",
          },
        });
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .reply(404);
      return dateTimeService.update("foo").should.be.rejectedWith(Error);
    });

    it("should fail the update due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "stopped" })
        .reply(200, {
          dateTimeService: {
            configParm: "",
          },
          zosConnect: {
            dataXformProvider: "DATA_UNAVAILABLE",
            serviceDescription: "Get the date and time from the server",
            serviceInvokeURL:
                      "http://test:9080/zosConnect/services/dateTimeService?action=invoke",
            serviceName: "dateTimeService",
            serviceProvider: "zOSConnect Reference Service Provider",
            serviceURL: "http://test:9080/zosConnect/services/dateTimeService",
            serviceStatus: "Stopped",
          },
        });
      nock("http://test:9080")
        .put("/zosConnect/services/dateTimeService")
        .query({ status: "started" })
        .replyWithError("Something fatal happened");
      return dateTimeService.update("foo").should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("#delete", () => {
    it("should delete the service", () => {
      nock("http://test:9080")
        .delete("/zosConnect/services/dateTimeService")
        .reply(200, {
          name: "dateTime",
        });
      return dateTimeService.delete().should.be.fulfilled;
    });

    it("should fail the delete", () => {
      nock("http://test:9080")
        .delete("/zosConnect/services/dateTimeService")
        .reply(403);
      return dateTimeService.delete().should.be.rejectedWith(Error);
    });

    it("should fail due to error", () => {
      nock("http://test:9080")
        .delete("/zosConnect/services/dateTimeService")
        .replyWithError("Something fatal happened");
      return dateTimeService.delete().should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("getName", () => {
    it("should return the service name", () => dateTimeService.getName().should.equal("dateTimeService"));
  });

  describe("getDescription", () => {
    it("should return the service description",
      () => dateTimeService.getDescription().should.equal("Date Time Service"));
  });

  describe("getServiceProvider", () => {
    it("should return the service provider name",
      () => dateTimeService.getServiceProvider().should.equal("SampleServiceProvider"));
  });
});
