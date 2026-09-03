export default function PostCard({ post }) {
  return <article><h2>{post?.title}</h2><p>{post?.content}</p></article>
}
