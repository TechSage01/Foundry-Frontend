import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  GitFork,
  MessageCircle,
  Bookmark,
  Star,
  Folder,
  ArrowRight,
  Loader2,
  FolderOpen,
  Heart,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { likeStateOf, toggleProjectLikeApi, fetchProjectLikesApi } from "../services/projectLikes";
import {
  ProjectComponents,
  SubmitProjectModal,
} from "../components/ProjectComponents";

// Helper function to safely parse and display tech stack tags
const renderTechStack = (techStackData) => {
  let stack = [];
  try {
    if (typeof techStackData === "string") {
      stack = techStackData.startsWith("[")
        ? JSON.parse(techStackData)
        : techStackData.split(",").map((item) => item.trim());
    } else if (Array.isArray(techStackData)) {
      stack = techStackData;
    }
  } catch (err) {
    stack = [];
  }

  if (!Array.isArray(stack) || stack.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {stack.map((tech, index) => (
        <span
          key={index}
          className="bg-stone-100 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-md border border-stone-200/50"
        >
          {tech}
        </span>
      ))}
    </div>
  );
};
const toArray = (raw)=> {
  if(Array.isArray(raw)) return raw;
  const candidate = raw?.projects ?? raw?.data?.projects ?? raw?.data ?? [];
  return Array.isArray(candidate) ? candidate : [];
}

const toCommunity = (c) => {
  const name = c.name || c.title || "Community";
  return {
    id: c.id || c._id,
    slug: c.slug,
    name,
    badge: name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join(""),
    description: c.description || "",
    members: c.builders_count ?? c.members_count ?? c.member_count ?? 0,
    joined: Boolean(c.is_joined ?? c.is_member ?? c.isMember ?? false),
  };
};

