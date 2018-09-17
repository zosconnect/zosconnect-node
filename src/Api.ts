/*
 * Copyright 2016 IBM Corp. All Rights Reserved.
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
  private basePath: string;
  private documentation: any;

  constructor(options: request.OptionsWithUri, apiName: string, basePath: string, documentation: any) {
    this.options = options;
    this.apiName = apiName;
    this.basePath = basePath;
    this.documentation = documentation;
  }

  public async getApiDoc(type: string): Promise<any> {
    let opOptions = {} as request.OptionsWithUri;
    const documentationUri = this.documentation[type];
    if (documentationUri === undefined) {
      return Promise.reject("Documentation not available");
    }
    const docUrl = url.parse(documentationUri);
    const apiUrl = url.parse(this.basePath);
    opOptions = extend(opOptions, this.options);
    opOptions.uri = `${apiUrl.protocol}//${apiUrl.host}${docUrl.pathname}`;
    return await request(opOptions);
  }

  public async invoke(resource: string, method: string, content: any): Promise<any> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.uri = `${this.basePath}/${resource}`;
    opOptions.method = method;
    if (content !== null) {
      opOptions.body = content;
    }

    opOptions.json = true;
    return await request(opOptions);
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

  public async update(aarFile): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "PUT";
    opOptions.uri += "?status=started";
    opOptions.body = aarFile;
    opOptions.headers = {
      "Content-Type": "application/zip",
    };
    await this.stop();
    const json = JSON.parse(await request(opOptions));
    this.basePath = json.apiUrl;
    this.documentation = json.documentation;
  }

  public async delete(): Promise<void> {
    let opOptions = {} as request.OptionsWithUri;
    opOptions = extend(opOptions, this.options);
    opOptions.method = "DELETE";
    await request(opOptions);
  }
}
