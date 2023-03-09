import { APIError } from './errorInstances';

const parseNetworkData = async (res) => {
    const text = await res.text();

    try {
        const data = JSON.parse(text);

        if (!res.ok) {
            throw new APIError(data, res);
        }

        return data;
    } catch (err) {
        if (err instanceof APIError) {
            throw new APIError(err?.msg, res);
        } else if (!res.ok) {
            throw new APIError(text, res);
        }

        return text;
    }
};

export default parseNetworkData;
