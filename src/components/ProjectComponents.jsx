import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Star,
  Bookmark,
  Share2,
  Clock,
  CheckCircle2,
  ExternalLink,
  Plus,
  Check,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Mail,
  Send,
  Upload,
  Search,
  // Trash2,
  Edit3,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
import api from "../services/api";

export const ProjectComponents = ({
  project: initialProject = {},
  currentUser = {},
  isAuthor: isAuthorProp,
  onBack,
  onDeleteSuccess,
  api,
}) => {
  const [project, setProject] = useState(initialProject);
  const [starred, setStarred] = useState(false);
  const [starCount, setStarCount] = useState(
    project.stars || project.star_count || 0,
  );
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("Overview");

  // State Management for Author Action Controls
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: project.title || "",
    tagline: project.tagline || "",
    description: project.description || "",
    demo_url: project.demo_url || project.demoUrl || "",
    github_url: project.github_url || project.githubUrl || "",
  });

  // Roadmap & Updates state
  const [phases, setPhases] = useState(project.phases || []);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");
  const [showAddPhase, setShowAddPhase] = useState(false);

  const [updates, setUpdates] = useState(project.updates || []);
  const [newUpdateText, setNewUpdateText] = useState("");
  const [showAddUpdate, setShowAddUpdate] = useState(false);

  // 1. Extract Current User ID / Identifier
  const currentUserId = String(
    currentUser?._id || currentUser?.id || currentUser?.userId || "",
  ).trim();


  // 2. Extract Current User Name / Handle
  const currentUsername = String(
    currentUser?.username ||
      currentUser?.handle ||
      currentUser?.name ||
      currentUser?.email?.split("@")[0] ||
      "",
  )
    .toLowerCase()
    .trim();
    const authorObj =
    typeof project?.author === "object" && project?.author !== null
      ? project.author
      : typeof project?.user === "object" && project?.user !== null
      ? project.user
      : null;

const rawUserId =
    authorObj?._id ||
    authorObj?.id ||
    project?.author_id ||
    project?.user_id ||
    project?.userId ||
    (typeof project?.author === "string" ? project.author : "") ||
    (typeof project?.user === "string" ? project.user : "");

const authorId = String(
  typeof rawUserId === "object" && rawUserId !== null 
    ? rawUserId._id || rawUserId.id 
    : rawUserId
)
  .trim()
  .replace(/^"|"$/g, ""); 
  
const projectUsername = String(
  authorObj?.username ||
      project?.author_name ||
      project?.authorName ||
      project?.username ||
      ""
  )
    .toLowerCase()
    .trim();

