import React from 'react'
import CreatePostCard from './CreatePostCard'
import FeedFilter from './FeedFilter'

const PostCard = () => {
  return (
    <div className='space-y-4'>
        <CreatePostCard />
        <FeedFilter />
        <PostCard />
    </div>
  )
}

export default PostCard