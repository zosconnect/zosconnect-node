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
import { CoreOptions, UriOptions } from "request";
import request = require("request-promise");
import url = require("url");

export class Service {

  private options: request.OptionsWithUri;
  private serviceName: string;
  private description: string;
  private serviceProvider: string;
  private serviceInvokeUrl: string = "";
  private status: string = "";

  constructor(options: request.OptionsWithUri, serviceName: string, description: string,
              serviceProvider: string) {
    this.options = options;
    this.serviceName = serviceName;
    this.description = description;
    this.serviceProvider = serviceProvider;
  }

  /**
   * Mark the Service as started and available to process requests.
   */
  public async start(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    opOptions.headers = {
      "Content-Type": "application/json",
    };
    const response = JSON.parse(await request(opOptions));
    this.status = response.zosConnect.serviceStatus;
  }

  /**
   * Mark the Service as stopped and unavailable to process requests.
   */
  public async stop(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=stopped";
    opOptions.headers = {
      "Content-Type": "application/json",
    };
    const response = JSON.parse(await request(opOptions));
    this.status = response.zosConnect.serviceStatus;
  }

  /**
   * Update the Service with a new version.
   * @param sarFile The new SAR file for the Service
   */
  public async update(sarFile: Buffer): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    opOptions.body = sarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    await this.stop();
    const serviceData = JSON.parse(await request(opOptions));
    this.description = serviceData.zosConnect.serviceDescription;
    this.status = serviceData.zosConnect.serviceStatus;
    const baseUrl = new url.URL(this.options.uri.toString());
    this.serviceInvokeUrl =
      `${baseUrl.protocol}//${baseUrl.host}${new url.URL(serviceData.zosConnect.serviceInvokeURL).pathname}`;
  }

  /**
   * Delete the Service from the server.
   */
  public async delete(): Promise<void> {
    let opOptions = {} as UriOptions & CoreOptions;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "DELETE";
    await request(opOptions);
  }

  /**
   * @returns The name of the Service.
   */
  public getName(): string {
    return this.serviceName;
  }

  /**
   * @returns The Services description.
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * @returns The service provider for the Service.
   */
  public getServiceProvider(): string {
    return this.serviceProvider;
  }

  /**
   * @returns The status of the Service.
   */
  public async getStatus(): Promise<string> {
    if (this.status === "") {
      await this.getServiceInfo();
    }
    return this.status;
  }

  /**
   * @returns The URL that the Service can be invoked on.
   */
  public async getServiceInvokeUrl(): Promise<string> {
    if (this.status === "") {
      await this.getServiceInfo();
    }
    return this.serviceInvokeUrl;
  }

  private async getServiceInfo(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "GET";
    const serviceJson = JSON.parse(await request(opOptions));
    const baseUrl = new url.URL(this.options.uri.toString());
    const invokeUrl = new url.URL(serviceJson.zosConnect.serviceInvokeURL);
    this.serviceInvokeUrl =
      `${baseUrl.protocol}//${baseUrl.host}${invokeUrl.pathname}${invokeUrl.search}`;
    this.status = serviceJson.zosConnect.serviceStatus;
  }
}
