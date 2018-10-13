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
import { ApiRequester } from "../src/ApiRequester";
import { ZosConnect } from "../src/ZosConnect";

before(() => {
  chai.should();
  chai.use(chaiAsPromised);
});

describe("apiRequester", () => {
  const apiRequester = new ApiRequester({ uri: "http://test:9080/zosConnect/apiRequesters/Book_Inventory",
                                          strictSSL: true },
    "Book_Inventory", "1.0.0", "API requester for Book_Inventory app", "BookConnref");

  describe("#start", () => {
    it("should start the API Requester", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Started",
          connection: "BookConnref",
        });
      return apiRequester.start().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .reply(404);
      return apiRequester.start().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .replyWithError("something fatal happened");
      return apiRequester.start().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#stop", () => {
    it("should stop the API Requester", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Stopped",
          connection: "BookConnref",
        });
      return apiRequester.stop().should.be.fulfilled;
    });

    it("should return not found", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(404);
      apiRequester.stop().should.be.rejectedWith(Error);
    });

    it("should return an error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      apiRequester.stop().should.be.rejectedWith("something fatal happened");
    });
  });

  describe("#update", () => {
    it("should update the API Requester", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Stopped",
          connection: "BookConnref",
        });
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Started",
          connection: "BookConnref",
        });
      return apiRequester.update(new Buffer("foo")).should.be.fulfilled;
    });

    it("should fail to stop the API Requester", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(404);
      apiRequester.update(new Buffer("foo")).should.be.rejectedWith(Error);
    });

    it("should fail to stop the API Requester due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .replyWithError("something fatal happened");
      apiRequester.update(new Buffer("foo")).should.be.rejectedWith("something fatal happened");
    });

    it("should fail the update", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Stopped",
          connection: "BookConnref",
        });
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .reply(404);
      apiRequester.update(new Buffer("foo")).should.be.rejectedWith(Error);
    });

    it("should fail the update due to error", () => {
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "stopped" })
        .reply(200, {
          name: "Book_Inventory",
          version: "1.0.0",
          description: "API requester for Book_Inventory app",
          status: "Stopped",
          connection: "BookConnref",
        });
      nock("http://test:9080")
        .put("/zosConnect/apiRequesters/Book_Inventory")
        .query({ status: "started" })
        .replyWithError("Something fatal happened");
      apiRequester.update(new Buffer("foo")).should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("#delete", () => {
    it("should delete the API Requester", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apiRequesters/Book_Inventory")
        .reply(200, {
          name: "Book_Inventory",
        });
      return apiRequester.delete().should.be.fulfilled;
    });

    it("should fail the delete", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apiRequesters/Book_Inventory")
        .reply(403);
      return apiRequester.delete().should.be.rejectedWith(Error);
    });

    it("should fail due to error", () => {
      nock("http://test:9080")
        .delete("/zosConnect/apiRequesters/Book_Inventory")
        .replyWithError("Something fatal happened");
      return apiRequester.delete().should.be.rejectedWith("Something fatal happened");
    });
  });

  describe("#getName", () => {
    it("should return the API Name", () => apiRequester.getName().should.equal("Book_Inventory"));
  });

  describe("#getVersion", () => {
    it("should return the API Version", () => apiRequester.getVersion().should.equal("1.0.0"));
  });

  describe("#getDescription", () => {
    it("should return the API Description", () => apiRequester.getDescription().should
      .equal("API requester for Book_Inventory app"));
  });

  describe("#getConnection", () => {
    it("should return the connection ref", () => apiRequester.getConnection().should.equal("BookConnref"));
  });
});
