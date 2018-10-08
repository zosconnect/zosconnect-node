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

    if (options.uri === null || options.uri === undefined) {
      throw new Error("Required uri or url not specified");
    }

    this.options = extend(this.defaultOptions, options);
  }

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
        service.ServiceProvider, null));
    }
    return services;
  }

  public async getService(serviceName: string): Promise<Service> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += `/zosConnect/services/${serviceName}`;

    const serviceData = JSON.parse(await request(opOptions));
    const invokeUrl = url.parse(serviceData.zosConnect.serviceInvokeURL);
    return new Service(opOptions, serviceName, serviceData.zosConnect.serviceDescription,
      serviceData.zosConnect.serviceProvider, this.options.uri + invokeUrl.pathname + invokeUrl.search);
  }

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
      apis.push(new Api(apiOptions, api.name, api.version, api.description, null, null));
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
    return new Service(opOptions, serviceData.zosConnect.serviceName, serviceData.zosConnect.serviceDescription,
      serviceData.zosConnect.serviceProvider, this.options.uri + invokeUrl.pathname + invokeUrl.search);
  }
}
