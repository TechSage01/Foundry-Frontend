import React, { useState } from "react";
import {
  ArrowLeft,
  Star,
  Users,
  TrendingUp,
  FileText,
  Bookmark,
  Share2,
  Clock,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  X,
} from "lucide-react";
import { SiGithub } from "react-icons/si";
export const ProjectComponents = ({ project, onBack }) => {
    const [activeTab, setActiveTab] = useState("");
  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto font-sans">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={16} />
          <span> Back to Projects</span>
        </button>
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-[#A04622]/10 rounded-2xl flex items-center justify-center shrink-0 border border-[#AO4622]/10 font-bold text-xl">
              {project.title.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-stone-900">
                  {project.title}
                </h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Active
                </span>
                <span className="bg-stone-100 text-stone-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                  Public
                </span>
              </div>
              <p className="text-xs text-stone-600 max-w-xl">
                {project.tagLine || project.tagLine}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-stone-400 pt-1 ">
                <span>By {project.authorName}</span>
                <span>.</span>
                <span>{project.category}</span>
                <span>.</span>
                <span>Updated {project.updatedAt || "recently"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 bg-[#A04622] text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-[#8A3A1B]">
              <Star size={14} className="fill-white" />
              <span>Star</span>
              {/* <span className="bg-black/20 px-1.5 py-0.5 rounded text-[10px]">
                {project.stars}
              </span> */}
              <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                {project.stars || "842"}
              </span>
            </button>
            <button className="p-2 rounded-xl border border-stone-200/80 hover:bg-stone-50 text-stone-600 transition-colors">
              <Bookmark size={15} />
            </button>
            <button className="p-2 rounded-xl border border-stone-200/80 hover:bg-stone-50 text-stone-600 transition-colors">
              <Share2 size={15} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-stone-200/50 p-1.5 rounded-2xl text-xs font-medium border border-stone-200/60 overflow-x-auto">
          {[
            "Overview",
            "Journey & Milestones",
            "Updates",
            "Team",
            "Documents",
            "Resources & Code",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-stone-900 shadow-sm font-semibold"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 h-72">
              <img
                src={project.bannerImage}
                alt="Project Demo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-stone-900">
                About This Project
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {project.description ||
                  "Modern robotics and high-performance framework engineered for precision motion planning and inverse kinematics."}
              </p>
              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">
                    Frame Latency
                  </p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    16.4 ms
                  </p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">
                    WASM Bundle Size
                  </p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    84 KB
                  </p>
                </div>
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-semibold uppercase">
                    Compute Speedup
                  </p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    14.2x
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-stone-900">
                  Interactive Journey & Roadmap
                </h3>
                <span className="text-[11px] font-semibold text-stone-400">
                  Phase 2 of 3
                </span>
              </div>
              <div className="space-y-3">
                <div className="border border-stone-200/80 bg-stone-50/50 rounded-2xl p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <h4 className="text-xs font-bold text-stone-900">
                        Phase 1: Core Kinematics Pipeline
                      </h4>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      Completed
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 pl-6">
                    Established inverse kinematics core module with 99.9% solver
                    accuracy.
                  </p>
                </div>
                <div className="border-2 border-[#A04622]/40 bg-white rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#A04622]" />
                      <h4 className="text-xs font-bold text-stone-900">
                        Phase 2: WebAssembly Integration
                      </h4>
                    </div>
                    <span className="bg-[#A04622] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      In Progress
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 pl-6">
                    Compiling C++ spatial indexing algorithms directly to Wasm
                    for web runtime.
                  </p>
                </div>
                <div className="border-2 border-[#A04622]/40 bg-white rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-[#A04622]" />
                      <h4 className="text-xs font-bold text-stone-900">
                        Phase 2: WebAssembly Integration
                      </h4>
                    </div>
                    <span className="bg-[#A04622] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                      In Progress
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 pl-6">
                    Compiling C++ spatial indexing algorithms directly to Wasm
                    for web runtime.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 space-y-6 ">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200/60 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A04622]">
                  Open Opportunity
                </span>
                <Sparkles size={14} className="text-[#A04622]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  Robotics & Wasm Contributor
                </h4>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Seeking a developer with C++ and WebAssembly experience to
                  help optimize kinematic solvers.
                </p>
              </div>
              <button className="w-full bg-[#A04622] hover:bg-[#8A3A1B] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm cursor-pointer">
                Apply with Profile
              </button>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-4">
              <h4 className="text-xs font-extrabold text-stone-900">
                Core Team (3)
              </h4>
              <div className="space-y-3">
                {[
                  {
                    name: "TechSage",
                    role: "Lead Engineer",
                    avatar: "https://i.pravatar.cc/100?img=12",
                  },
                  {
                    name: "Paul",
                    role: "DevOps & Infrastructure",
                    avatar: "https://i.pravatar.cc/100?img=33",
                  },
                ].map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border border-stone-200 object-cover"
                      />
                      <div>
                        <p className="text-xs font-bold text-stone-900">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-stone-400">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-stone-200/80 shadow-sm space-y-3">
              <h4 className="text-xs font-extrabold text-stone-900">
                Traction & Health
              </h4>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-medium">
                    Monthly Views
                  </p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">
                    12.4k
                  </p>
                </div>
                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-medium">
                    Contributors
                  </p>
                  <p className="text-sm font-bold text-stone-900 mt-0.5">18</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-stone-900 uppercase">
                  Resources and Code
                </h4>
                <a
                  href={project.githubUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200/60 text-xs text-stone-700 font-medium "
                >
                  <div className="flex items-center gap-2">
                    <SiGithub size={15} />
                    <span>Github Repository</span>
                  </div>
                  <ExternalLink size={13} className="text-stone-400" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const SubmitProjectModal = ({ onClose, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState("");
  const [tagLine, setTagLine] = useState("");
  const [category, setCategory] = useState("AI $ ML");
  const [description, setDescription] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !tagLine.trim()) return;

    onSubmit({
      title: title.trim(),
      tagLine: tagLine.trim(),
      category,
      description: description.trim(),
      bannerImage:
        bannerImage.trim() ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
      version: "v1.0.0",
    });
  };
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-lg font-bold text-stone-900">
              Post New Project
            </h3>
            <button
              onClick={onClose}
              type="button"
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Next.js App"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                TagLine
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Autonomous runtime engine"
                value={tagLine}
                onChange={(e) => setTagLine(e.target.value)}
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
                >
                  <option>AI & ML</option>
                  <option>Web Dev</option>
                  <option>Robotics</option>
                  <option>Crypto</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622]"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1 ">
                Description
              </label>
              <textarea
                name=""
                id=""
                rows={3}
                placeholder="Provide a Project details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F7F4F0] p-3 rounded-xl border border-stone-200 focus:outline-none focus:border-[#A04622] resize-none"
              />
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#A04622] hover:bg-[#8A3A1B] text-white font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Publish Project"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
