import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFetchOptions } from '../fetchContetxt/useFetchContext';
import { APIError, AbortError, NetworkError } from './errorInstances';
import useHandleReduce from './useHandleReduce';
import consts from './consts';

const { defaultFetchOptions, initialInfo, initialRefInfo, isArrayValid } = consts;

const useFetch = (fetchOptions = defaultFetchOptions) => {
    const [info, setInfo] = useState(initialInfo);

    const infoRef = useRef(initialRefInfo);
    const justUnMounted = useRef(false);

    const isOnlineDispatch = useFetchOptions();

    const handleResetError = useCallback(() => {
        setInfo((prevInfo) => ({ ...prevInfo, error: initialInfo.error }));
    }, []);

    const resetInfoRef = useCallback(() => {
        infoRef.current = { response: {}, controller: null, numOfCalls: 0 };
    }, []);

    const updateResponseRef = useCallback((id, res) => {
        infoRef.current.response = { ...infoRef.current.response, [id]: res };
    }, []);

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
            };

            if (
                err instanceof NetworkError &&
                typeof isOnlineDispatch?.handleConfirmIsOnline === 'function'
            ) {
                isOnlineDispatch?.handleConfirmIsOnline(err);
                error = { error: true, msg: null, ...err, errInstance: err };
            } else if (err instanceof APIError) {
                error = { error: true, msg: null, ...err, errInstance: err };
            } else if (!(err instanceof AbortError)) {
                console.error(err);
            }

            if (!justUnMounted.current) {
                resetInfoRef();
                setInfo({ ...initialInfo, error });
            }

            if (fetchOptions?.hasAdditionalCatchMethod) return Promise.reject(error);
        },
        [fetchOptions?.hasAdditionalCatchMethod, resetInfoRef, isOnlineDispatch]
    );

    const handleReduce = useHandleReduce(infoRef, updateResponseRef);

    const doFetch = useCallback(
        (options) => {
            if (isArrayValid(options)) {
                const controller = new AbortController();
                infoRef.current = { response: {}, controller, numOfCalls: 0 };

                setInfo({ ...initialInfo, isLoading: true });

                return handleReduce(options)
                    .then(() => {
                        const response = { ...infoRef.current.response };

                        if (!justUnMounted.current) {
                            setInfo({ ...initialInfo, response });
                            resetInfoRef();
                        }

                        return Promise.resolve({ data: response });
                    })
                    .catch(handleCatch);
            }
        },
        [handleCatch, handleReduce, resetInfoRef]
    );

    useEffect(() => {
        return () => {
            if (typeof infoRef.current.controller?.abort === 'function') {
                if (fetchOptions?.abortOnUnmount) infoRef.current.controller.abort();
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
