export default function OpportunityFilters({ filters = [], onChange }) {
  return <div>{filters.map((filter) => <button type="button" key={filter} onClick={() => onChange?.(filter)}>{filter}</button>)}</div>
}
