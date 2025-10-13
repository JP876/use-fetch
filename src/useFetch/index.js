import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFetchOptions } from '../fetchContetxt/useFetchContext';
import { APIError, AbortError, NetworkError } from './errorInstances';
import useHandleReduce from './hooks/useHandleReduce';
import consts from './consts';

const { defaultFetchOptions, initialInfo, initialRefInfo, isArrayValid } = consts;

const useFetch = (fetchOptions = defaultFetchOptions) => {
    const [info, setInfo] = useState(initialInfo);

    const infoRef = useRef(initialRefInfo);
    const justUnMounted = useRef(false);
    const hasFetched = useRef(0);

    const isOnlineDispatch = useFetchOptions();

    const handleResetError = useCallback(() => {
        setInfo((prevInfo) => ({ ...prevInfo, error: initialInfo.error }));
    }, []);

    const resetInfoRef = useCallback(() => {
        infoRef.current = { response: {}, controller: null, numOfCalls: 0, failedRequests: null };
    }, []);

    const updateResponseRef = useCallback((id, res) => {
        infoRef.current.response = { ...infoRef.current.response, [id]: res };
    }, []);
    const updateFailedRequestsRef = useCallback((req) => {
        infoRef.current.failedRequests = [...(infoRef.current.failedRequests || []), { ...req }];
    }, []);

    const handleReduce = useHandleReduce(infoRef, updateResponseRef, updateFailedRequestsRef);

    const handleCatch = useCallback(
        (err) => {
            if (!err) {
                console.warn(`Error object not found: ${err}`);
                setInfo(initialInfo);
                return;
            }

            let error = {
                error: false,
                msg: null,
                ...err,
                errInstance: err,
                isAborted: err instanceof AbortError,
                failedRequests: infoRef.current.failedRequests,
            };
            const response = { ...infoRef.current.response };

            if (
                err instanceof NetworkError &&
                typeof isOnlineDispatch?.handleConfirmIsOnline === 'function'
            ) {
                isOnlineDispatch?.handleConfirmIsOnline(err);
                error = { ...error, error: true };
            } else if (err instanceof APIError) {
                error = { ...error, error: true };
            } else if (!(err instanceof AbortError)) {
                console.error(err);
            }

            if (!justUnMounted.current) {
                resetInfoRef();
                setInfo({ ...initialInfo, error });
            }

            if (fetchOptions?.hasCatchMethod) return Promise.reject(error);
            return Promise.resolve(response);
        },
        [fetchOptions?.hasCatchMethod, resetInfoRef, isOnlineDispatch]
    );

    const doFetch = useCallback(
        async (options) => {
            if (fetchOptions?.fetchOnce && fetchOptions?.ignoreFirst) {
                console.warn(
                    'The fetch options fetchOnce and ignoreFirst cannot both be set to true simultaneously.'
                );
                return new Promise((res) => res());
            }

            if (!isArrayValid(options)) {
                console.warn('The first argument must be an array.');
                return new Promise((res) => res());
            }

            if (fetchOptions?.fetchOnce && hasFetched.current) {
                return new Promise((res) => res());
            }

            if (fetchOptions?.ignoreFirst && !hasFetched.current) {
                hasFetched.current = ++hasFetched.current;
                return new Promise((res) => res());
            }

            const controller = new AbortController();

            infoRef.current = { response: {}, controller, numOfCalls: 0, failedRequests: null };
            hasFetched.current = ++hasFetched.current;

            setInfo({ ...initialInfo, isLoading: true });

            return handleReduce(options)
                .then(() => {
                    const response = { ...infoRef.current.response };

                    if (!justUnMounted.current) {
                        setInfo({ ...initialInfo, response });
                        resetInfoRef();
                    }

                    return Promise.resolve(response);
                })
                .catch(handleCatch);
        },
        [
            fetchOptions?.fetchOnce,
            fetchOptions?.ignoreFirst,
            handleCatch,
            handleReduce,
            resetInfoRef,
        ]
    );

    useEffect(() => {
        if (typeof fetchOptions?.id === 'string' || fetchOptions?.id instanceof String) {
            const event = new CustomEvent(`get_fetch_info-${fetchOptions?.id}`, { detail: info });
            document.dispatchEvent(event);
        }
    }, [fetchOptions?.id, info]);

    useEffect(() => {
        return () => {
            if (typeof infoRef.current.controller?.abort === 'function') {
                if (
                    fetchOptions?.abortOnUnmount === undefined ||
                    fetchOptions?.abortOnUnmount === true
                ) {
                    infoRef.current.controller.abort();
                }
                justUnMounted.current = true;
            }
        };
    }, [fetchOptions?.abortOnUnmount]);

    return useMemo(() => {
        return {
            ...info,
            controller: infoRef.current.controller,
            doFetch,
            handleResetError,
        };
    }, [info, doFetch, handleResetError]);
};

export default useFetch;
