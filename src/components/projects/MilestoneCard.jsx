export default function MilestoneCard({ milestone }) {
  return <article><h3>{milestone?.title}</h3><p>{milestone?.description}</p></article>
}
