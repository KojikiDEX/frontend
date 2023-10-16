import React from "react";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Typography } from "@material-tailwind/react";

import UserEpochItem from "./components/UserEpochItem";
import { formatUnits, getContract } from "../../../hooks/contractHelper";
import { BigNumber } from "@ethersproject/bignumber";
import { contracts } from "../../../config/contracts";
import { CHAIN_ID, getWeb3 } from "../../../hooks/connectors";
import DividendsABI from "../../../assets/abi/Dividends.json";
import { toast } from "react-toastify";
import { useWeb3React } from "@web3-react/core";

export default function UserAllocation(props) {
  const {
    allocOpen,
    setAllocOpen,
    deallocOpen,
    setDeallocOpen,
    totalAllocation,
    curEpochData,
    xSakeDecimals,
    allocatedOfDividends,
    redeems,
  } = props;

  const { account, library } = useWeb3React();
  const [confirming, setConfirming] = React.useState(false);

  let redeemAllocation = BigNumber.from(0);
  for (let index = 0; index < redeems.length; index++) {
    if (redeems[index][3] === contracts[CHAIN_ID].DIVIDENDS) {
      // dividendsContract
      redeemAllocation = redeemAllocation.add(redeems[index][4]); // dividendsAllocation
    }
  }

  const totalShareOfUser =
    totalAllocation && totalAllocation > 0
      ? formatUnits(allocatedOfDividends, xSakeDecimals) /
        parseFloat(totalAllocation)
      : 0;

  const harvestAllDividends = async () => {
    setConfirming(true);
    try {
      const dividendsContract = getContract(
        DividendsABI,
        contracts[CHAIN_ID].DIVIDENDS,
        library
      );

      const tx = await dividendsContract.harvestAllDividends({ from: account });

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
    <div className="w-full border p-5 lg:ml-3 lg:w-1/2 mt-7  p-5  ">
      <div className="flex flex-col lg:flex-row mb-5 lg:mb-0">
        <span className="mb-5 text-center lg:mb-0">your allocation</span>
        {!account ? (
          <div className="mx-auto lg:mx-0 lg:ml-auto">
            <button className="min-w-[180px] default-outline">
              not connected
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-2 mx-auto lg:mx-0 lg:ml-auto">
              <button
                className="default-outline"
                onClick={() => {
                  setDeallocOpen(!deallocOpen);
                }}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <button
                className="default-outline"
                onClick={() => {
                  setAllocOpen(!allocOpen);
                }}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </>
        )}
      </div>
      {account ? (
        <>
          <div className="flex flex-col lg:flex-row mt-2 text-center">
            <div className="flex flex-col justify-center lg:text-left lg:pr-20">
              <span>total allocation</span>
              <span className="text-kojiki-blue">
                {formatUnits(allocatedOfDividends, xSakeDecimals).toFixed(2)}{" "}
                xSAKE
              </span>
            </div>
            <div className="flex flex-col justify-center lg:text-left">
              <span>total share</span>
              <span className="text-kojiki-blue">
                {(totalShareOfUser ? totalShareOfUser * 100 : 0).toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row mt-2 text-center">
            <div className="flex flex-col justify-center lg:text-left lg:pr-20">
              <span className="pt-2">manual allocation</span>
              <span className="text-kojiki-blue">
                {formatUnits(allocatedOfDividends, xSakeDecimals).toFixed(2)}{" "}
                xSAKE
              </span>
            </div>
            <div className="flex flex-col justify-center lg:text-left">
              <span className="pt-2">redeem allocation</span>
              <span className="text-kojiki-blue">
                {formatUnits(redeemAllocation, xSakeDecimals).toFixed(2)} xSAKE
              </span>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <div className="py-3 mb-3 border-b-2 border-dashed"></div>
      <div className="flex flex-col lg:flex-row mb-5 lg:mb-0">
        <span>your dividends</span>
        {!account ? (
          <div className="mx-auto lg:mx-0 lg:ml-auto">
            <button className="min-w-[180px] default-outline">
              not connected
            </button>
          </div>
        ) : (
          <button
            className="mx-auto lg:mx-0 lg:ml-auto default-outline"
            type="button"
            disabled={confirming}
            onClick={(e) => {
              if (!confirming) harvestAllDividends();
            }}
          >
            {confirming ? "claiming all..." : "claim all"}
          </button>
        )}
      </div>
      {account ? (
        curEpochData.map((item, i) => {
          return (
            <div className="flex flex-col lg:flex-row" key={i}>
              <UserEpochItem
                symbol={item.symbol}
                token={item.token}
                token0={item.token0}
                token1={item.token1}
                amount={item.amount * totalShareOfUser}
                amountInUsd={item.amountInUsd * totalShareOfUser}
              />
            </div>
          );
        })
      ) : (
        <></>
      )}
    </div>
  );
}
