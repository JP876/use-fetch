const isArrayValid = (arr) => {
    return Array.isArray(arr) && arr.length !== 0;
};

// TODO
const checkFetchSchema = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
};

const typeOptions = ['all', 'allSettled'];
// TODO: mode: fetch | XMLHttpRequest
const defaultFetchOptions = { abortOnUnmount: true, hasAdditionalCatchMethod: false };
const defaultFetchProviderOptions = { confirmIsOnline: null, logErrors: true };

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
    controller: null,
    numOfCalls: 0,
};

const networkErrorMessages = [
    'TypeError: Failed to fetch', // Chrome
    'Failed to fetch', // Chrome, Edge
    'NetworkError when attempting to fetch resource.', // Firefox
    'Load failed', // iOS Safari,
];

const abortErrorNames = ['AbortError', 'ABORT_ERR'];

const consts = {
    isArrayValid,
    checkFetchSchema,
    defaultFetchOptions,
    defaultFetchProviderOptions,
    typeOptions,
    initialInfo,
    initialRefInfo,
    networkErrorMessages,
    abortErrorNames,
};

export default consts;
