const handleFetch = async ({
    i,
    currentFunc,
    signal,
    setResponse,
    setIsLoading,
    optionsArr,
}) => {
    let options = currentFunc?.options;
    let { url } = currentFunc;

    if (!currentFunc.options) {
        options = {};
    }

    return fetch(url, { ...options, signal })
        .then((res) => Promise.all([res.text(), res]))
        .then(([text, res]) => {
            try {
                let data = JSON.parse(text);

                if (!res.ok) {
                    return Promise.reject(data);
                }
                setResponse((prevState) => ({
                    ...prevState,
                    [currentFunc?.id || i]: data,
                }));

                if (optionsArr.length - 1 === i) {
                    setIsLoading(false);
                }

                return Promise.resolve({ data, res });
            } catch (err) {
                //'Received text';
                if (!res.ok) {
                    return Promise.reject(data);
                }
                return Promise.resolve({ data: text, res });
            }
        });
};

export default handleFetch;
