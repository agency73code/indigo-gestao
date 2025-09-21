import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

export default function RequireAuth() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to='/401' replace />
    }

    return <Outlet />
}