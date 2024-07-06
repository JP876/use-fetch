const isArrayValid = (arr) => {
    return Array.isArray(arr) && arr.length !== 0;
};

// TODO
const checkFetchSchema = (arr) => {
    if (!Array.isArray(arr) || arr.length === 0) return false;
};

const typeOptions = ['all', 'allSettled'];
// TODO: mode: fetch | XMLHttpRequest
const defaultFetchOptions = { abortOnUnmount: true };

const initialInfo = {
    response: {},
    isLoading: false,
    error: { error: false, msg: null },
};

const initialRefInfo = {
    response: {},
    options: null,
    controller: null,
    numOfCalls: 0,
};

const consts = {
    isArrayValid,
    checkFetchSchema,
    defaultFetchOptions,
    typeOptions,
    initialInfo,
    initialRefInfo,
};

export default consts;
