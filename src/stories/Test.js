import React, { useCallback, useEffect, useRef, useState } from 'react';

import useFetch, {
    APIError,
    useTriggerNetworkRequest,
    useFetchStatusState,
    FetchProvider,
} from '../';

const getRandomNum = (min, max) => {
    return Math.round(Math.random() * (max - min) + min);
};

const baseUrl = 'https://jsonplaceholder.typicode.com';

const textBody = `Lorem ipsum dolor sit amet, consectetur adipiscin elit. 
    Integer euismod massa sit amet ante fermentum, sed viverra justo mollis. 
    Nunc faucibus ac elit vel interdum.`;

const keys = [
    { id: 'isLoading', label: 'Loading' },
    { id: 'error', label: 'Error', key: 'error' },
    { id: 'error', label: 'Error message', key: 'msg' },
    { id: 'response', label: 'Response', key: 'randomUser' },
];

const fetchUrls = {
    posts: `${baseUrl}/posts`,
    users: `${baseUrl}/users`,
    todos: `${baseUrl}/todos`,
    photos: `${baseUrl}/photos`,
    comments: `${baseUrl}/comments`,
};

const FetchContainer = ({ initialFetch }) => {
    const justMounted = useRef(true);

    const triggerNetworkRequest = useTriggerNetworkRequest();
    const fetchObj = useFetch({
        abortOnUnmount: true,
        hasAdditionalCatchMethod: false,
    });

    const { doFetch, error, isLoading, response, controller, handleResetError } = fetchObj;

    const handleFetch = useCallback(
        (event) => {
            if (event?.target) {
                const type = event.target.dataset?.type;

                if (type === 'error') {
                    fetchUrls.users = `${baseUrl}/userss`;
                } else {
                    fetchUrls.users = `${baseUrl}/users`;
                }
            }

            doFetch([
                {
                    id: 'reqs',
                    // type options: 'all' || 'allSettled'
                    // default type: 'allSettled'
                    // type: 'all',
                    reqs: [{ url: fetchUrls.posts }, { url: fetchUrls.users }],
                },
                {
                    // id: 'after-reqs',
                    func: (data, res, controller) => {
                        const [posts, users] = data;

                        /* if (!Array.isArray(users)) {
                            controller.abort();
                            return
                        } */

                        let randomUser = users?.[getRandomNum(0, users?.length)];
                        if (!randomUser?.id) randomUser = { id: 1 };

                        return [
                            {
                                id: 'randomUser',
                                url: `${fetchUrls.users}/${randomUser?.id || 0}`,
                            },
                            {
                                func: (user) => {
                                    // console.log(user);

                                    return [
                                        {
                                            // id: 'commentsAndPhotos',
                                            reqs: [
                                                { url: fetchUrls.comments },
                                                { url: fetchUrls.photos },
                                            ],
                                        },
                                    ];
                                },
                            },
                            {
                                // id: "message",
                                func: () =>
                                    new Promise((res) => {
                                        setTimeout(() => res('Message'), 500);
                                    }),
                            },
                        ];
                    },
                },
                {
                    id: 'todos',
                    func: (data, res, controller) => {
                        return new Promise((res) => res()).then(async () => {
                            const reqRes = await triggerNetworkRequest(fetchUrls.todos, {
                                signal: controller?.signal,
                            });

                            if (!reqRes?.ok) throw new APIError('Message', reqRes);

                            const data = await reqRes.json();
                            return Promise.resolve(data);
                        });
                    },
                },
            ])
                .then((result) => {
                    console.log('Then');
                    console.log(result);
                })
                .catch((err) => {
                    // catch runs if catchHandlerPassed was passed as option to useFetch
                    console.log('Catch');
                    console.log(err);
                });
        },
        [doFetch, triggerNetworkRequest]
    );

    useEffect(() => {
        if (initialFetch && justMounted.current) {
            handleFetch();
        }
        justMounted.current = false;
    }, [handleFetch, initialFetch]);

    return (
        <div style={{ display: 'flex', gap: '.5rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '.5rem' }}>
                <button onClick={handleFetch}>Fetch</button>
                <button data-type="error" onClick={handleFetch}>
                    Fetch with error
                </button>
            </div>

            <div style={{ marginLeft: '2rem' }}>
                <ul>
                    {keys.map(({ id, label, key }) => (
                        <li key={key || id}>
                            {label}:{' '}
                            {key
                                ? JSON.stringify(fetchObj[id]?.[key])
                                : JSON.stringify(fetchObj[id])}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
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
                        <label style={{ fontSize: '1.4rem', marginLeft: '.5rem' }} htmlFor="fetch">
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

const Test = () => (
    <FetchProvider>
        <TestContainer />
    </FetchProvider>
);

export default Test;
