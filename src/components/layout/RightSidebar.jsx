import React, { useEffect, useState } from 'react'
import {
    TrendingUp,
    Users,
    UserPlus,
    ChevronRight
} from 'lucide-react'

const INITIAL_TOPICS = [
    { id: 1, tag: "#BuildInPublic", count: 1400 },
    { id: 2, tag: "#IndieHackerMRR", count: 850 },
    { id: 3, tag: "#AIAgents", count: 620 },
    { id: 4, tag: "#DesignSystems", count: 410  },
]
const RightSidebar = ({ onSelectTopic, selectedTopic }) => {
    const [topics, setTopics] = useState(INITIAL_TOPICS);
    const formatCount = (num) => {
        return num >= 1000 ? `${(num/1000).toFixed(1)}k`: num;
    }
    useEffect(()=> {
        const interval = setInterval(()=> {
            setTopics((prevTopics) => prevTopics.map((topic)=> {
                    const increment = Math.floor(Math.random() * 3);
                    return{...topic, count: topic.count + increment };
                })
            )
        }, 10000);
        return () => clearInterval(interval);
    }, []);
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
                {topics.map((item) => {
                    const isActive = selectedTopic === item.tag
                    
                    return(
                        <button
                        key={item.id}
                        type='button'
                        onClick={() => onSelectTopic && onSelectTopic(isActive ? null : item.tag)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group text-left ${isActive ? 'bg-[#A04622]/10 border border-[#A04622]/30'  : 'hover:bg-stone-200/60 border border-transparent'}`}
                        >
                            {/* <div key={item.tag} className= "flex items-center justify-between text-xs cursor-pointer group"> */}
                                <div>
                                    <p className={`text-xs font-bold transition-colors ${isActive ? 'text-[#A054622]' : 'text-stone-800 group-hover:text-[#A04622]' }`}>{item.tag}</p>
                                    <p className="text-[10px] text-[#737373]">{formatCount(item.count)} posts today</p>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 text-[#737373] transition-transform  ${ isActive ? 'text-[#A04622] translate-x-0.5' : 'text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5'}`}/>
                            {/* </div> */}
                        </button>
                    )
                })}
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