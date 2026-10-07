import {
  Users,
  Palette,
  FolderKanban,
} from "lucide-react";

const messagesData = [
  {
    id: 1,
    type: "project",
    name: "Foundry v2.0 Redesign",
    shortName: "F2",
    members: 5,
    activeBuilders: "Sarah, Alex, Elena, Marcus, You",
    time: "2m",
    preview: "Sarah: Pushed the updated color tokens to main branch.",
    avatar: null,
    icon: FolderKanban,
    messages: [
      {
        id: 1,
        sender: "Sarah Jenkins",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        time: "10:42 AM",
        text:
          "Hey team! I've just finished auditing the surface contrast and token mappings across all primary components. The warm off-white background paired with surface-container shifts feels exceptionally crisp now.",
        isOwn: false,
      },
      {
        id: 2,
        sender: "Alex Rivera",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        time: "10:45 AM",
        text:
          "Looks incredible. The transition states are super smooth. Attached the updated Figma library export and token configuration specs below.",
        isOwn: false,
        attachment: {
          name: "Foundry_v2_Tokens_Final.fig",
          size: "2.4 MB",
          type: "Design Library",
        },
      },
      {
        id: 3,
        sender: "You",
        avatar: null,
        time: "10:50 AM",
        text:
          "Awesome work everyone! I'll integrate these tokens right away and prep the build for our demo later this afternoon. Let's keep this momentum going 🚀",
        isOwn: true,
      },
    ],
  },

  {
    id: 2,
    type: "direct",
    name: "Sarah Jenkins",
    members: 1,
    time: "1h",
    preview: "Let's sync on the typography scale tomorrow morning.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    messages: [
      {
        id: 1,
        sender: "Sarah Jenkins",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        time: "9:20 AM",
        text:
          "Let's sync on the typography scale tomorrow morning.",
        isOwn: false,
      },
    ],
  },

  {
    id: 3,
    type: "project",
    name: "Launchpad Core Squad",
    members: 8,
    time: "Yesterday",
    preview: "Alex: Deployed the latest build to staging environment.",
    avatar: null,
    icon: Users,
    messages: [
      {
        id: 1,
        sender: "Alex Rivera",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        time: "Yesterday",
        text:
          "Deployed the latest build to staging environment.",
        isOwn: false,
      },
    ],
  },

  {
    id: 4,
    type: "direct",
    name: "Alex Rivera",
    members: 1,
    time: "2d",
    preview: "Check out this new shader animation snippet.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    messages: [
      {
        id: 1,
        sender: "Alex Rivera",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
        time: "Monday",
        text:
          "Check out this new shader animation snippet.",
        isOwn: false,
      },
    ],
  },

  {
    id: 5,
    type: "project",
    name: "Design System Guild",
    members: 12,
    time: "3d",
    preview: "Elena: Updated the Figma component variants.",
    avatar: null,
    icon: Palette,
    messages: [
      {
        id: 1,
        sender: "Elena Rostova",
        avatar:
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop",
        time: "Sunday",
        text:
          "Updated the Figma component variants.",
        isOwn: false,
      },
    ],
  },
];

export default messagesData;