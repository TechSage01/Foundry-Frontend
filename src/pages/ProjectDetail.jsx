import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import api from "../services/api.js";
import { ProjectComponents } from "../components/ProjectComponents.jsx";
import { Loader2 } from "lucide-react";

const readStoredUser = () => {
  try {
    const raw = JSON.parse(localStorage.getItem("user") || "{}");
    return raw.user || raw.data || raw;
  } catch (error) {
    return {};
  }
};
const ProjectDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [currentUser, setCurrentUser] = useState(readStoredUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // const userRaw = JSON.parse(localStorage.getItem("user") || "{}")
  // const currentUser = userRaw.user || userRaw.data || userRaw;
  useEffect(() => {
    let cancelled = false;
    api
      .get("/api/auth/me")
      .then((res) => {
        const me = res.data?.data || res.data?.user || res.data;
        if (!cancelled && me) setCurrentUser(me);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const fetchProject = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get(`/api/projects/${slug}`);
        const data = res.data?.data || res.data?.project || res.data;
        if (!cancelled) setProject(data);
      } catch (err) {
        console.error("Failed to load project:", err);
        if (!cancelled) setError("Project not found");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (slug) fetchProject();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  const [isAuthor, setIsAuthor] = useState(false);
  useEffect(() => {
    const username = currentUser?.username || currentUser?.user?.username;
    if (!project || !username) {
      setIsAuthor(false);
      return;
    }
    let cancelled = false;
    const checkAuthor = async () => {
      try {
        const res = await api.get(`/api/projects/user/${username}`);
        const body = res.data;
        const list = Array.isArray(body)
          ? body
          : Array.isArray(body?.data)
            ? body.data
            : Array.isArray(body?.projects)
              ? body.projects
              : Array.isArray(body?.data?.projects)
                ? body.data.projects
                : [];
        const thisId = String(
          project._id || project.id || project.slug || project.slugId,
        );
        const mine = list.some(
          (p) =>
            (thisId && String(p._id || p.id) === thisId) ||
            (p.slug || p.slugId) === slug,
        );
        if (!cancelled) setIsAuthor(mine);
      } catch (err) {
        console.error(
          "Failed to check author:",
          err.response?.status,
          err.response?.data || err.message,
        );
      }
    };
    checkAuthor();
    return () => {
      cancelled = true;
    };
  }, [project, currentUser, slug]);
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/discover");
  const projectWithAuthor = useMemo(() => {
  if (!project) return project;

  const hasAuthor =
    (typeof project.author === "object" && project.author) ||
    project.author_name ||
    project.authorName ||
    project.username;

  if (hasAuthor || !isAuthor) return project;

  return {
    ...project,
    author: {
      id: currentUser?.id || currentUser?._id,
      username: currentUser?.username,
      full_name: currentUser?.full_name || currentUser?.name,
      avatar_url: currentUser?.avatar_url || currentUser?.avatar,
    },
  };
}, [project, isAuthor, currentUser]);
  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <Loader2 className="w-8 h-8 animate-spin text-[#A04622]" />
          </div>
        ) : error || !project ? (
          <div className="text-center py-16 text-stone-500 text-sm">
            {error || "Project not found."}
          </div>
        ) : (
          <ProjectComponents
            project={projectWithAuthor}
            key={project._id || project.id || slug}
            currentUser={currentUser}
            isAuthor={isAuthor}
            api={api}
            onBack={goBack}
            onDeleteSuccess={() => navigate("/profile", { replace: true })}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
