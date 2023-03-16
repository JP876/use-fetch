import { useCallback, useEffect, useState } from 'react';
import { useFetchContext } from '../fetchContetxt/useFetchContext';
import { APIError, NetworkError } from './errorInstances';
import handleFetch from './handleFetch';

const isArrayEmpty = (arr) => Array.isArray(arr) && arr.length === 0;

const useFetch = () => {
    const [response, setResponse] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ error: false, msg: null });

    const [options, setOptions] = useState({});
    const [, { setIsOnline }] = useFetchContext();

    const handleReduce = useCallback(
        (optionsArr, signal) => {
            return optionsArr
                .reduce((promiseChain, currentFunc, i) => {
                    const handleLoading = () => {
                        if (optionsArr.length - 1 === i) {
                            setIsLoading(false);
                        }
                    };

                    return promiseChain.then((data) => {
                        if (currentFunc?.url) {
                            return handleFetch({
                                currentFunc,
                                signal,
                                setResponse,
                                handleLoading,
                            });
                        } else if (typeof currentFunc?.func === 'function') {
                            handleLoading();

                            if (data && Object.keys(data).length !== 0) {
                                currentFunc.func(data?.data, data?.res);
                            } else {
                                currentFunc.func();
                            }

                            return Promise.resolve(data);
                        } else {
                            handleLoading();
                            return Promise.resolve(data);
                        }
                    });
                }, Promise.resolve())
                .catch((err) => {
                    setResponse(false);

                    if (err instanceof NetworkError) {
                        setIsOnline(false);
                        setError({ error: true, ...err });
                    } else if (err instanceof APIError) {
                        setError({ error: true, ...err });
                    } else if (
                        !(
                            err instanceof DOMException &&
                            (err?.name === 'AbortError' || err?.name === 'ABORT_ERR')
                        )
                    ) {
                        console.error(err);
                    }

                    setIsLoading(false);
                });
        },
        [setIsOnline]
    );

    const doFetch = useCallback((options) => {
        if (!isArrayEmpty(options)) {
            setOptions(options);
            setIsLoading(true);
            setError({ error: false, msg: null });
            setResponse({});
        }
    }, []);

    useEffect(() => {
        if (!isLoading) return;

        let controller = new AbortController();

        handleReduce(options, controller.signal);

        return () => controller.abort();
    }, [isLoading, options, handleReduce]);

    return { response, error, isLoading, doFetch };
};

export default useFetch;
