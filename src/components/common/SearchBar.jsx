export default function SearchBar({ value, onChange, placeholder = 'Search' }) {
  return <input type="search" value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} />
}
