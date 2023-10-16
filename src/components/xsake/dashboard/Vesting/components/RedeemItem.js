import React, { useEffect, useState } from "react";

import { Typography } from "@material-tailwind/react";
import { GiCancel } from "react-icons/gi";
import { IconContext } from "react-icons";
import { displayRemainTime } from "../../../../../utils";
import CancelRedeemDlg from "./CancelRedeemDlg";

export default function RedeemItem(props) {
  const {
    redeemIndex,
    sakeAmount,
    xSakeAmount,
    coolDown,
    // dividendsAddress,
    // allocatedOfDividends
  } = props;

  const [downTime, setDownTime] = useState(coolDown);
  const [timeString, setTimeString] = useState("");

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);

  useEffect(() => {
    setDownTime(coolDown);
  }, [coolDown]);

  useEffect(() => {
    const timerID = setInterval(() => {
      setDownTime((prevData) => {
        if (prevData > 0) {
          return prevData - 1;
        }
        return 0;
      });
    }, 1000);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    setTimeString(displayRemainTime(downTime));
  }, [downTime]);

  const handleCancel = () => {
    setOpen(true);
  };

  return (
    <div className="w-full flex ">
      {sakeAmount !== undefined && (
        <>
          <div className="w-full flex justify-between items-center lg:gap-2 mt-4">
            <span>{`${xSakeAmount} xSAKE`}</span>
            <span>{`${sakeAmount} SAKE`}</span>
            <span>{timeString}</span>
            <button
              className="button my-auto flex flex-col lg:flex-row items-center p-0.5  hover:border-[#14a8d4]"
              onClick={(e) => handleCancel()}
            >
              <IconContext.Provider value={{ className: "my-auto" }}>
                <GiCancel />
              </IconContext.Provider>
              <span>cancel</span>
            </button>
          </div>
        </>
      )}
      <CancelRedeemDlg
        redeemIndex={redeemIndex}
        xSakeAmount={xSakeAmount}
        open={open}
        handleOpen={handleOpen}
      />
    </div>
  );
}
