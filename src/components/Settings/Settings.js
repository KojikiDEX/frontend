import React, { useState, useRef } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import SettingIcon from "../Icons/SettingIcon";
import { CHAIN_ID } from "../../hooks/connectors";

export default function Settings(props) {
  const { slippage, setSlippage, initSlippage } = props;
  const [openModal, setOpenModal] = useState(false);
  const settingPad = useRef(null);

  const handleModal = () => {
    if (!openModal)
      document.addEventListener("click", handleOutsideClick, false);

    if (openModal == false) initSlippage();
    setOpenModal(!openModal);
  };

  const changeSlippage = (v) => {
    if (v <= 50) {
      setSlippage(Number(v));

      localStorage.setItem(
        "settings" + CHAIN_ID,
        JSON.stringify({
          slippage: Number(v),
        })
      );
    }
  };

  const handleOutsideClick = (e) => {
    if (!settingPad.current.contains(e.target)) {
      setOpenModal(false);
      document.removeEventListener("click", handleOutsideClick, false);
    }
  };

  return (
    <React.Fragment>
      <div className="relative" ref={settingPad}>
        <button onClick={() => handleModal()}>
          <SettingIcon />
        </button>
        <div
          className={`${
            openModal ? "block" : "hidden"
          } absolute right-0 bg-kojiki-white border-[1px] mt-2 p-2 cursor-default`}
        >
          <div className="p-1">
            <div className="flex justify-between gap-1 items-center mb-3">
              <label>slippage </label>
              <div className="w-[60px] flex items-center gap-1 border-[1px] px-2 py-1">
                <input
                  className="w-full text-right text-sm"
                  type="text"
                  value={slippage}
                  onChange={(e) => changeSlippage(e.target.value)}
                />
                <span className="text-sm">%</span>
              </div>
            </div>
            <div className="flex gap-1 justify-end text-sm">
              <button className="primary" onClick={(e) => changeSlippage(0.3)}>
                0.3%
              </button>
              <button className="primary" onClick={(e) => changeSlippage(0.5)}>
                0.5%
              </button>
              <button className="primary" onClick={(e) => changeSlippage(1)}>
                1%
              </button>
              <button className="primary" onClick={(e) => changeSlippage(5)}>
                5%
              </button>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
