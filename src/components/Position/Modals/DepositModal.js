import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { formatUnits } from "../../../hooks/contractHelper";
import { getWeb3Contract } from "../../../hooks/contractHelper";

import { CHAIN_ID } from "../../../hooks/connectors";

import erc20ABI from "../../../assets/abi/IERC20.json";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";

export default function DepositModal(props) {
  const { openModal, handleModal, positionData, approveToken, deposit } = props;
  const { account } = useWeb3React();
  const [confirming, setConfirming] = useState(false);

  const [loading, setLoading] = useState(0);

  const [amount, setAmount] = useState(0);

  const [balance, setBalance] = useState(0);

  const [allowance, setAllowance] = useState(true);

  const pairAddress = positionData.lpToken;

  useEffect(() => {
    if (!account) {
      return;
    }

    if (!pairAddress) {
      return;
    }

    (async () => {
      const contractERC20 = getWeb3Contract(erc20ABI, pairAddress, CHAIN_ID);

      const reserves = await contractERC20.methods.balanceOf(account).call();
      const allowance = await contractERC20.methods
        .allowance(account, positionData.poolAddr)
        .call();
      const isAllowed = formatUnits(reserves) < formatUnits(allowance);
      setBalance(reserves);
      setAllowance(isAllowed);
    })();
  }, [account, pairAddress]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">add To position</span>
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
          <div className="mb-4 px-2">
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
                  setAmount(formatUnits(balance, 18));
                }}
              >
                max
              </button>
            </div>
            <div className="text-right">
              <span className="text-sm">bal: </span>
              <span className="text-kojiki-blue text-sm">
                {formatUnits(balance, 18).toFixed(3)} {positionData.symbol}
              </span>
            </div>
          </div>
          <div className="px-2">
            <p className="mb-2">estimates</p>
            <div className="flex flex-col md:flex-row justify-between items-center mb-3 ">
              <span className="whitespace-nowrap">deposit value</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="whitespace-nowrap">
                ${formatUnits(positionData.amountInUSD, 6).toFixed(3)} &#8594;{" "}
                <span>
                  ${formatUnits(positionData.amountInUSD, 6).toFixed(3)}
                </span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
              <span className="whitespace-nowrap">total apr</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="whitespace-nowrap">
                {formatUnits(positionData.poolAPY, 18).toFixed(3)}% &#8594;{" "}
                <span>{formatUnits(positionData.poolAPY, 18).toFixed(3)}%</span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
              <span className="whitespace-nowrap">from base apr</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="whitespace-nowrap ">
                {formatUnits(positionData.poolAPY, 18).toFixed(3)}%
              </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
              <span className="whitespace-nowrap">farm bonus apr</span>
              <hr className="border-dashed w-full mx-3" />
              <span className="whitespace-nowrap">
                {formatUnits(positionData.poolAPY, 18).toFixed(3)}% &#8594;{" "}
                <span>{formatUnits(positionData.poolAPY, 18).toFixed(3)}%</span>
              </span>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-center mb-1 ">
              <span className="whitespace-nowrap">earned fees api</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">9.6%</span>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            {!allowance && (
              <button
                className="w-full primary"
                onClick={(e) => {
                  if (!confirming)
                    approveToken(
                      positionData.lpToken,
                      amount,
                      setConfirming,
                      setAllowance
                    );
                }}
              >
                {confirming ? "approving..." : `approve ${positionData.symbol}`}
              </button>
            )}
            {allowance && (
              <button
                className="w-full primary"
                onClick={(e) => {
                  if (!confirming)
                    deposit(
                      positionData.poolAddr,
                      positionData.tokenId,
                      amount,
                      setConfirming
                    );
                }}
              >
                {confirming ? "confirming..." : "add"}
              </button>
            )}
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
