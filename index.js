import { useCallback, useEffect, useState } from 'react';

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
                    if (currentFunc?.url) {
                        let options = currentFunc?.options;
                        let { url } = currentFunc;

                        if (!currentFunc.options) {
                            options = {};
                        }

                        return fetch(url, { ...options, signal: controller.signal })
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
                        currentFunc.func(data);
                        return Promise.resolve(data);
                    }
                });
            }, Promise.resolve())
            .catch(err => {
                console.log(err);
                setResponse(false);
                setError({ error: true, msg: err });
            })
            .finally(() => {
                setIsLoading(false);
            });

        return () => {
            controller.abort();
        };
    }, [isLoading, options]);

    return { response, error, isLoading, doFetch };
};

export default useFetch;
