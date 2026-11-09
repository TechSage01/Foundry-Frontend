import api from "./api";
const readList = (res) => {
    const body = res.data || {};
    const d = body?.data || {};
    const items = Array.isArray(d)
    ? d
    : d?.opportunities ||
    d?.items ||
    d?.results ||
    body?.opportunities ||
    body?.items ||
    (Array.isArray(body) ? body : []);

    const pagination = 
        body?.pagination || body?.meta || d?.pagination || d?.meta || null || {};
    return { items: Array.isArray(items) ? items : [], pagination };
};

export const fetchOpportunitiesApi = async ({ 
    page = 1,
    limit = 20,
    category,
    work_arrangement,
    skill,
} = {}) => {
    const params = { page,limit };
    if(category) params.category = category;
    if(work_arrangement) params.work_arrangement = work_arrangement;
    if(skill) params.skill = skill;
    return readList(await api.get("/api/opportunities", { params }));
}


export const fetchMyOpportunitiesApi = async ({ page = 1,limit = 10 } = {}) => 
    readList(await api.get("/api/opportunities/me", { params: { page, limit }
}));

export const fetchOpportunityApi = async (id) => {
    const res = await api.get(`/api/opportunities/${id}`);
    return res.data?.data || res.data?.opportunities || res.data;
};

export const createOpportunityApi = async (form) => {
    const skills = Array.isArray(form.required_skills)
    ? form.required_skills.filter(Boolean)
    : [];
    const payload = {
        category: form.category,
        title: form.title,
        description: form.description ?? form.overview ?? "",
        required_skills: skills.length ? skills : null,
        work_arrangement: form.work_arrangement
            ? String(form.work_arrangement).toLowerCase().replace(/[^a-z]/g, "") // "On-site" -> "onsite"
            : form.work_arrangement,
        location_range: form.location_range || null,
        compensation: form.compensation || null,
        deadline_at: form.deadline_at || null,
        fast_apply_enabled: form.fast_apply_enabled ?? null,
        external_apply_url: form.external_apply_url || null,
        screening_prompt: form.screening_prompt || null, 
    };
    console.log("POST /api/opportunities payload:", payload);
    const res = await api.post("/api/opportunities", payload);
    return res.data?.data || res?.data?.oppournity || res.data;
}

export const updateOpportunityApi = async (id, payload) => {
  const res = await api.put(`/api/opportunities/${id}`, payload);
  return res.data?.data || res.data?.opportunity || res.data;
};
 
export const deleteOpportunityApi = async (id) => {
  await api.delete(`/api/opportunities/${id}`);
};
