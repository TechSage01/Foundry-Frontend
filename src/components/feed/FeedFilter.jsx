import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FeedFilter(){
    const [activeTab, setActiveTab] = useState('Trending')
    const tabs = ['Trending', 'Following', 'Milestones']
  return (
    <div className='flex items-center justify-between my-4'>
        <div className='fles items-center bg-[#EFECE6]/60 p-1 rounded-2xl gap-1'>
            {tabs.map((tab)=>(
                <button key={tab}
                onClick={()=> setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-ts font-semibold transition-all cursor-pointer ${ activeTab === tab
                    ? 'bg-white text-[#1F1F1F] shadow-sm'
                    : 'text-[#666666] hover:text-[#1F1F1F]' 
                }`}
                >
                    {tab}
                </button>
            ))}
        </div>
        <div className='flex items-center gap-2 text-xs text-[#666666]'>
            <span>Sort by:</span>
            <div className=' relative inline-block'>
                <select className="appearance-none bg-[#EFECE6]/60 hover:bg-[#EFECE6] text-[#1F1F1F] font-medium rounded-xl px-3 py-1.5 pr-7 focus:outline-none cursor-pointer" id="">
                    <option value="top">Top</option>
                    <option value="latest">Latest</option>
                    <option value="most-liked">Most Liked</option>
                </select>
                <ChevronDown className='w-3.5 h-3.5 text-[#666666] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none'/>
            </div>
        </div>
    </div>
  )
}

