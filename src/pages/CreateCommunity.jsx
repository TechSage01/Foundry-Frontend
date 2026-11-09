import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Check,
  ChevronDown,
  Eye,
  Info,
  Link as LinkIcon,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ArrowUpRight,
} from "lucide-react";
import MainLayout from "../components/layout/MainLayout";
import "./CreateCommunity.css";
import { createCommunityApi } from "../services/communities";

const domains = [
  { label: "Systems Programming", value: "systems" },
  { label: "Software Engineering", value: "web-dev" },
  { label: "Distributed Systems", value: "distributed-systems" },
  { label: "AI / ML Infra", value: "ai" },
  { label: "Robotics & Hardware", value: "robotics" },
];

const membershipOptions = [
  {
    id: "Open Guild",
    title: "Open Guild",
    description: "Open to builders who want to participate and contribute",
  },
  {
    id: "Vetted Syndicate",
    title: "Vetted Syndicate",
    description: "Members are reviewed against technical contribution criteria",
  },
  {
    id: "Working Group",
    title: "Working Group",
    description: "A focused group working toward a specific technical outcome",
  },
];

function CreateCommunity() {
  const navigate = useNavigate()
  const [communityName, setCommunityName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  // const [techStack, setTechStack] = useState([]);
  // const [techInput, setTechInput] = useState("");
  const [membershipType, setMembershipType] = useState("Open Guild");
  const [githubProof, setGithubProof] = useState(false);
  const [repositoryContribution, setRepositoryContribution] = useState(false);
  const [foundrySignal, setFoundrySignal] = useState(false);
  const [charterMode, setCharterMode] = useState("write");
  const [charter, setCharter] = useState("");
  const [discussionTopics, setDiscussionTopics] = useState("");
  const [liveSync, setLiveSync] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [communityLink, setCommunityLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState("");

  // const addTechToken = () => {
  //   const token = techInput.trim();

  //   if (!token) return;

  //   if (!techStack.includes(token)) {
  //     setTechStack((current) => [...current, token]);
  //   }

  //   setTechInput("");
  // };

  // const removeTechToken = (tokenToRemove) => {
  //   setTechStack((current) =>
  //     current.filter((token) => token !== tokenToRemove),
  //   );
  // };

  // const handleTechKeyDown = (event) => {
  //   if (event.key === "Enter" || event.key === ",") {
  //     event.preventDefault();
  //     addTechToken();
  //   }

  //   if (event.key === "Backspace" && techInput === "" && techStack.length > 0) {
  //     removeTechToken(techStack[techStack.length - 1]);
  //   }
  // };

  const previewName = communityName.trim() || "Your Community Name";

  const previewTagLine = 
  tagline.trim() || "Your community mission will appear here";

  const previewSlug = slug.trim() || "your-community";

  const previewTagline =
    tagline.trim() || "Your community mission will appear here";

  const previewMembership = membershipType || "Open Guild";

  const readinessItems = [
    { label: "Community name added", complete: communityName.trim() !== ""},
    { label: "Tagline written", complete: tagline.trim() !== ""},
    { label: "Category Selected", complete: selectedDomain !== ""},
  ];
  const completedReadiness = readinessItems.filter(
    (i) => i.complete).length;

  const readinessPercentage = Math.round(
    (completedReadiness / readinessItems.length) * 100,
  );

  const handleLaunch = async (event) => {
    event.preventDefault();
    if(submitting) return;
    if(!communityName.trim() || !tagline.trim() || !selectedDomain) {
      setSubmitError("Community name, tagline and category are required.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try{
      const created = await createCommunityApi({
        title: communityName.trim(),
        description: tagline.trim(),
        category: selectedDomain,
      });
       const newSlug = created?.slug || created?.data?.slug;
      if (newSlug) navigate(`/communities/${newSlug}`);
      else navigate("/communities");
    } catch(err) {
      console.error("Failed to create community:", err);
      setSubmitError(
        err.response?.data?.message ||
        "Failed to create community. Please try again.",
      )
    } finally {
      setSubmitting(false);
    }
    // console.log("Launch community:", communityData);
  };
  const handleDiscard = () => {
    setCommunityName("");
    // setSlug("");
    setTagline("");
    setSelectedDomain("");
    setSubmitError("");
  };

  return (
    <MainLayout>
      <div className="create-community-page">
        <div className="create-community-topbar">
          <div className="create-community-breadcrumb">
            <Link to="/communities">Communities</Link>
            <span>/</span>
          </div>

          <div className="create-community-save-status">
            <button
              type="button"
              className="discard-button"
              onClick={handleDiscard}
            >
              Discard
            </button>
          </div>
        </div>

        <header className="create-community-header">
          <div>
            <h1>Create a Technical Community</h1>

            <p>
              Assemble an engineering guild, working group or peer-review pod
              centered around specific architectures, low-level tooling, and
              production systems
            </p>
          </div>
        </header>

        <form className="create-community-layout" onSubmit={handleLaunch}>
          <main className="create-community-main">
            <section className="community-form-section">
              <div className="form-section-heading">
                <div>
                  <div className="section-title-row">
                    <h2>Community Identity &amp; Focus</h2>

                    <span className="section-badge required">Required</span>
                  </div>

                  <p>
                    Define what your community is about and who it is built for.
                  </p>
                </div>
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="community-name">Community Name</label>

                  <span>{communityName.length} / 60</span>
                </div>

                <input
                  id="community-name"
                  name="communityName"
                  type="text"
                  value={communityName}
                  maxLength={60}
                  onChange={(event) => setCommunityName(event.target.value)}
                  placeholder="e.g. WebGPU & Graphics Infrastructure"
                  required
                />
              </div>

              {/* <div className="form-field">
                <label htmlFor="community-slug">Slug Handle</label>

                <div className="slug-input-wrapper">
                  <span className="slug-prefix">foundry.network/c/</span>

                  <input
                    id="community-slug"
                    name="slug"
                    type="text"
                    value={slug}
                    onChange={(event) =>
                      setSlug(
                        event.target.value.toLowerCase().replace(/\s+/g, "-"),
                      )
                    }
                    placeholder="your-community"
                    required
                  />

                  {slug.trim() && (
                    <span className="slug-valid">
                      <Check size={15} />
                    </span>
                  )}
                </div>
              </div> */}

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="community-tagline">
                    Tagline &amp; Mission
                  </label>

                  <span>One-liner</span>
                </div>

                <input
                  id="community-tagline"
                  name="tagline"
                  type="text"
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  placeholder="Describe the purpose of your community in one sentence..."
                  required
                />
              </div>

              <div className="form-field">
                <label>Category</label>

                <div className="domain-options">
                  {domains.map((domain) => (
                    <button
                      key={domain.value}
                      type="button"
                      className={`domain-option ${
                        selectedDomain === domain.value ? "selected" : ""
                      }`}
                      onClick={() => setSelectedDomain(domain.value)}
                    >
                      {domain.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
            {submitError && (
              <div className="create-community-error">{submitError}</div>
            )}

            <div className="create-community-form-actions">
              <button type="submit" className="launch-community-button" disabled={submitting}>
                <Send size={16} />
                {submitting ? "Launching..." : "Found Community & Launch Pod"}
              </button>
            </div>
          </main>

          <aside className="create-community-sidebar">
            <section className="community-side-card preview-card">
              <div className="side-card-header">
                <div>
                  <span className="side-card-eyebrow">DIRECTORY PREVIEW</span>

                  <h2>Live Preview</h2>
                </div>

                <span className="live-status">
                  <span />
                  Live
                </span>
              </div>

              <p className="preview-description">
                This is how your community will appear in the Foundry directory.
              </p>

              <div className="directory-preview">
                <div className="preview-icon">
                  <Sparkles size={22} />
                </div>

               <div className="preview-main">
                  <div className="preview-title-row">
                    <h3>{previewName}</h3>
                  </div>
                  <p>{previewTagline}</p>
                  <div className="preview-footer">
                    <span>
                      <Users size={14} />0 members
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section className="community-side-card readiness-card">
              <div className="side-card-header">
                <div>
                  <span className="side-card-eyebrow">FOUNDING READINESS</span>

                  <h2>{readinessPercentage}% Complete</h2>
                </div>

                <span className="readiness-icon">
                  <Check size={17} />
                </span>
              </div>

              <div className="readiness-progress">
                <div
                  className="readiness-progress-bar"
                  style={{
                    width: `${readinessPercentage}%`,
                  }}
                />
              </div>

              <div className="readiness-list">
                {readinessItems.map((item) => (
                  <div className="readiness-item" key={item.label}>
                    <span
                      className={
                        item.complete
                          ? "readiness-check complete"
                          : "readiness-check"
                      }
                    >
                      {item.complete && <Check size={12} />}
                    </span>

                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="community-side-card launch-card">
              <div className="launch-warning">
                <Info size={17} />

                <p>
                  Launching creates a public directory entry and opens the
                  community for membership requests.
                </p>
              </div>

             <button type="submit" className="launch-primary-button" disabled={submitting}>
                <Sparkles size={16} />
                {submitting ? "Launching..." : "Found Community & Launch Pod"}
              </button>

              {/* <button
                type="button"
                className="launch-secondary-button"
                onClick={handleSaveDraft}
              >
                <Save size={16} />
                Save Pod Draft
              </button> */}
            </section>

            {/* <section className="community-side-card architect-card">
              <span className="side-card-eyebrow">ARCHITECT LEAD</span>

              <div className="architect-profile">
                <div className="architect-avatar">AV</div>

                <div>
                  <h3>Alex Vance</h3>

                  <p>
                    Foundry Rep Score:
                    <strong>850</strong>
                    <span>Verified</span>
                  </p>
                </div>
              </div>

              <div className="architect-divider" />

              <div className="architect-meta">
                <span>
                  <ShieldCheck size={14} />
                  Verified Builder
                </span>

                <span>
                  <Users size={14} />
                  Community Lead
                </span>
              </div>
            </section> */}
          </aside>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateCommunity;