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
import { Api } from "../src/Api";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("api", () => {
  const api = new Api("http://test:9080/zosConnect/apis/dateApi", { }, "dateTime",
    "1.0.0", "Date Time API");
  describe("#start", () => {
    it("should start the api", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "started",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      return api.start().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(404);
      return api.start().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .replyWithError("something fatal happened");
      return api.start().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#stop", () => {
    it("should stop the api", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      return api.stop().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(404);
      api.stop().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      api.stop().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#update", () => {
    it("should update the API", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      return api.update(Buffer.from("foo")).should.be.fulfilled;
    });

    it("should fail to stop the API", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(404);
      api.update(Buffer.from("foo")).should.be.rejectedWith(Error);
    });

    it("should fail to stop the API due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      api.update(Buffer.from("foo")).should.be.rejectedWith("something fatal happened");
    });

    it("should fail the update", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(404);
      api.update(Buffer.from("foo")).should.be.rejectedWith(Error);
    });

    it("should fail the update due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .replyWithError("Something fatal happened");
      api.update(Buffer.from("foo")).should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("#delete", () => {
    it("should delete the api", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apis/dateApi")
        .reply(200, {
          name: "dateTime",
        });
      return api.delete().should.be.fulfilled;
    });

    it("should fail the delete", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apis/dateApi")
        .reply(403);
      return api.delete().should.be.rejectedWith(Error);
    });

    it("should fail due to error", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apis/dateApi")
        .replyWithError("Something fatal happened");
      return api.delete().should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("#getApiName", () => {
    it("should return the API Name", () => api.getApiName().should.equal("dateTime"));
  });

  describe("#getVersion", () => {
    it("should return the API Version", () => api.getVersion().should.equal("1.0.0"));
  });

  describe("#getDescription", () => {
    it("should return the API Description", () => api.getDescription().should.equal("Date Time API"));
  });

  describe("#getApiUrl", () => {
    const localApi = new Api("http://test:9080/zosConnect/apis/dateApi", { }, "dateTime",
      "1.0.0", "Date Time API");
    it("should return the API URL", () => {
      nock("http://test:9080")
        .get("/zosConnect/apis/dateApi")
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "started",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      return localApi.getApiUrl().should.eventually.equal("http://test:9080/dateTime");
    });

    it("should return API URL without calling the server", () => {
      return localApi.getApiUrl().should.eventually.equal("http://test:9080/dateTime");
    });
  });

  describe("#getStatus", () => {
    const localApi = new Api("http://test:9080/zosConnect/apis/dateApi", { }, "dateTime",
      "1.0.0", "Date Time API");
    it("should return the status of the API", () => {
      nock("http://test:9080")
        .get("/zosConnect/apis/dateApi")
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "Started",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      localApi.getStatus().should.eventually.equal("Started");
    });

    it("should return the status of the API without calling the server", () => {
      return localApi.getStatus().should.eventually.equal("Started");
    });
  });

  describe("#getDocumentation", () => {
    const localApi = new Api("http://test:9080/zosConnect/apis/dateApi", { }, "dateTime",
      "1.0.0", "Date Time API");
    it("should return the swagger", () => {
      nock("http://test:9080")
        .get("/zosConnect/apis/dateApi")
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "started",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      nock("http://test:9080")
        .get("/dateTime/api-docs")
        .reply(200, {version: 2});
      return localApi.getDocumentation("swagger").should.eventually.equal("{\"version\":2}");
    });

    it("should fail to get RAML", () => {
      return localApi.getDocumentation("RAML").should.be.rejected;
    });
  });

  describe("#getServices", () => {
    const localApi = new Api("http://test:9080/zosConnect/apis/dateApi", { }, "dateTime",
      "1.0.0", "Date Time API");
    it("should return the list of service names", () => {
      nock("http://test:9080")
        .get("/zosConnect/apis/dateApi")
        .reply(200, {
          apiUrl: "http://test:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://test:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "started",
          version: "1.0.0",
          services: [
            {
              name: "service1",
              uri: "http://test:9080/zosConnect/services/service1",
            },
          ],
        });
      return localApi.getServices().should.eventually.have.members(["service1"]);
    });

    it("should return the list of service names without calling the server", () => {
      return localApi.getServices().should.eventually.have.members(["service1"]);
    });
  });
});
