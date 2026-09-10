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
} from 'lucide-react'

function CreateOpportunity() {
  const navigate = useNavigate();

  const OpportunityTypes = [
    {
      name: 'Full-time Job',
      icon: BriefcaseBusiness,
    },
    {
      name: 'Co-founder',
      icon: Users,
    },
    {
      name: 'OS Bounty',
      icon: Zap,
    },
    {
      name: 'Hackathon',
      icon: Code2,
    },
    {
      name: 'Grant / Fund',
      icon: CircleDollarSign,
    },
    {
      name: 'Freelance',
      icon: Handshake,
    },
  ]

  const [opportunityType, setOpportunityType] =
  useState('Full-time Job')
  const [title, setTitle] = useState(
    'Senior Rust & WebGPU Graphics Engineer'
  )
  const [linkedProject, setLinkedProject] = useState(
    'Aether Spatial Engine (Active)'
  )
  const [hiringTeam, setHiringTeam] = useState(
    'Graphics Runtime & Shaders Pod'
  )

  const [overview, setOverview] = useState(
    "We're building the next-generation low latency rendering pipeline for decntralized spatial simulations. You will design new WebGPU shader graph, optimize compute shaders in WGSL, and interface directly with our Rust-based deterministic physics engine. Candidates should be comfortable profiling memory bottlenecks in native WASM runtimes."
  )

  const [skills, setSkills] = useState([
    'Rust',
    'WebGPU / WGSL',
    'WASM',
    'Computer Graphics',
  ])
  const suggestedSkills = [
    'Typescript',
    'Distributed Systems',
    'GLSL',
  ]

  const [skillInput, setSkillInput] = useState('')
  const [workArrangement, setWorkArrangement] =
  useState('Remote')

  const [location, setLocation] = useState(
    'Global Remote (UTC-8 to UTC)'
  )

  const [currency, setCurrency] = useState('USD ($)')
  const [minPay, setMinPay] = useState('160,000')
  const [maxPay, setMaxPay] = useState('210,000')
  const [payPeriod, setPayPeriod] = useState('yr')
  const [includesEquity, setIncludesEquity] = 
    useState(true)
  const [tokenGrant, setTokenGrant] =
    useState(false)
  const [deadline, setDeadline] =
    useState('2025-04-30')
  const [startWindow, setStartWindow] =
    useState('Within 30 days')
  const [fastApply, setFastApply] = useState(true)
  const [applicationUrl, setApplicationUrl] =
  useState(
    'https://jobs.lever.co/aether-engine/senior-graphics-engineer'
  )

  const [screeningQuestion, setScreeningQuestion] =
    useState(
      'Share a link to a WebGPU shader or Rust crate you authored, along with the toughest GPU memory profiling challegnge you solved.'
    )

    const [isSaved, setIsSaved] = useState(false)
     const handleSkillKeyDown = (event) => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    const newSkill = skillInput.trim()
    if (!newSkill) return

    if (!skills.includes(newSkill)) {
      setSkills([...skills, newSkill])
    }

    setSkillInput('')
}

  const removeSkill = (skill) => {
    setSkills(
      skills.filter(
        (currentSkill) => currentSkill !== skill
      )
    )
  }

  const addSuggestedSkill = (skill) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill])
    }
  }

   const handleSaveDraft = () => {
    setIsSaved(true)

    setTimeout(() => {
      setIsSaved(false)
    }, 2500)
  }

  const handlePublish = (event) => {
    event.preventDefault()

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
        tokenGrant
      },
      deadline,
      startWindow,
      fastApply,
      applicationUrl,
      screeningQuestion,
    }
    console.log('Opportunity ready to publish:', opportunity)

    const previewTitle =
    title || 'Senior Rust & WebGPU Graphics Engineer'
    const previewDescription =
    overview || 
    'Your opportunity description will appear here.'

    const previewLocation =
    location || 'Global Remote'

  const previewCompensation =
    `${currency} ${minPay} - ${maxPay} / ${payPeriod}`

    return (
      <MainLayout>
        <form 
        className="create-opportunity-page"
        onSubmit={handlePublish}
          >
          <div className="create-opportunity-topbar">
            <button
            type="button"
            className="opportunity-breadcrumb"
            onClick={() =>
              navigate('/opportunities')
            }
            >
              <ArrowLeft size={14} />
              <span>
                Opportunities
              </span>
              <span className="breadcrumb-divider">
              /
            </span>
            <strong>
              Post a New Opportunity
            </strong>
            </button>

            <div className="topbar-actions">
              <span className="autosave-status">
                    <span className="autosave-dot"/>
                    {isSaved
                ? 'Saved to drafts'
                : 'Autosaved to drafts (10:42 AM)'}
              </span>
            <button
              type="button"
              className="discard-button"
              onClick={() =>
                navigate('/opportunities')
              }
            >
              Discard
            </button>
            </div>
          </div>
          <section className="create-opportunity-hero">
            <div className="hero-content">
              <span className="builder-network-badge">
                <Sparkles size={12} />
                  Foundry Builder Network Reach ·
                  42,000+ Engineers & Founders
              </span>
              <h1>
                Create & Publish an Opportunity
              </h1>
              <p>
              Connect with verified builders,
              open-source contributors, technical
              co-founders, and specialized creators
              across the Foundry ecosystem.
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
                    <span className="section-number">
                      1
                    </span>
                    <div>
                      <h2>
                        Opportunity Type & Basics
                      </h2>
                      <p>
                        Classify the opening to reach the right candidate feeds
                      </p>
                    </div>
                  </div>
                  <span className="section-required">
                    Required
                  </span>
                </div>
                <div className="form-field">
                  <label>
                    Category
                  </label>
                  <div className="opportunity-type-grid">
                    {opportunityTypes.map(
                    (type) => {

                      const Icon = type.icon

                      return (
                        <button
                          type="button"
                          key={type.name}
                          className={`opportunity-type-button ${
                            opportunityType ===
                            type.name
                              ? 'active'
                              : ''
                          }`}
                          onClick={() =>
                            setOpportunityType(
                              type.name
                            )
                          }
                        >

                          <Icon size={15} />

                          <span>
                            {type.name}
                          </span>

                        </button>
                      )
                    }
                  )}
                  </div>
                </div>
                <div className="form-field">
                  <div className="field-label-row">
                    <label htmlFor="opportunity-title">
                      Opportunity Title
                    </label>
                    <span className="character-count">
                      {title.length} / 100
                    </span>
                  </div>
                  
                <input
                  id="opportunity-title"
                  type="text"
                  maxLength={100}
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
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
                        setLinkedProject(
                          event.target.value
                        )
                      }
                    >
                      <option>
                        Aether Spatial Engine
                      </option>
                      <option>
                        Nexus Design System
                      </option>
                      <option>
                        ForgeCLI Toolchain
                      </option>
                      <option>
                        No linked project
                      </option>
                    </select>
                    <ChevronDown size={14} />
                    </div>
                  </div>
                  <div className="form-field">
                    <label htmlFor="hiring-team">
                      Hiring Team / Pod
                    </label>
                  </div>
                </div>
              </section>
              
            </div>
          </div>
          
          </form>
      </MainLayout>
    )
}




}
export default CreateOpportunity;