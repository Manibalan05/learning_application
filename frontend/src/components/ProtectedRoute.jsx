import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { account } from '../lib/appwrite';

const ProtectedRoute = ({ allowedRoles }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await account.get();
                // Determine role
                if (user.labels && user.labels.includes('admin')) {
                    setUserRole('admin');
                } else {
                    setUserRole('student');
                }
                setIsAuthenticated(true);
            } catch (error) {
                console.log('Not authenticated');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (isLoading) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)' 
            }}>
                Loading session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Role-based protection
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redirect to their appropriate dashboard if they try to access wrong area
        return userRole === 'admin' 
            ? <Navigate to="/admin" replace /> 
            : <Navigate to="/student" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
