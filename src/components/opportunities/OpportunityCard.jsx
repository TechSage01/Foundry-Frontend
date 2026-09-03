export default function OpportunityCard({ opportunity }) {
  return <article><h2>{opportunity?.title}</h2><p>{opportunity?.description}</p></article>
}
