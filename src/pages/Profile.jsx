import React from "react";
import MainLayout from "../components/layout/MainLayout";
import profileData from "../data/profileData";

import {
  UserPlus,
  Share2,
  MoreHorizontal,
  Folder,
  Users,
  UserRoundCheck,
  Flame,
  BriefcaseBusiness,
  Code2,
  TrendingUp,
  FlaskConical,
  ExternalLink,
  Star,
  GitFork,
  Activity,
} from 'lucide-react'

function Profile() {
    const profile = profileData;
    return (
        <MainLayout>
            <div className="profile-page">
                <section className="profile-hero">
                    <div className="profile-cover">
                        <img src={profile.cover} alt="" className="profile-cover-image" />

                        <img
                            src={profile.avatar}
                            alt={profile.name}
                            className="profile-avatar"
                        />
                    </div>

                    <div className="profile-info">
                        <div>
                            <div className="profile-name-row">
                                <h1>{profile.name}</h1>

                                <span className="profile-badge">{profile.badge}</span>
                            </div>

                            <p className="profile-meta">
                                {profile.username} · {profile.bio}
                            </p>
                        </div>

                        <div className="profile-actions">
                            <button className="follow-button">
                                <UserPlus size={16} />
                                <span>Follow Builder</span>
                            </button>

                            <button className="icon-button" aria-label="Share profile">
                                <Share2 size={18} />
                            </button>

                            <button className="icon-button" aria-label="More options">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="profile-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Folder size={20} />
                        </div>

                        <div>
                            <span>Active Projects</span>
                            <strong>{profile.stats.activeProjects}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Users size={20} />
                        </div>

                        <div>
                            <span>Followers</span>
                            <strong>{profile.stats.followers}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <UserRoundCheck size={20} />
                        </div>

                        <div>
                            <span>Following</span>
                            <strong>{profile.stats.following}</strong>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">
                            <Flame size={20} />
                        </div>

                        <div>
                            <span>Builder Score</span>
                            <strong>{profile.stats.builderScore}</strong>
                        </div>
                    </div>
                </section>

                <div className="profile-content">
                    <div className="profile-main">
                        <section className="profile-section">
                            <div className="section-heading">
                                <BriefcaseBusiness size={18} />
                                <h2>About Builder</h2>
                            </div>

                            <p>{profile.about}</p>
                        </section>

                        <section className="profile-section">
                            <div className="section-heading">
                                <Code2 size={18} />
                                <h2>Skills & Stack</h2>
                            </div>

                            <div className="skill-list">
                                {profile.skills.map((skill) => (
                                    <span key={skill}>{skill}</span>
                                ))}
                            </div>
                        </section>

                        <section className="profile-section">
                            <div className="section-heading">
                                <TrendingUp size={18} />
                                <h2>Journey Timeline</h2>
                            </div>

                            <div className="timeline">
                                {profile.journey.map((item) => (
                                    <div className="timeline-item" key={item.role}>
                                        <div className="timeline-dot" />

                                        <div className="timeline-content">
                                            <span className="timeline-period">{item.period}</span>

                                            <strong>{item.role}</strong>

                                            <p>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="profile-showcase">
                        <div className="showcase-heading">
                            <h2>Active Showcase</h2>

                            <span>{profile.projects.length} public modules</span>
                        </div>

                        {profile.projects.map((project) => (
                            <article className="showcase-card" key={project.title}>
                                <div className="showcase-image-wrapper">
                                    <img src={project.image} alt={project.title} />

                                    <span className="beta-badge">
                                        <FlaskConical size={13} />
                                        {project.version}
                                    </span>
                                </div>

                                <div className="showcase-content">
                                    <div className="showcase-title-row">
                                        <div>
                                            <h3>{project.title}</h3>
                                            <p>{project.description}</p>
                                        </div>

                                        <button
                                            className="project-link"
                                            aria-label={`Open ${project.title}`}
                                        >
                                            <ExternalLink size={17} />
                                        </button>
                                    </div>
                                    <div className="project-stats">
                                        <div>
                                            <span>Stars</span>

                                            <strong>
                                                <Star size={14} />
                                                {project.stats.stars}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Forks</span>
                                            <strong>
                                                <GitFork size={14} />
                                                {project.stats.forks}
                                            </strong>
                                        </div>
                                        <div>
                                            <span>Active Users</span>

                                            <strong>
                                                <Activity size={14} />
                                                {project.stats.activeUsers}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </aside>
                </div>
            </div>
        </MainLayout>
    );
}

export default Profile
