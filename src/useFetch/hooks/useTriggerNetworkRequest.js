import { useCallback, useRef } from 'react';

import useCatchErrorInstance from './useCatchErrorInstance';
import { useInitialFetchOptions } from '../../fetchContetxt/useFetchContext';

const useTriggerNetworkRequest = () => {
    const handleCatch = useCatchErrorInstance();
    const initialFetchOptions = useInitialFetchOptions();

    const optionsRef = useRef(initialFetchOptions || {});
    optionsRef.current = initialFetchOptions || {};

    const triggerNetworkRequest = useCallback(
        async (url, options = {}) => {
            try {
                return await fetch(url, { ...(optionsRef.current || {}), ...(options || {}) });
            } catch (err) {
                return handleCatch(err, url);
            }
        },
        [handleCatch]
    );

    return triggerNetworkRequest;
};

export default useTriggerNetworkRequest;
