import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";

import { formatUnits } from "../../../hooks/contractHelper";

export default function HarvestModal(props) {
  const {
    openModal,
    handleModal,
    rewardAmount,
    harvestPosition,
    assetData,
    hasNitro,
    pendingReward,
    tokenIds,
  } = props;
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
          <span className="text-kojiki-blue font-normal">harvest all</span>
        </DialogHeader>
        <DialogBody>
          <div className="flex justify-center md:items-center gap-2">
            <div className="flex gap-1 pt-2">
              <img
                className="w-6 md:w-9 my-auto border-kojiki-blue "
                src={require(`../../../assets/img/token/${assetData.token0.symbol}.png`)}
                alt="fromToken"
              />
              <img
                className="w-6 md:w-9 my-auto border-kojiki-blue "
                src={require(`../../../assets/img/token/${assetData.token1.symbol}.png`)}
                alt="toToken"
              />
            </div>
            <div>
              <Typography>
                {assetData.token0.symbol} - {assetData.token1.symbol}
              </Typography>
              <Typography>{assetData["positions"].length} positions</Typography>
            </div>
          </div>
          <div className="px-2">
            <p>Pending Reward</p>
            <div className="flex justify-between">
              <Typography variant="small">Total rewards</Typography>
              <Typography variant="small">
                ${formatUnits(pendingReward, 18).toFixed(3)}
              </Typography>
            </div>
          </div>
          {hasNitro && (
            <div>
              <br></br>
              <div className="px-2">
                <div className="justify-center">
                  <Typography variant="small">
                    To get those pending rewards, you will need to successively
                    validate a total of harvest transactions.
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => {
                if (!confirming)
                  harvestPosition(
                    assetData.poolAddr,
                    assetData.nitroPool,
                    tokenIds,
                    hasNitro,
                    setConfirming
                  );
              }}
            >
              {confirming ? "confirming" : "Harvest"}
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
