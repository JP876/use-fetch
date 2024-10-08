import { useCallback } from 'react';

import { useFetchOptions } from '../../fetchContetxt/useFetchContext';
import { AbortError, NetworkError } from '../errorInstances';
import consts from '../consts';

const useCatchErrorInstance = () => {
    const { providerOptions } = useFetchOptions();

    const handleCatch = useCallback(
        (err, ...rest) => {
            let abortErrorNames = providerOptions?.abortErrorNames;
            let networkErrorMessages = providerOptions?.networkErrorMessages;
            console.log(err);

            if (!Array.isArray(abortErrorNames)) {
                abortErrorNames = consts.defaultAbortErrorNames;
            }
            if (!Array.isArray(networkErrorMessages)) {
                networkErrorMessages = consts.defaultNetworkErrorMessages;
            }

            if (err instanceof DOMException && abortErrorNames.includes(err?.name)) {
                throw new AbortError(err?.message, ...rest);
            } else if (networkErrorMessages.includes(err?.message)) {
                throw new NetworkError(err?.message, ...rest);
            }
            throw err;
        },
        [providerOptions?.abortErrorNames, providerOptions?.networkErrorMessages]
    );

    return handleCatch;
};

export default useCatchErrorInstance;
