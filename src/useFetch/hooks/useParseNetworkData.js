import { useCallback } from 'react';
import { APIError } from '../errorInstances';

const useParseNetworkData = () => {
    const parseNetworkData = useCallback(async (res, type) => {
        if (!(res instanceof Response)) {
            throw new Error(
                `The first argument passed is not an instance of Response: ${JSON.stringify(res)}`
            );
        }

        const text = await res.text();

        try {
            const data = JSON.parse(text);

            if (type !== 'allSettled' && !res.ok) {
                throw new APIError(data, res);
            }

            return res.ok ? data : null;
        } catch (err) {
            if (err instanceof APIError) {
                throw new APIError(err?.msg, res);
            } else if (type !== 'allSettled' && !res.ok) {
                throw new APIError(text, res);
            }

            return text;
        }
    }, []);

    return parseNetworkData;
};

export default useParseNetworkData;
