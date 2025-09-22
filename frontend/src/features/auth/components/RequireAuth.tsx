import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { useRef } from "react";

export default function RequireAuth() {
    const { user, isLoading } = useAuth()
    const sentRef = useRef(false);
    const justLoggedOut = sessionStorage.getItem('auth:justLoggedOut') === '1';

    if (isLoading) {
        return null;
    }

    if (!user) {
        if (justLoggedOut || sentRef.current) {
            sentRef.current = true;
            sessionStorage.removeItem('auth:justLoggedOut');
            return <Navigate to='/sign-in' replace />
        }
        return <Navigate to='/401' replace />
    }

    return <Outlet />
}