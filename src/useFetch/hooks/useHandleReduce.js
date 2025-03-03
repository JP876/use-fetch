import { useCallback } from 'react';

import consts from '../consts';
import { AbortError, NetworkError } from '../errorInstances';
import useTriggerNetworkRequest from './useTriggerNetworkRequest';
import useParseNetworkData from './useParseNetworkData';
import useFetchHandler from './useFetchHandler';
import useCatchErrorInstance from './useCatchErrorInstance';

const { isArrayValid, typeOptions } = consts;

const useHandleReduce = (infoRef, updateResponseRef, updateFailedRequestsRef) => {
    const triggerNetworkRequest = useTriggerNetworkRequest();
    const parseNetworkData = useParseNetworkData();
    const handleFetch = useFetchHandler();

    const handleCatch = useCatchErrorInstance();

    const handleStaticMethods = useCallback(
        (currentFunc, signal, id) => {
            return Promise[currentFunc.type](
                currentFunc.reqs.map((el) =>
                    triggerNetworkRequest(el?.url, { ...(el?.options || {}), signal })
                )
            ).then(async (results) => {
                const data = await Promise.all(
                    results.map((el) => {
                        if (el?.value && !el?.value?.ok) {
                            updateFailedRequestsRef(el);
                        }

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
        [parseNetworkData, triggerNetworkRequest, updateFailedRequestsRef, updateResponseRef]
    );

    const handleReduce = useCallback(
        (options, value) => {
            if (!isArrayValid(options)) {
                console.warn(`Passed options are: ${options}`);
                return;
            }

            const controller = infoRef.current.controller;
            const signal = controller?.signal;

            infoRef.current.numOfCalls = ++infoRef.current.numOfCalls;

            return options.reduce((promiseChain, currentFunc, i) => {
                if (controller instanceof AbortController && signal?.aborted) {
                    throw new AbortError('Aborted.');
                }

                let index = i;
                if (value) index = value + i;

                const id = currentFunc?.id || index;

                return promiseChain
                    .then((data) => {
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
                            let result = null;

                            if (data && Object.keys(data).length !== 0) {
                                result = currentFunc.func(data?.data, data?.res, controller);
                            } else {
                                result = currentFunc.func(null, null, controller);
                            }

                            if (result !== null) {
                                if (isArrayValid(result)) {
                                    return handleReduce(
                                        result,
                                        id ? `${id}_` : `${infoRef.current.numOfCalls}_`
                                    );
                                } else if (typeof result?.then === 'function') {
                                    return result
                                        .then((value) => {
                                            if (value) updateResponseRef(id, value);
                                            return Promise.resolve({ data: value ? value : data });
                                        })
                                        .catch(handleCatch);
                                }
                            }

                            return Promise.resolve(data);
                        }

                        return Promise.resolve(data);
                    })
                    .catch(handleCatch);
            }, Promise.resolve());
        },
        [infoRef, handleStaticMethods, handleFetch, updateResponseRef, handleCatch]
    );

    return handleReduce;
};

export default useHandleReduce;
