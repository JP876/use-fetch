import parseNetworkData from './parseNetworkData';
import triggerNetworkRequest from './triggerNetworkRequest';

const handleFetch = async (info) => {
    if (!info) {
        console.error(`Info not found: ${info}`);
        return;
    }

    const { currentFunc, signal, updateResponseRef, handleFinish } = info;
    let options = currentFunc?.options;
    let { url } = currentFunc;

    if (!currentFunc.options) {
        options = {};
    }

    const response = await triggerNetworkRequest(url, options, signal);
    const data = await parseNetworkData(response);

    if (typeof updateResponseRef === 'function') updateResponseRef(data);
    if (typeof handleFinish === 'function') handleFinish();

    return Promise.resolve({ data, res: response });
};

export default handleFetch;
