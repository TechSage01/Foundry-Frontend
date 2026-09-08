import React, { useState} from 'react'
import CreatePostCard from './CreatePostCard'
import FeedFilter from './FeedFilter'
import {
  Heart,
  MessageSquare,
  Share2,
  Bookmark,
  Repeat2,
} from 'lucide-react'

const PostCard = ({ post }) => {
  const [liked,setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post?.likes || 0);

  const[reposted, setReposted] = useState(false)
  const[repostCount, setRepostCount] = useState(post?.repost || 0);

  const[bookmarked, setBookMarked] = useState(false);

  const[showComments, setShowComments]= useState(false)
  const[commentsList, setCommentsList] = useState(post?.commentsList || []);
  const[commentsText, setCommentsText] = useState('')
  const[copied, setCopied] = useState(false)

  const getRelativeTime =(timestamp) => {
    if(!timestamp) return 'Just now';
    const posDate = new Date(timestamp)
    if(isNaN(posDate.getTime())) return timestamp;
    const now = new Date()
    const diffInSeconds = Math.floor((now - posDate)/1000)
    if (diffInSeconds < 60 ) return 'Updated Just now'
    if(diffInSeconds < 3600 ) return `${Math.floor(diffInSeconds/ 60)}m ago`
    if(diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}m ago`

    return date.toLocaleDateString(en-US, {month: 'short', day: 'numeric', year: 'numeric'})
  };
  const handleLike = () => {
    setLiked(!liked);
    setLikesCount((prev) =>(liked ? prev - 1 : prev + 1));
  };
  const handleRepost = ()=> {
    setReposted(!reposted);
    setRepostCount((prev) => (reposted ? prev -1 : prev + 1));
  }
  const handleBookmark = () => {
    setBookMarked(!bookmarked)
  }
  const handleShare = async () => {
    const shareData = {
      title: `Post by ${post?.author || 'Builder' }`,
      text: post?.content || 'Check out this post on Foundry',
      url: window.location.href
    };
    if(navigator.share){
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Error Sharingn:', erroe)
      }
    } else{
      navigator.clipboard.writeText(window.location.href)
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentsText.trim()) return;
    const newComment = {
      id:Date.now(),
      author: 'You',
      text: commentsText.trim(),
      timestamp: new Date().toISOString()
    };
    setCommentsList([...commentsList, newComment]);
    setCommentsText('');
  };
  if(!post) return null;
  return (
  <>
  <article className='p-5 bg-white rounded-xl border border-stone-200/60 shadow-sm text-[#1C1917] space-y-3 font-sans'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <img src=
          {post.avatar} 
          alt={post.author} 
          className='w-10 h-10 rounded-full border border-stone-200 bg-[#F5F0EB] object-cover'
        />
        <div>
          <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-stone-900 leading-none'>{post.author}</h3>
          {post.badge && (
            <span className='text-[10px] font-medium px-2 py-0.5 bg-[#F5F0EB] text-stone-600 rounded-full border border-stone-200'>
              {post.badge}
            </span>
          )}
          </div>
          <span className='text-[11px] text-stone-400'>{getRelativeTime(post.timestamp)}</span>
        </div>
      </div>
    </div>
    {(post.isArticle || post.title) && (
      <div className="pt-1">
        <span className='inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D97757]/10 text-[#D97757] uppercase tracking-wider mb-1.5 '>
          Article
        </span>
        <h2 className='text-base font-bold text-stone-900 leading-tight'>
          {post.title}
        </h2>
      </div>
    )}
    <p className='text-sm text-stone-700 leading-relaxed'>
      {post.content.split(' ').map((word, i) => 
        word.startsWith('H') ? (
          <span key={i} className='text-[#D97757] font-medium mr-1'>
            {word}{' '}
          </span>
        ):(
          word + ' '
        )
      )}
    </p>
    {post.video ? (
        <div className='rounded-lg overflow-hidden border border-stone-200/60 mt-2'>
          <video 
          src={post.video}
          controls
          className='w-full max-h-96 object-contain'
          />
        </div>
    ): post.image ? (
        <div className='rounded-lg overflow-hidden border border-stone-200/60 mt-2'>
          <img src={post.image} alt="Post Attachments" className='w-full max-h-80 object-cover'/>
        </div>
    ): null}

    <div className='flex items-center justify-between pt-3 border-t border-stone-100' text-stone-500 text-xs>
      <button onClick={handleLike}
      className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
        liked ? 'text-[#D97757]' : 'hover:text-[#D97757]'
      }`}
      >
        <Heart size={16} fill={liked ? '#D97757' : 'none'}/>
        <span>{likesCount}</span>
      </button>
      <button
      onClick={() => setShowComments(!showComments)}
      className={`flex items-center gap-1.5 transition-colors cursor-pointer 
        ${showComments ? 'text-stone-900 bg-stone-100' : 'hover: text-stone-900 hover:bg-stone-50' }`}
      >
        <MessageSquare size={18}/>
        <span>{commentsList.length}</span>
      </button>
      <button onClick={handleRepost}
      className={`flex items-center gap-1.5 transition-colors py-1 px-2 rounded-lg hover:text-stone-900 hover:bg-stone-50 cursor-pointer ${
        reposted ? 'text-emerald-600 bg-emerald-50' : 'hover:text-emerald-600 hover:bg-stone-50'
      }`}
      >
        <Repeat2 size={18} className={reposted ? 'rotate-180 transition-transform' : ''}/>
        <span>{repostCount}</span>
      </button>

      {/* <button className='flex items-center gap-1.5 hover:text-stone-800 transition-colors cursor-pointer'>
        <MessageSquare size={16}/>
        <span>{post.comments}</span>
      </button> */}

      <button
      onClick={handleShare}
      className='flex items-center gap-1.5 hover:text-stone-800 transition-colors cursor-pointer'>
        <Share2 size={18}/>
        <span>{copied ? 'copied!' : 'Share'}</span>
      </button>

      <button
      onClick={handleBookmark}
      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
        bookmarked ? 'text-[#D97757] bg-[#F5F0EB]/60' : 'hover:text-stone-900 hover:bg-stone-50'
      }`}
      >
      <Bookmark size={18} fill={bookmarked ? 'D97757' : 'none'}/>
      </button>
    </div>
    {showComments && (
      <div className='pt-3 border-t border-stone-100 space-y-3 bg-[#F9F8F6] p-3 rounded-xl mt-2'>
        <form action="" onSubmit={handleAddComment} className='flex gap-2'>
          <input type='text'
          value={commentsText}
          onChange={(e) => setCommentsText(e.target.value)}
          placeholder='Write a comment...'
          className='flex-1 text-xs px-3 py-2 bg-white rounded-lg border border-stone-200 outline-none focus:border-[#D97757]'
          />
          <button type='submit'
          className='px-3 py-1.5 text-xs font-semibold bg-[#D97757] text-white rounded-lg hover:bg[#C66243] transition-colors cursor-pointer'
          >
            Post
          </button>
        </form>
        <div className='space-y-2 max-h-48 overflow-y-auto pr-1'>
          {commentsList.length === 0 ? (
            <p className='text-[11px] text-stone-400 text-center py-1'>No Comments yet. Be the First!</p>
          ): (
            commentsList.map((c) =>  (
              <div key={c.id} className= "text-xs bg-white p-2.5 rounded-lg border border-stone-200/60 space-y-0.5 ">
                <div className='flex justify-between items-center'> 
                  <span className='font-semibold text-stone-800'>{c.author}</span>
                  <span className='text-[10px] text-stone-400'>{getRelativeTime(c.timestamp)}</span>
                </div>
                <p className='text-stone-600'>{c.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    )}
  </article>
  </>
  )
}

export default PostCard