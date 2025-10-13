import {
    FetchProvider,
    useFetchStatusState,
    useFetchDispatch,
    useInitialFetchOptions,
} from './fetchContetxt/useFetchContext';
import useFetch from './useFetch';
import useTriggerNetworkRequest from './useFetch/hooks/useTriggerNetworkRequest';
import useFetchInfo from './useFetch/hooks/useFetchInfo';
import consts from './useFetch/consts';
import { APIError, AbortError, NetworkError } from './useFetch/errorInstances';

const { defaultFetchOptions, defaultAbortErrorNames, defaultNetworkErrorMessages } = consts;

export {
    useFetch as default,
    FetchProvider,
    useFetchStatusState,
    useFetchDispatch,
    useInitialFetchOptions,
    useTriggerNetworkRequest,
    useFetchInfo,
    defaultFetchOptions,
    defaultAbortErrorNames,
    defaultNetworkErrorMessages,
    APIError,
    AbortError,
    NetworkError,
};
