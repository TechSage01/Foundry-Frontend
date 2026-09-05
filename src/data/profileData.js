import avatar from '../assets/images/avatar.png'
import cover from '../assets/images/cover.jpg'
import project1 from '../assets/images/project-1.jpg'
import project2 from '../assets/images/project-2.jpg'
import project3 from '../assets/images/project-3.jpg'

const profileData = {
    name: 'Alex Vance',
    username: '@alexvance_dev',
    badge: 'Pro Builder',
    bio: 'Building spatial web tools and design systems',

    stats: {
        activeProjects: 12,
        followers: '2.4k',
        following: 186,
        builderScore: 94,
    },

    about:
        'Full-stack engineer and design technologist. Passionate about crafting high-performance design systems, spatial interfaces, and developer tooling.',

    skills: [
        'TypeScript',
        'React',
        'Next.js',
        'Tailwind CSS',
        'Rust',
        'Three.js',
        'GraphQL',
        'Node.js',
        'Docker'
    ],

    journey: [
        {
            period: '2023 — Present',
            role: 'Principal Design Technologist',
            description:
                'Leading spatial computing interface research and component architecture.',
        },
        {
            period: '2021 — 2023',
            role: 'Senior Frontend Engineer',
            description:
                'Developed core design system workflows used by over 10,000 active builders.',
        },
        {
            period: '2019 — 2021',
            role: 'Full Stack Developer',
            description:
                'Built cloud-native microservices and high-throughput data visualization apps.',
        },
    ],

    projects: [
        {
            title: 'Nexus Design System',
            description:
                'Unified design tokens and modular UI components for rapid application prototyping.',
            image: project1,
            version: 'Beta v0.9',
            stats: {
                stars: '1.2k',
                forks: '340',
                activeUsers: '4.5k',
            },
        },

        {
            title: 'Aether Spatial Engine',
            description:
                'Lightweight WebGL renderer for interactive graph-based visualization in the browser.',
            image: project2,
            version: 'Beta v1.2',
            stats: {
                stars: '850',
                forks: '125',
                activeUsers: '2.1k',
            },
        },

        {
            title: 'ForgeCLI Toolchain',
            description:
                'Blazing fast scaffolding utility for multi-tenant cloud applications written in Rust.',
            image: project3,
            version: 'Beta v0.4',
            stats: {
                stars: '2.4k',
                forks: '410',
                activeUsers: '6.8k',
            },
        },
    ],

    avatar,
    cover,
}


export default profileData
