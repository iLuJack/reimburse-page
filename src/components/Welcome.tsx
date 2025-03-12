"use client";

import { Play, Circle } from "lucide-react";
import { useState } from "react";
import VideoPopup from "@/components/VideoPopup";
import { DEMO_VIDEO } from "@/constants/index";
import Image from "next/image";
function Welcome() {
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);

  return (
    <div className="bg-white-1 pb-20">
      <section className="min-h-screen flex justify-center items-center py-12 lg:py-20">
        <div className="px-4 w-full"></div>
      </section>
      <div>
        <div className="py-2 flex justify-center relative">
          <div className="relative z-[0] w-[75%] max-w-[1200px]">
            <div className="absolute -top-8 left-0 right-0 h-10 bg-gray-100 rounded-t-[14px] border-[1.5px] border-black-1">
              <div className="flex items-center h-full px-4">
                <div className="flex gap-2">
                  <Circle size={12} className="text-red-500 fill-current" />
                  <Circle size={12} className="text-yellow-500 fill-current" />
                  <Circle size={12} className="text-green-500 fill-current" />
                </div>
              </div>
            </div>
            <div className="aspect-video w-full">
              <Image
                width={1300}
                height={731}
                alt="Demo Interface"
                className="h-full w-full 
                  rounded-b-[14px] 
                  border-[1.5px] 
                  border-t-0
                  border-black-1
                  bg-white-1/80 
                  object-cover 
                  shadow-[0px_15px_45px_0px_rgba(0,0,0,0.10),0px_0px_0px_6px_rgba(171,178,192,0.12)]
                  backdrop-blur-[7.5px]"
                src={DEMO_VIDEO.thumbnail}
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-100/30 to-gray-100 rounded-[14px]" />
          </div>

          <button
            className="group
              absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
              flex items-center justify-center gap-2 rounded-full bg-white/60
              w-[120px] md:w-[160px]
              px-4 md:px-6 py-2 md:py-3
              text-sm md:text-base lg:text-lg text-white-1 
              shadow-lg transition-all duration-300
              hover:bg-gradient-to-r hover:from-blue-400/80 hover:via-blue-400/60 hover:to-blue-400/40
              hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]
              hover:scale-105
              "
            onClick={() => setIsVideoPopupOpen(true)}
          >
            <Play className="group-hover:rotate-6 w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span className="flex-1 text-center">展示影片</span>
          </button>
        </div>
      </div>
      <VideoPopup
        isOpen={isVideoPopupOpen}
        onClose={() => setIsVideoPopupOpen(false)}
        videoUrl={DEMO_VIDEO.url}
      />
    </div>
  );
}

export default Welcome;
