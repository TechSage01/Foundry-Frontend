import { useEffect, useMemo, useRef, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useNavigate, Link } from "react-router-dom";
import {
  fetchOpportunitiesApi,
  fetchMyOpportunitiesApi,
  deleteOpportunityApi,
} from "../services/opportunities";

import {
  Search,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Bookmark,
  Zap,
  UserRound,
  ChevronDown,
  Loader2,
  Trash2,
} from "lucide-react";

const PAGE_SIZE = 50;

// "param" tells the API how to filter. Change the values to match the
// category names your backend actually stores.
const FILTERS = [
  { label: "All Opportunities" },
  { label: "Remote", work_arrangement: "remote" },
  { label: "Full-time", category: "Full-time" },
  { label: "Hackathons", category: "Hackathon" },
  { label: "Co-founder", category: "Co-founder" },
  { label: "Grants", category: "Grant" },
];

const parseSkills = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string" && raw.trim()) {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");

// turn one API item into what the cards need
const normalize = (o) => {
  const deadline = o.deadline_at ? new Date(o.deadline_at) : null;
  const daysRemaining = deadline
    ? Math.ceil((deadline - Date.now()) / 86400000)
    : null;
  const rawUsername = o.username || o.poster_username || o.author_username;
  const username =
    rawUsername && String(rawUsername).toLowerCase() !== "unknown"
      ? rawUsername
      : null;
  return {
    id: o.id,
    title: o.title || "Untitled opportunity",
    description: o.description || "",
    company:
      o.company_name ||
      o.company ||
      o.full_name ||
      o.poster_name ||
      (username ? `@${username}` : "Foundry builder"),
    username: username || null,
    companyMeta: username ? `@${username}` : "",
    companyDescription: o.headline || o.poster_headline || "",
    type: o.category || "Opportunity",
    compensation: o.compensation || "Not specified",
    compensationValue: Math.max(
      0,
      ...(
        String(o.compensation || "")
          .replace(/,/g, "")
          .match(/\d+(\.\d+)?/g) || [0]
      ).map(Number),
    ),
    category: String(o.category || "").toLowerCase(),
    arrangement: String(o.work_arrangement || "").toLowerCase(),
    location:
      o.location_range ||
      (o.work_arrangement ? cap(o.work_arrangement) : "Not specified"),
    deadlineLabel: deadline
      ? daysRemaining < 0
        ? "Closed"
        : deadline.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
      : "Open",
    daysRemaining,
    tags: parseSkills(o.required_skills),
    createdAt: o.created_at || o.createdAt,
    externalUrl: o.external_apply_url,
    fastApply: Boolean(o.fast_apply_enabled),
  };
};

