import { APIError } from './errorInstances';

const parseNetworkData = async (res, type) => {
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

        return data;
    } catch (err) {
        if (err instanceof APIError) {
            throw new APIError(err?.msg, res);
        } else if (type !== 'allSettled' && !res.ok) {
            throw new APIError(text, res);
        }

        return text;
    }
};

export default parseNetworkData;
