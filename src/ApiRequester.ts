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

export class ApiRequester {
    private apiRequesterUrl: string;
    private options: http.RequestOptions | https.RequestOptions;
    private name: string;
    private version: string;
    private description: string;
    private connection: string;
    private status: string;

    constructor(apiRequsterUrl: string, options: http.RequestOptions | https.RequestOptions, name: string,
                version: string, description: string, connection: string, status: string) {
        this.apiRequesterUrl = apiRequsterUrl;
        this.options = options;
        this.name = name;
        this.version = version;
        this.description = description;
        this.connection = connection;
        this.status = status;
    }

    /**
     * Mark the API Requester as started and available for requests.
     */
    public async start() {
        let opOptions = {};
        let requestOptions = {} as https.RequestOptions;
        requestOptions = extend(requestOptions, this.options);
        requestOptions.method = "PUT";
        const uri = this.apiRequesterUrl + "?status=started";
        requestOptions.headers = {
            "Content-Type": "application/json",
        };
        opOptions = extend(opOptions, requestOptions);
        const response = JSON.parse((await got(uri, opOptions)).body);
        this.status = response.status;
    }

    /**
     * Mark the API Requester as stopped and unavailable for requests.
     */
    public async stop() {
        let opOptions = {};
        let requestOptions = {} as https.RequestOptions;
        requestOptions = extend(requestOptions, this.options);
        requestOptions.method = "PUT";
        const uri = this.apiRequesterUrl + "?status=stopped";
        requestOptions.headers = {
            "Content-Type": "application/json",
        };
        opOptions = extend(opOptions, requestOptions);
        const response = JSON.parse((await got(uri, opOptions)).body);
        this.status = response.status;
    }

    /**
     * Update the API Requester with the new version.
     * @param araFile The ARA file.
     */
    public async update(araFile: Buffer) {
        let opOptions = {};
        let requestOptions = {} as https.RequestOptions;
        requestOptions = extend(requestOptions, this.options);
        requestOptions.method = "PUT";
        const uri = this.apiRequesterUrl + "?status=started";
        // tslint:disable-next-line:no-string-literal
        requestOptions["body"] = araFile;
        requestOptions.headers = {
            "Content-Type": "application/zip",
        };
        opOptions = extend(opOptions, requestOptions);
        await this.stop();
        const json = JSON.parse((await got(uri, opOptions)).body);
        this.version = json.version;
        this.connection = json.connection;
        this.description = json.description;
        this.status = json.status;
    }

    /**
     * Delete the API Requester from the server.
     */
    public async delete() {
        let opOptions = {};
        opOptions = extend(opOptions, this.options);
        await got.delete(this.apiRequesterUrl, opOptions);
    }

    /**
     * @returns The name of the API Requester.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * @returns The description of the API Requester.
     */
    public getDescription(): string {
        return this.description;
    }

    /**
     * @returns The version of the API Requester.
     */
    public getVersion(): string {
        return this.version;
    }

    /**
     * @returns The connection used by the API Requester.
     */
    public getConnection(): string {
        return this.connection;
    }

    /**
     * @returns The status of the API Requester.
     */
    public getStatus(): string {
        return this.status;
    }
}
