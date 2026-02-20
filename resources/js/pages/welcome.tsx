import { Link, router } from '@inertiajs/react';

export default function Example() {
    const handleLogout = () => {
        router.post('/logout');
    };
    return (
        <>
            <Link href="/login">Log in</Link>
            <Link href="/register">Register</Link>
            <Link href="/login">Log in</Link>
            <Link href="/mail">Mail</Link>
            <Link as="button" onClick={handleLogout}>Log out</Link>
        </>
    );
}
