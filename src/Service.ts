/*
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

import extend = require("extend");
import { CoreOptions, UriOptions } from "request";
import request = require("request-promise");

export class Service {

  private options: request.OptionsWithUri;
  private serviceName: string;
  private invokeUri: string;

  constructor(options: request.OptionsWithUri, serviceName: string, invokeUri: string) {
    this.options = options;
    this.serviceName = serviceName;
    this.invokeUri = invokeUri;
  }

  public async invoke(data: any): Promise<any> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri = this.invokeUri;
    opOptions.json = true;
    opOptions.body = data;
    return await request(opOptions);
  }

  public async getRequestSchema(): Promise<any> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/schemas/request";
    return await request(opOptions);
  }

  public async getResponseSchema(): Promise<any> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "/schemas/response";
    return await request(opOptions);
  }

  public async start(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    await request(opOptions);
  }

  public async stop(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=stopped";
    await request(opOptions);
  }

  public async update(sarFile): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    opOptions.body = sarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    await this.stop();
    await request(opOptions);
  }

  public async delete(): Promise<void> {
    let opOptions = {} as UriOptions & CoreOptions;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "DELETE";
    await request(opOptions);
  }
}
