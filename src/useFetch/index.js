import { useCallback, useEffect, useState } from 'react';
import { useFetchContext } from '../fetchContetxt/useFetchContext';
import handleFetch from './handleFetch';

const isArrayEmpty = (arr) => Array.isArray(arr) && arr.length === 0;

const useFetch = () => {
    const [response, setResponse] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ error: false, msg: null });

    const [options, setOptions] = useState({});

    const [_, { setIsOnline }] = useFetchContext();

    const handleReduce = useCallback(
        (optionsArr, signal) => {
            return optionsArr
                .reduce((promiseChain, currentFunc, i) => {
                    return promiseChain.then((data) => {
                        if (currentFunc?.url) {
                            const fetchInfo = { currentFunc, signal, optionsArr, i };
                            const dispatchInfo = { setResponse, setIsLoading };

                            return handleFetch({ ...fetchInfo, ...dispatchInfo });
                        } else if (typeof currentFunc?.func === 'function') {
                            if (optionsArr.length - 1 === i) {
                                setIsLoading(false);
                            }

                            if (data && Object.keys(data).length !== 0) {
                                currentFunc.func(data?.data, data?.res);
                            } else {
                                currentFunc.func();
                            }

                            return Promise.resolve(data);
                        } else {
                            if (optionsArr.length - 1 === i) {
                                setIsLoading(false);
                            }

                            return Promise.resolve(data);
                        }
                    });
                }, Promise.resolve())
                .catch((err) => {
                    if (err instanceof TypeError) {
                        setIsOnline(false);
                    }

                    setIsLoading(false);
                    setResponse(false);
                    setError({ error: true, msg: err });
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
