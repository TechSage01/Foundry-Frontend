import api from './api'
import { disconnectSocket } from './socket'

export const requestOtpApi = async (email) => {
    const response = await api.post('/api/auth/request-otp', { email });
    return response.data?.data || response.data;
};

export const verifyOtpApi = async (email, code) => {
    const response = await api.post('/api/auth/verify-otp', { email, code });
    return response.data?.data || response.data;
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