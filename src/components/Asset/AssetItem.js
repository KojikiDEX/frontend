import React, { useEffect, useState } from "react";
import { Typography, Button } from "@material-tailwind/react";
import { BigNumber } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";
import { getWeb3, CHAIN_ID } from "../../hooks/connectors";

import HarvestModal from "./Modals/HarvestModal";
import { formatUnits } from "../../hooks/contractHelper";

import nftPoolABI from "../../assets/abi/NFTPool.json";
import nitroPoolABI from "../../assets/abi/NitroPool.json";

import {
  getContract,
  getWeb3Contract,
  formatValue,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";

export default function AssetItem(props) {
  const { assetData } = props;
  const [openHarvestModal, setOpenHarvestModal] = useState(false);
  const [avgAPY, setAvgApy] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [pendingXSake, setPendingXSake] = useState(0);
  const [countPosition, setCountPosition] = useState(0);
  const [tokenIds, setTokenIds] = useState([]);

  const { account, library } = useWeb3React();

  useEffect(() => {
    if (!assetData) {
      return;
    }

    let totalDeposit = BigNumber.from(0);
    let avgAPY = BigNumber.from(0);
    let pendingReward = BigNumber.from(0);
    const tokenIds = [];
    for (let position of assetData["positions"]) {
      totalDeposit = totalDeposit.add(BigNumber.from(position.amountInUSD));
      avgAPY = avgAPY.add(BigNumber.from(position.poolAPY));
      pendingReward = pendingReward.add(position.kojikiStakeTokenRewards);
      tokenIds.push(...position.tokenId);
    }

    setTotalDeposit(totalDeposit);
    setAvgApy(avgAPY);
    setPendingXSake(pendingReward);
    setCountPosition(assetData["positions"].length);
    setTokenIds(tokenIds);
  }, [assetData]);

  const harvestPosition = async (
    poolAddr,
    nitroPoolAddr,
    tokenIds,
    hasNitroPool,
    setConfirming
  ) => {
    setConfirming(true);
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.harvestPositionsTo(tokenIds, account, {
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
          clearInterval(interval);
          if (response.status === true) {
            toast.success("success! your transaction is success.");
            setConfirming(false);
          } else if (response.status === false) {
            toast.error("error! your last transaction is failed.");
            setConfirming(false);
          } else {
            toast.error("error! something went wrong.");
            setConfirming(false);
          }
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
      <div className="grid grid-cols-[6fr_2fr_3fr] md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left ">
        <div className="whitespace-nowrap py-4 ">
          <div className="flex justify-start md:items-center gap-2">
            <div className="flex gap-1 pt-2">
              <img
                className="w-6 md:w-9 my-auto border-kojiki-blue "
                src={require(`../../assets/img/token/${assetData.token0.symbol}.png`)}
                alt="fromToken"
              />
              <img
                className="w-6 md:w-9 my-auto border-kojiki-blue "
                src={require(`../../assets/img/token/${assetData.token1.symbol}.png`)}
                alt="toToken"
              />
            </div>
            <div>
              <Typography>
                {assetData.token0.symbol} - {assetData.token1.symbol}
              </Typography>
              <Typography>{countPosition} positions</Typography>
            </div>
          </div>
        </div>
        <div className="hidden md:block whitespace-nowrap py-4">
          <p>{formatUnits(avgAPY).toFixed(3)}%</p>
        </div>
        <div className="hidden md:block whitespace-nowrap py-4">
          <p>${formatUnits(totalDeposit, 6).toFixed(3)}</p>
        </div>
        <div className="whitespace-nowrap py-4">
          <p>${formatUnits(pendingXSake, 18).toFixed(3)}</p>
        </div>
        <div className="whitespace-nowrap py-4">
          <button
            className="min-w-[150px] default-outline"
            onClick={(e) => {
              setOpenHarvestModal(true);
            }}
          >
            harvest
          </button>
        </div>
      </div>
      <HarvestModal
        openModal={openHarvestModal}
        handleModal={setOpenHarvestModal}
        rewardAmount="1000"
        harvestPosition={harvestPosition}
        assetData={assetData}
        hasNitro={assetData.hasNitroPool}
        pendingReward={pendingXSake}
        tokenIds={tokenIds}
      />
    </React.Fragment>
  );
}
