import { router } from '@inertiajs/react';

export default function Dashboard() {
    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="flex flex-col items-center justify-center pt-10">
            <h1 className="text-3xl">Landlord Dashboard</h1>
            <p className="mt-4 text-lg">Welcome</p>
            <button
                className="mt-20 rounded-full border border-gray-400 p-2"
                type="button"
                onClick={handleLogout}
            >
                Log out
            </button>
        </div>
    );
}
