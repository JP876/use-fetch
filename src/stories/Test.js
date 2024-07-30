import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
    FetchProvider,
    useFetchDispatch,
    useFetchStatusState,
} from '../fetchContetxt/useFetchContext';
import useFetch from '../useFetch';
import triggerNetworkRequest from '../useFetch/triggerNetworkRequest';
import { APIError } from '../useFetch/errorInstances';

const getRandomNum = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const baseUrl = 'https://jsonplaceholder.typicode.com';
const textBody =
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod massa sit amet ante fermentum, sed viverra justo mollis. Nunc faucibus ac elit vel interdum.';

const FetchContainer = ({ initialFetch }) => {
    const justMounted = useRef(true);

    const { doFetch, isLoading, response, error, handleResetError, controller } = useFetch({
        abortOnUnmount: false,
        hasAdditionalCatchMethod: true,
    });
    const { error: isError, msg } = error;

    const {
        doFetch: fetchTest,
        isLoading: testLoading,
        error: { msg: testMsg },
    } = useFetch();

    const { setIsOnline } = useFetchDispatch();

    const fetchCheck = useCallback(() => {
        fetchTest([{ url: `${baseUrl}/posts` }, { func: () => setIsOnline(true) }]);
    }, [fetchTest, setIsOnline]);

    const handleTestFetch = useCallback(
        (type) => {
            const url = type === 'error' ? 'posts1' : 'posts';

            doFetch([
                {
                    // type options: 'all' || 'allSettled'
                    // default type: 'allSettled'
                    // type: 'all',
                    reqs: [{ url: `${baseUrl}/posts` }, { url: `${baseUrl}/users` }],
                },
                {
                    func: (data, res, controller) => {
                        const [posts, users] = data;
                        const randomUser = users[getRandomNum(0, users?.length)];

                        return [{ url: `${baseUrl}/users/${randomUser?.id || 1}` }];
                    },
                },
                {
                    func: (data, res, controller) => {
                        return new Promise((res) => res()).then(async () => {
                            const reqRes = await fetch(`${baseUrl}/todos`, {
                                signal: controller?.signal,
                            });
                            const data = await reqRes.json();
                            return Promise.resolve(data);
                        });
                    },
                },
                {
                    id: 'addedPost',
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
                        return new Promise((resolve) => setTimeout(resolve, 2000)).then(
                            async () => {
                                const reqRes = await triggerNetworkRequest(`${baseUrl}/users`, {
                                    signal: controller?.signal,
                                });

                                if (!reqRes?.ok) throw new APIError('Message', reqRes);

                                const data = await reqRes.json();
                                return Promise.resolve(data);
                            }
                        );
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
            ])
                .then((a) => {
                    console.log(a);
                })
                .catch((e) => {
                    console.log(e);
                    /* if (e?.err instanceof APIError) {
                        console.log(e);
                    } */
                });
        },
        [doFetch]
    );

    useEffect(() => {
        if (justMounted.current && initialFetch) {
            handleTestFetch();
        }
        justMounted.current = false;
    }, [handleTestFetch, initialFetch]);

    /* useEffect(() => {
        if (controller instanceof AbortController) {
            setTimeout(() => controller?.abort(), 200);
        }
    }, [controller]); */

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
                    <li>Error: {isError ? 'True' : 'False'}</li>
                    <li>Error message: {msg ? JSON.stringify(msg) : 'False'}</li>
                    <li>IsOnline message: {testMsg ? JSON.stringify(msg) : 'False'}</li>
                    {response?.addedPost && (
                        <li>
                            <h4>Response 0:</h4>
                            <p style={{ marginTop: '.4rem' }}>
                                Title: <span>{response?.addedPost?.title}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                Body: <span>{response?.addedPost?.body}</span>
                            </p>
                            <p style={{ marginTop: '.4rem' }}>
                                UserId: <span>{response?.addedPost?.userId}</span>
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

    const { isOnline } = useFetchStatusState();

    useEffect(() => {
        const handleError = (event) => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        };
        window.addEventListener('unhandledrejection', handleError);
        return () => {
            window.addEventListener('unhandledrejection', handleError);
        };
    }, []);

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
                        IsOnline: {isOnline ? 'True' : 'False'}
                    </p>
                </div>
            </div>

            {mount ? <FetchContainer initialFetch={initialFetch} /> : null}
        </>
    );
};

const confirmIsOnline = (err) => {
    return new Promise((resolve, reject) => {
        return fetch(`${baseUrl}/todos`)
            .then(() => resolve())
            .catch(() => reject());
    });
};

const Test = () => (
    <FetchProvider confirmIsOnline={confirmIsOnline}>
        <TestContainer />
    </FetchProvider>
);

export default Test;
