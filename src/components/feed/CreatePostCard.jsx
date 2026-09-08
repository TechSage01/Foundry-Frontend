import React from "react";
import { Image, BarChart2, Flag, PenSquare } from "lucide-react";

const CreatePostCard = () => {
  return (
    <>
      <section className="bg-white">
        <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[EFECE6] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#A04622] text-white flex items-center justify-center font-bold text-sm shrink-0">
              JD
            </div>
            <div className="flex-1 flex items-center justify-between bg-[#EFECE6]/70 hover:bg-[#EFECE6]/90 transition-colors rounded-full px-4 py-2 cursor-pointer">
              <input
                type="text"
                placeholder="Share a milestone, metric, or what you're building today..."
                className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none cursor-pointer"
              />
              <PenSquare className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-4 sm:gap-6">
              <button className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer">
                <Image className="w-4 h-4 text-[#A04622]" />
                <span>Photo</span>
              </button>
              <button className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer">
                <BarChart2 className="w-4 h-4 text-[#A04622]" />
                <span>Metrics</span>
              </button>
              <button className="flex items-center gap-2 text-xs font-medium text-[#4A4A4A] hover:text-[#1F1F1F] transition-colors cursor-pointer">
                <Flag className="w-4 h-4 text-[#A04622]" />
                <span>Milestones</span>
              </button>
            </div>
            <button className="bg-[#A04622] hover:bg-[#8A3A1B] text-white px-5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-sm">
              Post Update
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default CreatePostCard;

// <div className="flex items-center justify-between gap-2 w-full">
                    //     <input type="text"
                    //         value={content}
                    //         disabled={isSubmitting}
                    //         onChange={(e) => setContent(e.target.value)}
                    //         placeholder="Share a milestone, metric or what you are building today..."
                    //         className="w-full bg-transparent text-sm text-[#2D2D2D] placeholder-[#737373] focus:outline-none cursor-pointer disabled:opacity-50"
                    //         onKeyDown={(e) => e.key === 'Enter'&& handleSubmit(e)}
                    //     />
                    //     <PenSquare className="w-4 h-4 text-[#737373] shrink-0 ml-2" />
                    //     {/* <Edit3 className="w-4 h-4 text-[#737373] shrink-0 ml-2"/> */}
                    // </div>