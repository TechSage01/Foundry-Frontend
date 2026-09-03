export default function ProjectCard({ project }) {
  return <article><h2>{project?.name}</h2><p>{project?.description}</p></article>
}
