import { useCallback, useEffect, useState } from 'react';

const isArrayEmpty = arr => Array.isArray(arr) && arr.length === 0;

const useFetch = () => {
    const [response, setResponse] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ error: false, msg: null });
    const [options, setOptions] = useState({});

    const handleReduce = useCallback((optionsArr, signal) => {
        return optionsArr
            .reduce((promiseChain, currentFunc, i) => {
                return promiseChain.then(data => {
                    if (currentFunc?.url) {
                        let options = currentFunc?.options;
                        let { url } = currentFunc;

                        if (!currentFunc.options) {
                            options = {};
                        }

                        return fetch(url, { ...options, signal })
                            .then(res => Promise.all([res.text(), res]))
                            .then(([text, res]) => {
                                try {
                                    let data = JSON.parse(text);
                                    if (!res.ok) {
                                        return Promise.reject(data);
                                    }
                                    setResponse(prevState => ({
                                        ...prevState,
                                        [currentFunc?.id || i]: data,
                                    }));
                                    return Promise.resolve(data);
                                } catch (err) {
                                    //console.log('Received text');
                                    if (!res.ok) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                }
                            });
                    } else if (typeof currentFunc?.func === 'function') {
                        const additionalOptions = currentFunc.func(data);

                        if (!additionalOptions) {
                            return Promise.resolve();
                        } else if (!isArrayEmpty(additionalOptions)) {
                            handleReduce(additionalOptions, signal);
                        }
                    }
                });
            }, Promise.resolve())
            .catch(err => {
                console.log(err);
                setResponse(false);
                setError({ error: true, msg: err });
            });
    }, []);

    const doFetch = useCallback(options => {
        if (!isArrayEmpty(options)) {
            setOptions(options);
            setIsLoading(true);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) return;

        let controller = new AbortController();

        handleReduce(options, controller.signal).finally(() => setIsLoading(false));

        return () => controller.abort();
    }, [isLoading, options, handleReduce]);

    return { response, error, isLoading, doFetch };
};

export default useFetch;
