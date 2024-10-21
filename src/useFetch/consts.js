const isArrayValid = (arr) => {
    return Array.isArray(arr) && arr.length !== 0;
};

// TODO
const checkFetchSchema = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
};

const defaultNetworkErrorMessages = [
    'TypeError: Failed to fetch', // Chrome
    'Failed to fetch', // Chrome, Edge
    'NetworkError when attempting to fetch resource.', // Firefox
    'Load failed', // iOS Safari,
];

const defaultAbortErrorNames = ['AbortError', 'ABORT_ERR'];

const typeOptions = ['all', 'allSettled'];
// TODO: mode: fetch | XMLHttpRequest
const defaultFetchOptions = {
    abortOnUnmount: true,
    hasCatchMethod: false,
    fetchOnce: false,
    ignoreFirst: false,
};
const defaultFetchProviderOptions = {
    networkErrorMessages: defaultNetworkErrorMessages,
    abortErrorNames: defaultAbortErrorNames,
};

const initialInfo = {
    response: {},
    isLoading: false,
    error: {
        error: false,
        msg: null,
        isAborted: false,
        errInstance: null,
        name: null,
        response: null,
    },
};

const initialRefInfo = {
    response: {},
    failedRequests: null,
    controller: null,
    numOfCalls: 0,
};

const consts = {
    isArrayValid,
    checkFetchSchema,
    defaultFetchOptions,
    defaultFetchProviderOptions,
    typeOptions,
    initialInfo,
    initialRefInfo,
    defaultNetworkErrorMessages,
    defaultAbortErrorNames,
};

export default consts;