function Opportunities() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState(FILTERS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [view, setView] = useState("all"); // "all" | "mine"
  const [notice, setNotice] = useState("");

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const load = async (filter, pageToLoad, append) => {
    const myRequest = ++requestId.current;
    append ? setLoadingMore(true) : setLoading(true);
    setError("");
    try {
      const { items: fetched, pagination } =
        view === "mine"
          ? await fetchMyOpportunitiesApi({
              page: pageToLoad,
              limit: PAGE_SIZE,
            })
          : await fetchOpportunitiesApi({
              page: pageToLoad,
              limit: PAGE_SIZE,
              // category: filter.category,
              // work_arrangement: filter.work_arrangement,
            });
      if (myRequest !== requestId.current) return; // a newer request won
      const normalized = fetched.map(normalize);
      setItems((prev) => (append ? [...prev, ...normalized] : normalized));
      setPage(pageToLoad);

      const totalPages = pagination?.total_pages ?? pagination?.totalPages;
      setHasMore(
        totalPages ? pageToLoad < totalPages : fetched.length === PAGE_SIZE,
      );
      setTotal(pagination?.total ?? pagination?.total_items ?? null);
    } catch (err) {
      if (myRequest !== requestId.current) return;
      console.error(
        "Failed to load opportunities:",
        err.response?.status,
        err.response?.data,
      );
      setError(
        err.response?.data?.message ||
          "Could not load opportunities right now.",
      );
    } finally {
      if (myRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  // reload from page 1 whenever the filter changes
  useEffect(() => {
    load(activeFilter, 1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter, view]);

  const visible = useMemo(() => {
  const query = searchQuery.toLowerCase().trim();
  const norm = (v) => String(v || "").toLowerCase().replace(/[^a-z]/g, "");
  const filtered = items.filter(
    (o) =>
      (view === "mine" ||
        ((!activeFilter.category ||
          norm(o.category) === norm(activeFilter.category)) &&
          (!activeFilter.work_arrangement ||
            norm(o.arrangement) === norm(activeFilter.work_arrangement)))) &&
      (query === "" ||
        o.title.toLowerCase().includes(query) ||
        o.company.toLowerCase().includes(query) ||
        o.description.toLowerCase().includes(query) ||
        o.tags.some((tag) => String(tag).toLowerCase().includes(query))),
  );
  const sorted = [...filtered];
  if (sortBy === "latest") {
    sorted.sort(
      (a, b) =>
        (new Date(b.createdAt).getTime() || 0) -
        (new Date(a.createdAt).getTime() || 0),
    );
  }
  if (sortBy === "highestComp") {
    sorted.sort((a, b) => b.compensationValue - a.compensationValue);
  }
  if (sortBy === "closingSoon") {
    const key = (o) =>
      o.daysRemaining === null
        ? Infinity
        : o.daysRemaining < 0
          ? Infinity - 1
          : o.daysRemaining;
    sorted.sort((a, b) => (key(a) === key(b) ? 0 : key(a) < key(b) ? -1 : 1));
  }
  return sorted;
}, [items, searchQuery, sortBy, activeFilter, view]);
  const handleDelete = async (o) => {
    if (!window.confirm(`Delete "${o.title}"? This can't be undone.`)) return;
    try {
      await deleteOpportunityApi(o.id);
      setItems((prev) => prev.filter((x) => x.id !== o.id));
      setNotice("Opportunity deleted.");
    } catch (err) {
      setNotice(
        err.response?.data?.message || "Could not delete this opportunity.",
      );
    }
  };

  const handleApplyWithProfile = () => {
    setNotice(
      "Applying with your profile isn't available yet. It needs the applications API on the backend.",
    );
    setTimeout(() => setNotice(""), 5000);
  };

  const openApply = (o) => {
    if (o.externalUrl) window.open(o.externalUrl, "_blank", "noopener");
  };

  return (
    <MainLayout>
      <div className="opportunities-page">
        {/* Page Header */}
        <section className="opportunities-header">
          <div className="opportunities-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>

          <div className="opportunities-heading">
            <div>
              <p className="opportunities-eyebrow">
                OPPORTUNITIES & GIGS <span>•</span> UPDATED LIVE
              </p>
              <h1>Discover Open Roles & Funding</h1>
              <p className="opportunities-subtitle">
                Find jobs, grants, hackathons, and people looking for builders.
              </p>
            </div>

            <button
              className="post-opportunity-button"
              onClick={() => navigate("/opportunities/create")}
            >
              <span>+</span>
              Post an Opportunity
            </button>
          </div>
        </section>

        <div className="opportunity-filters" style={{ marginBottom: 12 }}>
          {[
            ["all", "All opportunities"],
            ["mine", "My opportunities"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={`opportunity-filter ${view === key ? "active" : ""}`}
              onClick={() => setView(key)}
            >
              <span>{label}</span>
            </button>
          ))}
        </div>

        {notice && (
          <p
            role="status"
            style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px" }}
          >
            {notice}
          </p>
        )}

        {/* Filters and Sort */}
        <div className="opportunities-controls">
          <div
            className="opportunity-filters"
            style={view === "mine" ? { visibility: "hidden" } : undefined}
          >
            {FILTERS.map((filter) => (
              <button
                key={filter.label}
                className={`opportunity-filter ${
                  activeFilter.label === filter.label ? "active" : ""
                }`}
                onClick={() => setActiveFilter(filter)}
              >
                <span>{filter.label}</span>
                {filter.label === "All Opportunities" &&
                  activeFilter.label === "All Opportunities" &&
                  !loading && (
                    <span className="filter-count">
                      {total ?? items.length}
                    </span>
                  )}
              </button>
            ))}
          </div>

          <div className="opportunities-sort">
            {[
              ["latest", "Latest"],
              ["highestComp", "Highest Comp"],
              ["closingSoon", "Closing Soon"],
            ].map(([key, label]) => (
              <button
                key={key}
                className={`sort-button ${sortBy === key ? "active" : ""}`}
                onClick={() => setSortBy(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading / error */}
        {loading && (
          <div className="opportunities-empty">
            <Loader2 size={28} className="animate-spin" />
            <h2>Loading opportunities...</h2>
          </div>
        )}

        {!loading && error && (
          <div className="opportunities-empty">
            <BriefcaseBusiness size={28} />
            <h2>{error}</h2>
            <p>
              <button
                className="load-more-button"
                onClick={() => load(activeFilter, 1, false)}
              >
                Try again
              </button>
            </p>
          </div>
        )}

        {/* Opportunity Grid */}
        {!loading && !error && (
          <section className="opportunity-grid">
            {visible.map((opportunity) => (
              <article className="opportunity-card" key={opportunity.id}>
                <div className="opportunity-company">
                  <div className="company-logo">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div className="company-info">
                    <div className="company-name">
                      {opportunity.username ? (
                        <Link
                          to={`/profile/${opportunity.username}`}
                          className="hover:underline"
                          style={{ color: "inherit" }}
                        >
                          <strong>{opportunity.company}</strong>
                        </Link>
                      ) : (
                        <strong>{opportunity.company}</strong>
                      )}
                      {opportunity.companyMeta &&
                        (opportunity.username ? (
                          <Link
                            to={`/profile/${opportunity.username}`}
                            className="hover:underline"
                            style={{ color: "inherit" }}
                          >
                            <span>• {opportunity.companyMeta}</span>
                          </Link>
                        ) : (
                          <span>• {opportunity.companyMeta}</span>
                        ))}
                    </div>
                    {opportunity.companyDescription && (
                      <p>{opportunity.companyDescription}</p>
                    )}
                  </div>

                  <div className="opportunity-card-actions">
                    <span className="opportunity-type">{opportunity.type}</span>
                    <button
                      className="bookmark-button"
                      aria-label={`Save ${opportunity.title}`}
                    >
                      <Bookmark size={17} />
                    </button>
                  </div>
                </div>

                <div className="opportunity-main">
                  <h2>
                    <Link
                      to={`/opportunities/${opportunity.id}`}
                      className="hover:underline"
                      style={{ color: "inherit" }}
                    >
                      {opportunity.title}
                    </Link>
                  </h2>
                  <p>{opportunity.description}</p>
                </div>

                <div className="opportunity-details">
                  <div>
                    <span>Compensation</span>
                    <strong>{opportunity.compensation}</strong>
                  </div>
                  <div>
                    <span>Location</span>
                    <strong>
                      <MapPin size={14} />
                      {opportunity.location}
                    </strong>
                  </div>
                  <div>
                    <span>Deadline</span>
                    <strong className="deadline">
                      <CalendarDays size={14} />
                      {opportunity.deadlineLabel}
                    </strong>
                  </div>
                </div>

                {opportunity.tags.length > 0 && (
                  <div className="opportunity-tags">
                    {opportunity.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                )}

                <div className="opportunity-actions">
                  <button
                    className="quick-apply-button"
                    disabled={!opportunity.externalUrl}
                    title={
                      opportunity.externalUrl
                        ? "Apply on the poster's site"
                        : "Quick apply isn't available yet"
                    }
                    onClick={() => openApply(opportunity)}
                  >
                    <Zap size={16} />
                    Quick Apply
                  </button>

                  <button
                    className="profile-apply-button"
                    onClick={handleApplyWithProfile}
                  >
                    <UserRound size={16} />
                    Apply with Profile
                  </button>

                  {view === "mine" && (
                    <button
                      className="profile-apply-button"
                      onClick={() =>
                        navigate(`/opportunities/${opportunity.id}/edit`)
                      }
                    >
                      Edit
                    </button>
                  )}

                  {view === "mine" && (
                    <button
                      className="profile-apply-button"
                      onClick={() => handleDelete(opportunity)}
                      aria-label={`Delete ${opportunity.title}`}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}

        {/* Empty State */}
        {!loading && !error && visible.length === 0 && (
          <div className="opportunities-empty">
            <BriefcaseBusiness size={28} />
            <h2>No opportunities found</h2>
            <p>Try another search or choose a different category.</p>
          </div>
        )}

        {/* Load More */}
        {!loading && !error && hasMore && (
          <div className="load-more-wrapper">
            <button
              className="load-more-button"
              disabled={loadingMore}
              onClick={() => load(activeFilter, page + 1, true)}
            >
              {loadingMore ? "Loading..." : "Load More Opportunities"}
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Opportunities;
