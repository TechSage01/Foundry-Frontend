import ConversationItem from './ConversationItem'

export default function ConversationList({ conversations = [], onSelect }) {
  return <aside>{conversations.map((conversation) => <ConversationItem key={conversation.id} conversation={conversation} onSelect={onSelect} />)}</aside>
}
