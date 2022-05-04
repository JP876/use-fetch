import { useState, useEffect, useCallback } from 'react';

const useFetch = () => {
    const [response, setResponse] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState({ error: false, msg: null });
    const [options, setOptions] = useState({});

    const doFetch = useCallback(options => {
        if (Array.isArray(options) && options.length !== 0) {
            setOptions(options);
            setIsLoading(true);
        }
    }, []);

    useEffect(() => {
        if (!isLoading) return;

        let controller = new AbortController();

        options
            .reduce((promiseChain, currentFunc, i) => {
                return promiseChain.then(data => {
                    try {
                        let info = [...currentFunc.info, controller.signal];

                        return currentFunc.func
                            .apply(this, info)
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

                                    if (options.length - 1 === i) {
                                        setIsLoading(false);
                                    }
                                    return Promise.resolve(data);
                                } catch (err) {
                                    //console.log('Received text');
                                    if (options.length - 1 === i) {
                                        setIsLoading(false);
                                    }
                                    if (!res.ok) {
                                        return Promise.reject();
                                    }
                                    return Promise.resolve();
                                }
                            });
                    } catch (err) {
                        if (typeof currentFunc.func === 'function') {
                            currentFunc.func(data);
                        }
                        if (options.length - 1 === i) {
                            setIsLoading(false);
                        }
                        return Promise.resolve(data);
                    }
                });
            }, Promise.resolve())
            .catch(err => {
                setResponse(false);
                setError({ error: true, msg: err });
                setIsLoading(false);
            });

        return () => controller.abort();
    }, [isLoading, options]);

    return { response, error, isLoading, doFetch };
};

export default useFetch;
