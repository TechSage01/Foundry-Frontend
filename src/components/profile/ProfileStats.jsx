export default function ProfileStats({ stats = {} }) {
  return <dl>{Object.entries(stats).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
}
