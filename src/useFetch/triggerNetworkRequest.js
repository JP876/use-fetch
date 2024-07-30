import { AbortError, NetworkError } from './errorInstances';
import consts from './consts';

const { abortErrorNames, networkErrorMessages } = consts;

const triggerNetworkRequest = async (url, options = {}) => {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (err instanceof DOMException && abortErrorNames.includes(err?.name)) {
            throw new AbortError(err?.message, url);
        } else if (networkErrorMessages.includes(err?.message)) {
            throw new NetworkError(err?.message, url);
        }

        throw err;
    }
};

export default triggerNetworkRequest;
