export default function ProjectTabs({ tabs = [], activeTab, onChange }) {
  return <nav>{tabs.map((tab) => <button type="button" key={tab} onClick={() => onChange?.(tab)} aria-current={tab === activeTab}>{tab}</button>)}</nav>
}
