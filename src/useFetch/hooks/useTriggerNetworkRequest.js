import { useCallback } from 'react';

import useCatchErrorInstance from './useCatchErrorInstance';

const useTriggerNetworkRequest = () => {
    const handleCatch = useCatchErrorInstance();

    const triggerNetworkRequest = useCallback(
        async (url, options = {}) => {
            try {
                return await fetch(url, options);
            } catch (err) {
                return handleCatch(err, url);
            }
        },
        [handleCatch]
    );

    return triggerNetworkRequest;
};

export default useTriggerNetworkRequest;
