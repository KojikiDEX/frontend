import React from "react";
import Input from "./input";

import { Typography } from "@material-tailwind/react";
import { toast } from "react-toastify";
import { CHAIN_ID, getWeb3 } from "../../../../hooks/connectors";
import {
  formatUnits,
  formatValue,
  getContract,
} from "../../../../hooks/contractHelper";
import { contracts } from "../../../../config/contracts";
import ERC20ABI from "../../../../assets/abi/ERC20.json";
import XSakeABI from "../../../../assets/abi/KojikiStakeToken.json";
import { useWeb3React } from "@web3-react/core";
import { useSakeState } from "../../../../hooks/useSakeState";

export default function GetxSAKE() {
  const [tokenAllowance, setTokenAllowance] = React.useState(false);
  const { sakeDecimals, sakeBalanceOf, allowanceOfXSake } =
    useSakeState(tokenAllowance);
  const xSakeTokenAddress = contracts[CHAIN_ID].XSakeTOKEN;
  const saketokenAddress = contracts[CHAIN_ID].saketoken;

  // const [isNavOpen, setIsNavOpen] = React.useState(false);
  const { account, library } = useWeb3React();
  const [amount, setAmount] = React.useState(0);
  const [disabled] = React.useState();
  const [confirming, setConfirming] = React.useState(false);

  const approveToken = async () => {
    setConfirming(true);
    try {
      const sakeContract = getContract(ERC20ABI, saketokenAddress, library);
      const tx = await sakeContract.approve(
        contracts[CHAIN_ID].XSakeTOKEN,
        formatValue(amount, sakeDecimals).toString(),
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

  const getXSake = async () => {
    setConfirming(true);
    try {
      const amountValue = formatValue(amount, sakeDecimals);
      const xSakeContract = getContract(XSakeABI, xSakeTokenAddress, library);

      const tx = await xSakeContract.convert(amountValue, { from: account });

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
    <React.Fragment>
      <div className="mb-1">
        <p className="text-center lg:text-left mb-5">get xSAKE</p>
        <Input amount={amount} disabled={disabled} setAmount={setAmount} />
        {amount !== undefined && parseFloat(amount) > 0 && (
          <div className="flex flex-row justify-between mt-3 border-x-0 border-t-0">
            <span>you will receive</span>
            <span className="text-kojiki-blue">{`${amount} xSAKE`}</span>
          </div>
        )}
        <div className="flex justify-center items-center gap-2 mt-4">
          {!account ? (
            <button className="min-w-[200px] default-outline" disabled>
              not connected
            </button>
          ) : formatUnits(allowanceOfXSake, sakeDecimals) <
            parseFloat(amount) ? (
            <button
              className="min-w-[200px] default-outline"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) approveToken();
              }}
            >
              {confirming ? "approving..." : `approve`}
            </button>
          ) : (
            <button
              className="min-w-[200px] default-outline"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) getXSake();
              }}
            >
              {confirming
                ? "confirming..."
                : formatUnits(sakeBalanceOf, sakeDecimals) >= parseFloat(amount)
                ? `get xSAKE`
                : `insufficient balance`}
            </button>
          )}
        </div>
      </div>
    </React.Fragment>
  );
}
