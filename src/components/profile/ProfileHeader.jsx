export default function ProfileHeader({ profile }) {
  return <header><h1>{profile?.name}</h1><p>{profile?.bio}</p></header>
}
