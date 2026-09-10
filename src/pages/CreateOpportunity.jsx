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
}




}
export default CreateOpportunity;