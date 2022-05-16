# @josipp/use-fetch

> A custom React hook to execute multiple api requests sequentially.

## Install

```bash
npm i @josipp/use-fetch
```

## Usage

```jsx
import { useEffect, useState } from 'react';
import useFetch from '@josipp/use-fetch';

const baseUrl = 'https://jsonplaceholder.typicode.com';

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
            // id is key in response object, it is optional
            // options are also optional
            { url: `${baseUrl}/posts`, id: 'posts' },
            { url: `${baseUrl}/users`, options: { method: 'GET' } },
            // you can also set to another state manager, like redux or do something else
            // with data
            { func: data => setUsers(data) },
            {
                url: `${baseUrl}/posts`,
                options: {
                    method: 'POST',
                    body: JSON.stringify({ title: 'test', body: 'test', userId: 2 }),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    },
                },
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
