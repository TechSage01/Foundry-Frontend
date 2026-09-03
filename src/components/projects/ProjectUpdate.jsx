export default function ProjectUpdate({ update }) {
  return <article><time>{update?.date}</time><p>{update?.content}</p></article>
}
