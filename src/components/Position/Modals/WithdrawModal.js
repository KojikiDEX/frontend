import React, { useState } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { formatUnits, formatValue } from "../../../hooks/contractHelper";

import LoadingIcon from "../../Icons/LoadingIcon";
import { BigNumber } from "ethers";

export default function WithdrawModal(props) {
  const { openModal, handleModal, positionData, withdraw } = props;

  const [loading, setLoading] = useState(0);

  const [amount, setAmount] = useState(0);
  const [confirming, setConfirming] = useState(false);

  const [willBeWithdrawnUSD, setWillBeWithdrawnUSD] = useState(0);
  const [willBeRemainedUSD, setWillBeRemainedUSD] = useState(0);

  const calculateUSDValues = (amount) => {
    const realAmount = formatValue(amount, 18);
    const withdrawInUSD = BigNumber.from(realAmount)
      .mul(positionData.lpAssetPrice)
      .div(positionData.lpTotalSupply);
    const remainInUSD = BigNumber.from(positionData.amount)
      .sub(BigNumber.from(realAmount))
      .mul(positionData.lpAssetPrice)
      .div(positionData.lpTotalSupply);
    setWillBeWithdrawnUSD(formatUnits(withdrawInUSD, 6));
    setWillBeRemainedUSD(formatUnits(remainInUSD, 6));
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
          <span className="text-kojiki-blue font-normal">
            withdraw from position
          </span>
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
                onChange={(e) => {
                  setAmount(e.target.value);
                  calculateUSDValues(amount);
                }}
              />
              <button
                className="primary !py-0"
                onClick={(e) => {
                  setAmount(formatUnits(positionData.amount, 18));
                  calculateUSDValues(amount);
                }}
              >
                max
              </button>
            </div>
            <div className="text-right">
              <span className="text-sm">total deposit: </span>
              <span className="text-kojiki-blue text-sm">
                {formatUnits(positionData.amount, 18).toFixed(3)}{" "}
                {positionData.symbol}
              </span>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-3 ">
              <span className=" whitespace-nowrap">withdraw amount</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="  whitespace-nowrap">${willBeWithdrawnUSD}</span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
              <span className=" whitespace-nowrap">remaining amount</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="  whitespace-nowrap">${willBeRemainedUSD}</span>
            </div>
          </div>
          <div>
            <p className="border border-kojiki-blue text-kojiki-blue text-sm p-3">
              Withdrawing from a position doesn't unbind your LP tokens. You
              will need to do so on the Liquidity page once this operation is
              validated.
            </p>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() =>
                withdraw(
                  positionData.poolAddr,
                  positionData.tokenId,
                  amount,
                  setConfirming
                )
              }
            >
              {confirming ? "confirming..." : "withdraw"}
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
