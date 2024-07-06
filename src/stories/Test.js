import React, { useCallback, useEffect, useRef, useState } from 'react';

import { FetchProvider, useFetchContext } from '../fetchContetxt/useFetchContext';
import useFetch from '../useFetch';

const baseUrl = 'https://jsonplaceholder.typicode.com';
const textBody =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod massa sit amet ante fermentum, sed viverra justo mollis. Nunc faucibus ac elit vel interdum.';

const FetchContainer = ({ initialFetch }) => {
    const justMounted = useRef(true);

    const {
        doFetch,
        isLoading,
        response,
        error: { error, msg },
        handleResetError,
    } = useFetch({ abortOnUnmount: true });
    const {
        doFetch: fetchTest,
        isLoading: testLoading,
        error: { msg: testMsg },
    } = useFetch();

    const [, { setIsOnline }] = useFetchContext();

    const fetchCheck = useCallback(() => {
        fetchTest([{ url: `${baseUrl}/posts` }, { func: () => setIsOnline(true) }]);
    }, [fetchTest, setIsOnline]);

    const handleTestFetch = useCallback(
        (type) => {
            const url = type === 'error' ? 'posts1' : 'posts';

            doFetch([
                /* {
                    type: 'all',
                    reqs: [{ url: `${baseUrl}/posts` }, { url: `${baseUrl}/users` }],
                },
                {
                    func: (data, res, controller) => {
                        // console.log(data, controller);
                    },
                }, */
                { url: `${baseUrl}/posts` },
                {
                    func: (data) => {
                        return [
                            {
                                // type: 'all',
                                reqs: [{ url: `${baseUrl}/posts` }, { url: `${baseUrl}/users` }],
                            },
                            {
                                func: (data) => {
                                    // console.log(data);
                                },
                            },
                        ];
                    },
                },
                {
                    url: `${baseUrl}/${url}`,
                    options: {
                        method: 'POST',
                        body: JSON.stringify({
                            title: 'test',
                            body: textBody,
                            userId: 2,
                        }),
                        headers: {
                            'Content-type': 'application/json; charset=UTF-8',
                        },
                    },
                },
                {
                    func: (data, res, controller) => {
                        return null;
                    },
                },
                /* { url: `${baseUrl}/users` },
                {
                    func: (data, res, controller) => {
                        // console.log(data);
                    },
                }, */
                /* {
                    func: () =>
                        new Promise((resolve) => {
                            return resolve('yooo');
                        }),
                }, */
            ]).then((res) => {
                // console.log(res?.data);
            });
        },
        [doFetch, fetchCheck]
    );

    useEffect(() => {
        if (justMounted.current && initialFetch) {
            handleTestFetch();
        }
        justMounted.current = false;
    }, [handleTestFetch, initialFetch]);

    return (
        <>
            <div className="btn-container">
                <button disabled={isLoading} onClick={handleTestFetch}>
                    Test Correct
                </button>

                <button disabled={isLoading} onClick={() => handleTestFetch('error')}>
                    Test Wrong
                </button>
                <button disabled={isLoading || !error} onClick={handleResetError}>
                    Reset error
                </button>

                <button disabled={isLoading} onClick={fetchCheck}>
                    Test Connection
                </button>
            </div>

            <div className="status-container">
                <ul>
                    <li>Loading: {isLoading ? 'True' : 'False'}</li>
                    <li>Error: {error ? 'True' : 'False'}</li>
                    <li>Error message: {msg ? JSON.stringify(msg) : 'False'}</li>
                    <li>IsOnline message: {testMsg ? JSON.stringify(msg) : 'False'}</li>
                    {response?.[1] && (
                        <li>
                            <h4>Response 0:</h4>
                            <p style={{ marginTop: '.4rem' }}>
                                Title: <span>{response[0]?.title}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                Body: <span>{response[0]?.body}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                UserId: <span>{response[0]?.userId}</span>
                            </p>
                        </li>
                    )}
                </ul>
            </div>
        </>
    );
};

const TestContainer = () => {
    const [mount, setMount] = useState(true);
    const [initialFetch, setInitialFetch] = useState(false);

    const [state] = useFetchContext();

    return (
        <>
            <div
                style={{
                    borderBottom: '1px solid black',
                    marginBottom: '1rem',
                }}
            >
                <div
                    style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <button onClick={() => setMount((prevValue) => !prevValue)}>
                        {mount ? 'Unmount' : 'Mount'}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            id="fetch"
                            name="fetch"
                            checked={initialFetch}
                            onChange={() => setInitialFetch((prevValue) => !prevValue)}
                        />
                        <label
                            style={{
                                fontSize: '1.4rem',
                                marginLeft: '.5rem',
                            }}
                            htmlFor="fetch"
                        >
                            Initial Fetch
                        </label>
                    </div>
                    <p style={{ fontSize: '1.4rem', marginLeft: '1rem' }}>
                        IsOnline: {state?.isOnline ? 'True' : 'False'}
                    </p>
                </div>
            </div>

            {mount ? <FetchContainer initialFetch={initialFetch} /> : null}
        </>
    );
};

const Test = () => (
    <FetchProvider>
        <TestContainer />
    </FetchProvider>
);

export default Test;
