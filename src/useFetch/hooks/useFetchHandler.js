import { useCallback } from 'react';

import useTriggerNetworkRequest from './useTriggerNetworkRequest';
import useParseNetworkData from './useParseNetworkData';

const useFetchHandler = () => {
    const triggerNetworkRequest = useTriggerNetworkRequest();
    const parseNetworkData = useParseNetworkData();

    const handleFetch = useCallback(
        async (info) => {
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
        },
        [parseNetworkData, triggerNetworkRequest]
    );

    return handleFetch;
};

export default useFetchHandler;