const timeAgo = (value) => {
  const d = new Date(value);
  if (!value || Number.isNaN(d.getTime())) return "Recently updated";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "Updated today";
  if (days < 30) return `Updated ${days}d ago`;
  return `Updated ${d.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
};

function LikeButton({ project, className = "" }) {
  const base = likeStateOf(project);
  const [liked, setLiked] = useState(base.liked);
  const [count, setCount] = useState(base.count);
  const [busy, setBusy] = useState(false);
  const id = project._id || project.id;
  const LS_KEY = "foundry_liked_projects";

  const readLocal = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writeLocal = (isLiked) => {
    try {
      const set = new Set(readLocal().map(String));
      if (isLiked) set.add(String(id));
      else set.delete(String(id));
      localStorage.setItem(LS_KEY, JSON.stringify([...set]));
    } catch {}
  };

  // the list endpoint doesn't carry like info, so load it per project
  useEffect(() => {
    if (!id) return;
    let alive = true;
    if (base.liked === false && readLocal().map(String).includes(String(id))) {
      setLiked(true);
    }
    fetchProjectLikesApi(id)
      .then((r) => {
        if (!alive) return;
        if (r.count !== undefined) setCount(r.count);
        if (r.liked !== undefined) {
          setLiked(r.liked);
          writeLocal(r.liked);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // eslint-disable-next-line
  }, [id]);

  const toggle = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (busy || !id) return;
    const prev = { liked, count };
    setBusy(true);
    setLiked(!liked);
    setCount(Math.max(0, count + (liked ? -1 : 1)));
    try {
      const r = await toggleProjectLikeApi(id);
      const nowLiked = r.liked !== undefined ? r.liked : !prev.liked;
      setLiked(nowLiked);
      writeLocal(nowLiked);
      if (r.count !== undefined) setCount(r.count);
    } catch (err) {
      console.error("Like failed:", err);
      setLiked(prev.liked);
      setCount(prev.count);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={liked}
      className={`group/like flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors ${
        liked ? "text-[#f91880]" : "text-stone-500 hover:text-[#f91880]"
      } ${className}`}
    >
      <span className="p-1.5 -m-1.5 rounded-full group-hover/like:bg-[#f91880]/10 transition-colors">
        <Heart size={16} className={liked ? "fill-[#f91880]" : ""} />
      </span>
      <span>{count}</span>
    </button>
  );
}

const starsOf = (p) => p.stars ?? p.star_count ?? p.likes_count ?? p.likes ?? 0;

const Discover = () => {
  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All Trending");
  const [activeTab, setActiveTab] = useState("discover");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);


  // Current user comes from the API (no token or user data kept in localStorage)
  useEffect(() => {
    api
      .get("/api/auth/me")
      .then((res) => setUser(res.data?.data || res.data?.user || res.data || {}))
      .catch(() => {});
  }, []);

  const navigate = useNavigate();
  const openProject = (p) => {
    const slug = p.slug || p._slug;
  console.log("OPEN PROJECT:", slug, p);
  if (slug) navigate(`/projects/${slug}`);
  else setSelectedProject(p);
  }
  const currentUsername =
    user?.username ||
    user?.handle ||
    user?.name ||
    user?.email?.split("@")[0] ||
    "";

  const categories = [
    "All Trending",
    "AI & ML",
    "Web Dev",
    "Robotics",
    "Crypto",
  ];

  // Communities for the "Active Builder Communities" section
  useEffect(() => {
    api
      .get("/api/communities")
      .then((res) => {
        const body = res.data?.data ?? res.data;
        const list = Array.isArray(body)
          ? body
          : body?.communities || body?.items || [];
        setCommunities(
          list
            .map(toCommunity)
            .sort((a, b) => b.members - a.members)
            .slice(0, 4),
        );
      })
      .catch((err) =>
        console.error("Failed to load communities:", err.response?.status),
      )
      .finally(() => setCommunitiesLoading(false));
  }, []);

  const toggleJoin = async (community) => {
    const wasJoined = community.joined;
    try {
      await api.post(
        `/api/communities/${community.id}/${wasJoined ? "leave" : "join"}`,
      );
      setCommunities((prev) =>
        prev.map((c) =>
          c.id === community.id
            ? {
                ...c,
                joined: !wasJoined,
                members: Math.max(0, c.members + (wasJoined ? -1 : 1)),
              }
            : c,
        ),
      );
    } catch (err) {
      // 409 = already a member: just fix the button
      if (err.response?.status === 409) {
        setCommunities((prev) =>
          prev.map((c) => (c.id === community.id ? { ...c, joined: true } : c)),
        );
      } else {
        console.error("join/leave failed:", err.response?.status, err.response?.data);
      }
    }
  };

  // 1. Fetch Discovery Hub Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/projects", { params: { page: 1, limit: 50 } });

        setProjects(toArray(res.data));
      } catch (err) {
        console.error("Failed to load global projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // 2. Fetch User Projects when switching to "my-projects" tab or when username is available
  useEffect(() => {
    const fetchUserProjects = async () => {
      if (!currentUsername) return;

      try {
        if (activeTab === "my-projects") setLoading(true);
        const res = await api.get(`/api/projects/user/${currentUsername}`);

        const rawData = res.data;
        const fetchedUserProjects = Array.isArray(rawData)
          ? rawData
          : rawData?.projects || rawData?.data || [];

        setUserProjects(toArray(res.data));
      } catch (err) {
        console.error("Failed to load user projects:", err);
      } finally {
        if (activeTab === "my-projects") setLoading(false);
      }
    };

    fetchUserProjects();
  }, [activeTab, currentUsername]);

  const handleCreateProject = async (newProjectData) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", newProjectData.title || "");
      formData.append("tagline", newProjectData.tagline || "");
      formData.append("description", newProjectData.description || "");
      formData.append("is_published", "true");
      formData.append("category", newProjectData.category || "Web Dev");
      formData.append("demo_url", newProjectData.demo_url || "");
      formData.append("github_url", newProjectData.github_url || "");
      // formData.append("tech_stck", JSON.stringify(["AI & ML", ""]))

      if (Array.isArray(newProjectData.tech_stack)) {
        formData.append("tech_stack", JSON.stringify(newProjectData.tech_stack));
        // newProjectData.tech_stack.forEach((tech) =>
        //   formData.append("tech_stack", tech),
        // );
      } else {
        formData.append("tech_stack", JSON.stringify([]));
      }

      if (Array.isArray(newProjectData.team)) {
        newProjectData.team.forEach((memberId) =>
          formData.append("team", memberId),
        );
      }

      if (newProjectData.cover_image instanceof File) {
        formData.append("cover_image", newProjectData.cover_image);
      }

      const res = await api.post("/api/projects", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const createdProject = res.data?.project || res.data?.data || res.data;

      setUserProjects((prev) => [createdProject, ...(Array.isArray(prev) ? prev : [])]);
      setProjects((prev) => [createdProject, ...(Array.isArray(prev) ? prev : [])]);

      setIsSubmitModalOpen(false);
      setActiveTab("my-projects");
    } catch (err) {
      console.error("Failed to Create Project:", err);
    } finally {
      setLoading(false);
    }
  };

  // Determine list based on selected active tab
  const displayedProjects =
    activeTab === "my-projects"
      ? userProjects
      : projects.filter((p) => {
          if (activeCategory === "All Trending") return true;
          return p.category?.toLowerCase() === activeCategory.toLowerCase();
        });

  const featuredProject =
    projects.find((p) => p.isFeatured || p.is_featured) ||
    [...projects].sort((a, b) => starsOf(b) - starsOf(a))[0] ||
    null;

  return (
    <div className="min-h-screen bg-white text-[#1C1917] font-sans pb-16">
      <main className="px-4 sm:px-6 pb-6">
        {selectedProject ? (
          <ProjectComponents
            project={selectedProject}
            currentUser={user}
            api={api}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <div className="space-y-6">
            {/* X-style tab bar */}
            <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 -mt-0 bg-white/90 backdrop-blur border-b border-stone-200/70 flex items-stretch">
              {[
                { id: "discover", label: "Discover" },
                { id: "my-projects", label: "My Projects", count: userProjects.length },
              ].map((t) => {
                const active = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`relative flex-1 py-3.5 text-[15px] cursor-pointer hover:bg-stone-50 transition-colors ${
                      active ? "font-bold text-stone-900" : "font-medium text-stone-500"
                    }`}
                  >
                    {t.label}
                    {t.count > 0 && (
                      <span className="ml-1.5 text-[11px] bg-stone-200/70 text-stone-700 rounded-full px-1.5 py-0.5 align-middle">
                        {t.count}
                      </span>
                    )}
                    {active && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-1 w-14 rounded-full bg-[#A04622]" />
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="m-2 flex items-center gap-1.5 bg-[#A04622] hover:bg-[#8A3A1B] text-white px-4 rounded-full text-sm font-bold cursor-pointer active:scale-95 transition shrink-0"
              >
                <Plus size={16} />
                <span className="max-[510px]:hidden">Post Project</span>
              </button>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold tracking-wider uppercase text-[#A04622]">
                {activeTab === "my-projects" ? "Workspace" : "Discovery hub"}
              </p>
              <h1 className="text-xl font-extrabold tracking-tight text-stone-900">
                {activeTab === "my-projects" ? "My Created Projects" : "Explore Builder Projects"}
              </h1>
            </div>

            {/* FEATURED SPOTLIGHT */}
            {activeTab === "discover" && featuredProject && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/80 grid grid-cols-1 xl:grid-cols-12 gap-5 items-center">
                <div className="xl:col-span-7 relative group overflow-hidden rounded-2xl h-52 sm:h-64 bg-stone-900">
                  <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md z-10">
                    Featured Spotlight
                  </span>
                  <img
                    src={
                      featuredProject.cover_image_url ||
                      featuredProject.cover_image ||
                      featuredProject.bannerImage ||
                      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={featuredProject.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="xl:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                    <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md">
                      {featuredProject.category || featuredProject.categoryName || featuredProject.category_name || "General"}
                    </span>
                    <span>•</span>
                    <span>
                      {timeAgo(featuredProject.updated_at || featuredProject.updatedAt)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-stone-900">
                    {featuredProject.title}
                  </h2>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {featuredProject.tagline}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                    {featuredProject.description}
                  </p>

                  {renderTechStack(featuredProject.tech_stack)}

                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                    <div className="flex items-center gap-3">
                      <LikeButton key={featuredProject._id || featuredProject.id} project={featuredProject} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openProject(featuredProject)}
                      className="flex-1 bg-[#A04622] hover:bg-[#8A3A1B] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Explore Project</span>
                    </button>
                    <button className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer">
                      <Bookmark size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "discover" && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      activeCategory === cat
                        ? "bg-stone-900 text-white"
                        : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Grid Display Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">
                  {activeTab === "my-projects"
                    ? "Your Projects"
                    : "Trending Projects"}
                </h3>
                <button className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer">
                  View all <ArrowRight size={13} />
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 text-stone-500 text-xs gap-3 bg-white rounded-2xl border border-stone-200/80">
                  <Loader2 className="animate-spin text-[#A04622]" size={24} />
                  <span className="font-medium text-stone-600">
                    Projects loading...
                  </span>
                </div>
              ) : displayedProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-stone-200/80 p-6 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400">
                    <FolderOpen size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-stone-800">
                      No content posted yet
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm">
                      {activeTab === "my-projects"
                        ? "You haven't submitted any projects yet. Click 'Post Project' above to publish your first work."
                        : projects.length === 0
                          ? "No projects have been posted yet. Be the first to post one."
                          : "No projects were found matching this filter category."}
                    </p>
                  </div>
                  {activeTab === "my-projects" && (
                    <button
                      onClick={() => setIsSubmitModalOpen(true)}
                      className="mt-2 text-xs font-semibold text-[#A04622] hover:underline cursor-pointer"
                    >
                      + Create a project now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {displayedProjects.map((project) => (
                    <div
                      key={project._id || project.id}
                      onClick={() => openProject(project)}
                      className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 cursor-pointer hover:bg-stone-50 hover:border-stone-300 transition-colors flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="h-40 bg-stone-100 rounded-xl overflow-hidden relative border border-stone-200">
                          <img
                            src={
                              project.cover_image_url ||
                              project.cover_image ||
                              project.bannerImage ||
                              "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80"
                            }
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                          <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                            {project.category || "General"}
                          </span>
                          <span>{project.version || ""}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#A04622] transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                            {project.tagline || project.description}
                          </p>

                          {renderTechStack(project.tech_stack)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-100">
                        <LikeButton project={project} />
                        <span className="flex items-center gap-1">
                          <GitFork size={13} /> {project.forks_count ?? project.forks ?? 0} forks
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={13} /> {project.comments_count ?? project.comments ?? 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeTab === "discover" && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900">
                    Active Builder Communities
                  </h3>
                  <button
                    onClick={() => navigate("/communities")}
                    className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    Browse all <ArrowRight size={13} />
                  </button>
                </div>
                {communitiesLoading ? (
                  <div className="flex justify-center py-10 bg-white rounded-2xl border border-stone-200/80">
                    <Loader2 className="animate-spin text-[#A04622]" size={22} />
                  </div>
                ) : communities.length === 0 ? (
                  <div className="py-10 text-center text-xs text-stone-500 bg-white rounded-2xl border border-stone-200/80">
                    No communities yet.{" "}
                    <Link to="/communities/create" className="font-semibold text-[#A04622] hover:underline">
                      Create one
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {communities.map((comm) => (
                      <div
                        key={comm.id}
                        className="bg-white rounded-2xl border border-stone-200/80 p-5 flex items-center justify-between gap-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs shrink-0">
                            {comm.badge}
                          </div>
                          <div className="space-y-1 min-w-0">
                            <h4 className="font-bold text-stone-900 text-xs">
                              {comm.slug ? (
                                <Link to={`/communities/${comm.slug}`} className="hover:underline">
                                  {comm.name}
                                </Link>
                              ) : (
                                comm.name
                              )}
                            </h4>
                            <p className="text-xs text-stone-500 max-w-xs line-clamp-2">
                              {comm.description}
                            </p>
                            <p className="text-[11px] text-stone-400">
                              {comm.members.toLocaleString()} {comm.members === 1 ? "builder" : "builders"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleJoin(comm)}
                          className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                            comm.joined
                              ? "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                              : "bg-stone-100 hover:bg-stone-200 text-stone-800"
                          }`}
                        >
                          {comm.joined ? "Joined" : "Join"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {isSubmitModalOpen && (
        <SubmitProjectModal
          onClose={() => setIsSubmitModalOpen(false)}
          onSubmit={handleCreateProject}
          isSubmitting={loading}
        />
      )}
    </div>
  );
};

export default Discover;