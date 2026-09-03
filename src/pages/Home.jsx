import Feed from '../components/home/Feed'

export default function Home({ posts = [] }) {
  return <><h1>Home</h1><Feed posts={posts} /></>
}
