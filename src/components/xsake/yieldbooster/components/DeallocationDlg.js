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
import { useYieldboosterUserStatus } from "../../../../hooks/useYieldboosterUserStatus";
import { boostMultiplier } from "../../../../utils";
import { IconContext } from "react-icons";
import { HiOutlineArrowLongRight } from "react-icons/hi2";

export default function DeallocationDlg(props) {
  const {
    open,
    handleOpen,
    // totalAllocation,
    deallocationFee,
    positionInfo,
  } = props;

  const [amount, setAmount] = useState(0);
  const {
    usersPositionsAllocation,
    expectBonusMultiplier,
    expectPoolShare,
    expectBoostShare,
    // expectTotalAPR,
    // expectFarmBaseAPR,
    // expectBonusBaseAPR,
    // expectEarnedBaseAPR,
    deallocationFeeAmount,
  } = useYieldboosterUserStatus(positionInfo, amount, false, deallocationFee);
  const { xSakeDecimals, xSakeSymbol } = useXSakeState();
  const { account, library } = useWeb3React();
  const [confirming, setConfirming] = React.useState(false);
  const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;

  const calcTotalAlloc =
    usersPositionsAllocation - parseFloat(amount) > 0
      ? usersPositionsAllocation - parseFloat(amount)
      : 0;

  const deallocate = async () => {
    if (!amount || amount <= 0) {
      toast.error("input amount correctly!");
      return;
    }

    setConfirming(true);
    try {
      const amountValue = formatValue(amount, xSakeDecimals);
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

      const web3 = getWeb3();
      const byteDate = web3.eth.abi.encodeParameters(
        ["address", "uint256"],
        [positionInfo.poolAddr, positionInfo.tokenId]
      );

      const tx = await xSakeContract.deallocate(
        contracts[CHAIN_ID].YIELDBOOSTER,
        amountValue,
        byteDate,
        { from: account }
      );

      const resolveAfter3Sec = new Promise((resolve) =>
        setTimeout(resolve, 20000)
      );

      toast.promise(resolveAfter3Sec, {
        pending: "waiting for confirmation...",
      });

      var interval = setInterval(async function () {
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
        <span className="text-kojiki-blue font-normal">unboost position</span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
          <input
            type="number"
            className="w-full text-sm leading-none"
            min="0"
            max={usersPositionsAllocation}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            containerProps={{
              className: "min-w-0",
            }}
          />
          <button
            className="primary !py-0"
            onClick={(e) => {
              setAmount(usersPositionsAllocation);
            }}
          >
            max
          </button>
        </div>
        <p className="text-right text-sm">
          allocated balance: {usersPositionsAllocation.toFixed(2)} {xSakeSymbol}
        </p>
        {amount && amount > 0 ? (
          <div className="w-full flex flex-col">
            <div className="w-full flex flex-row justify-between">
              <p className="mb-2">estimates</p>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                boost allocation
              </Typography>
              <div className="flex flex-row">
                <Typography variant="small" className="text-left">
                  {usersPositionsAllocation}
                </Typography>
                <IconContext.Provider
                  value={{ className: "m-0.5", size: "1rem" }}
                >
                  <HiOutlineArrowLongRight />
                </IconContext.Provider>
                <Typography variant="small" className="mr-4 text-left ">
                  {calcTotalAlloc.toFixed(2)} xSAKE
                </Typography>
              </div>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                bonus multiplier
              </Typography>
              <div className="flex flex-row">
                <Typography variant="small" className="text-left">
                  x{boostMultiplier(positionInfo.boostMultiplier)}
                </Typography>
                <IconContext.Provider
                  value={{ className: "m-0.5", size: "1rem" }}
                >
                  <HiOutlineArrowLongRight />
                </IconContext.Provider>
                <Typography variant="small" className="mr-4 text-left ">
                  x{boostMultiplier(expectBonusMultiplier)}
                </Typography>
              </div>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                position pool share
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {(expectPoolShare / 10000).toFixed(4)} %
              </Typography>
            </div>
            <div className="w-full flex flex-row justify-between">
              <Typography variant="small" className="ml-4 text-right">
                pool boost share
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {expectBoostShare.toFixed(3)} %
              </Typography>
            </div>

            {/* <div className="w-full flex flex-row justify-between mt-2">
                            <Typography variant="small" className="ml-4 text-right">
                                Total APR
                            </Typography>
                            <Typography variant="small" className="mr-4 text-left ">
                                {amount && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : 0} xSAKE
                            </Typography>
                        </div>
                        <div className="w-full flex flex-row justify-between">
                            <Typography variant="small" className="ml-4 text-right">
                                Farm base APR
                            </Typography>
                            <Typography variant="small" className="mr-4 text-left ">
                                {amount && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : 0} xSAKE
                            </Typography>
                        </div>
                        <div className="w-full flex flex-row justify-between">
                            <Typography variant="small" className="ml-4 text-right">
                                Bonus APR
                            </Typography>
                            <Typography variant="small" className="mr-4 text-left ">
                                {amount && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : 0} xSAKE
                            </Typography>
                        </div>
                        <div className="w-full flex flex-row justify-between">
                            <Typography variant="small" className="ml-4 text-right">
                                Earned base APR
                            </Typography>
                            <Typography variant="small" className="mr-4 text-left ">
                                {amount && parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : 0} xSAKE
                            </Typography>
                        </div> */}

            <div className="w-full flex flex-row justify-between mt-2">
              <Typography variant="small" className="ml-4 text-right">
                deallocation fee
              </Typography>
              <Typography variant="small" className="mr-4 text-left ">
                {deallocationFeeAmount.toFixed(4)} xSAKE
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
                : usersPositionsAllocation >= parseFloat(amount)
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
