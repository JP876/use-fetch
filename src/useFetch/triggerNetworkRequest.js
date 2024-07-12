import { AbortError, NetworkError } from './errorInstances';

const triggerNetworkRequest = async (url, options = {}) => {
    try {
        return await fetch(url, options);
    } catch (err) {
        if (
            err instanceof DOMException &&
            (err?.name === 'AbortError' || err?.name === 'ABORT_ERR')
        ) {
            throw new AbortError(err?.message, url);
        } else {
            throw new NetworkError(err?.message, url);
        }
    }
};

export default triggerNetworkRequest;
