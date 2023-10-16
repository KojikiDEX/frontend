import React, { useEffect, useState } from "react";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import { Link, useLocation } from "react-router-dom";

import { ChevronDownIcon } from "@heroicons/react/24/outline";

export default function NavListItem(props) {
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
        <span
          className={`hover:text-kojiki-blue ${
            location.pathname == link && "text-kojiki-blue"
          } `}
        >
          {label}
        </span>
      </MenuItem>
    </Link>
  ));

  return (
    <React.Fragment>
      <Menu open={isMenuOpen} handler={setIsMenuOpen}>
        <MenuHandler>
          <label
            {...triggers}
            className="flex items-center pt-[2px] px-2 cursor-pointer hover:text-kojiki-blue"
          >
            <span
              className={`${
                containFlag && "text-kojiki-blue underline underline-offset-2"
              }`}
            >
              {menu.label}
            </span>
          </label>
        </MenuHandler>
        <MenuList
          {...triggers}
          className="border-kojiki-gray/20 bg-kojiki-white max-w-fit"
        >
          <ul className="col-span-4 flex flex-col items-start gap-1 !outline-0">
            {renderItems}
          </ul>
        </MenuList>
      </Menu>
    </React.Fragment>
  );
}
