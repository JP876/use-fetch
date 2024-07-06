import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFetchContext } from '../fetchContetxt/useFetchContext';
import { APIError, NetworkError } from './errorInstances';
import handleFetch from './handleFetch';
import triggerNetworkRequest from './triggerNetworkRequest';
import parseNetworkData from './parseNetworkData';
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
        infoRef.current = { response: {}, options: null, controller: null, numOfCalls: 0 };
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

            let error = { error: false, msg: null };

            if (err instanceof NetworkError) {
                setIsOnline(false);
                error = { error: true, msg: null, ...err };
            } else if (err instanceof APIError) {
                error = { error: true, msg: null, ...err };
            } else if (err.message !== 'AbortError') {
                console.error(err);
            }

            if (err.message !== 'AbortError' && !justUnMounted.current) {
                resetInfoRef();
                setInfo({ ...consts.initialInfo, error });
            }
        },
        [resetInfoRef, setIsOnline]
    );

    const handleStaticMethods = useCallback(
        (currentFunc, signal, id) => {
            return Promise[currentFunc.type](
                currentFunc.reqs.map((el) => triggerNetworkRequest(el?.url, el?.options, signal))
            ).then(async (results) => {
                const data = await Promise.all(
                    results.map((el) => parseNetworkData(el?.value || el, currentFunc.type))
                );

                updateResponseRef(id, data);
                return Promise.resolve({ data, res: results });
            });
        },
        [updateResponseRef]
    );

    const handleReduce = useCallback(
        (options, value) => {
            let fetchOptions = options;
            if (!Array.isArray(options)) fetchOptions = infoRef.current.options;

            if (!consts.isArrayValid(fetchOptions)) {
                console.warn(`Passed options are: ${fetchOptions}`);
                return;
            }

            infoRef.current.numOfCalls = ++infoRef.current.numOfCalls;

            const controller = infoRef.current.controller;
            const signal = controller?.signal;

            return fetchOptions.reduce((promiseChain, currentFunc, i) => {
                let index = i;
                if (value) index = value + i;

                const id = currentFunc?.id || index;

                return promiseChain.then((data) => {
                    if (
                        Array.isArray(currentFunc?.reqs) &&
                        currentFunc?.reqs.filter((el) => !el?.url).length === 0
                    ) {
                        let type = 'allSettled';
                        if (consts.typeOptions.includes(currentFunc?.type)) {
                            type = currentFunc.type;
                        }

                        return handleStaticMethods({ ...currentFunc, type }, signal, id);
                    } else if (currentFunc?.url) {
                        return handleFetch({
                            signal,
                            currentFunc,
                            updateResponseRef: (data) => updateResponseRef(id, data),
                        });
                    } else if (typeof currentFunc?.func === 'function') {
                        if (data && Object.keys(data).length !== 0) {
                            const result = currentFunc.func(data?.data, data?.res, controller);

                            if (consts.isArrayValid(result)) {
                                return handleReduce(result, `${infoRef.current.numOfCalls}_`);
                            }

                            if (typeof result?.then === 'function') {
                                return result.then((value) => {
                                    return Promise.resolve({ ...data, value });
                                });
                            }
                        } else {
                            currentFunc.func();
                        }

                        return Promise.resolve(data);
                    }

                    return Promise.resolve(data);
                });
            }, Promise.resolve());
        },
        [updateResponseRef, handleStaticMethods]
    );

    const doFetch = useCallback(
        (options) => {
            if (consts.isArrayValid(options)) {
                const controller = new AbortController();
                infoRef.current = { options, response: {}, controller, numOfCalls: 0 };

                setInfo({ ...consts.initialInfo, isLoading: true });

                return handleReduce()
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
