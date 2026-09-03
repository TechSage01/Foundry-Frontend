import { useState } from 'react'
import Button from '../common/Button'

export default function CreatePost({ onSubmit }) {
  const [content, setContent] = useState('')
  const submit = (event) => { event.preventDefault(); onSubmit?.(content); setContent('') }
  return <form onSubmit={submit}><textarea value={content} onChange={(event) => setContent(event.target.value)} /><Button type="submit">Post</Button></form>
}
