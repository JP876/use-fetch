import { useCallback } from 'react';

import consts from './consts';
import triggerNetworkRequest from './triggerNetworkRequest';
import parseNetworkData from './parseNetworkData';
import handleFetch from './handleFetch';
import { AbortError, NetworkError } from './errorInstances';

const { isArrayValid, typeOptions, abortErrorNames, networkErrorMessages } = consts;

const useHandleReduce = (infoRef, updateResponseRef) => {
    const handleStaticMethods = useCallback(
        (currentFunc, signal, id) => {
            return Promise[currentFunc.type](
                currentFunc.reqs.map((el) =>
                    triggerNetworkRequest(el?.url, { ...(el?.options || {}), signal })
                )
            ).then(async (results) => {
                const data = await Promise.all(
                    results.map((el) => {
                        if (el?.status === 'rejected') {
                            if (
                                el?.reason instanceof NetworkError ||
                                el?.reason instanceof AbortError
                            ) {
                                throw el.reason;
                            }
                            return { ...el, data: null };
                        }

                        return parseNetworkData(el?.value || el, currentFunc.type);
                    })
                );

                updateResponseRef(id, data);
                return Promise.resolve({ data, res: results });
            });
        },
        [updateResponseRef]
    );

    const handleReduce = useCallback(
        (options, value) => {
            if (!isArrayValid(options)) {
                console.warn(`Passed options are: ${options}`);
                return;
            }

            infoRef.current.numOfCalls = ++infoRef.current.numOfCalls;

            const controller = infoRef.current.controller;
            const signal = controller?.signal;

            return options.reduce((promiseChain, currentFunc, i) => {
                let index = i;
                if (value) index = value + i;

                const id = currentFunc?.id || index;

                return promiseChain.then((data) => {
                    if (
                        Array.isArray(currentFunc?.reqs) &&
                        currentFunc?.reqs.filter((el) => !el?.url).length === 0
                    ) {
                        let type = 'allSettled';
                        if (typeOptions.includes(currentFunc?.type)) {
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

                            if (isArrayValid(result)) {
                                return handleReduce(result, `${infoRef.current.numOfCalls}_`);
                            }

                            if (typeof result?.then === 'function') {
                                return result
                                    .then((value) => {
                                        if (value) updateResponseRef(id, value);
                                        return Promise.resolve({ data: value ? value : data });
                                    })
                                    .catch((err) => {
                                        if (
                                            err instanceof DOMException &&
                                            abortErrorNames.includes(err?.name)
                                        ) {
                                            throw new AbortError(err?.message);
                                        } else if (networkErrorMessages.includes(err?.message)) {
                                            throw new NetworkError(err?.message);
                                        }
                                        throw err;
                                    });
                            }
                        } else {
                            const result = currentFunc.func();
                            if (isArrayValid(result)) {
                                return handleReduce(result, `${infoRef.current.numOfCalls}_`);
                            }
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
