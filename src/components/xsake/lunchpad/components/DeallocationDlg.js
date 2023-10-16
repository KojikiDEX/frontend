import React, { useState } from "react";
import {
  Input,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { contracts } from "../../../../config/contracts";
import { CHAIN_ID, getWeb3 } from "../../../../hooks/connectors";
import { formatValue, getContract } from "../../../../hooks/contractHelper";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import XSakeABI from "../../../../assets/abi/KojikiStakeToken.json";
import { useXSakeState } from "../../../../hooks/useXSakeState";

export default function DeallocationDlg(props) {
  const {
    open,
    handleOpen,
    totalAllocation,
    deallocationFee,
    userAllocation,
    userCoolDown,
  } = props;

  const { xSakeDecimals, xSakeSymbol } = useXSakeState();
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState(0);
  const [confirming, setConfirming] = React.useState(false);
  const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;

  const deallocate = async () => {
    if (!userCoolDown || userCoolDown >= 0) {
      toast.error("Please wait for your cool down time!");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("input amount correctly!");
      return;
    }

    setConfirming(true);
    try {
      const amountValue = formatValue(amount, xSakeDecimals);
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

      const tx = await xSakeContract.deallocate(
        contracts[CHAIN_ID].LAUNCHPAD,
        amountValue,
        0,
        { from: account }
      );

      const resolveAfter3Sec = new Promise((resolve) =>
        setTimeout(resolve, 20000)
      );

      toast.promise(resolveAfter3Sec, {
        pending: "waiting for confirmation...",
      });

      var interval = setInterval(async function () {
        let web3 = getWeb3();
        var response = await web3.eth.getTransactionReceipt(tx.hash);
        if (response !== null) {
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
          setConfirming(false);
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const calcTotalAlloc =
    userAllocation - parseFloat(amount) > 0
      ? userAllocation - parseFloat(amount)
      : 0;

  return (
    <Dialog
      size="xs"
      open={open}
      handler={handleOpen}
      className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
    >
      <DialogHeader className="border-b border-kojiki-blue">
        <span className="text-kojiki-blue font-normal">deallocate xSAKE</span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
          <input
            type="number"
            className="w-full text-sm leading-none"
            min="0"
            max={userAllocation}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            containerProps={{
              className: "min-w-0",
            }}
          />
          <button
            className="primary !py-0"
            onClick={(e) => {
              setAmount(userAllocation);
            }}
          >
            max
          </button>
        </div>
        <p className="text-right text-sm">
          bal : allocated balance: {userAllocation.toFixed(2)} {xSakeSymbol}
        </p>
        {amount && amount > 0 ? (
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-row justify-between">
              <p className="mb-2">estimates</p>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total allocated amount
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {calcTotalAlloc.toFixed(2)} xSAKE
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total allocation share
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {(
                  (calcTotalAlloc / (totalAllocation - parseFloat(amount))) *
                  100
                ).toFixed(2)}{" "}
                %
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                deallocation Fee
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {(amount * deallocationFee).toFixed(2)} xSAKE
              </Typography>
            </div>
          </div>
        ) : (
          <></>
        )}
      </DialogBody>
      <DialogFooter>
        <div className="w-full flex gap-2">
          {!account ? (
            <button className="w-full primary" disabled>
              not connected
            </button>
          ) : (
            <button
              className="w-full primary"
              variant="text"
              size="sm"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) deallocate();
              }}
            >
              {confirming
                ? "confirming..."
                : userAllocation >= parseFloat(amount)
                ? "dellocate"
                : "incorrect amount"}
            </button>
          )}
          <button className="w-full primary" onClick={handleOpen}>
            cancel
          </button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
