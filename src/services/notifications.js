import api from './api';

const unwrapList = (res) => {
    const body = res.data?.data ?? res.data;
    if(Array.isArray(body)) return  body;
    return (
        body?.notifications ||
        body?.items ||
        body?.results ||
        Object.values(body || {}).find(Array.isArray) ||
        []
    );
}

export const fetchNotificationsApi = async () => {
    const res = await api.get("api/notifications", { params: {
        limit: 50
    } });
    return (unwrapList(res))
};

export const markNotificationReadApi = async (id) => {
    try {
        const res = await api.patch(`api/notifications/${id}/read`);
        return res.data?.data || res.data;
    } catch (err) {
        if (err.response?.status === 404) {
            const res = await api.patch(`api/notifications/${id}`);
            return res.data?.data || res.data;
        }
        throw err;
    }
}
