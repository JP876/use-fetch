# @josipp/use-fetch

> A custom React hook to execute multiple api requests sequentially.

## Install

```bash
npm install @josipp/use-fetch
```

## Usage

```jsx
import { useEffect, useState } from 'react';
import useFetch from '@josipp/useFetch';

const fetchJSONPosts = signal => {
    return fetch('https://jsonplaceholder.typicode.com/posts', {
        signal,
    });
};

// signal is last argument
const fetchJSONUsers = signal => {
    return fetch('https://jsonplaceholder.typicode.com/users', {
        signal,
    });
};

const fetchJSONCreateResource = (data, signal) => {
    return fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        },
        signal,
    });
};

function App() {
    const [users, setUsers] = useState(null);
    const {
        doFetch,
        isLoading,
        response,
        error: { error, msg },
    } = useFetch();

    useEffect(() => {
        doFetch([
            // for api requsets, info is required
            { func: fetchJSONPosts, info: [], id: 'posts' },
            // id is key in response object, it is optional
            { func: fetchJSONUsers, info: [] },
            // you can also set to another state manager, like redux
            { func: data => setUsers(data) },
            {
                func: fetchJSONCreateResource,
                info: [{ title: 'test', body: 'test', userId: 2 }],
            },
        ]);
    }, [doFetch]);

    if (isLoading) {
        // can be used for loading indicator
        return <h1>Loading...</h1>;
    }

    if (error) {
        console.log(msg);
        return <h1>Something went wrong.</h1>;
    }

    return (
        <>
            <p>{JSON.stringify(response.posts)}</p>
            <br />
            <p>{JSON.stringify(response[1])}</p>
            <br />
            <p>{JSON.stringify(users)}</p>
            <br />
            <p>{JSON.stringify(response[3])}</p>
        </>
    );
}

export default App;
```
