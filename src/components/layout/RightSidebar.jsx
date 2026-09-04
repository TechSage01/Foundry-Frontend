import React from 'react'
import {
    TrendingUp,
    Users,
    UserPlus,
    ChevronRight
} from 'lucide-react'

const RightSidebar = () => {
  return (
    <div className='space-y-4'>
        <div className='bg-[#FEF2EC] rounded-2xl p-4 border border-[#EFECE6]'>
            <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                    <TrendingUp className='w-4 h-4 text-[#D97757]'/>
                    <h3 className='text-xs font-bold text-[#1F1F1F]'>Trending Topics</h3>
                </div>
                <span className='text-[10px] text-gray-500 font-medium'>Live</span>
            </div>
            <div className='space-y-3'>
                {[
                    {tag: "#BuildInPublic",  count: "1.4k posts today"},
                    {tag: "#IndieHackerMRR", count: "850 posts today"},
                    {tag: "#AIAgents",       count: "620 posts today"},
                    {tag: "DesignSystems",   count: "410 posts today"},
                ].map((topic) => (
                    <div key={topic.tag} className= "flex items-center justify-between text-xs cursor-pointer group">
                        <div>
                            <p className='font-semibold text-[#2D2D2D] group-hover:text-[#D97757]'>{topic.tag}</p>
                            <p className="text-[10px] text-[#737373]">{topic.count}</p>
                        </div>
                        <ChevronRight className='w-3.5 h-3.5 text-[#737373]'/>
                    </div>
                ))}
            </div>
        </div>
        <div className='bg-[#F4F2E2] rounded-2xl p-4 border border-[#EFECE6]'>
            <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-2'>
                    <Users className='w-4 h-4 text-[#D97757]'/>
                    <h3 className='text-xs font-bold text-[#1F1F1F]'>Active Communities</h3>
                </div>
                <button className='text-[11px] text-gray-500 hover:underline'>Explore all</button>
            </div>
            <div className='space-y-3'>
                {[
                    { name: "SaaS Founders",      count: "1.4k posts today",  avatar:'SaaS', color: "bg-[#D97757]"},
                    { name: "AI & LLM Hackers",   count: "4.2k posts today",  avatar:'AI',   color: "bg-zinc-700"},
                    { name: "Design Engineers",   count: "2.4k posts today",  avatar:'UI',   color: "bg-slate-800"},
                ].map((comm) => (
                    <div key={comm.name} className= "flex items-center justify-between text-xs cursor-pointer group">
                        <div className='flex items-center gap-2'>
                            <div className={`w-7 h-7 rounded-lg ${comm.color} text-white flex items-center justify-center font-bold text-[10px]`}>
                                {comm.avatar}
                            </div>
                            <div>
                                <p className='font-semibold text-[#2D2D2D] group-hover:text-[#D97757] text-[11px]'>{comm.name}</p>
                                <p className="text-[10px] text-[#737373]">{comm.count}</p>
                            </div>
                        </div>
                        <button className='px-2.5 py-1 bg-white hover:bg-gray-100 rounded-md text-[11px] font-medium border border-gray-200'>
                            Join
                        </button>
                        {/* <ChevronRight className='w-3.5 h-3.5 text-[#737373]'/> */}
                    </div>
                ))}
            </div>
        </div>
        <div className='bg-[#FEF2EC] rounded-2xl p-4 border border-[#EFECE6]'>
            <div className='flex items-center gap-2 mb-3'>
                <UserPlus className='w-4 h-4 text-[#D97757]'/>
                <h3 className='text-xs font-bold text-[#1F1F1F]'>Suggested Builders</h3>
            </div>
            <div className='space-y-3'>
                {[
                    {name: "Alex Rivera",  role: "Creator Of Taskflow"},
                    {name: "Sarah Jenkins", role: "Design Lead at vercel"}
                ].map((user) => (
                    <div key={user.name} className= "flex items-center justify-between text-xs cursor-pointer group">
                        <div>
                            <p className='font-semibold text-[#2D2D2D] group-hover:text-[#D97757]'>{user.name}</p>
                            <p className="text-[10px] text-[#737373]">{user.role}</p>
                        </div>
                        <button className='px-3 py-1 bg-[#803323] text-white hover: opacity-90 rounded-md font-medium text-[11px]'>
                            Follow
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </div>
  )
}

export default RightSidebar