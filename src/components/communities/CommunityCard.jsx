export default function CommunityCard({ community }) {
  return <article><h2>{community?.name}</h2><p>{community?.description}</p></article>
}
