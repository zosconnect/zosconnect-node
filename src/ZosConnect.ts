/*
 * Copyright 2015, 2016 IBM Corp. All Rights Reserved.
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
import {Api} from "./Api";
import {Service} from "./Service";

export class ZosConnect {

  private defaultOptions = {
    strictSSL: true,
  };

  private options: request.OptionsWithUri;

  constructor(options: request.OptionsWithUri) {
    if (options === null || options === undefined) {
      throw new Error("An options object is required");
    }

    if (options.uri === undefined) {
      throw new Error("Required uri or url not specified");
    }

    this.options = extend(this.defaultOptions, options);
  }

  public async getServices(): Promise<string[]> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/services";

    const json = JSON.parse(await request(opOptions));
    const services: string[] = [];
    for (const service of json.zosConnectServices) {
      services.push(service.ServiceName);
    }
    return services;
  }

  public async getService(serviceName: string): Promise<Service> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/services/${serviceName}`;

    const serviceData = JSON.parse(await request(opOptions));
    const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
    return new Service(opOptions, serviceName, this.options.uri + invokeUrl.pathname + invokeUrl.search);
  }

  public async getApis(): Promise<string[]> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/zosConnect/apis";
    const json = JSON.parse(await request(opOptions));
    const apis = [];
    for (const api of json.apis) {
      apis.push(api.name);
    }
    return apis;

  }

  public async getApi(apiName: string): Promise<Api> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/apis/${apiName}`;
    const json = JSON.parse(await request(opOptions));
    const apiUrl = url.parse(json.apiUrl);
    return new Api(opOptions, apiName, json.version, json.description, this.options.uri + apiUrl.pathname,
      json.documentation);
  }

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
    return new Api(opOptions, json.name, json.version, json.description, this.options.uri + apiUrl.pathname,
      json.documentation);
  }

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
    const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
    return new Service(opOptions, serviceData.ServiceName, this.options.uri + invokeUrl.pathname + invokeUrl.search);
  }
}
