import { useState } from 'react'
import { Link } from 'react-router-dom'
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
} from 'lucide-react'

import MainLayout from '../components/layout/MainLayout'

const domains = [
  'Systems Programming',
  'Distributed Systems',
  'AI / ML Infra',
  'Compilers & Languages',
  'Cryptography & Zero-Knowledge',
  'Robotics & Hardware',
]

const membershipOptions = [
    {
        id: 'Open Guild',
        title: 'Open Guild',
        description: 'Open to builders who want to participate and contribute'
    },
    {
        id: 'Vetted Syndicate',
        title: 'Vetted Syndicate',
        description: 'Members are reviewed against technical contribution criteria'
    },
     {
        id: 'Working Group',
        title: 'Working Group',
        description: 'A focused group working toward a specific technical outcome'
    },
]

function CreateCommunity() {
    const [communityName, setCommunityName] = useState('')
    const [slug, setSlug] = useState('')
    const [tagLine, setTagline] = useState('')
    const [selectedDomain, setSelectedDomain] = useState('')
    const [techStack, setTechStack] = useState([])
    const [techInput, setTechInput] = useState('')
    const [membershipType, setMembershipType] =
    useState('Open Guild')
    const [githubProof, setGithubProof] = useState(false)
    const [repositoryContribution, setRepositoryContribution] = useState(false)
    const [foundrySignal, setFoundrySignal] = useState(false)
    const [charterMode, setCharterMode] = useState('write')
  const [charter, setCharter] = useState('')
    const [discussionTopics, setDiscussionTopics] =
    useState('')
  const [liveSync, setLiveSync] = useState('')
  const [githubLink, setGithubLink] = useState('')
  const [communityLink, setCommunityLink] = useState('')
    const addTechToken = () => {
    const token = techInput.trim()

    if (!token) return

    if (!techStack.includes(token)) {
      setTechStack((current) => [...current, token])
    }

    setTechInput('')
  }

  const removeTechToken = (tokenToRemove) => {
    setTechStack((current) =>
      current.filter((token) => token !== tokenToRemove)
    )
  }

  const handleTechKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      addTechToken()
    }

    if (
      event.key === 'Backspace' &&
      techInput === '' &&
      techStack.length > 0
    ) {
      removeTechToken(techStack[techStack.length - 1])
    }
  }
  
}

export default CreateCommunity