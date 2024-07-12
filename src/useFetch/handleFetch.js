import parseNetworkData from './parseNetworkData';
import triggerNetworkRequest from './triggerNetworkRequest';

const handleFetch = async (info) => {
    if (!info) {
        console.error(`Info not found: ${info}`);
        return;
    }

    const { currentFunc, signal, updateResponse } = info;
    let options = currentFunc?.options || {};
    let { url } = currentFunc;

    const response = await triggerNetworkRequest(url, { ...options, signal });
    const data = await parseNetworkData(response);

    if (typeof updateResponse === 'function') updateResponse(data);

    return Promise.resolve({ data, res: response });
};

export default handleFetch;
