import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuItem } from "@material-tailwind/react";

import NavListMenu from "./NavListMenu";

import { menuItems } from "../../../config/menu";

export default function NavListItem() {
  const location = useLocation();

  return (
    <React.Fragment>
      <ul className="w-full overflow-x-auto	flex justify-around border-t-2 ">
        {menuItems.map((menu, key) =>
          menu.link === undefined ? (
            <NavListMenu key={menu.label} menu={menu} />
          ) : (
            <Link
              key={menu.label}
              to={menu.link}
              target={menu.target !== undefined ? menu.target : "_self"}
            >
              <MenuItem className="px-2 text-center">
                <span
                  className={` hover: ${
                    location.pathname == menu.link ? "" : ""
                  } `}
                >
                  {menu.label}
                </span>
              </MenuItem>
            </Link>
          )
        )}
      </ul>
    </React.Fragment>
  );
}
