import {
    AtSign,
    Rocket,
    UserPlus,
    BriefcaseBusiness,
    ThumbsUp,
} from "lucide-react";

const notificationsData = [
    {
        id: 1,
        type: "mention",
        section: "new",
        unread: true,
        icon: AtSign,
        actor: "Elena Rostova",
        action: "mentioned you in a discussion",
        time: "10m ago",
        avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        message: 
            '"@alex We really need your input on the tactile feedback module for the upcoming Foundry hardware drop. Let’s sync?"',
        actions: [
            {
                label: "Join discussion",
                variant: "primary",
            },
            {
                label: "Dismiss",
                variant: "secondary"
            },
        ],
    },
    {
        id: 2,
        type: "project",
        section: "new",
        unread: true,
        icon: Rocket,
        iconStyle: "accent",
        actor: "Project Kinetic",
        action: "released v2.4 milestone",
        time: "1h ago",
        message:
            "All core mechanical assemblies have passed stress tests. Read the full changelog and review performance specs.",
        actions: [
            {
                label: "View update",
                variant: "dark",
            },
        ],
    },
    {
        id: 3,
        type: "follow",
        section: "new",
        unread: true,
        actor: "Marcus Vance",
        action: "started following you",
        time: "3h ago",
        avatar: 
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        message: 
            "Industrial designer crafting autonomous robotics and sustainable hardware systemss.",
        actions: [
            {
                label: "Follow back",
                variant: "primary",
            },
            {
                label: "View profile",
                variant: "secondary",
            },
        ],
    },
        {
        id: 4,
        type: "opportunity",
        section: "earlier",
        unread: false,
        icon: BriefcaseBusiness,
        actor: "Foundry Grants",
        action: "posted a new opportunity matching your stack",
        time: "2d ago",
        message: 
           "Hardware Acceleration Track: Up to $50k in non-dilutive funding for open-source tactile interfaces.",
        actions: [
            {
                label: "View opportunity",
                variant: "secondary",
            },
        ],
    },
    {
        id: 5,
        type: "project",
        unread: false,
        icon: ThumbsUp,
        actor: "Sarah Lin",
        action: 'upvoted your project "AnvilOS"',
        time: "4d ago",
        avatar:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop",
        message: 
            '"This architecture is exceptionally clean. Excited to see where you take the HAL layer."',
        actions: [
            {
                label: "View Project",
                variant: "secondary",
            },
        ],
    },
];
export default notificationsData;