import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Inspect all incoming URL params for debugging
    navigate('/home', { replace: true });
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900 text-stone-200">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium">Authenticating session...</p>
      </div>
    </div>
  );
}