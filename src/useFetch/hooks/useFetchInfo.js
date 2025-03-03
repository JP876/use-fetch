import { useEffect, useState } from 'react';
import consts from '../consts';

const useFetchInfo = (id) => {
    const [info, setInfo] = useState(consts.initialInfo);

    useEffect(() => {
        if (typeof id === 'string' || id instanceof String) {
            const controller = new AbortController();

            document.addEventListener(
                `get_fetch_info-${id}`,
                (e) => {
                    if (e?.detail) setInfo(e.detail);
                },
                { signal: controller.signal }
            );

            return () => {
                controller.abort();
            };
        }
    }, [id]);

    return { ...info };
};

export default useFetchInfo;
