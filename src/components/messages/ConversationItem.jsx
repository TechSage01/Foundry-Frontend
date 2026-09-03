export default function ConversationItem({ conversation, onSelect }) {
  return <button type="button" onClick={() => onSelect?.(conversation)}>{conversation?.name}</button>
}
