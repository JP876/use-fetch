import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFetchContext } from '../fetchContetxt/useFetchContext';
import { APIError, AbortError, NetworkError } from './errorInstances';
import useHandleReduce from './useHandleReduce';
import consts from './consts';

const useFetch = (fetchOptions = consts.defaultFetchOptions) => {
    const [info, setInfo] = useState(consts.initialInfo);

    const infoRef = useRef(consts.initialRefInfo);
    const justUnMounted = useRef(false);

    const [, { setIsOnline }] = useFetchContext();

    const handleResetError = useCallback(() => {
        setInfo((prevInfo) => ({ ...prevInfo, error: consts.initialInfo.error }));
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
                setInfo(consts.initialInfo);
                return;
            }

            let error = { error: false, msg: null, ...err, err };

            if (err instanceof NetworkError) {
                setIsOnline(false);
                error = { error: true, msg: null, ...err, err };
            } else if (err instanceof APIError) {
                error = { error: true, msg: null, ...err, err };
            } else if (!(err instanceof AbortError)) {
                console.error(err);
            }

            if (!justUnMounted.current) {
                resetInfoRef();
                setInfo({ ...consts.initialInfo, error });
            }

            if (fetchOptions?.catchHandlerPassed) return Promise.reject(error);
        },
        [fetchOptions?.catchHandlerPassed, resetInfoRef, setIsOnline]
    );

    const handleReduce = useHandleReduce(infoRef, updateResponseRef);

    const doFetch = useCallback(
        (options) => {
            if (consts.isArrayValid(options)) {
                const controller = new AbortController();
                infoRef.current = { options, response: {}, controller, numOfCalls: 0 };

                setInfo({ ...consts.initialInfo, isLoading: true });

                return handleReduce(options)
                    .then(() => {
                        const response = { ...infoRef.current.response };

                        if (!justUnMounted.current) {
                            setInfo({ ...consts.initialInfo, response });
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
