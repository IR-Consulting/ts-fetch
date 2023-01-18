interface IBaseResponse {
    statusCode?: number;
}
interface ISuccessResponse<T> extends IBaseResponse {
    data: T;
    headers?: Record<string, string>;
    status: "OK";
}
interface IErrorResponse<E> extends IBaseResponse {
    errorData: E;
    status: "ERROR";
}
interface INetworkErrorResponse extends IBaseResponse {
    networkError: NetworkError;
    status: "NETWORK_ERROR";
}
export declare type TResponse<T, E> = ISuccessResponse<T> | IErrorResponse<E> | INetworkErrorResponse;
export declare type NetworkError = "TIMEOUT" | "JSON_PARSING" | "OTHER";
export declare type HttpType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";
export interface IExtraHeader {
    key: string;
    value: string;
}
export interface IRequestBasicParams<Body> {
    body?: Body;
    extraHeaders?: IExtraHeader[];
    method?: HttpType;
    jsonRequest?: boolean;
    jsonResponse?: boolean;
    timeout?: number;
    url: string;
}
export interface IValidStatusCode {
    validStatusCodes?: number[];
    validStatusCodeStart?: number;
    validStatusCodeEnd?: number;
}
export declare type IRequestParams<B> = IRequestBasicParams<B> & IValidStatusCode;
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
export declare function request<Return, Error, Body>(requestParams: IRequestParams<Body>): Promise<TResponse<Return, Error>>;
export {};
