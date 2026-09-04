import React from "react";
import MainLayout from "../components/layout/MainLayout";

function Profile() {
  return (
    <MainLayout>
      <div>
        <h1>Alex Vance</h1>
        <p>@alexvance_dev</p>
      </div>
      <div>
        <h2>About Builder</h2>
        <p>
          Full-stack engineer and design technologist. Passionate about crafting
          high-performance design systems, spatial interfaces, and developer
          tooling.
        </p>
      </div>
      <div>
        <h2>Skills & Stack</h2>
        <p>TypeScript · React · Next.js · Tailwind CSS · Rust</p>
      </div>
      <div>
        <h2>Journey Timeline</h2>
        <p>2023 - Present: Principal Design Technologist</p>
        <p>2021 - 2023: Senior Frontend Engineer</p>
        <p>2019 - 2021: Full Stack Developer</p>
      </div>
      <div>
        <h2>Active Showcase</h2>
        <p>Nexus Design System</p>
        <p>Aether Spatial Engine</p>
        <p>ForgeCLI Toolchain</p>
      </div>
    </MainLayout>
  );
}


export default Profile
