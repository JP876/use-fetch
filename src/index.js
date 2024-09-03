import {
    FetchProvider,
    useFetchStatusState,
    useFetchDispatch,
} from './fetchContetxt/useFetchContext';
import useFetch from './useFetch';
import useTriggerNetworkRequest from './useFetch/hooks/useTriggerNetworkRequest';
import consts from './useFetch/consts';
import { APIError, AbortError, NetworkError } from './useFetch/errorInstances';

const { defaultFetchOptions, defaultAbortErrorNames, defaultNetworkErrorMessages } = consts;

export {
    useFetch as default,
    FetchProvider,
    useFetchStatusState,
    useFetchDispatch,
    useTriggerNetworkRequest,
    defaultFetchOptions,
    defaultAbortErrorNames,
    defaultNetworkErrorMessages,
    APIError,
    AbortError,
    NetworkError,
};
