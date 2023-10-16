import React from "react";

import NavListItem from "./components/NavListItem";
import SocialMenu from "./components/SocialMenu";
import WaveMotion from "./components/WaveMotion";

export default function Footer() {
  return (
    <>
      <div className="relative w-fit mx-auto mb-[50px] md:fixed md:mb-[0px] md:right-[20px] md:bottom-[20px] bg-kojiki-blue z-50 px-5 py-3 rounded-full">
        <SocialMenu />
      </div>
      <div className="fixed block md:hidden w-full bottom-0 z-50 bg-kojiki-white">
        <NavListItem />
      </div>
      <div className="hidden md:fixed bottom-0 w-full z-10">
        <WaveMotion />
      </div>
    </>
  );
}
