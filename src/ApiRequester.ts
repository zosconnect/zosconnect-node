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

export class ApiRequester {
    private options: request.OptionsWithUri;
    private name: string;
    private version: string;
    private description: string;
    private connection: string;

    constructor(options: request.OptionsWithUri, name: string, version: string, description: string,
                connection: string) {
        this.options = options;
        this.name = name;
        this.version = version;
        this.description = description;
        this.connection = connection;
    }

    public async start() {
        let opOptions = {} as request.OptionsWithUri;
        opOptions = extend(opOptions, this.options);
        opOptions.method = "PUT";
        opOptions.uri += "?status=started";
        await request(opOptions);
    }

    public async stop() {
        let opOptions = {} as request.OptionsWithUri;
        opOptions = extend(opOptions, this.options);
        opOptions.method = "PUT";
        opOptions.uri += "?status=stopped";
        await request(opOptions);
    }

    public async update(araFile: Buffer) {
        let opOptions = {} as request.OptionsWithUri;
        opOptions = extend(opOptions, this.options);
        opOptions.method = "PUT";
        opOptions.uri += "?status=started";
        opOptions.body = araFile;
        opOptions.headers = {
            "Content-Type": "application/zip",
        };
        await this.stop();
        const json = JSON.parse(await request(opOptions));
        this.version = json.version;
        this.connection = json.connection;
        this.description = json.description;
    }

    public async delete() {
        let opOptions = {} as request.OptionsWithUri;
        opOptions = extend(opOptions, this.options);
        opOptions.method = "DELETE";
        await request(opOptions);
    }

    public getName(): string {
        return this.name;
    }

    public getDescription(): string {
        return this.description;
    }

    public getVersion(): string {
        return this.version;
    }

    public getConnection(): string {
        return this.connection;
    }
}
