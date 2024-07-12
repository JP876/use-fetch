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
        this.msg = msg;
        this.response = url;
    }
}

class AbortError extends Error {
    constructor(msg, url, ...params) {
        super(...params);

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AbortError);
        }

        this.name = 'AbortError';
        this.msg = msg;
        this.response = url;
    }
}

export { APIError, NetworkError, AbortError };
