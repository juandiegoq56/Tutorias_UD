import React from "react"; 
import { Navigate, Outlet } from "react-router-dom";
import useUser from './useUser ';

export const ProtectedRoute = ({ children, redirectTo }) => {
    const { isLogged } = useUser();

    // Si isLogged es falso, redirige
    if (!isLogged) {
        return <Navigate to={redirectTo} replace />; 
    }

    // Si isLogged es verdadero, renderiza los elementos secundarios
    return children || <Outlet />;
};

export const ProtectedRouteLogin = ({ children, redirectTo }) => {
    const { isLogged } = useUser();

    // Si el usuario ha iniciado sesión, redirige inmediatamente
    if (isLogged) {
        return <Navigate to={redirectTo} replace />;
    }

    // Si no ha iniciado sesión, muestra el contenido
    return children || <Outlet />;
};

export default { ProtectedRoute, ProtectedRouteLogin };
