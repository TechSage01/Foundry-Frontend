export default function Feed({ posts = [] }) {
  return <section>{posts.map((post) => <article key={post.id}>{post.title || post.content}</article>)}</section>
}
