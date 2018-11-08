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
import request = require("request-promise");
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

  private defaultOptions = {
    strictSSL: true,
  };

  private options: request.OptionsWithUri;

  /**
   * Establish a connection to the server ready to work with APIs, Services and API Requesters.
   *
   * @param options A {@link request.OptionsWithUri} which describes the connection to the server
   */
  constructor(options: request.OptionsWithUri) {
    if (options === null || options === undefined) {
      throw new Error("An options object is required");
    }

    if (options.uri === null || options.uri === undefined) {
      throw new Error("Required uri or url not specified");
    }

    this.options = extend(this.defaultOptions, options);
  }

  /**
   * Retrieve all the Services that are installed in the server.
   *
   * @returns An array of all the Service objects.
   */
  public async getServices(): Promise<Service[]> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/services";

    const json = JSON.parse(await request(opOptions));
    const services: Service[] = [];
    for (const service of json.zosConnectServices) {
      let serviceOptions = {} as request.OptionsWithUri;
      serviceOptions = extend(serviceOptions, opOptions);
      serviceOptions.uri += `/${service.ServiceName}`;
      services.push(new Service(serviceOptions, service.ServiceName, service.ServiceDescription,
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
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/services/${serviceName}`;

    const serviceData = JSON.parse(await request(opOptions));
    const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
    return new Service(opOptions, serviceName, serviceData.zosConnect.serviceDescription,
      serviceData.zosConnect.serviceProvider);
  }

  /**
   * Retrieve all the APIs that are intalled in the server.
   *
   * @returns An array of all the API objects.
   */
  public async getApis(): Promise<Api[]> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/apis";
    const json = JSON.parse(await request(opOptions));
    const apis = [];
    for (const api of json.apis) {
      let apiOptions = {} as request.OptionsWithUri;
      apiOptions = extend(apiOptions, opOptions);
      apiOptions.uri += `/${api.name}`;
      apis.push(new Api(apiOptions, api.name, api.version, api.description));
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
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/apis/${apiName}`;
    const json = JSON.parse(await request(opOptions));
    const apiUrl = url.parse(json.apiUrl);
    return new Api(opOptions, apiName, json.version, json.description);
  }

  /**
   * Install a new API.
   *
   * @param aarFile The AAR file to install.
   * @returns The {@link Api} that was installed
   */
  public async createApi(aarFile: Buffer): Promise<Api> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/apis";
    opOptions.method = "POST";
    opOptions.body = aarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    const json = JSON.parse(await request(opOptions));
    const apiUrl = url.parse(json.apiUrl);
    return new Api(opOptions, json.name, json.version, json.description);
  }

  /**
   * Install a new Service.
   *
   * @param sarFile The SAR file to install.
   * @returns The {@link Service} that was installed.
   */
  public async createService(sarFile: Buffer): Promise<Service> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/services";
    opOptions.method = "POST";
    opOptions.body = sarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    const serviceData = JSON.parse(await request(opOptions));
    return new Service(opOptions, serviceData.zosConnect.serviceName, serviceData.zosConnect.serviceDescription,
      serviceData.zosConnect.serviceProvider);
  }

  /**
   * Retrieve all the API Requsters installed in the server.
   *
   * @returns An array of the API Requester objects.
   */
  public async getApiRequesters(): Promise<ApiRequester[]> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/apiRequesters";
    const json = JSON.parse(await request(opOptions));
    const apis = [];
    for (const apiRequester of json.apiRequesters) {
      let apiRequesterOptions = {} as request.OptionsWithUri;
      apiRequesterOptions = extend(apiRequesterOptions, opOptions);
      apiRequesterOptions.uri += `/${apiRequester.name}`;
      apis.push(new ApiRequester(apiRequesterOptions, apiRequester.name, apiRequester.version,
        apiRequester.description, apiRequester.connectionRef));
    }
    return apis;
  }

  /**
   * Retrieve the named API Requester.
   * @param name The name of the API Requester.
   * @returns The {@link ApiRequester}
   */
  public async getApiRequester(name: string): Promise<ApiRequester> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/apiRequesters/${name}`;
    const json = JSON.parse(await request(opOptions));
    return new ApiRequester(opOptions, json.name, json.version, json.description, json.connection);
  }

  /**
   * Install a new API Requester.
   * @param araFile The ARA file.
   * @returns The {@link ApiRequester} that was installed.
   */
  public async createApiRequester(araFile: Buffer): Promise<ApiRequester> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/apiRequesters";
    opOptions.method = "POST";
    opOptions.body = araFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    const apiRequester = JSON.parse(await request(opOptions));
    opOptions.uri += apiRequester.name;
    return new ApiRequester(opOptions, apiRequester.name, apiRequester.version,
      apiRequester.description, apiRequester.connection);
  }
}
