import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

export default function MainLayout({children, rightSidebar}){
    return(
        <>
            <div className='min-h-screen bg-[#FAF9F6] text-[#1F1F1F]'>
                <Header/>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
                    <div className='grid grid-cols-1 md:grid-cols-12 gap-6'>
                        <aside className='hidden md:block md:col-span-3 lg:col-span-3'>
                            <div className='sticky top-20'>
                                <Sidebar/>
                            </div>
                        </aside>
                        <main className={`col-span-12 ${rightSidebar ? 'md:col-span-9 lg:col-span-6' : 'md:col-span-9'}`}>
                            {children}
                        </main>
                        {rightSidebar && (
                            <aside className='hidden lg:block lg:col-span-3'>
                                <div className='sticky top-20'>
                                    {rightSidebar}
                                </div>
                            </aside>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}