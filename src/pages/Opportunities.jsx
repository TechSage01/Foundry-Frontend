import { useMemo, useState } from "react";
import MainLayout from "../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import opportunitiesData from "../data/opportunitiesData";

import {
  Search,
  BriefcaseBusiness,
  MapPin,
  CalendarDays,
  Bookmark,
  Zap,
  UserRound,
  ChevronDown,
} from "lucide-react";

function Opportunities() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All Opportunities");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  const categories = [
    "All Opportunities",
    "Remote",
    "Full-time",
    "Hackathons",
    "Co-founder",
    "Grants",
  ];

  const filteredOpportunities = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = opportunitiesData.filter((opportunity) => {
      const matchesCategory =
        activeCategory === "All Opportunities" ||
        opportunity.filters.includes(activeCategory);

      const matchesSearch =
        query === "" ||
        opportunity.title.toLowerCase().includes(query) ||
        opportunity.company.toLowerCase().includes(query) ||
        opportunity.description.toLowerCase().includes(query) ||
        opportunity.tags.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    const sorted = [...filtered];

    if (sortBy === "latest") {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortBy === "highestComp") {
      sorted.sort((a, b) => b.reward.amount - a.reward.amount);
    }

    if (sortBy === "closingSoon") {
      sorted.sort(
        (a, b) => a.deadline.daysRemaining - b.deadline.daysRemaining,
      );
    }

    return sorted;
  }, [activeCategory, searchQuery, sortBy]);

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

        {/* Filters and Sort */}
        <div className="opportunities-controls">
          <div className="opportunity-filters">
            {categories.map((category) => (
              <button
                key={category}
                className={`opportunity-filter ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                <span>{category}</span>

                {category === "All Opportunities" && (
                  <span className="filter-count">
                    {opportunitiesData.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="opportunities-sort">
            <button
              className={`sort-button ${sortBy === "latest" ? "active" : ""}`}
              onClick={() => setSortBy("latest")}
            >
              Latest
            </button>

            <button
              className={`sort-button ${
                sortBy === "highestComp" ? "active" : ""
              }`}
              onClick={() => setSortBy("highestComp")}
            >
              Highest Comp
            </button>

            <button
              className={`sort-button ${
                sortBy === "closingSoon" ? "active" : ""
              }`}
              onClick={() => setSortBy("closingSoon")}
            >
              Closing Soon
            </button>
          </div>
        </div>

        {/* Opportunity Grid */}
        <section className="opportunity-grid">
          {filteredOpportunities.map((opportunity) => (
            <article className="opportunity-card" key={opportunity.id}>
              {/* Company Header */}
              <div className="opportunity-company">
                <div className="company-logo">
                  <BriefcaseBusiness size={20} />
                </div>

                <div className="company-info">
                  <div className="company-name">
                    <strong>{opportunity.company}</strong>

                    <span>• {opportunity.companyMeta}</span>
                  </div>

                  <p>{opportunity.companyDescription}</p>
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

              {/* Opportunity Content */}
              <div className="opportunity-main">
                <h2>{opportunity.title}</h2>

                <p>{opportunity.description}</p>
              </div>

              {/* Opportunity Details */}
              <div className="opportunity-details">
                <div>
                  <span>{opportunity.reward.label}</span>

                  <strong>{opportunity.reward.value}</strong>
                </div>

                <div>
                  <span>Location</span>

                  <strong>
                    <MapPin size={14} />
                    {opportunity.location}
                  </strong>
                </div>

                <div>
                  <span>{opportunity.deadline.label}</span>

                  <strong className="deadline">
                    <CalendarDays size={14} />
                    {opportunity.deadline.value}
                  </strong>
                </div>
              </div>

              {/* Tags */}
              <div className="opportunity-tags">
                {opportunity.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="opportunity-actions">
                <button className="quick-apply-button">
                  <Zap size={16} />
                  Quick Apply
                </button>

                <button className="profile-apply-button">
                  <UserRound size={16} />
                  Apply with Profile
                </button>
              </div>
            </article>
          ))}
        </section>

        {/* Empty State */}
        {filteredOpportunities.length === 0 && (
          <div className="opportunities-empty">
            <BriefcaseBusiness size={28} />

            <h2>No opportunities found</h2>

            <p>Try another search or choose a different category.</p>
          </div>
        )}

        {/* Load More */}
        {filteredOpportunities.length > 0 && (
          <div className="load-more-wrapper">
            <button className="load-more-button">
              Load More Opportunities
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default Opportunities;
