import { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import communities from "../data/communitiesData";

const categories = ["All", "Web Dev", "AI & ML", "Design Systems", "Robotics"];

function Communities() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(``);

  const filteredCommunities = communities.filter((community) => {
    const matchesCategory =
      activeCategory === "All" || community.category === activeCategory;

    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      query === "" ||
      community.name.toLowerCase().includes(query) ||
      community.category.toLowerCase().includes(query) ||
      community.description.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const formatBuilders = (number) => {
    if (number >= 1000) {
      return `${(number / 1000).toFixed(1)}k`;
    }
    return number;
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
            <span className="communities-eyebrow">ECOSYSTEM & GUILDS</span>
            <h1>Communities</h1>
            <p>Find your people. Share knowledge. Build together.</p>
          </div>
          <Link to="/communities/create" className="create-community-button">
            <Plus size={18} />
            <span>Create Community</span>
          </Link>
        </section>
        <section className="communities-controls">
          <div className="community-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={`community-filter ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
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
        <div className="communities-results">
          <span>{filteredCommunities.length} communities</span>
          {activeCategory !== "All" && (
            <button type="button" onClick={() => setActiveCategory("All")}>
              Clearfilter
            </button>
          )}
        </div>
        {filteredCommunities.length > 0 ? (
          <section className="community-grid">
            {filteredCommunities.map((community) => (
              <article className="community-card" key={community.id}>
                <div className="community-card-top">
                  <div className="community-icon">
                    {getCommunityIcon(community.icon)}
                  </div>

                  <span className="community-category">
                    {community.category}
                  </span>
                </div>

                <div className="community-card-content">
                  <h2>{community.name}</h2>

                  <p>{community.description}</p>
                </div>
                <div className="community-card-stats">
                  <div className="community-stat">
                    <Users size={15} />

                    <span>{formatBuilders(community.builders)} builders</span>
                  </div>

                  <div className="community-stat">
                    <MessageCircle size={15} />

                    <span>{community.threads} threads</span>
                  </div>
                </div>
                <div className="community-card-actions">
                  <button
                    type="button"
                    className="join-community-button"
                    onClick={() => {
                      console.log(`Joining ${community.name}`);
                    }}
                  >
                    Join Community
                  </button>

                  <button
                    type="button"
                    className="community-arrow-button"
                    aria-label={`Open ${community.name}`}
                    onClick={() => {
                      console.log(`Opening ${community.name}`);
                    }}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="communities-empty">
            <Search size={28} />
            <h2>No communities found</h2>
            <p>Try a different search term or category.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
            >
              Clear Search
            </button>
          </div>
        )}
        <section className="community-spotlight">
            <div className="spotlight-content">
                <span className="spotlight-eyebrow">
                  WEEKLY SPOTLIGHT
                </span>
                <h2>
                  Foundry Global Build Sprint
                </h2>
                <p>Join builders across the ecosystem for a week of shipping, collaboration, and open source building</p>
                <div className="spotlight-meta">
                  <span>7 days</span>
                  <span>•</span>
                  <span>1,200+ builders</span>
                </div>
                <button
                  type="button"
                  className="spotlight-button"
                  onClick={() => {
                    console.log('Register team')
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
  )
}
export default Communities;
