import React, { useContext, useEffect, useState } from "react";
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
import { TokenContext } from "../../../../../context/context";
import { contracts } from "../../../../../config/contracts";
import {
  CHAIN_ID,
  MIN_DAYS,
  MAX_DAYS,
  getWeb3,
} from "../../../../../hooks/connectors";
import {
  formatUnits,
  formatValue,
  getContract,
} from "../../../../../hooks/contractHelper";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import XSakeABI from "../../../../../assets/abi/KojikiStakeToken.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function RedeemDlg(props) {
  const { account, library } = useWeb3React();
  const [amount, setAmount] = useState(0);
  const [duration, setDuration] = useState(MIN_DAYS);
  const [days, setDays] = useState(MIN_DAYS);
  const [months, setMonths] = useState(0);
  const [confirming, setConfirming] = React.useState(false);
  const { tokens } = useContext(TokenContext);
  const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;

  const redeem = async () => {
    if (!xSakeToken || !amount || !duration) {
      toast.error("Please check your xSAKE balance, input amount and duration");
      return;
    }
    setConfirming(true);
    try {
      const amountValue = formatValue(amount, xSakeToken.decimals);
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

      const tx = await xSakeContract.redeem(amountValue, duration * 86400, {
        from: account,
      });

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

  useEffect(() => {
    let _duration = duration;
    if (_duration > MAX_DAYS) {
      _duration = MAX_DAYS;
    }
    const _months = Math.floor(_duration / 30);
    const _days = _duration % 30;
    setDays(_days);
    setMonths(_months);
  }, [duration]);

  useEffect(() => {
    let _duration = days + months * 30;
    if (_duration > MAX_DAYS) {
      _duration = MAX_DAYS;
    } else if (_duration < MIN_DAYS) {
      _duration = MIN_DAYS;
    }
    const _months = Math.floor(_duration / 30);
    const _days = _duration % 30;
    setDays(_days);
    setMonths(_months);
    setDuration(_duration);
  }, [days, months]);

  const xSakeToken = tokens[contracts[CHAIN_ID].XSakeTOKEN.toLowerCase()];
  const { open, handleOpen } = props;

  return (
    <Dialog
      size="xs"
      open={open}
      handler={handleOpen}
      className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
    >
      <DialogHeader className="border-b border-kojiki-blue">
        <span className="text-kojiki-blue font-normal">redeem xSAKE</span>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <span>xSAKE allocation</span>
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
              if (xSakeToken) {
                setAmount(formatUnits(xSakeToken.balance, xSakeToken.decimals));
              }
            }}
          >
            max
          </button>
        </div>
        <p className="text-right text-sm">
          bal :{" "}
          {xSakeToken
            ? formatUnits(xSakeToken.balance, xSakeToken.decimals).toFixed(2)
            : 0}{" "}
          {xSakeToken ? xSakeToken.symbol : ""}
        </p>
        <div className="w-full flex flex-row justify-between mt-7">
          <div className="w-2/5">
            <span>redeem duration</span>
            <button
              className="default-outline"
              onClick={(e) => {
                setDuration(MAX_DAYS);
              }}
            >
              <Typography variant="small" className=" text-left">
                set max
              </Typography>
            </button>
          </div>
          <div className="w-3/5 flex flex-row justify-between">
            <button
              className="w-1/5 border  m-2 p-1 py-2 hover:border-[#14a8d4]"
              onClick={() => {
                if (duration <= MIN_DAYS) {
                  setDuration(MIN_DAYS);
                } else {
                  setDuration(duration - 1);
                }
              }}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <div className="w-1/5 mx-1">
              <Typography variant="small" className="mt-2  text-center">
                M
              </Typography>
              <input
                type="number"
                min={0}
                max={6}
                variant="small"
                className="w-full text-center"
                value={months}
                onChange={(e) => {
                  setMonths(parseInt(e.target.value));
                }}
              />
            </div>
            <div className="w-1/5 mx-1">
              <Typography variant="small" className="mt-2  text-center">
                D
              </Typography>
              <input
                type="number"
                min={0}
                max={30}
                variant="small"
                className="w-full text-center"
                value={days}
                onChange={(e) => {
                  setDays(parseInt(e.target.value));
                }}
              />
            </div>
            <button
              className="w-1/5 border  m-2 p-1 py-2 hover:border-[#14a8d4]"
              onClick={() => {
                if (duration >= MAX_DAYS) {
                  setDuration(MAX_DAYS);
                } else {
                  setDuration(duration + 1);
                }
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <div className="w-full flex gap-2">
          {!account ||
          xSakeToken.balance === undefined ||
          xSakeToken.balance <= formatValue(0, 1) ? (
            <button className="w-full primary" disabled>
              redeem
            </button>
          ) : (
            <button
              className="w-full primary"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) redeem();
              }}
            >
              {confirming
                ? "confirming..."
                : xSakeToken &&
                  formatUnits(xSakeToken.balance, xSakeToken.decimals) >=
                    parseFloat(amount)
                ? "redeem"
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
