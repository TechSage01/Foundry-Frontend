import React, { useState } from 'react'
import CreateNewPostCard from '../components/feed/CreateNewPostCard'
import FeedFilter from '../components/feed/FeedFilter'
import MainLayout from '../components/layout/MainLayout'
import PostCard from '../components/feed/PostCard'
import { dummyPosts } from '../data/post'

const Home= () => {
  const [posts, setPosts] = useState(dummyPosts);
  const [activeTab, setActiveTab]= useState('Trending')
  const [sortBy, setSortBy] = useState('Top')

  const handleAddPosts = (newPost) => {
    setPosts((prevPosts)=> [newPost, ...prevPosts])
  }
  const filteredPosts = posts.filter((post) => {
    if(activeTab === 'Following') {
      return post.isFollowingAuthor === true || post.isFollowing === true;
    }
    if(activeTab === 'Milestones') {
      return post.isMilestone === true || post.isArticle === true;
    }
    return true;    
   
  })  
  const sortedPosts = [...filteredPosts].sort((a,b) => {
    if(sortBy === "Top") {
      return (b.likes || 0) - (a.likes || 0)
    }
    if(sortBy === "Latest") {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    if(sortBy === 'most-liked') {
      return (b.likes || 0) - (a.likes || 0);
    }
  })
  const currentUser = {
    name: 'Sage',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  }
  return (
    // <MainLayout rightSidebar = {<RightSidebar/>}> 
        <div className='space-y-4 max-w-2xl mx-auto'>
            <CreateNewPostCard onAddPost={handleAddPosts}
            userName={currentUser.name}
            userAvatar={currentUser.avatar}
            />

            <FeedFilter activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            sortBy={sortBy}
            setSortBy={setSortBy}
            />

            <div className='space-y-4'>
              {sortedPosts.length === 0 ? (
                <div className='text-center py-8 text-stone-400 text-xs bg-white rounded-xl border border-stone-200/60'>
                  <p className='text-sm font-semibold text-stone-700'>
                    {activeTab === 'Following' ? "You are not Following anyone yet." : `No posts found under ${activeTab}.`}
                  </p>
                  <p className='text-xs text-stone-400 mt-1'>
                    {activeTab === 'Following'?  "Follow builders to see their update here!" : "Be the first to share an update!"}
                  </p>
                  {/* No updates found for {activeFilter} yet. */}
                </div>
                
              ): (
                sortedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
                ))
              )}
              
            </div>
            {/* <FeedFilter /> */}
            {/* <PostCard /> */}
        </div>
    // </MainLayout>
  )
}

export default Home