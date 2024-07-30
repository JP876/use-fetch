import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import consts from '../useFetch/consts';

const FetchContextState = createContext();
const FetchContextDispatch = createContext();
const FetchOptions = createContext();

export const useFetchStatusState = () => useContext(FetchContextState);
export const useFetchDispatch = () => useContext(FetchContextDispatch);
export const useFetchOptions = () => useContext(FetchOptions);

export const FetchProvider = ({ options = consts.defaultFetchProviderOptions, children }) => {
    const { confirmIsOnline } = options;
    const [isOnline, setIsOnline] = useState(true);

    const handleConfirmIsOnline = useCallback(
        (err) => {
            if (typeof confirmIsOnline === 'function') {
                const promiseRes = confirmIsOnline(err);
                if (typeof promiseRes?.catch === 'function') {
                    promiseRes.catch((err) => {
                        setIsOnline(false);
                    });
                }
            } else {
                setIsOnline(false);
            }
        },
        [confirmIsOnline]
    );

    const stateValue = useMemo(() => ({ isOnline }), [isOnline]);
    const dispatchValue = useMemo(() => ({ setIsOnline }), []);

    const optionsValue = useMemo(() => {
        return { handleConfirmIsOnline };
    }, [handleConfirmIsOnline]);

    return (
        <FetchOptions.Provider value={optionsValue}>
            <FetchContextState.Provider value={stateValue}>
                <FetchContextDispatch.Provider value={dispatchValue}>
                    {children}
                </FetchContextDispatch.Provider>
            </FetchContextState.Provider>
        </FetchOptions.Provider>
    );
};
