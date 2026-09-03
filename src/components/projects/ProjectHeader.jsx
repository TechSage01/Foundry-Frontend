export default function ProjectHeader({ project }) {
  return <header><h1>{project?.name}</h1><p>{project?.description}</p></header>
}
