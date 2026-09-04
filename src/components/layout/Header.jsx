import {Search, Plus, User} from 'lucide-react';
import React from 'react';
import foundryLogo from '../../assets/foundry-logo.png';

export default function Header(){
    return (
        <header className= "fixed top-0 left-0 w-full h-16 bg-[#FAF9F6] border-b border-[#E5E5E5]/60 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-8">
                <div className='w-full md:w-56 flex items-center gap-2 shrink-0'>
                   <div>
                        <img src={foundryLogo} alt="Foundry Logo" className='w-6 h-6 object-contain'/>
                   </div>
                    <span className="text-lg font-bold tracking-tight text-[#1F1F1F]">Foundry</span>
                </div>
                <div className='flex-1 max-w-2xl'>
                    <div className='relative'>
                        <Search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#737373]'/>
                        <input type="text" placeholder='Search Builders, projects, ideas...' className='w-full bg-[#E5E5E5]/30 border border-[#E5E5E5] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1F1F1F] placeholder-[#737373] focus:outline-none focus:bg-write focus:ring-2 focus: ring-[#D97757] transition-all'
                        />
                    </div>
                </div>
                <div className='flex items-center justify-end gap-3 shrink-0'>
                    <button aria-label="Create new Project or Update"
                    className='p-2 hover:bg-[#E5E5E5]/50 rounded-xl transition-colors text-[#1F1F1F] cursor-pointer' 
                    ><Plus className="w-5 h-5"/></button>
                    <button aria-label='User Profile' className='w-8 h-8 rounded-full bg-[#DG7757] hover:bg-[#E5E5E5]/50 text-[#2D2D2D flex items-center justify-center cursor-pointer shadow-sm hover:opacity-95 transition-opacity'>
                        <User className='w-5 h-5 text-[#2D2D2D'/>
                    </button>
                </div>
            </div>

        </header>
    )
}