import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useFetchContext } from '../fetchContetxt/useFetchContext';
import { APIError, NetworkError } from './errorInstances';
import handleFetch from './handleFetch';
import triggerNetworkRequest from './triggerNetworkRequest';
import parseNetworkData from './parseNetworkData';

const isArrayEmpty = (arr) => Array.isArray(arr) && arr.length === 0;
const typeOptions = ['all', 'allSettled'];
const initialInfo = {
    response: {},
    isLoading: false,
    error: { error: false, msg: null },
};
const initialRefInfo = {
    response: {},
    options: null,
    controller: null,
};

const useFetch = () => {
    const [, { setIsOnline }] = useFetchContext();

    const [info, setInfo] = useState(initialInfo);
    const infoRef = useRef(initialRefInfo);

    const resetInfoRef = useCallback(() => {
        infoRef.current = { response: {}, options: null, controller: null };
    }, []);

    const handleCatch = useCallback(
        (err) => {
            if (!err) {
                console.warn(`Error object not found: ${err}`);
                setInfo(initialInfo);
                return;
            }

            let error = { error: false, msg: null };

            if (err instanceof NetworkError) {
                setIsOnline(false);
                error = { error: true, msg: null, ...err };
            } else if (err instanceof APIError) {
                error = { error: true, msg: null, ...err };
            } else {
                console.error(err);
            }

            // resetInfoRef();
            setInfo({ ...initialInfo, error });
        },
        [resetInfoRef]
    );

    const handleFinish = useCallback(
        (index) => {
            if (typeof index !== 'number') {
                console.warn(`Index not found: ${index}`);
                return;
            }

            if (infoRef.current.options.length - 1 !== index) return;

            setInfo({ ...initialInfo, response: infoRef.current.response });
            // resetInfoRef();
        },
        [resetInfoRef]
    );

    const updateResponseRef = useCallback((res, id) => {
        infoRef.current.response = { ...infoRef.current.response, [id]: res };
    }, []);

    const handleStaticMethods = useCallback((currentFunc, signal, id, i) => {
        return Promise[currentFunc.type](
            currentFunc.reqs.map((el) =>
                triggerNetworkRequest(el?.url, el?.options, signal)
            )
        ).then(async (results) => {
            const data = await Promise.all(
                results.map((el) => parseNetworkData(el?.value || el, currentFunc.type))
            );
            updateResponseRef(data, id);
            handleFinish(i);
            return Promise.resolve({ data, results });
        });
    }, []);

    const handleReduce = useCallback(() => {
        if (isArrayEmpty(infoRef.current.options)) {
            console.warn(`Passed options are: ${infoRef.current.options}`);
            return;
        }

        const controller = infoRef.current.controller;
        const signal = controller?.signal;

        return infoRef.current.options
            .reduce((promiseChain, currentFunc, i) => {
                const id = currentFunc?.id || i;

                return promiseChain.then((data) => {
                    if (
                        Array.isArray(currentFunc?.reqs) &&
                        currentFunc?.reqs.filter((el) => !el?.url).length === 0
                    ) {
                        if (!typeOptions.includes(currentFunc?.type)) {
                            const types = typeOptions.join(', ');
                            console.warn(
                                `Supported promise static methods are: ${types}`
                            );
                            return Promise.resolve(data);
                        }
                        return handleStaticMethods(currentFunc, signal, id, i);
                    } else if (currentFunc?.url) {
                        return handleFetch({
                            currentFunc,
                            signal,
                            updateResponseRef: (data) => updateResponseRef(data, id),
                            handleFinish: () => handleFinish(i),
                        });
                    } else if (typeof currentFunc?.func === 'function') {
                        handleFinish(i);

                        if (data && Object.keys(data).length !== 0) {
                            currentFunc.func(data?.data, data?.res, controller);
                        } else {
                            currentFunc.func();
                        }

                        return Promise.resolve(data);
                    } else {
                        handleFinish(i);
                        return Promise.resolve(data);
                    }
                });
            }, Promise.resolve())
            .catch(handleCatch);
    }, [setIsOnline, handleFinish, handleCatch, updateResponseRef, handleStaticMethods]);

    const doFetch = useCallback(
        (options) => {
            if (!isArrayEmpty(options)) {
                resetInfoRef();
                infoRef.current.options = options;
                setInfo({ ...initialInfo, isLoading: true });
            }
        },
        [handleReduce, resetInfoRef]
    );

    useEffect(() => {
        if (!info?.isLoading) return;

        const controller = new AbortController();
        infoRef.current.controller = controller;

        handleReduce();

        return () => {
            if (typeof controller?.abort === 'function') {
                controller.abort();
            }
        };
    }, [info?.isLoading, handleReduce]);

    return useMemo(() => ({ ...info, doFetch }), [info, doFetch]);
};

export default useFetch;
