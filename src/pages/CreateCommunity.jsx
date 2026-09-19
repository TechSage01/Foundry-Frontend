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

  const readinessItems = useMemo(() => [
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
        label: 'Chapter written',
        complete: charter.trim().length > 20,
    },
    {
        label: 'Sync channel configured',
        complete: githubLink.trim() !== '' ||
        communityLink.trim() !== '',
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
  ]
)
const completedReadiness = readinessItems.filter(
    (item) => item.complete
).length
const readinessPercentage = Math.round(
    (completedReadiness / readinessItems.length) * 100
)
const handleLaunch = (event) => {
    event.preventDefault()

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
        communityLink
    }
    console.log('Launch community:', communityData)
}


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
    }
    console.log('Save draft:', draftData)
}
const handleDiscard = () => {
    setCommunityName('')
    setSlug('')
    setTagline('')
    setSelectedDomain('')
    setTechStack([])
    setTechInput('')
    setMembershipType('Open Guild')
    setGithubProof(false)
    setRepositoryContribution(false)
    setFoundrySignal(false)
    setCharter('')
    setDiscussionTopics('')
    setLiveSync('')
    setGithubLink('')
    setCommunityLink('')
    setCharterMode('write')
}


return (
    <MainLayout>
        <div className="create-community-page">
            <div className="create-community-topbar">
                <div className="create-community-breadcrumb">
                    <Link to="/communities">
                    Communities
                    </Link>
                    <span>/</span>
                </div>
                <div className="create-community-save-status">
                    <span className="autosave-dot"/>
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
                    <h1>
                        Create a Technical Community
                    </h1>
                    <p>Assemble an engineering guild, working group or peer-review pod centered around specific architectures, low-level tooling, and production systems</p>
                </div>
            </header>
        </div>
    </MainLayout>
)
}

export default CreateCommunity;
