export default function CommunityPost({ post }) {
  return <article><h3>{post?.title}</h3><p>{post?.content}</p></article>
}
