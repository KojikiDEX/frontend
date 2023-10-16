import React from "react";
import { Link, useLocation } from "react-router-dom";
import { MenuItem } from "@material-tailwind/react";

import NavListItem from "./NavListItem";
import { menuItems } from "../../../config/menu";

export default function NavListMenu() {
  const location = useLocation();

  return (
    <React.Fragment>
      <ul className="hidden md:flex gap-2">
        {menuItems.map((menu, key) =>
          menu.link === undefined ? (
            <NavListItem key={menu.label} menu={menu} />
          ) : (
            <Link
              key={menu.label}
              to={menu.link}
              target={menu.target !== undefined ? menu.target : "_self"}
            >
              <MenuItem>
                <span
                  className={`hover:text-kojiki-blue ${
                    location.pathname == menu.link &&
                    "text-kojiki-blue underline underline-offset-2"
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
