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
import {
  formatUnits,
  formatValue,
  getContract,
} from "../../../../hooks/contractHelper";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import XSakeABI from "../../../../assets/abi/KojikiStakeToken.json";
import { useXSakeState } from "../../../../hooks/useXSakeState";

export default function AllocationDlg(props) {
  const { open, handleOpen, userAllocation, totalAllocation } = props;

  const [tokenAllowance, setTokenAllowance] = React.useState(false);
  const { xSakeSymbol, xSakeDecimals, xSakeBalanceOf, allowanceOfLaunchpad } =
    useXSakeState(tokenAllowance);

  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState(0);
  const [confirming, setConfirming] = React.useState(false);
  const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;

  const approveToken = async () => {
    setConfirming(true);
    try {
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);
      const tx = await xSakeContract.approveUsage(
        contracts[CHAIN_ID].LAUNCHPAD,
        formatValue(amount, xSakeDecimals).toString(),
        {
          from: account,
        }
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

            setTokenAllowance(true);

            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const allocate = async () => {
    if (!amount) {
      toast.error("input amount correctly!");
      return;
    }
    setConfirming(true);
    try {
      const amountValue = formatValue(amount, xSakeDecimals);
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

      const tx = await xSakeContract.allocate(
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

  return (
    <Dialog
      size="xs"
      open={open}
      handler={handleOpen}
      className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
    >
      <DialogHeader className="border-b border-kojiki-blue">
        <span className="text-kojiki-blue font-normal">allocate xSAKE</span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
          <input
            type="number"
            className="w-full text-sm leading-none"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            containerProps={{
              className: "min-w-0",
            }}
          />
          <button
            className="primary !py-0"
            onClick={(e) => {
              setAmount(formatUnits(xSakeBalanceOf, xSakeDecimals));
            }}
          >
            max
          </button>
        </div>
        <Typography variant="small" className="mb-4 text-right">
          bal : {formatUnits(xSakeBalanceOf, xSakeDecimals).toFixed(2)}{" "}
          {xSakeSymbol}
        </Typography>
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
                {parseFloat(amount) + parseFloat(userAllocation)} xSAKE
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                total allocation share
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {(
                  ((parseFloat(amount) + parseFloat(userAllocation)) /
                    (parseFloat(amount) + parseFloat(totalAllocation))) *
                  100
                ).toFixed(2)}{" "}
                %
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
          ) : formatUnits(allowanceOfLaunchpad, xSakeDecimals) < amount ? (
            <button
              className="w-full primary"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) approveToken();
              }}
            >
              {confirming ? "approving..." : `approve`}
            </button>
          ) : (
            <button
              className="w-full primary"
              variant="text"
              size="sm"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) allocate();
              }}
            >
              {confirming
                ? "confirming..."
                : formatUnits(xSakeBalanceOf, xSakeDecimals) >=
                  parseFloat(amount)
                ? "allocate"
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
