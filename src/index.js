import { FetchProvider, useFetchContext } from './fetchContetxt/useFetchContext';
import useFetch from './useFetch';
import consts from './useFetch/consts';
import triggerNetworkRequest from './useFetch/triggerNetworkRequest';
import { APIError, AbortError, NetworkError } from './useFetch/errorInstances';

const defaultFetchOptions = consts.defaultFetchOptions;

export {
    useFetch as default,
    FetchProvider,
    useFetchContext,
    defaultFetchOptions,
    triggerNetworkRequest,
    APIError,
    AbortError,
    NetworkError,
};
