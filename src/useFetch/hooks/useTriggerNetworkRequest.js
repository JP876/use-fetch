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
                const initialOptions = optionsRef.current || {};
                const finalOptions = { ...(options || {}) };

                if (initialOptions && Object.keys(initialOptions)?.length !== 0) {
                    const updateFinalOptions = (opt) => {
                        for (const key of Object.keys(opt)) {
                            if (opt?.[key] && typeof opt?.[key] === 'string') {
                                if (!finalOptions?.[key]) {
                                    finalOptions[key] = opt[key];
                                }
                            } else {
                                finalOptions[key] = {
                                    ...(opt?.[key] || {}),
                                    ...(options?.[key] || {}),
                                };
                            }
                        }
                    };
                    updateFinalOptions(initialOptions);
                }

                return await fetch(url, finalOptions);
            } catch (err) {
                return handleCatch(err, url);
            }
        },
        [handleCatch]
    );

    return triggerNetworkRequest;
};

export default useTriggerNetworkRequest;
