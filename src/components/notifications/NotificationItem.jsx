export default function NotificationItem({ notification }) {
  return <article><p>{notification?.message}</p><time>{notification?.date}</time></article>
}
