import { Link, router } from '@inertiajs/react';

import { route } from 'ziggy-js';

export default function Example() {
    const handleLogout = () => {
        router.post(route('logout4'));
    };
    return (
        <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
            <Link href={route('login')}>Log in</Link>
            <Link href={route('mail')}>Mail</Link>
            <Link onClick={handleLogout}>Mail</Link>
            <Link href={route('logout')}>Log out</Link>
        </>
    );
}
