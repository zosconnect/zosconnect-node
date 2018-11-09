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
  const api = new Api({ uri: "http://test:9080/zosConnect/apis/dateApi" }, "healthApi",
    "1.0", "Health API");
  describe("#start", () => {
    it("should start the api", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(200, {
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "started",
          version: "1.0.0",
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
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
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
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(200, {
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
        });
      return api.update(new Buffer("foo")).should.be.fulfilled;
    });

    it("should fail to stop the API", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(404);
      api.update(new Buffer("foo")).should.be.rejectedWith(Error);
    });

    it("should fail to stop the API due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      api.update(new Buffer("foo")).should.be.rejectedWith("something fatal happened");
    });

    it("should fail the update", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .reply(404);
      api.update(new Buffer("foo")).should.be.rejectedWith(Error);
    });

    it("should fail the update due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "stopped" })
        .reply(200, {
          apiUrl: "http://192.168.99.100:9080/dateTime",
          description: "Date Time API",
          documentation: {
            swagger: "http://192.168.99.100:9080/dateTime/api-docs",
          },
          name: "dateTime",
          status: "stopped",
          version: "1.0.0",
        });
      nock("http://test:9080")
        .put("/zosConnect/apis/dateApi")
        .query({ status: "started" })
        .replyWithError("Something fatal happened");
      api.update(new Buffer("foo")).should.be.rejectedWith("Something fatal happened");
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
    it("should return the API Name", () => api.getApiName().should.equal("healthApi"));
  });

  describe("#getVersion", () => {
    it("should return the API Version", () => api.getVersion().should.equal("1.0"));
  });

  describe("#getDescription", () => {
    it("should return the API Description", () => api.getDescription().should.equal("Health API"));
  });
});
