import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthLayout from './screens/auth/layout.tsx';
import SignInPage from './screens/sign-in/page.tsx';

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route 
                    path="/login" 
                    element={
                        <AuthLayout>
                            <SignInPage />
                        </AuthLayout>
                    } 
                />
                
                <Route 
                    path="*" 
                    element={
                        <AuthLayout>
                            <SignInPage />
                        </AuthLayout>
                    } 
                />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>,
);