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

  constructor(options: request.OptionsWithUri, apiName: string, version: string, description: string) {
    this.options = options;
    this.apiName = apiName;
    this.version = version;
    this.description = description;
  }

  public async start(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "?status=started";
    opOptions.method = "PUT";
    delete opOptions.body;
    await request(opOptions);
  }

  public async stop(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri += "?status=stopped";
    opOptions.method = "PUT";
    delete opOptions.body;
    await request(opOptions);
  }

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
    await request(opOptions);
  }

  public async delete(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "DELETE";
    await request(opOptions);
  }

  public getApiName(): string {
    return this.apiName;
  }

  public getDescription(): string {
    return this.description;
  }

  public getVersion(): string {
    return this.version;
  }
}
