import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import consts from '../useFetch/consts';

const FetchContextState = createContext();
const FetchContextDispatch = createContext();
const FetchOptions = createContext();

const InitialFetchOptions = createContext();

export const useFetchStatusState = () => useContext(FetchContextState);
export const useFetchDispatch = () => useContext(FetchContextDispatch);
export const useFetchOptions = () => useContext(FetchOptions);
export const useInitialFetchOptions = () => useContext(InitialFetchOptions);

const { defaultFetchProviderOptions } = consts;

export const FetchProvider = ({ options = defaultFetchProviderOptions, children }) => {
    const [isOnline, setIsOnline] = useState(true);
    const [fetchOptions, setFetchOptions] = useState({});

    const handleConfirmIsOnline = useCallback((err) => {
        setIsOnline(false);
    }, []);

    const updateInitialFetchOptions = useCallback((options) => {
        setFetchOptions((prevValue) => {
            let nextValue = options;
            if (typeof options === 'function') {
                nextValue = options(prevValue || {});
            }
            return { ...prevValue, ...(nextValue || {}) };
        });
    }, []);

    const stateValue = useMemo(() => ({ isOnline }), [isOnline]);
    const dispatchValue = useMemo(
        () => ({ setIsOnline, updateInitialFetchOptions }),
        [updateInitialFetchOptions]
    );

    const optionsValue = useMemo(() => {
        return { handleConfirmIsOnline, providerOptions: options };
    }, [handleConfirmIsOnline, options]);

    return (
        <FetchOptions.Provider value={optionsValue}>
            <FetchContextState.Provider value={stateValue}>
                <FetchContextDispatch.Provider value={dispatchValue}>
                    <InitialFetchOptions.Provider value={fetchOptions}>
                        {children}
                    </InitialFetchOptions.Provider>
                </FetchContextDispatch.Provider>
            </FetchContextState.Provider>
        </FetchOptions.Provider>
    );
};
