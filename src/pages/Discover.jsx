import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  GitFork,
  MessageCircle,
  Bookmark,
  Star,
  Folder,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { INITIAL_PROJECTS } from "../data/projectData";
import {
  ProjectComponents,
  SubmitProjectModal,
} from "../components/ProjectComponents";

const Discover = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeCategory, setActiveCategory] = useState("ALL Trending");
  const [activeTab, setActiveTab] = useState("discover");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const CURRENT_USER_ID = "techsage-me";
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // const res = await axios.get('/api/projects');
        // setProjects(res.data);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);
  const handleCreateProject = async (newProjectData) => {
    try {
      setLoading(true);
      // Backend integration example:
      // const res = await axios.post('/api/projects', newProjectData);
      // setProjects([res.data, ...projects]);

      const localCreatedProject = {
        ...newProjectData,
        id: Date.now().toString(),
        updatedAt: "Just now",
        stars: "0",
        likes: 0,
        comments: "0",
        authorId: CURRENT_USER_ID,
        authorname: "TechSage",
      };
      setProjects([localCreatedProject, ...projects]);
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error("Failed to Create Project:", err);
    } finally {
      setLoading(false);
    }
  };
  const filteredProjects = projects.filter((p) => {
    if (activeTab === "my-projects") return p.authorId === CURRENT_USER_ID;
    if (activeCategory === "All Trending") return true;
    return p.category.toLowerCase() === activeCategory.toLowerCase();
  });
  const featuredProject = projects.find((p) => p.isFeatured) || projects[0];
  return (
    <>
      <div className="min-h-screen bg-[#FAF9F6] text-[#1C1917] font-sans pb-16">
        {/* <header className='sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/80 px-6 py-3 flex items-center justify-between'>
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                    type="text"
                    placeholder="Search builders, projects, ideas..."
                    className="w-full bg-[#F5F5F4] pl-9 pr-4 py-2 rounded-xl text-xs font-medium focus:outline-none"
                    />
                </div>
            </div>
            <button onClick={()=> setIsSubmitModalOpen(true)}
                className='flex items-center gap-2 bg-[#A04622] hover:bg-[#8A3A1B] text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-sm'    
            >
                <Plus size={15}/>
                <span>Post Project</span>
            </button>
        </header> */}
        <main className="max-w-7xl mx-auto px-6 pt-6">
          {selectedProject ? (
            <ProjectComponents
              project={selectedProject}
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
                  {/* Tab Selector */}
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
                        {
                          projects.filter((p) => p.authorId === CURRENT_USER_ID)
                            .length
                        }
                      </span>
                    </button>
                  </div>

                  {/* Post Project Primary CTA */}
                  <button
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="flex items-center gap-2 bg-[#A04622] hover:bg-[#8A3A1B] text-white px-4 py-2.5 rounded-2xl text-xs font-semibold cursor-pointer shadow-sm hover:shadow transition-all active:scale-95 shrink-0"
                  >
                    <Plus size={16} />
                    <span>Post Project</span>
                  </button>
                </div>
              </div>

              {/* FEATURED SPOTLIGHT  */}
              {activeTab === "discover" && featuredProject && (
                <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-7 relative group overflow-hidden rounded-2xl h-64 bg-stone-900">
                    <span className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-md z-10">
                      Featured Spotlight
                    </span>
                    <img
                      src={featuredProject.bannerImage}
                      alt={featuredProject.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="lg:col-span-5 space-y-4">
                    <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium">
                      <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md">
                        {featuredProject.category}
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
                      {featuredProject.tagLine || featuredProject.tagline}
                    </p>
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">
                      {featuredProject.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                      <div className="flex -space-x-1.5">
                        <img
                          src="https://i.pravatar.cc/100?img=1"
                          alt="builder"
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                        <img
                          src="https://i.pravatar.cc/100?img=2"
                          alt="builder"
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                        <img
                          src="https://i.pravatar.cc/100?img=3"
                          alt="builder"
                          className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        />
                        <span className="w-6 h-6 rounded-full bg-stone-200 text-[9px] font-semibold flex items-center justify-center border-2 border-white text-stone-700">
                          +12
                        </span>
                      </div>
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
                      <button className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-colors">
                        <Bookmark size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid display */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-stone-900">
                    {activeTab === "my-projects"
                      ? "Your Projects"
                      : "Trending Projects"}
                  </h3>
                  <button className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1">
                    View all <ArrowRight size={13} />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setSelectedProject(project)}
                      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm p-4 space-y-3 cursor-pointer hover:border-stone-300 transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        <div className="h-36 bg-stone-100 rounded-xl overflow-hidden relative">
                          <img
                            src={project.bannerImage}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-stone-400 font-medium">
                          <span className="bg-stone-100 text-stone-700 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                            {project.category}
                          </span>
                          <span>{project.version || "v1.0.0"}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm group-hover:text-[#A04622] transition-colors">
                            {project.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                            {project.tagLine ||
                              project.tagline ||
                              project.description}
                          </p>
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
              </div>
              {activeTab === "discover" && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-stone-900">
                      Active Builder Communities
                    </h3>
                    <button className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1">
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
    </>
  );
};

export default Discover;
