import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Eye,
  Github,
  Info,
  Link as LinkIcon,
  Minus,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import MainLayout from "../components/layout/MainLayout";

const domains = [
  "Systems Programming",
  "Distributed Systems",
  "AI / ML Infra",
  "Compilers & Languages",
  "Cryptography & Zero-Knowledge",
  "Robotics & Hardware",
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
  const [communityName, setCommunityName] = useState("");
  const [slug, setSlug] = useState("");
  const [tagline, setTagline] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [techStack, setTechStack] = useState([]);
  const [techInput, setTechInput] = useState("");
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
  const addTechToken = () => {
    const token = techInput.trim();

    if (!token) return;

    if (!techStack.includes(token)) {
      setTechStack((current) => [...current, token]);
    }

    setTechInput("");
  };

  const removeTechToken = (tokenToRemove) => {
    setTechStack((current) =>
      current.filter((token) => token !== tokenToRemove),
    );
  };

  const handleTechKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTechToken();
    }

    if (event.key === "Backspace" && techInput === "" && techStack.length > 0) {
      removeTechToken(techStack[techStack.length - 1]);
    }
  };
  const previewName = communityName.trim() || "Your CommunityName";

  const previewSlug = slug.trim() || "your community";
  const previewTagline =
    tagline.trim() || "Your community mission will appear here";
  const previewMembership = membershipType || "Open Guild";

  const readinessItems = useMemo(
    () => [
      {
        label: "Community identity defined",
        complete: communityName.trim() !== "" && tagline.trim() !== "",
      },
      {
        label: "Technical domain selected",
        complete: selectedDomain !== "",
      },
      {
        label: "Membership governance configured",
        complete: membershipType !== "",
      },
      {
        label: "Technical stack added",
        complete: techStack.length > 0,
      },
      {
        label: "Chapter written",
        complete: charter.trim().length > 20,
      },
      {
        label: "Sync channel configured",
        complete: githubLink.trim() !== "" || communityLink.trim() !== "",
      },
    ],
    [
      communityName,
      tagline,
      selectedDomain,
      membershipType,
      techStack,
      charter,
      githubLink,
      communityLink,
    ],
  );
  const completedReadiness = readinessItems.filter(
    (item) => item.complete,
  ).length;
  const readinessPercentage = Math.round(
    (completedReadiness / readinessItems.length) * 100,
  );
  const handleLaunch = (event) => {
    event.preventDefault();

    const communityData = {
      name: communityName,
      slug,
      tagline,
      domain: selectedDomain,
      techStack,
      membershipType,
      verification: {
        githubProof,
        repositoryContribution,
        foundrySignal,
      },
      charter,
      discussionTopics,
      liveSync,
      githubLink,
      communityLink,
    };
    console.log("Launch community:", communityData);
  };

  const handleSaveDraft = () => {
    const draftData = {
      name: communityName,
      slug,
      tagline,
      domain: selectedDomain,
      techStack,
      membershipType,
      verification: {
        githubProof,
        repositoryContribution,
        foundrySignal,
      },
      charter,
      discussionTopics,
      liveSync,
      githubLink,
      communityLink,
    };
    console.log("Save draft:", draftData);
  };
  const handleDiscard = () => {
    setCommunityName("");
    setSlug("");
    setTagline("");
    setSelectedDomain("");
    setTechStack([]);
    setTechInput("");
    setMembershipType("Open Guild");
    setGithubProof(false);
    setRepositoryContribution(false);
    setFoundrySignal(false);
    setCharter("");
    setDiscussionTopics("");
    setLiveSync("");
    setGithubLink("");
    setCommunityLink("");
    setCharterMode("write");
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
            <span className="autosave-dot" />
            <span>Draft autosaved 1m ago</span>
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

              <div className="form-field">
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
              </div>

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
                <label>Technical Domain</label>

                <div className="domain-options">
                  {domains.map((domain) => (
                    <button
                      key={domain}
                      type="button"
                      className={`domain-option ${
                        selectedDomain === domain ? "selected" : ""
                      }`}
                      onClick={() => setSelectedDomain(domain)}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Primary Tech Stack &amp; Primitives</label>

                <div className="tech-input-wrapper">
                  <div className="tech-tokens">
                    {techStack.map((token) => (
                      <span className="tech-token" key={token}>
                        {token}

                        <button
                          type="button"
                          aria-label={`Remove ${token}`}
                          onClick={() => removeTechToken(token)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}

                    <input
                      type="text"
                      value={techInput}
                      onChange={(event) => setTechInput(event.target.value)}
                      onKeyDown={handleTechKeyDown}
                      placeholder={
                        techStack.length === 0
                          ? "Add technology or primitive..."
                          : "Add another..."
                      }
                    />
                  </div>
                </div>

                <span className="field-hint">
                  Press Enter or comma to insert technical tokens.
                </span>
              </div>
            </section>
            <section className="community-form-section">
              <div className="form-section-heading">
                <div>
                  <div className="section-title-row">
                    <h2>Structure &amp; Membership Governance</h2>

                    <span className="section-badge signal">High Signal</span>
                  </div>

                  <p>
                    Define how builders join and how participation is governed.
                  </p>
                </div>
              </div>

              <div className="membership-options">
                {membershipOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`membership-option ${
                      membershipType === option.id ? "selected" : ""
                    }`}
                    onClick={() => setMembershipType(option.id)}
                  >
                    <div className="membership-option-radio">
                      <span />
                    </div>

                    <div className="membership-option-content">
                      <strong>{option.title}</strong>

                      <span>{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="verification-section">
                <div className="verification-heading">
                  <div>
                    <h3>Builder Verification Criteria</h3>

                    <p>Require meaningful technical signals before joining.</p>
                  </div>

                  <ShieldCheck size={19} />
                </div>

                <div className="verification-list">
                  <label className="verification-item">
                    <div>
                      <strong>Require GitHub Cryptographic Proof</strong>

                      <span>
                        Verify ownership of the builder's GitHub account.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={githubProof}
                      onChange={(event) => setGithubProof(event.target.checked)}
                    />
                  </label>

                  <label className="verification-item">
                    <div>
                      <strong>Production Repository Contribution</strong>

                      <span>
                        Require evidence of contribution to a production
                        repository.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={repositoryContribution}
                      onChange={(event) =>
                        setRepositoryContribution(event.target.checked)
                      }
                    />
                  </label>
                  <label className="verification-item">
                    <div>
                      <strong>Foundry Network Signal ≥ 400</strong>

                      <span>
                        Require a minimum verified network reputation.
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={foundrySignal}
                      onChange={(event) =>
                        setFoundrySignal(event.target.checked)
                      }
                    />
                  </label>
                </div>
              </div>
            </section>
            <section className="community-form-section">
              <div className="form-section-heading">
                <div>
                  <div className="section-title-row">
                    <h2>Charter &amp; Working Principles</h2>
                  </div>
                  <p>Establish the principles and expectations for members.</p>
                </div>
                <div className="editor-mode-toggle">
                  <button
                    type="button"
                    className={charterMode === "write" ? "active" : ""}
                    onClick={() => setCharterMode("write")}
                  >
                    Write
                  </button>
                  <button type="button" className={charterMode === "preview"}>
                    <Eye size={14} />
                    Preview
                  </button>
                </div>
              </div>
              {charterMode === "write" ? (
                <div className="charter-editor">
                  <div className="editor-toolbar">
                    <button type="button">H1</button>
                    <button type="button">H2</button>
                    <button type="button">
                      <strong>B</strong>
                    </button>
                    <button type="button">
                      <em>I</em>
                    </button>
                    <button type="button">``</button>
                    <span />
                    <button type="button">•</button>
                    <button type="button">1.</button>
                    <button type="button">
                      <LinkIcon size={14} />
                    </button>
                  </div>
                  <textarea
                    name="charter"
                    value={charter}
                    onChange={(event) => setCharter(event.target.value)}
                    placeholder={`## Mission

Describe what this community exists to build, explore, or discuss.

## Working Principles

- What should members contribute?
- How should members collaborate?
- What makes this community high-signal?`}
                    rows={13}
                  />
                </div>
              ) : (
                <div className="charter-preview">
                  {charter.trim() ? (
                    charter
                      .split("\n")
                      .map((line, index) => (
                        <p key={index}>{line || "\u00a0"}</p>
                      ))
                  ) : (
                    <p className="empty-preview">
                      Your charter preview will appear here as your write.
                    </p>
                  )}
                </div>
              )}
            </section>
            <section>
              
            </section>
          </main>
        </form>
      </div>
    </MainLayout>
  );
}

export default CreateCommunity;
