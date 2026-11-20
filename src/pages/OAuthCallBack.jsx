
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    useEffect(() => {
        let alive = true;

        const authError =
            searchParams.get('error') ||
            searchParams.get('message') ||
            searchParams.get('error_description');

        if (authError) {
            setError(authError);
            return;
        }

        api.get('/api/auth/me')
            .then(() => {
                if (alive) {
                    navigate('/home', { replace: true });
                }
            })
            .catch((err) => {
                if (!alive) return;

                setError(
                    err.response?.data?.message ||
                    'We could not complete sign-in. Please try again.'
                );
            });

        return () => {
            alive = false;
        };
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F7F5F0] px-4 text-[#1C1917]">
            <div className="w-full max-w-sm rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">

                {error ? (
                    <>
                        <h1 className="text-xl font-bold">
                            Sign-in could not be completed
                        </h1>

                        <p className="mt-2 text-sm text-stone-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate('/signin', { replace: true })}
                            className="mt-6 w-full rounded-full bg-[#A04622] px-4 py-3 text-sm font-bold text-white hover:bg-[#85381a] cursor-pointer"
                        >
                            Back to sign-in
                        </button>
                    </>
                ) : (
                    <>
                        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#A04622] border-t-transparent" />

                        <p className="text-sm font-medium">
                            Completing your sign-in...
                        </p>
                    </>
                )}

            </div>
        </div>
    );
}
