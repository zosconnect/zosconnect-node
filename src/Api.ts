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

export class Api {

  private apiAdminUrl: string;
  private options: http.RequestOptions | https.RequestOptions;
  private apiName: string;
  private version: string;
  private description: string;
  private apiUrl: string = "";
  private documentation: {};
  private status: string = "";
  private services: string[];

  constructor(apiAdminUrl: string, options: http.RequestOptions | https.RequestOptions, apiName: string,
              version: string, description: string) {
    this.apiAdminUrl = apiAdminUrl;
    this.options = options;
    this.apiName = apiName;
    this.version = version;
    this.description = description;
  }

  /**
   * Mark the API as started and available for requests.
   */
  public async start(): Promise<void> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    const uri = this.apiAdminUrl + "?status=started";
    requestOptions.method = "PUT";
    requestOptions.headers = {
      "Content-Type": "application/json",
    };
    opOptions = extend(opOptions, requestOptions);
    const apiJson = JSON.parse((await got(uri, opOptions)).body);
    this.status = apiJson.status;
  }

  /**
   * Mark the API as stopped and unavailable for requests.
   */
  public async stop(): Promise<void> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    const uri = this.apiAdminUrl + "?status=stopped";
    requestOptions.method = "PUT";
    requestOptions.headers = {
      "Content-Type": "application/json",
    };
    opOptions = extend(opOptions, requestOptions);
    const apiJson = JSON.parse((await got(uri, opOptions)).body);
    this.status = apiJson.status;
  }

  /**
   * Update the API with a new version.
   *
   * @param aarFile The new AAR file
   */
  public async update(aarFile: Buffer): Promise<void> {
    let opOptions = {};
    let requestOptions = {} as https.RequestOptions;
    requestOptions = extend(requestOptions, this.options);
    requestOptions.method = "PUT";
    const uri = this.apiAdminUrl + "?status=started";
    // tslint:disable-next-line:no-string-literal
    requestOptions["body"] = aarFile;
    requestOptions.headers = {
      "Content-Type": "application/zip",
    };
    opOptions = extend(opOptions, requestOptions);
    await this.stop();
    const apiJson = JSON.parse((await got(uri, opOptions)).body);
    this.version = apiJson.version;
    this.description = apiJson.description;
    const baseURL = new url.URL(this.apiAdminUrl);
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
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    await got.delete(this.apiAdminUrl, opOptions);
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
    let opOptions = {};
    if (this.documentation === undefined) {
      await this.getApiInfo();
    }
    const docUrl = this.documentation[type];
    if (docUrl === undefined) {
      throw new Error(`Documentation of type ${type} not available`);
    }
    opOptions = extend(opOptions, this.options);
    const baseURL = new url.URL(this.apiAdminUrl);
    const uri = `${baseURL.protocol}//${baseURL.host}${new url.URL(docUrl).pathname}`;
    return (await got(uri, opOptions)).body;
  }

  public async getServices(): Promise<string[]> {
    if (this.services === undefined) {
      await this.getApiInfo();
    }
    return this.services;
  }

  private async getApiInfo(): Promise<void> {
    let opOptions = {};
    opOptions = extend(opOptions, this.options);
    const apiJson = JSON.parse((await got.get(this.apiAdminUrl, opOptions)).body);
    const baseURL = new url.URL(this.apiAdminUrl);
    this.apiUrl = `${baseURL.protocol}//${baseURL.host}${new url.URL(apiJson.apiUrl).pathname}`;
    this.documentation = apiJson.documentation;
    this.status = apiJson.status;
    this.services = [];
    apiJson.services.forEach((service) => this.services.push(service.name));
  }
}
