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
  // author lookup: the project response may only carry an id
  const [fetchedAuthor, setFetchedAuthor] = useState(null);
  useEffect(() => {
    setFetchedAuthor(null);
    if (!project) return;
    console.log("PROJECT DETAIL RESPONSE:", project);
    if (typeof project.author === "object" && project.author) return;
    const ref =
      project.author_username ||
      project.username ||
      project.author_id ||
      project.user_id ||
      project.owner_id ||
      project.created_by ||
      project.userId ||
      (typeof project.author === "string" ? project.author : "") ||
      (typeof project.user === "string" ? project.user : "");
    if (!ref) {
      // detail response has no author info: borrow it from the list response
      let gone = false;
      api
        .get("/api/projects", { params: { page: 1, limit: 50 } })
        .then((res) => {
          const body = res.data?.data ?? res.data;
          const list = Array.isArray(body) ? body : body?.projects || body?.items || [];
          const m = list.find((p) => String(p.id || p._id) === String(project.id || project._id));
          if (gone || !m) return;
          console.log("LIST ITEM FOR THIS PROJECT:", m);
          const o = typeof m.author === "object" && m.author ? m.author : m;
          const name = o.full_name || o.author_name || o.name || o.username;
          const avatar = o.avatar_url || o.author_avatar || o.avatar;
          if (name || avatar)
            setFetchedAuthor({
              id: o.id && o !== m ? o.id : m.user_id || m.author_id,
              username: o.username || o.author_username,
              full_name: name,
              avatar_url: avatar,
            });
        })
        .catch(() => {});
      return () => {
        gone = true;
      };
    }
    let cancelled = false;
    const toAuthor = (u) =>
      u && {
        id: u.id || u._id || ref,
        username: u.username,
        full_name: u.full_name || u.name,
        avatar_url: u.avatar_url || u.avatar || u.profile_picture,
      };
    api
      .get(`/api/users/${ref}`)
      .then((res) => {
        const u = res.data?.data?.user || res.data?.data || res.data?.user || res.data;
        if (!cancelled && u && (u.username || u.full_name)) setFetchedAuthor(toAuthor(u));
      })
      .catch((err) => console.error("author lookup failed:", err.response?.status));
    return () => {
      cancelled = true;
    };
  }, [project]);
  const goBack = () =>
    window.history.length > 1 ? navigate(-1) : navigate("/discover");
  const projectWithAuthor = useMemo(() => {
  if (!project) return project;

  const hasAuthor =
    (typeof project.author === "object" && project.author) ||
    project.author_name ||
    project.authorName ||
    project.username;

  if (hasAuthor) return project;
  if (fetchedAuthor) return { ...project, author: fetchedAuthor };
  if (!isAuthor) return project;

  return {
    ...project,
    author: {
      id: currentUser?.id || currentUser?._id,
      username: currentUser?.username,
      full_name: currentUser?.full_name || currentUser?.name,
      avatar_url: currentUser?.avatar_url || currentUser?.avatar,
    },
  };
}, [project, isAuthor, currentUser, fetchedAuthor]);
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