"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
var tslib_1 = require("tslib");
// The http types that allow a http body
var bodyHttpTypes = [
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
];
var defaultRequestParams = {
    method: "GET",
    jsonRequest: true,
    jsonResponse: true,
    validStatusCodeStart: 200,
    validStatusCodeEnd: 299,
    timeout: 12000, // 12 seconds default timeout
};
/**
 * Sends a standard request, and handles JSON parsing and response mapping to TResponse
 * If the TResponse success is true, it means the request was successful.
 * If the networkError is set it means a network error happened.
 * T is the expected type to be returned on success, Error the expected type on errors
 * Body is the type for the body arguments given
 * @param body Optional body for POST requests
 * @param extraHeaders Optional extra headers to add
 * @param method Http method to use (one of httpType)
 * @param jsonRequest Optional boolean whether this is a boolean request. Defaults to JSON - set this to false to omit json request headers
 * @param jsonResponse Optional boolean whether this is a boolean response. Defaults to JSON - set this to false to omit json response headers
 * @param validStatusCodes Optional array of HTTP status codes to consider success. Default is 200 - 299
 * @param url Full path for request - example: https://github.com/api/test
 * @return IJsonStatus object with the parsed data or error
 */
function request(requestParams) {
    var processedParams = tslib_1.__assign(tslib_1.__assign({}, defaultRequestParams), requestParams);
    var url = processedParams.url, method = processedParams.method, body = processedParams.body, extraHeaders = processedParams.extraHeaders, jsonResponse = processedParams.jsonResponse, jsonRequest = processedParams.jsonRequest, validStatusCodes = processedParams.validStatusCodes, validStatusCodeStart = processedParams.validStatusCodeStart, validStatusCodeEnd = processedParams.validStatusCodeEnd, timeout = processedParams.timeout;
    var statusCode;
    var headers = {};
    if (jsonRequest) {
        // Add default JSON headers
        headers["Content-Type"] = "application/json";
    }
    if (jsonResponse) {
        // Add default JSON headers
        headers["Accept"] = "application/json";
    }
    if (extraHeaders) {
        extraHeaders.forEach(function (h) { return (headers[h.key] = h.value); });
    }
    var params = {
        method: method,
        headers: headers,
    };
    if (body && bodyHttpTypes.includes(method)) {
        if (jsonRequest) {
            params.body = JSON.stringify(body);
        }
        else {
            params.body = body;
        }
    }
    var responseHeaders = {};
    return Promise.race([
        fetch(url, params),
        // The promise below will never resolve
        new Promise(function (_, reject) {
            return setTimeout(function () {
                statusCode = 408; // Timeout status code
                var err = "TIMEOUT";
                reject(err);
            }, timeout);
        }),
    ])
        .then(function (res) {
        // response will always be type 'Response'
        var response = res;
        response.headers.forEach(function (value, key) { return responseHeaders[key] = value; });
        statusCode = response.status;
        switch (headers["Accept"]) {
            case "application/octet-stream":
                return response.blob();
            case "application/json":
                return response.json();
            case "multipart/form-data":
                return response.formData();
            default:
                return response.text();
        }
    })
        .then(function (data) {
        // Allow expecting something other than 200s
        var validStatusCode = isValidStatusCode(statusCode, {
            validStatusCodes: validStatusCodes,
            validStatusCodeStart: validStatusCodeStart,
            validStatusCodeEnd: validStatusCodeEnd,
        });
        if (validStatusCode) {
            // Success - type is T
            var response = {
                statusCode: statusCode,
                data: data,
                headers: responseHeaders,
                status: "OK",
            };
            return response;
        }
        else {
            // Error - type is Error
            var response = {
                statusCode: statusCode,
                errorData: data,
                status: "ERROR",
            };
            return response;
        }
    })
        .catch(function (err) {
        // The error is either a timeout ('TIMEOUT'), a network error or a JSON parsing error
        // For now we're only handling the timeout, and calling all others 'OTHER'
        var networkError = err === "TIMEOUT" ? "TIMEOUT" : "OTHER";
        if (err.hasOwnProperty("type") &&
            err.type === "invalid-json") {
            networkError = "JSON_PARSING";
        }
        var response = {
            statusCode: statusCode,
            networkError: networkError,
            status: "NETWORK_ERROR",
        };
        return response;
    });
}
exports.request = request;
var isValidStatusCode = function (statusCode, validation) {
    var validStatusCodes = validation.validStatusCodes, validStatusCodeStart = validation.validStatusCodeStart, validStatusCodeEnd = validation.validStatusCodeEnd;
    if (validStatusCodes) {
        return validStatusCodes.find(function (sc) { return sc === statusCode; }) !== undefined;
    }
    if (validStatusCodeStart && validStatusCodeEnd) {
        return (statusCode >= validStatusCodeStart && statusCode <= validStatusCodeEnd);
    }
    return false;
};
//# sourceMappingURL=api.js.map