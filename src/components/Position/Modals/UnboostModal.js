import React, { useState, useEffect } from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { useWeb3React } from "@web3-react/core";
import { CHAIN_ID } from "../../../hooks/connectors";
import kojikiStakeABI from "../../../assets/abi/KojikiStakeToken.json";
import { getWeb3Contract, formatUnits } from "../../../hooks/contractHelper";
import LoadingIcon from "../../Icons/LoadingIcon";

export default function UnboostModal(props) {
  const { openModal, handleModal, positionData, deallocate } = props;

  const [loading, setLoading] = useState(0);

  const [amount, setAmount] = useState(0);

  const [confirming, setConfirming] = useState(false);

  const { account } = useWeb3React();

  const [balance, setBalance] = useState(0);

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
      const balanceOfAccount = await contractERC20.methods
        .getSakeStakeTokenBalance(account)
        .call();
      setBalance(balanceOfAccount[0]);
    })();
  }, [account]);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">unboost position</span>
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
              <span className="ml-auto  ">
                xSAKE bal: {formatUnits(balance, 18)}
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
                  deallocate(
                    positionData.poolAddr,
                    positionData.tokenId,
                    amount,
                    setConfirming
                  );
              }}
            >
              {confirming ? "cofirming..." : `unboost`}
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
