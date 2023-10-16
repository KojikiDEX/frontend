import React, { useEffect, useContext, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { BigNumber } from "ethers";
import { useWeb3React } from "@web3-react/core";

import { formatUnits } from "../../hooks/contractHelper";

import AssetList from "../../components/Asset/AssetList";
import Item from "../../components/Item";
import { KojikiContext } from "../../context/context";

export default function Dashboard() {
  const [userAssets, setUserAsset] = useState({});
  const [userPositions, setUserPositions] = useState([]);
  const [avgAPY, setAvgApy] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [pendingXSake, setPendingXSake] = useState(0);
  const [countPosition, setCountPosition] = useState(0);
  const contextData = useContext(KojikiContext);
  const { account } = useWeb3React();

  useEffect(() => {
    if (!contextData) {
      return;
    }
    if (!account) {
      return;
    }
    const userPositions = [];
    const assets = {};

    if (contextData.pools.length != 0) {
      for (let pool of contextData.pools) {
        userPositions.push(...pool.userPositions);
        if (pool.userPositions && pool.userPositions.length) {
          if (assets[pool.poolAddr] === undefined) {
            assets[pool.poolAddr] = {};
            assets[pool.poolAddr]["positions"] = [];
          }
          assets[pool.poolAddr]["positions"].push(...pool.userPositions);
          assets[pool.poolAddr]["poolAddr"] = pool.poolAddr;
          assets[pool.poolAddr]["token0"] = pool.token0;
          assets[pool.poolAddr]["token1"] = pool.token1;
          assets[pool.poolAddr]["nitroPool"] = pool.matchingNitro;
          assets[pool.poolAddr]["hasNitroPool"] = false;
        }
      }
    }

    if (contextData.nitroPools.length != 0) {
      for (let pool of contextData.nitroPools) {
        userPositions.push(...pool.userPositions);
        if (pool.userPositions && pool.userPositions.length > 0) {
          if (assets[pool.poolAddr] === undefined) {
            assets[pool.poolAddr] = {};
            assets[pool.poolAddr]["positions"] = [];
          }
          assets[pool.poolAddr]["poolAddr"] = pool.poolAddr;
          assets[pool.poolAddr]["token0"] = pool.token0;
          assets[pool.poolAddr]["token1"] = pool.token1;
          assets[pool.poolAddr]["hasNitroPool"] = true;
          assets[pool.poolAddr]["positions"].push(...pool.userPositions);
        }
      }
    }

    setUserPositions(userPositions);
    setUserAsset(assets);
  }, [contextData, account]);

  useEffect(() => {
    if (!userPositions || userPositions.length == 0) {
      return;
    }
    setCountPosition(userPositions.length);
    let totalDeposit = BigNumber.from(0);
    let avgAPY = BigNumber.from(0);
    let pendingReward = BigNumber.from(0);
    for (let position of userPositions) {
      totalDeposit = totalDeposit.add(BigNumber.from(position.amountInUSD));
      avgAPY = avgAPY.add(BigNumber.from(position.poolAPY));
      pendingReward = pendingReward.add(position.kojikiStakeTokenRewards);
    }

    setTotalDeposit(totalDeposit);
    setAvgApy(avgAPY);
    setPendingXSake(pendingReward);
  }, [userPositions]);

  return (
    <React.Fragment>
      <div className="w-full">
        <div className="w-full md:w-5/6 mx-auto  text-center md:text-left lg:pt-10">
          <Typography variant="h3">Earnings dashboard</Typography>
          <Typography as="p" variant="small">
            Easily monitor and harvest your active positions.
          </Typography>
          <div className="flex flex-col lg:flex-row border p-5 mt-10 ">
            <Item
              type="chain"
              label="Total active holdings"
              value={`$${formatUnits(totalDeposit, 6).toFixed(3)}`}
            />
            <Item
              type="feature"
              label="Total average APR"
              value={`${formatUnits(avgAPY).toFixed(3)}%`}
            />
            <Item
              type="jwerly"
              label="Staked positions"
              value={countPosition}
            />
            <Item
              type="symbol"
              label="Pending rewards"
              value={`${formatUnits(pendingXSake, 18).toFixed(3)}`}
            />
          </div>
        </div>
        <div className="w-full md:w-5/6 mx-auto  pt-10 lg:pt-10">
          <AssetList assetList={userAssets} />
        </div>
      </div>
    </React.Fragment>
  );
}
