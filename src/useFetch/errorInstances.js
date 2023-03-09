class APIError extends Error {
    constructor(data, response, ...params) {
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }

        this.name = 'APIError';
        this.response = response;
        this.msg = data;
    }
}

class NetworkError extends Error {
    constructor(msg, url, ...params) {
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NetworkError);
        }

        this.name = 'NetworkError';
        this.message = msg;
        this.requestUrl = url;
    }
}

export { APIError, NetworkError };
