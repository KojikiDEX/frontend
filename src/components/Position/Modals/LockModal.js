import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";
import MinusIcon from "../../Icons/MinusIcon";
import PlusIcon from "../../Icons/PlusIcon";

export default function LockModal(props) {
  const { openModal, handleModal, positionData, lockPosition } = props;

  const [loading, setLoading] = useState(0);

  const [lockMonths, setLockMonths] = useState(0);
  const [lockDays, setLockDays] = useState(0);
  let [bonusPercent, setBonusPercent] = useState(0.0);
  const handleLockPeriod = (lockMonths, lockDays) => {
    if (parseInt(lockDays) > 31) {
      setLockMonths(Number(lockMonths) + 1);
      setLockDays(0);
    } else if (lockDays < 0 && lockMonths < 1) {
      setLockMonths(0);
      setLockDays(0);
    } else if (lockDays < 0 && lockMonths >= 1) {
      setLockDays(30);
      setLockMonths(Number(lockMonths) - 1);
    } else {
      setLockDays(lockDays);
      setLockMonths(lockMonths);
    }
    bonusPercent = (parseFloat(lockMonths) + parseFloat(lockDays)) * 0.55;
    setBonusPercent(bonusPercent.toFixed(2));
  };

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">lock position</span>
        </DialogHeader>
        <DialogBody>
          {loading != 0 && (
            <div className="absolute flex justify-center items-center w-full h-full -ml-4">
              <div role="status">
                <LoadingIcon />
              </div>
              <p>loading ...</p>
            </div>
          )}
          <div>
            <div className="mb-2">
              <div>
                <p className="text-center">lock duration</p>
                {/* <button className="default-outline text-sm">
                  set max bonus
                </button> */}
              </div>
              <div className="flex justify-center gap-2 items-end">
                <div className="flex items-end justify-end">
                  <button
                    className="border-[1px] !p-0"
                    onClick={() =>
                      handleLockPeriod(lockMonths, Number(lockDays) - 1)
                    }
                  >
                    <MinusIcon />
                  </button>
                </div>
                <div className="flex flex-col justify-end items-center">
                  <p className="text-center">M</p>
                  <input
                    type="number"
                    className="max-w-[25px] text-center text-sm border leading-none"
                    value={lockMonths}
                    onChange={(e) => handleLockPeriod(e.target.value, lockDays)}
                  />
                </div>
                <div className="flex flex-col justify-end items-center">
                  <p className="text-center">D</p>
                  <input
                    type="number"
                    className="max-w-[25px] text-center text-sm border leading-none"
                    value={lockDays}
                    onChange={(e) =>
                      handleLockPeriod(lockMonths, e.target.value)
                    }
                  />
                </div>
                <div className="flex items-end justify-start">
                  <button
                    className="border-[1px] !p-0"
                    onClick={() =>
                      handleLockPeriod(lockMonths, Number(lockDays) + 1)
                    }
                  >
                    <PlusIcon color="#14a8d4" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center">
              <span className="text-kojiki-blue">{bonusPercent}%</span> lock
              bonus
            </p>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() =>
                lockPosition(
                  positionData.poolAddr,
                  positionData.tokenId,
                  (parseInt(lockMonths, 10) * 30 + parseInt(lockDays)) *
                    3600 *
                    24
                )
              }
            >
              Lock
            </button>
          </div>
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => handleModal(false)}
            >
              cancel
            </button>
          </div>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
