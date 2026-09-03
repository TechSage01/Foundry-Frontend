import ProjectCard from '../projects/ProjectCard'

export default function ProfileProjects({ projects = [] }) {
  return <section>{projects.map((project) => <ProjectCard key={project.id} project={project} />)}</section>
}
