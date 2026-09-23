import api from './api';

// --- PROFILE ---
export const updateProfile = async (profileData) => {
  const response = await api.put('/api/profile', profileData);
  return response.data;
};

// --- PROJECTS ---
// POST /api/projects
export const createProject = async (projectData) => {
  const response = await api.post('/api/projects', projectData);
  return response.data;
};

// GET /api/projects
export const getPublishedProjects = async () => {
  const response = await api.get('/api/projects');
  return response.data;
};

// GET /api/projects/{slug}
export const getProjectBySlug = async (slug) => {
  const response = await api.get(`/api/projects/${slug}`);
  return response.data;
};

// GET /api/projects/user/{username}
export const getUserProjects = async (username) => {
  const response = await api.get(`/api/projects/user/${username}`);
  return response.data;
};

// PUT /api/projects/{id}
export const updateProject = async (id, projectData) => {
  const response = await api.put(`/api/projects/${id}`, projectData);
  return response.data;
};

// DELETE /api/projects/{id}
export const deleteProject = async (id) => {
  const response = await api.delete(`/api/projects/${id}`);
  return response.data;
};