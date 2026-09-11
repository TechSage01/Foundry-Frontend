import React, { useState } from 'react'
import CreateNewPostCard from '../components/feed/CreateNewPostCard'
import FeedFilter from '../components/feed/FeedFilter'
import MainLayout from '../components/layout/MainLayout'
import PostCard from '../components/feed/PostCard'
import { dummyPosts } from '../data/post'
import RightSidebar from '../components/layout/RightSidebar'

const Home= ({selectedTopic, onSelectTopic}) => {
  const [posts, setPosts] = useState(dummyPosts);
  const [activeTab, setActiveTab]= useState('Trending')
  const [sortBy, setSortBy] = useState('Latest')
 
  const currentUser = {
    name: 'TechSage',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  }
  const handleAddPosts = (newPost) => {
    const rawMedia = newPost.mediaUrl || newPost.image || newPost.video|| null;
    const mediaType = newPost.mediaType || (newPost.video  ? 'video' : 'image');
    const createdPost = {
      ...newPost,
      id: Date.now(),
      content: newPost.content || '',
      category: newPost.category || 'Trending',
      isFollowingAuthor: newPost.isFollowingAuthor || true,
      isArticle: newPost.isArticle || Boolean(newPost.title),
      mediaUrl: rawMedia, 
      image: mediaType === 'image' ? rawMedia : null,
      video: mediaType === 'video' ? rawMedia : null,
      mediaType: rawMedia ? mediaType : null,
      timestamp: new Date().toISOString(),
      likes: 0,
      author: typeof newPost.author === 'object' ? newPost.author : {
        name: newPost.author || currentUser.name,
        avatar: newPost.avatar || currentUser.avatar,
      },
      commentsList: newPost.commentsList || [],
      ...newPost,
    };
    setPosts((prevPosts)=> [createdPost, ...prevPosts])
    if (selectedTopic) onSelectTopic(null);
  }

  const filteredPosts = posts.filter((post) => {
    if (selectedTopic) {
        const cleanTopic = selectedTopic.replace('#', '').toLowerCase();
        const contentMatch = post.content?.toLowerCase().includes(cleanTopic);
        const categoryMatch = post.category?.toLowerCase() === cleanTopic;

        return contentMatch || categoryMatch;
    }
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
  // const currentUser = {
  //   name: 'Sage',
  //   avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
  // }
  return (
    // <MainLayout rightSidebar = {<RightSidebar/>}> 
        <div className='space-y-4 max-w-2xl mx-auto'>
          {selectedTopic && (
            <div className='flex items-center justify-between bg-[#F7F4F0] px-4 py-2.5 rounded-xl border border-stone-200/80 text-xs text-stone-700'>
              <span>
                Filtering Feed by <strong>{selectedTopic}</strong>
              </span>
              <button onClick={()=> onSelectTopic(null)}
                className='text-[#A04662] font-semibold hover:underline cursor-pointer'
                >
                  Clear Filter
                </button>
            </div>
          )}
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
                  <div className='p-8 text-center text-xs font-semibold bg-white rounded-2xl border border-stone-200/80 text-stone-500'>
                    <p className='text-sm font-semibold text-stone-700'>
                      {selectedTopic 
                      ? `No posts found under ${selectedTopic}` 
                      : activeTab === 'Following'
                      ? 'You are not following anyone yet. Start following users to see their posts here.'
                      : `no post found under ${activeTab}` 
                      }
                      </p>
                      <p className="text-sm font-semibold text-stone-400 mt-1">
                        {activeTab === 'Following'
                        ? 'Explore the platform and follow users to see their posts in your feed.'
                        : 'Check back later or explore other topics for more content.'
                        ? `Be the first to create a post under ${selectedTopic}`
                        : `Be the first to create/share a post under ${activeTab}`
                        }
                      </p>
                </div>
                ): (
                  sortedPosts.map((post) => (
                    <PostCard key={post.id || Math.random()}  post={post}/>
                  ))
                )}
        </div>
        </div>
    // </MainLayout>
  )
}

export default Home