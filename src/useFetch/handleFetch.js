const handleFetch = async ({ currentFunc, signal, setResponse }) => {
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
                    [currentFunc?.id || Object.keys(prevState).length]: data,
                }));

                return Promise.resolve({ data, res });
            } catch (err) {
                //'Received text';
                if (!res.ok) {
                    return Promise.reject(text);
                }
                return Promise.resolve({ data: text, res });
            }
        });
};

export default handleFetch;
