import { NetworkError } from './errorInstances';

const triggerNetworkRequest = async (url, options, signal) => {
    try {
        return await fetch(url, { ...options, signal });
    } catch (err) {
        if (
            err instanceof DOMException &&
            (err?.name === 'AbortError' || err?.name === 'ABORT_ERR')
        ) {
            throw new Error('AbortError');
        } else {
            throw new NetworkError(err?.message, url);
        }
    }
};

export default triggerNetworkRequest;
