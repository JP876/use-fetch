import { NetworkError } from './errorInstances';

const triggerNetworkRequest = async (url, options, signal) => {
    try {
        return await fetch(url, { ...options, signal });
    } catch (err) {
        throw new NetworkError(err?.message, url);
    }
};

export default triggerNetworkRequest;
