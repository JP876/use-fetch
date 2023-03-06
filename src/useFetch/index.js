import { useCallback, useEffect, useState } from 'react';
import { useFetchContext } from '../fetchContetxt/useFetchContext';
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
                    return promiseChain.then((data) => {
                        if (currentFunc?.url) {
                            const fetchInfo = { currentFunc, signal };
                            const dispatchInfo = { setResponse };

                            return handleFetch({ ...fetchInfo, ...dispatchInfo });
                        } else if (typeof currentFunc?.func === 'function') {
                            if (data && Object.keys(data).length !== 0) {
                                currentFunc.func(data?.data, data?.res);
                            } else {
                                currentFunc.func();
                            }

                            return Promise.resolve(data);
                        } else {
                            return Promise.resolve(data);
                        }
                    });
                }, Promise.resolve())
                .catch((err) => {
                    setResponse(false);

                    if (err instanceof TypeError) {
                        setIsOnline(false);
                    }

                    setError({ error: true, msg: err });
                })
                .finally(() => setIsLoading(false));
        },
        [setIsOnline]
    );

    const doFetch = useCallback((options) => {
        //if (checkIsOnline && !isOnline && !checkConnnection) return;

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
