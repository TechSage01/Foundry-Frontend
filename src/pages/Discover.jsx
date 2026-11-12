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
} from "lucide-react";
import { INITIAL_PROJECTS } from "../data/projectData";
import api from "../services/api";
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

const Discover = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All Trending");
  const [activeTab, setActiveTab] = useState("discover");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Safely retrieve current user object and username
  const userRaw = JSON.parse(localStorage.getItem("user") || "{}");
  const user = userRaw.user || userRaw.data || userRaw;
  
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

  const communities = [
    {
      id: "comm-1",
      badge: "AI",
      title: "Autonomous Agents Guild",
      description:
        "Weekly syncs, prompt engineering workshops, and open-source hackathons.",
      members: "1,240 members",
      threads: "42 active threads",
    },
    {
      id: "comm-2",
      badge: "HW",
      title: "Hardware & Robotics Collective",
      description:
        "Sharing PCB designs, embedded rust code, and sensor integration tips.",
      members: "850 members",
      threads: "18 active threads",
    },
  ];

  // 1. Fetch Discovery Hub Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/projects");

        const rawData = res.data;
        const projectsArray = Array.isArray(rawData)
          ? rawData
          : rawData?.projects || rawData?.data || [];

        if (projectsArray.length > 0) {
          setProjects(projectsArray);
        }
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

        setUserProjects(fetchedUserProjects);
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

      setUserProjects((prev) => [createdProject, ...prev]);
      setProjects((prev) => [createdProject, ...prev]);

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
    projects.find((p) => p.isFeatured) || projects[0] || null;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] font-sans pb-16">
      <main className="max-w-7xl mx-auto px-6 pt-6">
        {selectedProject ? (
          <ProjectComponents
            project={selectedProject}
            currentUser={user}
            api={api}
            isAuthor={true}
            onBack={() => setSelectedProject(null)}
          />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#A04622]"></span>
                  <p className="text-[11px] font-bold tracking-wider uppercase text-[#A04622]">
                    {activeTab === "my-projects"
                      ? "WORKSPACE"
                      : "DISCOVERY HUB"}
                  </p>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
                  {activeTab === "my-projects"
                    ? "My Created Projects"
                    : "Explore Builder Projects"}
                </h1>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-stone-100 p-1 rounded-2xl border border-stone-200/80 shadow-inner">
                  <button
                    onClick={() => setActiveTab("discover")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      activeTab === "discover"
                        ? "bg-white text-stone-900 shadow-sm border border-stone-200/50"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    Discover
                  </button>
                  <button
                    onClick={() => setActiveTab("my-projects")}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center gap-2 cursor-pointer ${
                      activeTab === "my-projects"
                        ? "bg-white text-stone-900 shadow-sm border border-stone-200/50"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    <Folder
                      size={14}
                      className={
                        activeTab === "my-projects"
                          ? "text-[#A04622]"
                          : "text-stone-400"
                      }
                    />
                    <span>My Projects</span>
                    <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-stone-200/70 text-[10px] text-stone-700">
                      {userProjects.length}
                    </span>
                  </button>
                </div>

                <button
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="flex items-center gap-2 bg-[#A04622] hover:bg-[#8A3A1B] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
                >
                  <Plus size={16} />
                  <span>Post Project</span>
                </button>
              </div>
            </div>

            {/* FEATURED SPOTLIGHT */}
            {activeTab === "discover" && featuredProject && (
              <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 relative group overflow-hidden rounded-2xl h-64 bg-stone-900">
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
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                    <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md">
                      {featuredProject.category || featuredProject.categoryName || featuredProject.category_name || "General"}
                    </span>
                    <span>•</span>
                    <span>
                      {featuredProject.updatedAt || "Recently updated"}
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
                      <span className="flex items-center gap-1 font-medium">
                        <Star size={13} className="text-stone-400" />{" "}
                        {featuredProject.stars || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setSelectedProject(featuredProject)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {displayedProjects.map((project) => (
                    <div
                      key={project._id || project.id}
                      onClick={() => setSelectedProject(project)}
                      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 space-y-3 cursor-pointer hover:border-stone-300 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="h-36 bg-stone-100 rounded-xl overflow-hidden relative">
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
                          <span>{project.version || "v1.0.0"}</span>
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
                        <span className="flex items-center gap-1">
                          <Star size={13} /> {project.stars || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork size={13} /> {project.forks || 0} forks
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={13} /> {project.comments || 0}
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
                  <button className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer">
                    Browse all <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {communities.map((comm) => (
                    <div
                      key={comm.id}
                      className="bg-white rounded-2xl border border-stone-200/80 p-5 flex items-center justify-between gap-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs shrink-0">
                          {comm.badge}
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-stone-900 text-xs">
                            {comm.title}
                          </h4>
                          <p className="text-xs text-stone-500 max-w-xs">
                            {comm.description}
                          </p>
                          <p className="text-[11px] text-stone-400">
                            {comm.members} • {comm.threads}
                          </p>
                        </div>
                      </div>
                      <button className="bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer">
                        Join
                      </button>
                    </div>
                  ))}
                </div>
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