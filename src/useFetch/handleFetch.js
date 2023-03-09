import parseNetworkData from './parseNetworkData';
import triggerNetworkRequest from './triggerNetworkRequest';

const handleFetch = async ({ currentFunc, signal, setResponse, handleLoading }) => {
    let options = currentFunc?.options;
    let { url } = currentFunc;

    if (!currentFunc.options) {
        options = {};
    }

    const response = await triggerNetworkRequest(url, options, signal);
    const data = await parseNetworkData(response);

    setResponse((prevState) => ({
        ...prevState,
        [currentFunc?.id || Object.keys(prevState).length]: data,
    }));

    handleLoading();

    return Promise.resolve({ data, res: response });
};

export default handleFetch;
