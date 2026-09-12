import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Code2,
  FileText,
  Globe2,
  Handshake,
  HeartHandshake,
  List,
  MapPin,
  Plus,
  Rocket,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from "lucide-react";

function CreateOpportunity() {
  const navigate = useNavigate();

  const opportunityTypes = [
    {
      name: "Full-time Job",
      icon: BriefcaseBusiness,
    },
    {
      name: "Co-founder",
      icon: Users,
    },
    {
      name: "OS Bounty",
      icon: Zap,
    },
    {
      name: "Hackathon",
      icon: Code2,
    },
    {
      name: "Grant / Fund",
      icon: CircleDollarSign,
    },
    {
      name: "Freelance",
      icon: Handshake,
    },
  ];

  const [opportunityType, setOpportunityType] = useState("Full-time Job");
  const [title, setTitle] = useState("Senior Rust & WebGPU Graphics Engineer");
  const [linkedProject, setLinkedProject] = useState(
    "Aether Spatial Engine (Active)",
  );
  const [hiringTeam, setHiringTeam] = useState(
    "Graphics Runtime & Shaders Pod",
  );

  const [overview, setOverview] = useState(
    "We're building the next-generation low latency rendering pipeline for decntralized spatial simulations. You will design new WebGPU shader graph, optimize compute shaders in WGSL, and interface directly with our Rust-based deterministic physics engine. Candidates should be comfortable profiling memory bottlenecks in native WASM runtimes.",
  );

  const [skills, setSkills] = useState([
    "Rust",
    "WebGPU / WGSL",
    "WASM",
    "Computer Graphics",
  ]);
  const suggestedSkills = ["Typescript", "Distributed Systems", "GLSL"];

  const [skillInput, setSkillInput] = useState("");
  const [workArrangement, setWorkArrangement] = useState("Remote");

  const [location, setLocation] = useState("Global Remote (UTC-8 to UTC)");

  const [currency, setCurrency] = useState("USD ($)");
  const [minPay, setMinPay] = useState("160,000");
  const [maxPay, setMaxPay] = useState("210,000");
  const [payPeriod, setPayPeriod] = useState("yr");
  const [includesEquity, setIncludesEquity] = useState(true);
  const [tokenGrant, setTokenGrant] = useState(false);
  const [deadline, setDeadline] = useState("2025-04-30");
  const [startWindow, setStartWindow] = useState("Within 30 days");
  const [fastApply, setFastApply] = useState(true);
  const [applicationUrl, setApplicationUrl] = useState(
    "https://jobs.lever.co/aether-engine/senior-graphics-engineer",
  );

  const [screeningQuestion, setScreeningQuestion] = useState(
    "Share a link to a WebGPU shader or Rust crate you authored, along with the toughest GPU memory profiling challegnge you solved.",
  );

  const [isSaved, setIsSaved] = useState(false);
  const handleSkillKeyDown = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const newSkill = skillInput.trim();
    if (!newSkill) return;

    if (!skills.includes(newSkill)) {
      setSkills([...skills, newSkill]);
    }

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((currentSkill) => currentSkill !== skill));
  };

  const addSuggestedSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const handleSaveDraft = () => {
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
    }, 2500);
  };

  const handlePublish = (event) => {
    event.preventDefault();

    const opportunity = {
      opportunityType,
      title,
      linkedProject,
      hiringTeam,
      overview,
      skills,
      workArrangement,
      location,
      compensation: {
        currency,
        minPay,
        maxPay,
        payPeriod,
        includesEquity,
        tokenGrant,
      },
      deadline,
      startWindow,
      fastApply,
      applicationUrl,
      screeningQuestion,
    };
    console.log("Opportunity ready to publish:", opportunity);

    const previewTitle = title || "Senior Rust & WebGPU Graphics Engineer";
    const previewDescription =
      overview || "Your opportunity description will appear here.";

    const previewLocation = location || "Global Remote";

    const previewCompensation = `${currency} ${minPay} - ${maxPay} / ${payPeriod}`;

    return (
      <MainLayout>
        <form className="create-opportunity-page" onSubmit={handlePublish}>
          <div className="create-opportunity-topbar">
            <button
              type="button"
              className="opportunity-breadcrumb"
              onClick={() => navigate("/opportunities")}
            >
              <ArrowLeft size={14} />
              <span>Opportunities</span>
              <span className="breadcrumb-divider">/</span>
              <strong>Post a New Opportunity</strong>
            </button>

            <div className="topbar-actions">
              <span className="autosave-status">
                <span className="autosave-dot" />
                {isSaved ? "Saved to drafts" : "Autosaved to drafts (10:42 AM)"}
              </span>
              <button
                type="button"
                className="discard-button"
                onClick={() => navigate("/opportunities")}
              >
                Discard
              </button>
            </div>
          </div>
          <section className="create-opportunity-hero">
            <div className="hero-content">
              <span className="builder-network-badge">
                <Sparkles size={12} />
                Foundry Builder Network Reach · 42,000+ Engineers & Founders
              </span>
              <h1>Create & Publish an Opportunity</h1>
              <p>
                Connect with verified builders, open-source contributors,
                technical co-founders, and specialized creators across the
                Foundry ecosystem.
              </p>
            </div>
            <div className="hero-art">
              <HeartHandshake size={92} />
            </div>
          </section>

          <div className="create-opportunity-content">
            <div className="opportunity-form">
              <section className="form-section">
                <div className="form-section-heading">
                  <div className="section-heading-left">
                    <span className="section-number">1</span>
                    <div>
                      <h2>Opportunity Type & Basics</h2>
                      <p>
                        Classify the opening to reach the right candidate feeds
                      </p>
                    </div>
                  </div>
                  <span className="section-required">Required</span>
                </div>
                <div className="form-field">
                  <label>Category</label>
                  <div className="opportunity-type-grid">
                    {opportunityTypes.map((type) => {
                      const Icon = type.icon;

                      return (
                        <button
                          type="button"
                          key={type.name}
                          className={`opportunity-type-button ${
                            opportunityType === type.name ? "active" : ""
                          }`}
                          onClick={() => setOpportunityType(type.name)}
                        >
                          <Icon size={15} />

                          <span>{type.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="opportunity-title">Opportunity Title</label>
                    <span className="character-count">
                      {title.length} / 100
                    </span>
                  </div>

                  <input
                    id="opportunity-title"
                    type="text"
                    maxLength={100}
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div className="form-two-columns">
                  <div className="form-field">
                    <label htmlFor="linked-project">
                      Linked Foundry Project
                    </label>
                    <div className="select-field">
                      <select
                        id="linked-project"
                        value={linkedProject}
                        onChange={(event) =>
                          setLinkedProject(event.target.value)
                        }
                      >
                        <option>Aether Spatial Engine</option>
                        <option>Nexus Design System</option>
                        <option>ForgeCLI Toolchain</option>
                        <option>No linked project</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="hiring-team">Hiring Team / Pod</label>
                    <div className="select-field">
                      <select
                        id="hiring-team"
                        value={hiringTeam}
                        onChange={(event) => setHiringTeam(event.target.value)}
                      >
                        <option>Graphics Runtime & Shaders Pod</option>

                        <option>Core Engineering</option>

                        <option>Product Engineering</option>

                        <option>Design Systems</option>
                      </select>
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                <p className="form-helper-text">
                  Displays project milestones & ccodebase badges on the card
                </p>
              </section>
              <section className="form-section">
                <div className="form-section-heading">
                  <div className="section-heading-left">
                    <span className="section-number">2</span>

                    <div>
                      <h2>Details, Scope & Compensation</h2>

                      <p>
                        Clear technical specifications yield 3.4x higher
                        response rates
                      </p>
                    </div>
                  </div>

                  <span className="section-required">Required</span>
                </div>

                <div className="form-field">
                  <label htmlFor="overview">
                    Role Overview & What You'll Build
                  </label>

                  <div className="rich-text-editor">
                    <div className="editor-toolbar">
                      <button type="button" aria-label="Bold">
                        <strong>B</strong>
                      </button>

                      <button type="button" aria-label="Italic">
                        <em>I</em>
                      </button>

                      <button type="button" aria-label="List">
                        <List size={14} />
                      </button>
                    </div>

                    <textarea
                      id="overview"
                      rows={5}
                      maxLength={1000}
                      value={overview}
                      onChange={(event) => setOverview(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label htmlFor="skills">Required Skills & Stack</label>

                  <div className="skills-field">
                    <div className="selected-skills">
                      {skills.map((skill) => (
                        <span className="selected-skill" key={skill}>
                          {skill}

                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            aria-label={`Remove ${skill}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))}

                      <input
                        id="skills"
                        type="text"
                        placeholder="+ Add skill tag"
                        value={skillInput}
                        onChange={(event) => setSkillInput(event.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                    </div>
                  </div>

                  <div className="suggested-skills">
                    <span>Suggested:</span>

                    {suggestedSkills.map((skill) => (
                      <button
                        type="button"
                        key={skill}
                        onClick={() => addSuggestedSkill(skill)}
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-two-columns">
                  <div className="form-field">
                    <label>Work Arrangement</label>

                    <div className="segmented-control">
                      {["Remote", "Hybrid", "On-site"].map((option) => (
                        <button
                          type="button"
                          key={option}
                          className={workArrangement === option ? "active" : ""}
                          onClick={() => setWorkArrangement(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="location">Location / Timezone Range</label>

                    <div className="input-with-icon">
                      <Globe2 size={14} />

                      <input
                        id="location"
                        type="text"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="compensation-card">
                  <div className="compensation-heading">
                    <div>
                      <div className="compensation-title">
                        <CircleDollarSign size={15} />

                        <span>Compensation Structure</span>
                      </div>
                    </div>

                    <span>Pay transparency required by community charter</span>
                  </div>

                  <div className="compensation-fields">
                    <div className="form-field">
                      <label>Currency</label>

                      <div className="select-field">
                        <select
                          value={currency}
                          onChange={(event) => setCurrency(event.target.value)}
                        >
                          <option>USD ($)</option>

                          <option>EUR (€)</option>

                          <option>GBP (£)</option>

                          <option>NGN (₦)</option>
                        </select>

                        <ChevronDown size={13} />
                      </div>
                    </div>

                    <div className="form-field">
                      <label>Min Pay / Rate</label>

                      <input
                        type="text"
                        value={minPay}
                        onChange={(event) => setMinPay(event.target.value)}
                      />
                    </div>

                    <div className="form-field">
                      <label>Max Pay / Rate</label>

                      <div className="pay-input">
                        <input
                          type="text"
                          value={maxPay}
                          onChange={(event) => setMaxPay(event.target.value)}
                        />

                        <span>/ {payPeriod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="compensation-options">
                    <label>
                      <input
                        type="checkbox"
                        checked={includesEquity}
                        onChange={(event) =>
                          setIncludesEquity(event.target.checked)
                        }
                      />

                      <span>Includes Equity (0.25% - 0.75%)</span>
                    </label>

                    <label>
                      <input
                        type="checkbox"
                        checked={tokenGrant}
                        onChange={(event) =>
                          setTokenGrant(event.target.checked)
                        }
                      />

                      <span>Token Grant / Incentive Pool</span>
                    </label>
                  </div>
                </div>

                <div className="form-two-columns">
                  <div className="form-field">
                    <label htmlFor="deadline">Application Deadline</label>

                    <div className="input-with-icon">
                      <CalendarDays size={14} />

                      <input
                        id="deadline"
                        type="date"
                        value={deadline}
                        onChange={(event) => setDeadline(event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label htmlFor="start-window">Target Start Window</label>

                    <div className="select-field">
                      <select
                        id="start-window"
                        value={startWindow}
                        onChange={(event) => setStartWindow(event.target.value)}
                      >
                        <option>Immediately</option>

                        <option>Within 14 days</option>

                        <option>Within 30 days</option>

                        <option>Within 60 days</option>

                        <option>Flexible</option>
                      </select>

                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
              </section>
              <section className="form-section">
                <div className="form-section-heading">
                  <div className="section-heading-left">
                    <span className="section-number">3</span>
                    <div>
                      <h2>Application & Screening Protocol</h2>
                      <p>
                        Streamlined submissions powered by verified builder
                        profiles
                      </p>
                    </div>
                  </div>
                  <span className="section-required configurable">
                    Configurable
                  </span>
                </div>

                <div className="fast-apply-card">
                  <div className="fast-apply-icon">
                    <Zap size={18} />
                  </div>
                  <div className="fast-apply-content">
                    <h3>
                      Foundry Fast Apply
                      <span>Recommended</span>
                    </h3>
                    <p>
                      Applicants submit with their verified builder graph:
                      milestone proofs, Github pull requests, demo sandbox
                      links, and reputation scores. Zero cover letters required
                    </p>
                    <div className="fast-apply-benefits">
                      <span>
                        <Check size={11} />
                        1-click submission
                      </span>
                      <span>
                        <Check size={11} />
                        Direct DM in Foundry Chat
                      </span>
                      <span>
                        <Check size={11} />
                        Verified commit history
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle-switch ${fastApply ? "active" : ""}`}
                    onClick={() => setFastApply(!fastApply)}
                    aria-label="Toggle Fast Apply"
                  >
                    <span />
                  </button>
                </div>

                <div className="form-field">
                  <label htmlFor="application-url">
                    External Application URL
                    <span className="optional">Optional fallback</span>
                  </label>
                  <div className="input-with-icon">
                    <Send size={14} />
                    <input
                      id="application-url"
                      type="url"
                      value={applicationUrl}
                      onChange={(event) =>
                        setApplicationUrl(event.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="screening-question">
                    Custom Technical Prompt / Screening Question
                  </label>
                  <textarea
                    id="screening-question"
                    rows={3}
                    value={screeningQuestion}
                    onChange={(event) =>
                      setScreeningQuestion(event.target.value)
                    }
                  />
                </div>
              </section>
            </div>
            <aside className="create-opportunity-sidebar">
              <section className="preview-card-wrapper">
                <div className="side-card-heading">
                  <div>
                    <span className="live-indicator" />
                    <strong>Live Feed Card Preview</strong>
                  </div>
                  <span>As seen in Discover feed</span>
                </div>
                <div className="feed-preview">
                  <div className="preview-top">
                    <div className="preview-project-icon">
                      <BriefcaseBusiness size={17} />
                    </div>
                    <div className="preview-meta">
                      <span>Aether Spatial Engine</span>
                      <span>·</span>
                      <span>{workArrangement}</span>
                    </div>
                  </div>
                  <h3>{previewTitle}</h3>
                  <p>{previewDescription}</p>
                  <div className="preview-tags">
                    {skills
                    .slice(0, 4)
                    .map((skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    ))}
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </form>
      </MainLayout>
    );
  };
}
export default CreateOpportunity;
