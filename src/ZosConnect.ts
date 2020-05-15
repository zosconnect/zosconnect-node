/*
 * Copyright 2018 IBM Corp. All Rights Reserved.
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

import extend = require("extend");
import got from "got";
import * as http from "http";
import * as https from "https";
import url = require("url");
import { Api } from "./Api";
import { ApiRequester } from "./ApiRequester";
import { Service } from "./Service";

/**
 * Object which represents a z/OS Connect EE server.
 *
 * Can be used to retrieve and create artifacts on the server.
 */
export class ZosConnect {

  private options: http.RequestOptions | https.RequestOptions;
  private uri: string;

  /**
   * Establish a connection to the server ready to work with APIs, Services and API Requesters.
   *
   * @param options A {@link http.RequestOptions}|{@link https.RequestOptions} which describes the
   * connection to the server
   */
  constructor(uri: string, options: http.RequestOptions | https.RequestOptions) {
    if (options === null || options === undefined) {
      throw new Error("An options object is required");
    }

    if (uri === null || uri === undefined) {
      throw new Error("Required uri or url not specified");
    }

    this.uri = uri;
    this.options = options;
  }

  /**
   * Retrieve all the Services that are installed in the server.
   *
   * @returns An array of all the Service objects.
   */
  public async getServices(): Promise<Service[]> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + "/zosConnect/services";

    const json = JSON.parse((await got(requestUri, opOptions)).body);
    const services: Service[] = [];
    for (const service of json.zosConnectServices) {
      let serviceOptions = {};
      serviceOptions = extend(serviceOptions, this.options);
      const serviceOptionsUri = requestUri + `/${service.ServiceName}`;
      services.push(new Service(serviceOptionsUri, serviceOptions, service.ServiceName, service.ServiceDescription,
        service.ServiceProvider));
    }
    return services;
  }

  /**
   * Retrieve the named Service from the server.
   *
   * @param serviceName The name of the service.
   * @returns The {@link Service}
   */
  public async getService(serviceName: string): Promise<Service> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + `/zosConnect/services/${serviceName}`;

    const serviceData = JSON.parse((await got(requestUri, opOptions)).body);
    const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
    return new Service(requestUri, opOptions, serviceName, serviceData.zosConnect.serviceDescription,
      serviceData.zosConnect.serviceProvider);
  }

  /**
   * Retrieve all the APIs that are intalled in the server.
   *
   * @returns An array of all the API objects.
   */
  public async getApis(): Promise<Api[]> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + "/zosConnect/apis";
    const json = JSON.parse((await got(requestUri, opOptions)).body);
    const apis = [];
    for (const api of json.apis) {
      let apiOptions = {};
      apiOptions = extend(apiOptions, this.options);
      const apiUri = requestUri + `/${api.name}`;
      apis.push(new Api(apiUri, apiOptions, api.name, api.version, api.description));
    }
    return apis;

  }

  /**
   * Retrieve the named API from the server.
   *
   * @param apiName The name of the API to retrieve.
   * @returns The {@link Api}
   */
  public async getApi(apiName: string): Promise<Api> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + `/zosConnect/apis/${apiName}`;
    const json = JSON.parse((await got(requestUri, opOptions)).body);
    const apiUrl = url.parse(json.apiUrl);
    return new Api(requestUri, opOptions, apiName, json.version, json.description);
  }

  /**
   * Install a new API.
   *
   * @param aarFile The AAR file to install.
   * @returns The {@link Api} that was installed
   */
  public async createApi(aarFile: Buffer): Promise<Api> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    const requestUri = this.uri + "/zosConnect/apis";
    requestOptions.method = "POST";
    // tslint:disable-next-line:no-string-literal
    requestOptions["body"] = aarFile;
    requestOptions.headers = {
      "Content-Type": "application/zip",
    };
    opOptions = extend(opOptions, requestOptions);
    const json = JSON.parse((await got(requestUri, opOptions)).body);
    const apiUrl = url.parse(json.apiUrl);
    return new Api(requestUri + json.name, opOptions, json.name, json.version, json.description);
  }

  /**
   * Install a new Service.
   *
   * @param sarFile The SAR file to install.
   * @returns The {@link Service} that was installed.
   */
  public async createService(sarFile: Buffer): Promise<Service> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    const requestUri = this.uri + "/zosConnect/services";
    requestOptions.method = "POST";
    // tslint:disable-next-line:no-string-literal
    requestOptions["body"] = sarFile;
    requestOptions.headers = {
      "Content-Type": "application/zip",
    };
    opOptions = extend(opOptions, requestOptions);
    const serviceData = JSON.parse((await got(requestUri, opOptions)).body);
    return new Service(requestUri + serviceData.zosConnect.serviceName, opOptions, serviceData.zosConnect.serviceName,
      serviceData.zosConnect.serviceDescription, serviceData.zosConnect.serviceProvider);
  }

  /**
   * Retrieve all the API Requsters installed in the server.
   *
   * @returns An array of the API Requester objects.
   */
  public async getApiRequesters(): Promise<ApiRequester[]> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + "/zosConnect/apiRequesters";
    const json = JSON.parse((await got(requestUri, opOptions)).body);
    const apis = [];
    for (const apiRequester of json.apiRequesters) {
      let apiRequesterOptions = {};
      apiRequesterOptions = extend(apiRequesterOptions, this.options);
      const apiRequesterUri = requestUri + `/${apiRequester.name}`;
      apis.push(new ApiRequester(apiRequesterUri, apiRequesterOptions, apiRequester.name, apiRequester.version,
        apiRequester.description, apiRequester.connectionRef, apiRequester.status));
    }
    return apis;
  }

  /**
   * Retrieve the named API Requester.
   * @param name The name of the API Requester.
   * @returns The {@link ApiRequester}
   */
  public async getApiRequester(name: string): Promise<ApiRequester> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const requestUri = this.uri + `/zosConnect/apiRequesters/${name}`;
    const json = JSON.parse((await got(requestUri, opOptions)).body);
    return new ApiRequester(requestUri, opOptions, json.name, json.version, json.description, json.connection,
      json.status);
  }

  /**
   * Install a new API Requester.
   * @param araFile The ARA file.
   * @returns The {@link ApiRequester} that was installed.
   */
  public async createApiRequester(araFile: Buffer): Promise<ApiRequester> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    const requestUri = this.uri + "/zosConnect/apiRequesters";
    requestOptions.method = "POST";
    // tslint:disable-next-line:no-string-literal
    requestOptions["body"] = araFile;
    requestOptions.headers = {
      "Content-Type": "application/zip",
    };
    opOptions = extend(opOptions, requestOptions);
    const apiRequester = JSON.parse((await got(requestUri, opOptions)).body);
    const apiRequesterUri = requestUri + "/" + apiRequester.name;
    return new ApiRequester(apiRequesterUri, opOptions, apiRequester.name, apiRequester.version,
      apiRequester.description, apiRequester.connection, apiRequester.status);
  }
}
