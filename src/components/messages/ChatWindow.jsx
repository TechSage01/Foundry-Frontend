import MessageBubble from './MessageBubble'

export default function ChatWindow({ messages = [] }) {
  return <section>{messages.map((message) => <MessageBubble key={message.id} message={message} />)}</section>
}
