import { useCallback } from 'react';

import consts from './consts';
import triggerNetworkRequest from './triggerNetworkRequest';
import parseNetworkData from './parseNetworkData';
import handleFetch from './handleFetch';

const useHandleReduce = (infoRef, updateResponseRef) => {
    const handleStaticMethods = useCallback(
        (currentFunc, signal, id) => {
            return Promise[currentFunc.type](
                currentFunc.reqs.map((el) => triggerNetworkRequest(el?.url, el?.options, signal))
            ).then(async (results) => {
                const data = await Promise.all(
                    results.map((el) => parseNetworkData(el?.value || el, currentFunc.type))
                );

                updateResponseRef(id, data);
                return Promise.resolve({ data, res: results });
            });
        },
        [updateResponseRef]
    );

    const handleReduce = useCallback(
        (options, value) => {
            let fetchOptions = options;
            if (!Array.isArray(options)) fetchOptions = infoRef.current.options;

            if (!consts.isArrayValid(fetchOptions)) {
                console.warn(`Passed options are: ${fetchOptions}`);
                return;
            }

            infoRef.current.numOfCalls = ++infoRef.current.numOfCalls;

            const controller = infoRef.current.controller;
            const signal = controller?.signal;

            return fetchOptions.reduce((promiseChain, currentFunc, i) => {
                let index = i;
                if (value) index = value + i;

                const id = currentFunc?.id || index;

                return promiseChain.then((data) => {
                    if (
                        Array.isArray(currentFunc?.reqs) &&
                        currentFunc?.reqs.filter((el) => !el?.url).length === 0
                    ) {
                        let type = 'allSettled';
                        if (consts.typeOptions.includes(currentFunc?.type)) {
                            type = currentFunc.type;
                        }

                        return handleStaticMethods({ ...currentFunc, type }, signal, id);
                    } else if (currentFunc?.url) {
                        //
                        const updateResponse = (data) => updateResponseRef(id, data);
                        return handleFetch({ signal, currentFunc, updateResponse });
                        //
                    } else if (typeof currentFunc?.func === 'function') {
                        if (data && Object.keys(data).length !== 0) {
                            const result = currentFunc.func(data?.data, data?.res, controller);

                            if (consts.isArrayValid(result)) {
                                return handleReduce(result, `${infoRef.current.numOfCalls}_`);
                            }

                            if (typeof result?.then === 'function') {
                                return result.then((value) => {
                                    return Promise.resolve({ ...data, value });
                                });
                            }
                        } else {
                            currentFunc.func();
                        }

                        return Promise.resolve(data);
                    }

                    return Promise.resolve(data);
                });
            }, Promise.resolve());
        },
        [infoRef, handleStaticMethods, updateResponseRef]
    );

    return handleReduce;
};

export default useHandleReduce;
