import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";

export default function NavListMenu(props) {
  const { menu } = props;
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [containFlag, setContainFlag] = useState(false);

  useEffect(() => {
    setContainFlag(false);
    menu.subMenu.map(({ label, link, target }) => {
      if (link == location.pathname) setContainFlag(true);
    });
  }, [menu, location.pathname]);

  const triggers = {
    onMouseEnter: () => setIsMenuOpen(true),
    onMouseLeave: () => setIsMenuOpen(false),
  };

  const renderItems = menu.subMenu.map(({ label, link, target }) => (
    <Link
      to={link}
      key={label}
      target={target !== undefined ? target : "_self"}
    >
      <MenuItem>
        <span className={` hover: ${location.pathname == link ? "" : ""} `}>
          {label}
        </span>
      </MenuItem>
    </Link>
  ));

  return (
    <React.Fragment>
      <Menu open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <Link key={menu.label} to="#">
            <MenuItem {...triggers} className={`px-2 text-center`}>
              <span className={` hover: ${containFlag ? "" : ""} `}>
                {menu.label}
              </span>
            </MenuItem>
          </Link>
        </MenuHandler>
        <MenuList {...triggers} className="border-kojiki-blue max-w-fit">
          <ul className="col-span-4 flex flex-col gap-1 !outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
    </React.Fragment>
  );
}
