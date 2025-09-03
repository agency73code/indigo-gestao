import { Outlet } from 'react-router-dom';

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <h1>AppLayout funcionando!</h1>
            <div>
                <Outlet />
            </div>
        </div>
    );
}
