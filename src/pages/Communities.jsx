import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Communities.css";
import {
  Plus,
  Search,
  ArrowUpRight,
  Users,
  MessageCircle,
  Brain,
  Layers,
  Globe,
  Bot,
  Eye,
  Layout,
  Loader2,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import {
  fetchCommunities,
  fetchMyCommunities,
  joinCommunityApi,
  leaveCommunityApi,
} from "../services/communities";

const categories = [
  { label: "All", value: "all" },
  { label: "Systems", value: "systems" },
  { label: "Web Dev", value: "web-dev" },
  { label: "AI & ML", value: "ai" },
  { label: "Distributed Systems", value: "distributed-systems" },
  { label: "Robotics", value: "robotics" },
];

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loadingMore, setLoadingMore] = useState(null);
  const [error, setError] = useState("");

  const PAGE_SIZE = 12;
  const loadCommunities = async (
    pageToLoad,
    append,
    isCancelled = () => false,
  ) => {
    try {
      append ? setLoadingMore(true) : setLoading(true);
      setError("");
      const res =
        view === "mine"
          ? await fetchMyCommunities({ page: pageToLoad, limit: PAGE_SIZE })
          : await fetchCommunities({
              page: pageToLoad,
              limit: PAGE_SIZE,
              category: activeCategory !== "all" ? activeCategory : undefined,
              search: searchQuery.trim() || undefined,
            });

      if (isCancelled()) return;
      setCommunities((prev) => (append ? [...prev, ...res.items] : res.items));
      setPage(pageToLoad);
      setTotalPages(
        res.totalPages ??
          (res.items.length === PAGE_SIZE ? pageToLoad + 1 : pageToLoad),
      );
    } catch (error) {
      if (!isCancelled()) return;
      console.error(
        "Error fetching communities:",
        err.response?.status,
        err.response?.data,
      );
      setError(
        err.response?.status === 429
          ? "Too many requests. Please wait a moment."
          : "Could not load communities right now.",
      );
    } finally {
      if (!isCancelled()) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => loadCommunities(1, false, () => cancelled), 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [activeCategory, searchQuery, view]);

  const formatBuilders = (number) => {
    if (!number) return 0;
    if (number >= 1000) return `${(number / 1000).toFixed(1)}k`;
    return number;
  };

  const handleJoinToggle = async (community) => {
    const id = community.id || community._id;
    if (!id || joiningId) return;
    const isMember = community.is_joined ?? community.isMember ?? community.is_member ?? false;
    setJoiningId(id);
    try {
      if (isMember) await leaveCommunityApi(id);
      else await joinCommunityApi(id);
      setCommunities((prev) =>
        prev.map((c) =>
          (c.id || c._id) === id
            ? { ...c, is_member: !isMember, isMember: !isMember, is_joined: !isMember }
            : c,
        ),
      );
    } catch (error) {
      if (
        error.response?.status === 409 ||
        /already/i.test(error.response?.data?.message)
      ) {
        setCommunities((prev) =>
          prev.map((c) =>
            (c.id || c._id) === id
              ? { ...c, is_member: !isMember, isMember: !isMember }
              : c,
          ),
        );
      }
      console.error("Failed to update membership", error);
    } finally {
      setJoiningId(null);
    }
  };
  const getCommunityIcon = (icon) => {
    const iconProps = {
      size: 22,
      strokeWidth: 1.8,
    };

    switch (icon) {
      case "brain":
        return <Brain {...iconProps} />;
      case "layers":
        return <Layers {...iconProps} />;
      case "globe":
        return <Globe {...iconProps} />;
      case "bot":
        return <Bot {...iconProps} />;
      case "eye":
        return <Eye {...iconProps} />;
      case "layout":
        return <Layout {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };
  return (
    <MainLayout>
      <div className="communities-page">
        <section className="communities-header">
          <div className="communities-header-content">
            <div className="communities-eyebrow-row">
              <span className="communities-eyebrow">ECOSYSTEM & GUILDS</span>

              <span className="communities-divider-dot">•</span>

              <span className="communities-count">
                {communities.length} Active Circles
              </span>
            </div>
            <h1>Communities</h1>
          </div>
          <Link to="/communities/create" className="create-community-button">
            <Plus size={18} />
            <span>Create Community</span>
          </Link>
        </section>
        <section className="communities-controls">
          <div className="community-filters">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`community-filter ${activeCategory === cat.value ? "active" : ""}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="community-search">
            <Search size={17} />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search communities..."
              aria-label="Search communities"
            />
          </div>
        </section>
        <div style={{ display: "flex", gap: 8, margin: "8px 0" }}>
          {[
            ["all", "All communities"],
            ["mine", "My communities"],
          ].map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`community-filter ${view === k ? "active" : ""}`}
              onClick={() => setView(k)}
            >
              {label}
            </button>
          ))}
        </div>
        {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
        <div className="communities-results">
          <span>{communities.length} communities</span>
          {(activeCategory !== "all" || searchQuery !== "") && (
            <button
              type="button"
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
            >
              Clear filter
            </button>
          )}
        </div>
        {loading ? (
          <div className="communities-empty">
            <Loader2 className="animate-spin" size={28} />
            <p>Loading communities...</p>
          </div>
        ) : communities.length > 0 ? (
          <section className="community-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {communities.map((community) => {
              const id = community._id || community.id;
              const isMember = community.is_joined ??community.is_member ?? community.isMember ?? false;

              return (
                <article
                  className="community-card bg-white rounded-2xl border border-stone-200/80 p-5"
                  key={id}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
                      {getCommunityIcon(community.icon)}
                    </div>
                    {community.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A04622]/10 text-[#A04622] border border-[#A04622]/20">
                        {community.category}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-4 text-base font-bold text-stone-900">
                    <Link
                      to={`/communities/${community.slug}`}
                      className="hover:underline"
                    >
                      {community.title || community.name}
                    </Link>
                  </h3>

                  <p className="mt-1 text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {community.description || community.tagline}
                  </p>

                  <div className="mt-4 pt-4 border-t border-stone-200/70 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      <Users size={14} />
                      {formatBuilders(
                        community.builders_count ??
                        community.members_count ??
                          community.member_count ??
                          community.builders,
                      )}{" "}
                      builders
                    </span>
                    {(community.posts_count ?? 0) > 0 && (
                      <span className="flex items-center gap-1.5 text-xs text-stone-500">
                        <MessageCircle size={14} />
                        {community.posts_count}{" "}
                        {community.posts_count === 1 ? "post" : "posts"}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/communities/${community.slug}`}
                        className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-stone-900"
                      >
                        Open <ArrowUpRight size={13} />
                      </Link>
                      {view !== "mine" && (
                        <button
                          type="button"
                          disabled={joiningId === id}
                          onClick={() => handleJoinToggle(community)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold disabled:opacity-50 ${
                            isMember
                              ? "bg-stone-100 text-stone-700 border border-stone-200"
                              : "bg-[#A04622] text-white hover:bg-[#8A3A1B]"
                          }`}
                        >
                          {joiningId === id
                            ? "..."
                            : isMember
                              ? "Leave"
                              : "Join"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        ) : error ? null : (
          <div className="communities-empty">
            <Search size={28} />
            <h2>No communities found</h2>
            <p>Try a different search term or category.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
            >
              Clear Search
            </button>
          </div>
        )}
        {!loading && totalPages && page < totalPages && (
          <div style={{ textAlign: "center", margin: "16px 0" }}>
            <button
              type="button"
              className="community-filter"
              disabled={loadingMore}
              onClick={() => loadCommunities(page + 1, true)}
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
        <section className="community-spotlight">
          <div className="spotlight-content">
            <span className="spotlight-eyebrow">WEEKLY SPOTLIGHT</span>
            <h2>Foundry Global Build Sprint</h2>
            <p>
              Join builders across the ecosystem for a week of shipping,
              collaboration, and open source building
            </p>
            <div className="spotlight-meta">
              <span>7 days</span>
              <span>•</span>
              <span>1,200+ builders</span>
            </div>
            <button
              type="button"
              className="spotlight-button"
              onClick={() => {
                console.log("Register team");
              }}
            >
              Register Team
              <ArrowUpRight size={17} />
            </button>
          </div>
          <div className="spotlight-visual">
            <span>BUILD</span>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
export default Communities;
