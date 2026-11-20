import api from './api'
import { disconnectSocket } from './socket'

export const requestOtpApi = async (email) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    if (!normalizedEmail) throw new Error('Email is required');

    const response = await api.post('/api/auth/request-otp', { email: normalizedEmail });
    return response.data?.data || response.data;
};

export const verifyOtpApi = async (email, code) => {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedCode = String(code || '').replace(/\D/g, '').trim();

    if (!normalizedEmail) throw new Error('Email is required');
    if (!/^\d{6}$/.test(normalizedCode)) throw new Error('Enter a valid 6-digit code');

    try {
        const response = await api.post('/api/auth/verify-otp', {
            email: normalizedEmail,
            code: normalizedCode,
        });
        return response.data?.data || response.data;
    } catch (err) {
        const status = err.response?.status;
        if (status === 400 || status === 401) {
            try {
                // Compatibility with deployments that expose the OTP field as "otp"
                // instead of the README field name "code".
                const response = await api.post('/api/auth/verify-otp', {
                    email: normalizedEmail,
                    otp: normalizedCode,
                });
                return response.data?.data || response.data;
            } catch (fallbackErr) {
                throw err.response?.data ? err : fallbackErr;
            }
        }
        throw err;
    }
};

export const logoutApi = () => {
    disconnectSocket();

    try {
        ["token", "accessToken", "access_token", "refreshToken", "user", "auth", "authenticated"].forEach((k) =>
            localStorage.removeItem(k),
        );
        sessionStorage.clear();
    } catch {
        // Storage access can be unavailable in restricted browser contexts.
    }

    // Do not wait for the network while logging out: a slow/offline backend
    // must never leave the user stuck on a protected page.
    return api.post("/api/auth/logout", undefined, { timeout: 3000 }).catch((err) => {
        console.warn("logout request failed:", err.response?.status || err.code || err.message);
    });
}