import React, { useState, useMemo } from "react";
import MainLayout from "../components/layout/MainLayout";
import foundryLogo from "../assets/foundry-logo.png";
import {
  Search,
  Filter,
  Bookmark,
  MessageSquare,
  Share2,
  TrendingUp,
  Flame,
  Activity,
  ArrowUpRight,
  Download,
  Terminal,
  ExternalLink,
  X
} from "lucide-react";

export default function ExplorePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Stream");

  // Interactive State
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [upvotes, setUpvotes] = useState({
    1: { count: 48, upvoted: false },
    2: { count: 89, upvoted: false },
    3: { count: 34, upvoted: false },
    4: { count: 62, upvoted: false },
  });

  // Modal States
  const [isDevlogModalOpen, setIsDevlogModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [newLogContent, setNewLogContent] = useState("");

  const filterTabs = [
    "All Stream",
    "Milestones Completed",
    "R&D Architecture",
    "Performance Benchmarks",
    "Open Infrastructure",
  ];

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Aether Spatial Engine",
      badge: "VAST",
      category: "Performance Benchmarks",
      time: "2h ago",
      handle: "@aether_spatial",
      content:
        "v0.8.2 Octree Raymarching released with zero-copy Rust bindings. Achieved 142 FPS at 4K rendering across unified memory hardware with sub-millisecond dispatch cycles.",
      codeSnippet: `// benchmark dispatch system                  142.2 FPS • 2.1ms FRAME TARGET
let octree_buffer = OctreeBuffer::from_raw_parts(ptr, len);
let dispatch = pass.set_bind_group(0, &octree_buffer.webgpu_bind());
match dispatch.compute_octree_depth(RayConfig::ULTRA_PRECISION) {
    Ok(frame_no) => telemetry.record_latency(frame_no),
    Err(err) => panic!("Buffer Lock Failure: {:?}", err),
}`,
      tags: ["rust", "webgpu", "graphics", "3d-raymarching"],
      comments: 12,
      repo: "aether-engine • v0.8.2",
    },
    {
      id: 2,
      author: "HyperGraph AI",
      badge: "Milestone 2 Completed",
      category: "Milestones Completed",
      time: "4h ago",
      handle: "@hypergraph_ai",
      content:
        "Decentralized pipeline for LLM inference on consumer GPUs. Milestone 2 completed: Zero-sharding parameter routing across 128 distributed RTX nodes with <14ms inter-token overhead.",
      metricTitle: "INFERENCE LATENCY TARGET",
      metricValue: "13.8 ms/tok",
      tags: ["ai-ml", "cuda", "distributed"],
      comments: 24,
      repo: "hypergraph-core",
    },
    {
      id: 3,
      author: "Kira Micro-Kernel",
      badge: "Debug Update",
      category: "R&D Architecture",
      time: "7h ago",
      handle: "@kirakernel",
      content:
        "Deterministic task scheduler implemented in C++20 for high-frequency trading robotics. Zero dynamic allocation on critical paths with deterministic jitter upper bounds of <190 nanoseconds under simulated core starvation.",
      codeSnippet: `● SIMULATION SUITE (48 CORES 128 THREADS)                     PASS (1,000,000 CYCLES)
[0.000003] SCHED_INIT: Core pinning verified on affinity mask 0x0000FFFF
[0.000005] JITTER_TEST: Jitter peak 184ns | Jitter max: 190ns
[0.000009] WATCHDOG: 0 context-deadline faults across 10^7 preempt iterations.`,
      tags: ["cpp20", "kernel", "hft", "low-latency"],
      comments: 9,
      repo: "kirakernel • Apache 2.0",
    },
    {
      id: 4,
      author: "VectorDB Mesh",
      badge: "Formal RFC",
      category: "Open Infrastructure",
      time: "11h ago",
      handle: "@vectordb_mesh",
      content:
        "RFC 104: Partitioning distributed vector indexes without consensus bottlenecks. Proposing an asynchronous group protocol for HNSW graph partition replication.",
      document: {
        title: "RFC-104-VectorMesh-ConsensusDraft.pdf",
        meta: "24 pages • Mathematical proof appendices included • 7.2 MB",
      },
      tags: ["vector-database", "hnsw", "rfc", "consensus"],
      comments: 17,
      repo: "Status: Under Review",
    },
  ]);

  // Toggle Upvotes
  const handleUpvote = (id) => {
    setUpvotes((prev) => {
      const current = prev[id] || { count: 0, upvoted: false };
      return {
        ...prev,
        [id]: {
          count: current.upvoted ? current.count - 1 : current.count + 1,
          upvoted: !current.upvoted,
        },
      };
    });
  };

  // Toggle Bookmarks
  const handleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Native Share / Clipboard Fallback
  const handleShare = async (post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.author,
          text: post.content,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Post link copied to clipboard!");
    }
  };

  // Add New Devlog
  const handleCreateDevlog = (e) => {
    e.preventDefault();
    if (!newLogContent.trim()) return;

    const newPost = {
      id: Date.now(),
      author: "Adebimpe A.",
      badge: "Builder",
      category: "All Stream",
      time: "Just now",
      handle: "@adebimpe",
      content: newLogContent,
      tags: ["devlog", "foundry"],
      comments: 0,
      repo: "main-branch",
    };

    setPosts([newPost, ...posts]);
    setUpvotes((prev) => ({ ...prev, [newPost.id]: { count: 1, upvoted: true } }));
    setNewLogContent("");
    setIsDevlogModalOpen(false);
  };

  // Filter Posts by Active Tab and Search Term
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesTab =
        activeTab === "All Stream" || post.category === activeTab;
      const matchesSearch =
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return matchesTab && matchesSearch;
    });
  }, [posts, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] font-sans selection:bg-[#D87A56]/20">
      <nav className="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-stone-200/60 px-4 sm:px-6 py-3.5 max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="bg-[#FAF1EB] p-1.5 rounded-lg border border-stone-200/50">
              <img
                src={foundryLogo}
                alt="Foundry"
                className="w-5 h-5 object-contain"
              />
            </div>
            <span className="font-semibold text-lg tracking-tight text-stone-900">
              Foundry
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-7 text-xs font-medium text-stone-600">
            <a href="/manifesto" className="font-bold hover:text-stone-900 transition-colors">
              Manifesto
            </a>
            <a href="/explore" className="font-bold text-[#C66A47] hover:text-stone-900 transition-colors">
              Explore
            </a>
            <a href="/projects" className="hover:text-stone-900 transition-colors">
              Projects
            </a>
            <a href="/opportunities" className="hover:text-stone-900 transition-colors">
              Opportunities
            </a>
            <a href="#pricing" className="hover:text-stone-900 transition-colors">
              Pricing & Ecosystem
            </a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a href="/signin" className="text-xs font-medium text-stone-700 hover:text-stone-900 px-2 sm:px-3 py-2 hidden sm:inline-block">
              Sign In
            </a>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="px-3 sm:px-4 py-2 bg-[#C66A47] hover:bg-[#782B31] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              Join Foundry
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-stone-700 hover:bg-stone-200/50 transition-colors focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-200/60 mt-3 pt-3 pb-2 flex flex-col gap-3 font-medium text-sm text-stone-700 w-full">
            <a href="/manifesto" onClick={() => setIsMobileMenuOpen(false)} className="font-bold text-[#C66A47] px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors">
              Manifesto
            </a>
            <a href="/explore" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors">
              Explore
            </a>
            <a href="/projects" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors">
              Projects
            </a>
            <a href="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors">
              Opportunities
            </a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="px-2 py-1.5 hover:bg-stone-100 rounded-md transition-colors">
              Pricing & Ecosystem
            </a>
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between sm:hidden">
              <a href="/signin" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-semibold text-stone-700 hover:text-stone-900">
                Sign In
              </a>
            </div>
          </div>
        )}
      </nav>

      <div className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans pb-16">
        <section className="max-w-7xl mx-auto px-4 pt-8 pb-6 border-b border-stone-200/60">
          <div className="flex items-center justify-between text-xs font-semibold text-[#A04622] uppercase tracking-wider mb-2">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A04622] animate-pulse" />
              Public Platform Stream • Real-Time
            </span>
            <span className="text-stone-400">
              4,218 active builder nodes shipping products
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
            Live pulse of global builders shipping code.
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Discover real-time devlogs, architectural RFCs, milestone completions, and open engineering breakthroughs across the network.
          </p>

          <div className="mt-6 flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search devlogs, tech stacks, repositories, or builder handles..."
                className="w-full pl-10 pr-16 py-2.5 bg-white border border-stone-200 rounded-xl text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] transition shadow-xs"
              />
              <span className="absolute right-3 top-3 text-[10px] font-mono font-semibold bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200">
                ⌘K
              </span>
            </div>

            <button
              onClick={() => setActiveTab("All Stream")}
              className="w-full md:w-auto px-5 py-2.5 bg-[#A04622] hover:bg-[#85381a] text-white text-sm font-semibold rounded-xl shadow-xs transition active:scale-95 shrink-0"
            >
              Reset Filter
            </button>
          </div>

          <div className="flex items-center justify-between gap-2 overflow-x-auto pt-4 no-scrollbar">
            <div className="flex items-center gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeTab === tab
                      ? "bg-[#A04622] text-white shadow-xs"
                      : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200/70"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <span className="text-xs text-stone-400 shrink-0 hidden lg:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Auto-update active
            </span>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className="lg:col-span-8 space-y-6">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center font-bold text-stone-700 text-xs">
                  A
                </div>
                <div>
                  <h2 className="text-xs font-bold text-stone-900">
                    Shipped an optimization or milestone today?
                  </h2>
                  <p className="text-[11px] text-stone-400">
                    Broadcast a log or architectural update directly to the peer network.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDevlogModalOpen(true)}
                className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200/70 text-stone-800 text-xs font-semibold rounded-lg transition border border-stone-200/80 shrink-0"
              >
                Write Devlog
              </button>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-stone-200/80 p-8">
                <p className="text-stone-500 text-sm">No engineering logs match your search criteria.</p>
              </div>
            ) : (
              filteredPosts.map((post) => {
                const postUpvote = upvotes[post.id] || { count: 0, upvoted: false };
                const isBookmarked = bookmarkedIds.has(post.id);

                return (
                  <article
                    key={post.id}
                    className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-xs space-y-4 hover:border-stone-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FDF4F0] border border-[#f6e2d9] text-[#A04622] font-bold text-xs flex items-center justify-center">
                          {post.author.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-stone-900 text-sm">
                              {post.author}
                            </h3>
                            <span className="px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold rounded-md border border-stone-200/60">
                              {post.badge}
                            </span>
                            <span className="text-xs text-stone-400">
                              • {post.time}
                            </span>
                          </div>
                          <span className="text-xs text-stone-400 font-mono">
                            {post.handle}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleBookmark(post.id)}
                        className={`transition ${
                          isBookmarked ? "text-[#A04622] fill-[#A04622]" : "text-stone-400 hover:text-stone-700"
                        }`}
                      >
                        <Bookmark size={16} fill={isBookmarked ? "currentColor" : "none"} />
                      </button>
                    </div>

                    <p className="text-stone-800 text-xs md:text-sm leading-relaxed font-normal">
                      {post.content}
                    </p>

                    {post.codeSnippet && (
                      <div className="bg-[#1C1C1C] text-stone-200 rounded-xl p-3.5 font-mono text-xs overflow-x-auto shadow-inner">
                        <pre className="text-[11px] leading-relaxed">
                          <code>{post.codeSnippet}</code>
                        </pre>
                      </div>
                    )}

                    {post.metricValue && (
                      <div className="bg-[#FAF8F5] border border-stone-200/80 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                            {post.metricTitle}
                          </span>
                          <strong className="text-xl font-bold text-stone-900 font-mono">
                            {post.metricValue}
                          </strong>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                          On-par benchmark
                        </span>
                      </div>
                    )}

                    {post.document && (
                      <div className="bg-[#FAF8F5] border border-stone-200/80 p-3.5 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-stone-200 text-stone-600">
                            <Terminal size={18} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-900 font-mono">
                              {post.document.title}
                            </h4>
                            <span className="text-[11px] text-stone-400">
                              {post.document.meta}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => alert(`Downloading ${post.document.title}...`)}
                          className="p-2 text-stone-500 hover:text-stone-900 transition"
                        >
                          <Download size={16} />
                        </button>
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => setSearchQuery(tag)}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200/70 text-stone-600 text-[10px] font-semibold rounded-md transition"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleUpvote(post.id)}
                          className={`flex items-center gap-1.5 transition ${
                            postUpvote.upvoted ? "text-[#A04622] font-bold" : "hover:text-stone-900"
                          }`}
                        >
                          <TrendingUp size={14} />
                          <span>{postUpvote.count}</span>
                        </button>

                        <button
                          onClick={() => alert(`Opening comments for ${post.author}...`)}
                          className="flex items-center gap-1.5 hover:text-stone-900 transition"
                        >
                          <MessageSquare size={14} />
                          <span>{post.comments}</span>
                        </button>

                        <button
                          onClick={() => handleShare(post)}
                          className="hover:text-stone-900 transition"
                        >
                          <Share2 size={14} />
                        </button>

                        <span className="text-[11px] font-mono text-stone-400">
                          {post.repo}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </main>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
              <span className="text-[10px] font-bold text-[#A04622] uppercase tracking-wider flex items-center gap-1">
                <Flame size={12} /> Why The Foundry Stream
              </span>
              <h3 className="text-lg font-serif font-bold text-stone-900 leading-snug">
                Document your journey. Broadcast milestones to 42,000+ builders.
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Showcase technical depth, link automated git telemetry, receive code reviews, and tap into direct grants.
              </p>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="w-full py-2.5 bg-[#A04622] hover:bg-[#85381a] text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                Create Builder Profile →
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-[#A04622]" />
                  Trending Topics
                </h3>
                <span className="text-[10px] text-stone-400">Past 7d</span>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { tag: "WebGPU", devlogs: "142 devlogs • +38% this week" },
                  { tag: "RustLang", devlogs: "1,120 devlogs • High peer-review volume" },
                  { tag: "DistributedSystems", devlogs: "67 devlogs • 14 RFC drafts" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    onClick={() => setSearchQuery(item.tag)}
                    className="w-full flex items-center justify-between text-left hover:bg-stone-50 p-1.5 rounded-lg transition"
                  >
                    <div>
                      <h4 className="font-bold text-stone-800">#{item.tag}</h4>
                      <span className="text-[11px] text-stone-400">{item.devlogs}</span>
                    </div>
                    <ArrowUpRight size={14} className="text-stone-400" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Flame size={16} className="text-[#A04622]" />
                  Velocity Leaders
                </h3>
                <button className="text-[11px] text-stone-400 hover:text-stone-700">
                  View All
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { name: "Takeda K.", handle: "@takeda_tech", streak: "48d streak", score: "42.8k pts" },
                  { name: "Elena Rostova", handle: "@elena_dev", streak: "28d streak", score: "38.1k pts" },
                  { name: "Marcus Vance", handle: "@mvance_rust", streak: "21d streak", score: "31.4k pts" },
                ].map((leader, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 font-bold text-stone-700 flex items-center justify-center text-xs">
                        {leader.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900">{leader.name}</h4>
                        <span className="text-[11px] text-stone-400 font-mono">{leader.handle}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-stone-900 block">{leader.streak}</span>
                      <span className="text-[10px] text-stone-400">{leader.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                  <Activity size={16} className="text-[#A04622]" />
                  Live Network Pulse
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2 font-mono text-[11px] text-stone-600">
                <p>
                  <span className="text-stone-400">summit-1</span> pushed commit{" "}
                  <span className="text-stone-900 font-bold">a1e0f_f</span> (aether-engine){" "}
                  <span className="text-stone-400">2m ago</span>
                </p>
                <p>
                  <span className="text-stone-400">sergei-k</span> opened draft{" "}
                  <span className="text-stone-900 font-bold">lambda_arch merged PR #401</span> in auto-trains{" "}
                  <span className="text-stone-400">5m ago</span>
                </p>
                <p>
                  <span className="text-stone-400">r01-ballad</span> completed security{" "}
                  <span className="text-stone-900 font-bold">#61.1 audit review</span> approved on RFC-104{" "}
                  <span className="text-stone-400">11m ago</span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* WRITE DEVLOG MODAL */}
      {isDevlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-stone-900">Broadcast Devlog</h3>
              <button onClick={() => setIsDevlogModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateDevlog} className="space-y-4">
              <textarea
                value={newLogContent}
                onChange={(e) => setNewLogContent(e.target.value)}
                placeholder="What technical milestone or optimization did you ship today?"
                className="w-full h-32 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#A04622]/20 focus:border-[#A04622] resize-none"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDevlogModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#A04622] text-white text-xs font-semibold rounded-xl hover:bg-[#85381a]"
                >
                  Publish Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE PROFILE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-stone-900">Join Foundry</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-stone-500">
              Create your profile to broadcast milestones, connect git repositories, and receive peer reviews.
            </p>
            <input
              type="text"
              placeholder="Full Name"
              className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#A04622]"
            />
            <input
              type="email"
              placeholder="Engineering Email"
              className="w-full p-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#A04622]"
            />
            <button
              onClick={() => {
                alert("Profile registration initiated!");
                setIsProfileModalOpen(false);
              }}
              className="w-full py-2.5 bg-[#A04622] text-white text-xs font-semibold rounded-xl hover:bg-[#85381a]"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </div>
  );
}