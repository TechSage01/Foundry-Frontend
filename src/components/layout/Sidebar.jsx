export default function Sidebar({ items = [] }) {
  return <aside><nav>{items.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}</nav></aside>
}
