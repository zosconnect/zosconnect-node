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

export class Api {

  private options: request.OptionsWithUri;
  private apiName: string;
  private version: string;
  private description: string;
  private apiUrl: string = "";
  private documentation: {};
  private status: string = "";
  private services: string[];

  constructor(options: request.OptionsWithUri, apiName: string, version: string, description: string) {
    this.options = options;
    this.apiName = apiName;
    this.version = version;
    this.description = description;
  }

  /**
   * Mark the API as started and available for requests.
   */
  public async start(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "?status=started";
    opOptions.method = "PUT";
    delete opOptions.body;
    const apiJson = JSON.parse(await request(opOptions));
    this.status = apiJson.status;
  }

  /**
   * Mark the API as stopped and unavailable for requests.
   */
  public async stop(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "?status=stopped";
    opOptions.method = "PUT";
    delete opOptions.body;
    const apiJson = JSON.parse(await request(opOptions));
    this.status = apiJson.status;
  }

  /**
   * Update the API with a new version.
   *
   * @param aarFile The new AAR file
   */
  public async update(aarFile: Buffer): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    opOptions.body = aarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    await this.stop();
    const apiJson = JSON.parse(await request(opOptions));
    this.version = apiJson.version;
    this.description = apiJson.description;
    const baseURL = new url.URL(this.options.uri.toString());
    this.apiUrl = `${baseURL.protocol}//${baseURL.host}${new url.URL(apiJson.apiUrl).pathname}`;
    this.documentation = apiJson.documentation;
    this.status = apiJson.status;
    this.services = [];
    apiJson.services.forEach((service) => this.services.push(service.name));
  }

  /**
   * Delete the API.
   */
  public async delete(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "DELETE";
    await request(opOptions);
  }

  /**
   * @returns The name of the API.
   */
  public getApiName(): string {
    return this.apiName;
  }

  /**
   * @returns The description of the API.
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * @returns The version of the API.
   */
  public getVersion(): string {
    return this.version;
  }

  /**
   * @returns The base URL for the API.
   */
  public async getApiUrl(): Promise<string> {
    if (this.apiUrl === "") {
      await this.getApiInfo();
    }
    return this.apiUrl;
  }

  /**
   * @returns The status of the API.
   */
  public async getStatus(): Promise<string> {
    if (this.status === "") {
      await this.getApiInfo();
    }
    return this.status;
  }

  /**
   * @param type The type of documentation to retrieve, e.g. swagger
   * @returns The documentation for the requested types.
   */
  public async getDocumentation(type: string): Promise<string> {
    let opOptions = {} as request.OptionsWithUri;
    if (this.documentation === undefined) {
      await this.getApiInfo();
    }
    const docUrl = this.documentation[type];
    if (docUrl === undefined) {
      throw new Error(`Documentation of type ${type} not available`);
    }
    opOptions = extend(opOptions, this.options);
    const baseURL = new url.URL(this.options.uri.toString());
    opOptions.uri = `${baseURL.protocol}//${baseURL.host}${new url.URL(docUrl).pathname}`;
    return await request(opOptions);
  }

  public async getServices(): Promise<string[]> {
    if (this.services === undefined) {
      await this.getApiInfo();
    }
    return this.services;
  }

  private async getApiInfo(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "GET";
    const apiJson = JSON.parse(await request(opOptions));
    const baseURL = new url.URL(this.options.uri.toString());
    this.apiUrl = `${baseURL.protocol}//${baseURL.host}${new url.URL(apiJson.apiUrl).pathname}`;
    this.documentation = apiJson.documentation;
    this.status = apiJson.status;
    this.services = [];
    apiJson.services.forEach((service) => this.services.push(service.name));
  }
}
