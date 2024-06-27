import React from 'react';
import { Navigate } from 'react-router-dom';


const dd = '321'
export const PrivateRoute = ({ isAuth, children }) => {
    return dd ? children : <Navigate to="/login" />;
};

export const PublicRoute = ({ isAuth, children }) => {
    return !dd ? children : <Navigate to="/" />;
};
