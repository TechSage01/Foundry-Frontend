import avatar from '../assets/profile/avatar.png'
import cover from '../assets/profile/cover.jpg'
import project1 from '../assets/profile/project-1.jpg'
import project2 from '../assets/profile/project-2.jpg'
import project3 from '../assets/profile/project-3.jpg'

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
    ],

    journey: [
        {
            role: 'Principal Design Technologist',
            period: '2023 - Present'
        },
        {
            role: 'Senior Frontend Engineer',
            period: '2021 - 2023',
        },
        {
            role: 'Full Stack Developer',
            period: '2019 — 2021',
        },
    ],

    projects: [
        {
            title: 'Nexus Design System',
            description: 'Design system for modern web applications.',
            image: project1,
        },
        {
            title: 'Aether Spatial Engine', 
            description: 'Tools for building spatial web experiences.',
            image: project2,
        },
        {
            title: 'ForgeCLI Toolchain', 
            description: 'Developer tooling for faster workflows.',
            image: project3, 
        },
    ],

    avatar,
    cover,
}


export default profileData
