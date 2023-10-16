import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";
import { CHAIN_ID } from "../../../hooks/connectors";
import kojikiStakeABI from "../../../assets/abi/KojikiStakeToken.json";

import { getWeb3Contract, formatNumber } from "../../../hooks/contractHelper";
import { contracts } from "../../../config/contracts";
import { BigNumber } from "ethers";
import { ethers } from "ethers";

export default function BoostModal(props) {
  const { openModal, handleModal, positionData, approveUsage, allocate } =
    props;

  const [loading, setLoading] = useState(0);

  const [amount, setAmount] = useState(0);

  const [confirming, setConfirming] = useState(false);

  const [isAllowed, setIsAllowed] = useState(false);

  const [balanceAccount, setBalanceAccount] = useState(0);

  const { account } = useWeb3React();

  const positionAddress = positionData.poolAddr;
  const usageAddress = contracts[CHAIN_ID].YIELDBOOSTER;

  useEffect(() => {
    if (!account) {
      return;
    }

    (async () => {
      const contractERC20 = getWeb3Contract(
        kojikiStakeABI,
        positionData.kojikiStakeToken,
        CHAIN_ID
      );
      const usageApprovals = await contractERC20.methods
        .getUsageApproval(account, usageAddress)
        .call();
      const balanceOfAccount = await contractERC20.methods
        .balanceOf(account)
        .call();
      const isAllowed = BigNumber.from(usageApprovals).gt(
        BigNumber.from(balanceOfAccount[0])
      );
      setIsAllowed(isAllowed);
      setBalanceAccount(balanceOfAccount[0]);
    })();
  }, [account, positionAddress]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">boost position</span>
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
          <div className="px-2">
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
                  formatNumber(ethers.utils.formatUnits(balanceAccount), 18);
                }}
              >
                max
              </button>
            </div>
            <div className="text-right">
              <span className="text-sm">
                bal: {formatNumber(ethers.utils.formatUnits(balanceAccount), 5)}{" "}
                xSAKE
              </span>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            {!isAllowed && (
              <button
                className="w-full primary"
                onClick={() => {
                  if (!confirming) approveUsage(setConfirming, setIsAllowed);
                }}
              >
                {confirming ? "approving..." : `approve`}
              </button>
            )}

            {isAllowed && (
              <button
                className="w-full primary"
                onClick={() => {
                  if (!confirming)
                    allocate(
                      positionData.poolAddr,
                      positionData.tokenId,
                      amount,
                      setConfirming
                    );
                }}
              >
                {confirming ? "cofirming..." : `boost`}
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