// Resolve Author Name display
const authorName =
    authorObj?.full_name ||
    authorObj?.fullName ||
    authorObj?.name ||
    authorObj?.username ||
    project?.author_name ||
    project?.authorName ||
    project?.username ||
    "Developer";

  
  const authorAvatar =
    typeof authorObj === "object" && authorObj !== null
      ? authorObj?.profilePicture ||
        authorObj?.avatar_url ||
        authorObj?.avatar ||
        authorObj?.image
      : project.avatar || project.author_avatar;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    authorName,
  )}&background=A04622&color=fff`;

const matchesId = Boolean(
  currentUserId && authorId && String(currentUserId) === String(authorId)
);

const matchesUsername = Boolean(
  currentUsername &&
  projectUsername &&
  currentUsername.toLowerCase() === projectUsername.toLowerCase()
);

// const isAuthor = Boolean(
  const isAuthor = Boolean(
    Boolean(isAuthorProp) || matchesId || matchesUsername
  );
  

console.log("AUTHOR EVALUATION RESULT:", { matchesId, matchesUsername, isAuthor });

  console.log("DEBUG AUTHOR CHECK:", {
    currentUserId,
    authorId,
    currentUsername,
    projectUsername,
    isAuthorProp,
    isAuthor,
  });

  const projectId = project._id || project.id;
console.log("PROJECT KEYS:", Object.keys(project || {}));
console.log("FULL PROJECT OBJ:", project);
  // Sync prop changes
  useEffect(() => {
    setProject(initialProject);
    setPhases(initialProject.phases || []);
    setUpdates(initialProject.updates || []);
    setEditForm({
      title: initialProject.title || "",
      tagline: initialProject.tagline || "",
      description: initialProject.description || "",
      demo_url: initialProject.demo_url || initialProject.demoUrl || "",
      github_url: initialProject.github_url || initialProject.githubUrl || "",
    });
    setStarCount(initialProject.stars || initialProject.star_count || 0);
  }, [initialProject]);

  // Project Update Handler
  const handleSaveProjectDetails = async (e) => {
    e.preventDefault();
    if (!isAuthor) return;

    setLoading(true);
    try {
      if (api) {
        const response = await api.put(`/api/projects/${projectId}`, editForm);
        setProject(response.data?.project || { ...project, ...editForm });
      } else {
        setProject({ ...project, ...editForm });
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update project:", err);
      alert(err.response?.data?.message || "Failed to save updates.");
    } finally {
      setLoading(false);
    }
  };

  // Project Delete Handler
  const handleDeleteProject = async () => {
    if (!isAuthor) return;

    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone.",
      )
    )
      return;
    setLoading(true);
    try {
      if (api) {
        await api.delete(`/api/projects/${projectId}`);
      }
      if (onDeleteSuccess) onDeleteSuccess(projectId);
      else if (onBack) onBack();
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert(err.response?.data?.message || "Failed to delete project.");
    } finally {
      setLoading(false);
    }
  };

  // Add Phase Handler
 // Add Phase Handler
  const handleAddPhase = async (e) => {
    e.preventDefault();
    if (!isAuthor || !newPhaseTitle.trim()) return;

    const updatedPhases = [
      ...phases,
      {
        title: newPhaseTitle,
        description: newPhaseDesc,
        completed: false,
        id: Date.now().toString(),
      },
    ];

    try {
      /* 🔴 Commented out until backend roadmap endpoint is ready
      if (api) {
        await api.put(`/api/projects/${projectId}`, { phases: updatedPhases });
      }
      */

      // 🟢 Local UI State Update
      setPhases(updatedPhases);
      setNewPhaseTitle("");
      setNewPhaseDesc("");
      setShowAddPhase(false);
    } catch (err) {
      console.error("Failed to add phase:", err);
      alert("Could not update roadmap phase.");
    }
  };

  // Toggle Phase Completion
  const handleTogglePhase = async (index) => {
    if (!isAuthor) return;
    const updatedPhases = phases.map((p, idx) =>
      idx === index ? { ...p, completed: !p.completed } : p,
    );

    try {
      /*  Commented out until backend roadmap endpoint is ready
      if (api) {
        await api.put(`/api/projects/${projectId}`, { phases: updatedPhases });
      }
      */

      // Local UI State Update
      setPhases(updatedPhases);
    } catch (err) {
      console.error("Failed to update phase status:", err);
    }
  };

  // Add Update Post Handler
  const handleAddUpdate = async (e) => {
    e.preventDefault();
    if (!isAuthor || !newUpdateText.trim()) return;

    setLoading(true);
    try {
      if (api) {
        // Try standard payload structure expected by common REST controllers
        const payload = {
          projectId: projectId,
          project_id: projectId, // Sending both keys prevents schema naming mismatches
          content: newUpdateText,
          body: newUpdateText,
        };

        const response = await api.post("/api/posts", payload);

        const createdPost = response.data?.post || response.data || {
          content: newUpdateText,
          createdAt: new Date().toISOString(),
          author: authorName,
        };

        setUpdates([createdPost, ...updates]);
      } else {
        const localEntry = {
          content: newUpdateText,
          createdAt: new Date().toISOString(),
          author: authorName,
        };
        setUpdates([localEntry, ...updates]);
      }

      setNewUpdateText("");
      setShowAddUpdate(false);
    } catch (err) {
      console.error("Failed to post update:", err.response?.data || err);
      // Display specific validation message returned from backend
      alert(
        err.response?.data?.message || 
        err.response?.data?.error || 
        "Failed to post update. Check request validation."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStarToggle = () => {
    setStarred(!starred);
    setStarCount((prev) => (starred ? prev - 1 : prev + 1));
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.tagline || project.description,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#1C1917] pb-12 font-sans">
      {/* Top Header Navigation & Author Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>

        {/* RESTRICTED: Author Action Controls */}
        {isAuthor && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors border border-stone-200 cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Project</span>
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
              >
                <X size={13} />
                <span>Cancel</span>
              </button>
            )}

            <button
              onClick={handleDeleteProject}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 transition-colors cursor-pointer"
            >
              {loading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Banner Header Card */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-16 h-16 rounded-2xl bg-[#A04622] text-white flex items-center justify-center font-bold text-xl border border-stone-200/60 shadow-xs shrink-0 overflow-hidden">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackAvatar;
                }}
              />
            ) : project.title ? (
              project.title.slice(0, 2).toUpperCase()
            ) : (
              "PR"
            )}
          </div>

          <div className="space-y-1.5 flex-1">
            {!isEditing ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                    {project.title || "Untitled Project"}
                  </h1>
                  <span className="bg-[#A04622]/10 text-[#A04622] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#A04622]/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A04622]"></span>
                    {project.status || "Active"}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
                  {project.tagline ||
                    project.description ||
                    "A project built on Foundry."}
                </p>
              </>
            ) : (
              <form
                onSubmit={handleSaveProjectDetails}
                className="space-y-3 max-w-xl"
              >
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#A04622]"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={editForm.tagline}
                    onChange={(e) =>
                      setEditForm({ ...editForm, tagline: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#A04622]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
                    }
                    className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#A04622]"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">
                      Demo URL
                    </label>
                    <input
                      type="url"
                      value={editForm.demo_url}
                      onChange={(e) =>
                        setEditForm({ ...editForm, demo_url: e.target.value })
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#A04622]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-500 uppercase">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={editForm.github_url}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          github_url: e.target.value,
                        })
                      }
                      className="w-full bg-white border border-stone-300 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none focus:border-[#A04622]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#A04622] hover:bg-[#8A3A1B] text-white text-xs font-semibold px-4 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  <span>Save Changes</span>
                </button>
              </form>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1">
                By{" "}
                <span className="font-semibold text-stone-800">
                  {authorName}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Updated{" "}
                {project.updatedAt || project.updated_at
                  ? new Date(
                      project.updatedAt || project.updated_at,
                    ).toLocaleDateString()
                  : "recently"}
              </span>
            </div>
          </div>
        </div>

        {/* Global Public Actions */}
        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
          <button
            onClick={handleStarToggle}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
              starred
                ? "bg-[#A04622] text-white shadow-xs"
                : "bg-[#A04622] text-white hover:bg-[#8A3A1B]"
            }`}
          >
            <Star size={14} className={starred ? "fill-white" : ""} />
            <span>Star {starCount}</span>
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isBookmarked
                ? "bg-stone-200 border-stone-300 text-stone-900"
                : "border-stone-200 hover:bg-stone-100 text-stone-600"
            }`}
          >
            <Bookmark
              size={15}
              className={isBookmarked ? "fill-stone-900" : ""}
            />
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-600 transition-colors cursor-pointer"
          >
            {copied ? (
              <Check size={15} className="text-emerald-600" />
            ) : (
              <Share2 size={15} />
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-stone-200 flex items-center gap-6 text-xs font-semibold text-stone-500 overflow-x-auto">
        {[
          "Overview",
          "Journey & Milestones",
          "Updates",
          "Resources & Code",
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 transition-colors relative cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "text-[#A04622] font-bold"
                : "hover:text-stone-900"
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A04622] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {activeTab === "Overview" && (
            <>
              <div className="bg-stone-900 rounded-3xl overflow-hidden border border-stone-200/80 shadow-xs relative group">
                <img
                  src={
                    project.cover_image_url ||
                    project.cover_image ||
                    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={project.title}
                  className="w-full h-80 object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
                {(project.demo_url || project.demoUrl) && (
                  <a
                    href={project.demo_url || project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-4 right-4 bg-[#A04622] hover:bg-[#8A3A1B] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                  >
                    <span>Launch Live Demo</span>
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  About this Project
                </h2>
                <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-line">
                  {project.description ||
                    project.tagline ||
                    "No description provided."}
                </p>
              </div>
            </>
          )}

          {(activeTab === "Overview" ||
            activeTab === "Journey & Milestones") && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-900">
                  Interactive Journey & Roadmap
                </h2>

                {/* RESTRICTED: Only Author can add Roadmap Phases */}
                {isAuthor && (
                  <button
                    onClick={() => setShowAddPhase(!showAddPhase)}
                    className="text-xs font-semibold text-[#A04622] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Add Phase
                  </button>
                )}
              </div>

              {isAuthor && showAddPhase && (
                <form
                  onSubmit={handleAddPhase}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Phase Title"
                    value={newPhaseTitle}
                    onChange={(e) => setNewPhaseTitle(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622]"
                    required
                  />
                  <textarea
                    placeholder="Brief description..."
                    value={newPhaseDesc}
                    onChange={(e) => setNewPhaseDesc(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622]"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPhase(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#A04622] text-white text-xs px-3 py-1 rounded-xl font-semibold cursor-pointer"
                    >
                      Save Phase
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {phases.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    No project roadmap phases published yet.
                  </p>
                ) : (
                  phases.map((phase, idx) => (
                    <div
                      key={phase.id || idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                          <CheckCircle2
                            size={15}
                            className={
                              phase.completed
                                ? "text-emerald-600"
                                : "text-stone-300"
                            }
                          />
                          {phase.title}
                        </span>

                        {/* RESTRICTED: Only Author can toggle phase status */}
                        {isAuthor ? (
                          <button
                            onClick={() => handleTogglePhase(idx)}
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold cursor-pointer border transition-colors ${
                              phase.completed
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200"
                                : "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200"
                            }`}
                          >
                            {phase.completed ? "Completed ✓" : "Mark Completed"}
                          </button>
                        ) : (
                          <span
                            className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold border ${
                              phase.completed
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : "bg-amber-100 text-amber-800 border-amber-200"
                            }`}
                          >
                            {phase.completed ? "Completed" : "In Progress"}
                          </span>
                        )}
                      </div>
                      {phase.description && (
                        <p className="text-[11px] text-stone-500 pl-6">
                          {phase.description}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {(activeTab === "Overview" || activeTab === "Updates") && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-stone-900">
                  Latest Project Updates
                </h2>

                {/* RESTRICTED: Only Author can post updates */}
                {isAuthor && (
                  <button
                    onClick={() => setShowAddUpdate(!showAddUpdate)}
                    className="text-xs font-semibold text-[#A04622] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> Post Update
                  </button>
                )}
              </div>

              {isAuthor && showAddUpdate && (
                <form
                  onSubmit={handleAddUpdate}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3"
                >
                  <textarea
                    placeholder="Share what's new on this project..."
                    value={newUpdateText}
                    onChange={(e) => setNewUpdateText(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl p-2.5 text-xs text-stone-800 focus:outline-none focus:border-[#A04622]"
                    rows={3}
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddUpdate(false)}
                      className="text-xs text-stone-500 hover:text-stone-800 px-3 py-1 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#A04622] text-white text-xs px-3 py-1 rounded-xl font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Send size={12} /> Post
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {updates.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">
                    No updates logged yet.
                  </p>
                ) : (
                  updates.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">
                          {item.author || authorName}
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "Recently"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "Resources & Code" && (
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-stone-900">
                Resources & Code Repositories
              </h2>
              <div className="space-y-3">
                {project.github_url || project.githubUrl ? (
                  <a
                    href={project.github_url || project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-stone-50 hover:bg-stone-100 p-4 rounded-2xl border border-stone-200/60 text-stone-800 text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <SiGithub size={18} />
                      <div>
                        <p className="font-bold">Source Code Repository</p>
                        <p className="text-[10px] text-stone-500 font-normal">
                          {project.github_url || project.githubUrl}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} className="text-stone-400" />
                  </a>
                ) : (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-400 text-xs">
                    No GitHub repository attached to this project.
                  </div>
                )}

                {project.demo_url || project.demoUrl ? (
                  <a
                    href={project.demo_url || project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between bg-[#A04622]/5 hover:bg-[#A04622]/10 p-4 rounded-2xl border border-[#A04622]/20 text-[#A04622] text-xs font-semibold transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ExternalLink size={18} />
                      <div>
                        <p className="font-bold">Live Application Demo</p>
                        <p className="text-[10px] text-[#A04622]/80 font-normal">
                          {project.demo_url || project.demoUrl}
                        </p>
                      </div>
                    </div>
                    <ExternalLink size={14} />
                  </a>
                ) : (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/60 text-stone-400 text-xs">
                    No live demo link attached.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Project Author
            </h2>
            <div className="flex items-center gap-3">
              <img
                src={authorAvatar || fallbackAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border border-stone-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackAvatar;
                }}
              />
              <div>
                <p className="text-xs font-bold text-stone-900">{authorName}</p>
                <p className="text-[10px] text-stone-500">Project Creator</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SubmitProjectModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    demo_url: "",
    github_url: "",
    tech_stack: "",
    category: "AI & ML",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Teammates state
  const [team, setTeam] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Image Upload Handlers
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSearchUsers = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const res = await api.get(
        `/api/users/search?q=${encodeURIComponent(query)}`,
      );
      const data = res.data?.users || res.data?.data || res.data || [];
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error searching builders:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = (user) => {
    const userId = user._id || user.id;
    if (!team.some((member) => (member._id || member.id) === userId)) {
      setTeam([...team, user]);
    }
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMember = (id) => {
    setTeam(team.filter((m) => (m._id || m.id) !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formattedTechStack = formData.tech_stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const teammateIds = team.map((member) => member._id || member.id);

    onSubmit({
      ...formData,
      tech_stack: formattedTechStack,
      team: teammateIds,
      cover_image: imageFile, // Passing raw File object directly
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-xl border border-stone-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-100 shrink-0">
          <h3 className="text-lg font-bold text-stone-900">Post New Project</h3>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Next.js App"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Tagline *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous runtime engine"
                value={formData.tagline}
                onChange={(e) =>
                  setFormData({ ...formData, tagline: e.target.value })
                }
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Project Display Image (cover_image)
              </label>
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-stone-200 group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 bg-[#F7F4F0] border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:bg-stone-100 transition-colors">
                  <Upload size={20} className="text-stone-400 mb-1" />
                  <span className="text-stone-600 font-medium text-xs">
                    Click to upload project cover image
                  </span>
                  <span className="text-stone-400 text-[10px] mt-0.5">
                    PNG, JPG, WebP up to 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Add Teammates (Foundry Builders)
              </label>
              {team.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {team.map((member) => (
                    <div
                      key={member._id || member.id}
                      className="flex items-center gap-1.5 bg-stone-100 border border-stone-200 pl-2 pr-1 py-1 rounded-full text-xs"
                    >
                      <span className="font-medium text-stone-800">
                        {member.name || member.username}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveMember(member._id || member.id)
                        }
                        className="p-0.5 rounded-full hover:bg-stone-200 text-stone-500 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchUsers(e.target.value)}
                  placeholder="Search builder by username or full name..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#A04622]"
                />

                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-stone-200 shadow-lg z-20 max-h-40 overflow-y-auto divide-y divide-stone-100">
                    {isSearching ? (
                      <p className="p-3 text-[11px] text-stone-400">
                        Searching...
                      </p>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((user) => (
                        <div
                          key={user._id || user.id}
                          onClick={() => handleAddMember(user)}
                          className="p-2.5 hover:bg-stone-50 flex items-center justify-between cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-stone-200 text-[10px] font-bold flex items-center justify-center text-stone-700">
                              {user.name ? user.name[0] : "U"}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-stone-800">
                                {user.name}
                              </p>
                              <p className="text-[10px] text-stone-400">
                                @{user.username || user.handle || "user"}
                              </p>
                            </div>
                          </div>
                          <UserPlus size={14} className="text-[#A04622]" />
                        </div>
                      ))
                    ) : (
                      <p className="p-3 text-[11px] text-stone-400">
                        No builders found
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Demo URL / Video Link
                </label>
                <input
                  type="url"
                  placeholder="https://youtu.be/..."
                  value={formData.demo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, demo_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#A04622]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  GitHub Repository URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#A04622]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="React, Next.js, TailwindCSS, MongoDB"
                  value={formData.tech_stack}
                  onChange={(e) =>
                    setFormData({ ...formData, tech_stack: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-[#A04622]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
              >
                <option value="AI & ML">AI & ML</option>
                <option value="Web Dev">Web Dev</option>
                <option value="Robotics">Robotics</option>
                <option value="Crypto">Crypto</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide Project details..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A04622] hover:bg-[#8A3A1B] text-white font-semibold disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  "Publish Project"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
