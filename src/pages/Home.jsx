import React from 'react'
import CreatePostCard from '../components/feed/CreatePostCard'
import FeedFilter from '../components/feed/FeedFilter'
import MainLayout from '../components/layout/MainLayout'
import RightSidebar from '../components/layout/RightSidebar'

const PostCard = () => {
  return (
    // <MainLayout rightSidebar = {<RightSidebar/>}> 
        <div className='space-y-4'>
            <CreatePostCard />
            <FeedFilter />
            {/* <PostCard /> */}
        </div>
    // </MainLayout>
  )
}

export default PostCard