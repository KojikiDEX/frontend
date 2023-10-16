import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";
import { formatUnits } from "../../../hooks/contractHelper";

export default function SplitModal(props) {
  const { openModal, handleModal, positionData, splitPosition } = props;

  const [loading, setLoading] = useState(0);

  const [amount, setAmount] = useState(0);

  const [confirming, setConfirming] = useState(false);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">split position</span>
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
          <div className="mb-4">
            <p>amount</p>
            <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
              <input
                type="number"
                className="w-full text-sm leading-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button
                className="primary !py-0"
                onClick={(e) => {
                  setAmount(formatUnits(positionData.amount, 18));
                }}
              >
                max
              </button>
            </div>
            <div className="text-right">
              <span className="ml-auto text-sm">
                bal: {formatUnits(positionData.amount, 18)}{" "}
                {positionData.symbol}
              </span>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => {
                if (!confirming)
                  splitPosition(
                    positionData.poolAddr,
                    positionData.tokenId,
                    amount,
                    setConfirming
                  );
              }}
            >
              {confirming ? "confirming" : `split`}
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
