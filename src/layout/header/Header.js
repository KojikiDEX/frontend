import React from "react";
import { Navbar, MobileNav, IconButton } from "@material-tailwind/react";
import { Bars3Icon } from "@heroicons/react/24/outline";

import NavListMenu from "./components/NavListMenu";
import Connect from "../../components/Connect";

import ic_logo from "../../assets/img/logo.png";

export default function Header() {
  const [isNavOpen, setIsNavOpen] = React.useState(false);
  const toggleIsNavOpen = () => setIsNavOpen((cur) => !cur);

  React.useEffect(() => {
    window.addEventListener(
      "resize",
      () => window.innerWidth >= 960 && setIsNavOpen(false)
    );
  }, []);

  return (
    <Navbar className="sticky top-0 z-10 h-max max-w-full rounded-none shadow-none bg-kojiki-white border-none p-2 py-4">
      <div className="relative mx-auto flex justify-between items-center -900">
        <div>
          <span className="title">KOJIKI</span>
        </div>
        <div className="flex items-center gap-5">
          <NavListMenu size="desktop" />
          <Connect />
        </div>
      </div>
    </Navbar>
  );
}
