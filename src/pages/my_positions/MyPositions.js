import React, { useEffect, useContext, useState } from "react";
import { Typography } from "@material-tailwind/react";

import PositionList from "../../components/Position/PositionList";
import Item from "../../components/Item";
import { KojikiContext } from "../../context/context";
import {
  formatUnits,
  formatPrice,
  formatNumber,
} from "../../hooks/contractHelper";
import { BigNumber, ethers } from "ethers";

export default function MyPositions() {
  // let contextData = useKojikiContext();
  const [userPositions, setUserPositions] = useState([]);
  const [avgAPY, setAvgApy] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [pendingXSake, setPendingXSake] = useState(0);
  const contextData = useContext(KojikiContext);

  useEffect(() => {
    console.log(contextData);
    if (!contextData) {
      return;
    }
    const userPositions = [];

    if (contextData.pools.length != 0) {
      for (let pool of contextData.pools) {
        userPositions.push(...pool.userPositions);
      }
    }

    if (contextData.nitroPools.length != 0) {
      for (let pool of contextData.nitroPools) {
        userPositions.push(...pool.userPositions);
      }
    }

    setUserPositions(userPositions);
  }, [contextData]);

  useEffect(() => {
    if (!userPositions || userPositions.length == 0) {
      return;
    }

    let totalDeposit = BigNumber.from(0);
    let avgAPY = BigNumber.from(0);
    let pendingReward = BigNumber.from(0);
    for (let position of userPositions) {
      totalDeposit = totalDeposit.add(BigNumber.from(position.amountInUSD));
      avgAPY = avgAPY.add(BigNumber.from(position.poolAPY));
      // pendingReward = pendingReward.add(position.kojikiStakeTokenRewards);
      pendingReward = pendingReward.add(position.pendingRewards);
    }

    setTotalDeposit(totalDeposit);
    setAvgApy(avgAPY);
    setPendingXSake(pendingReward);
  }, [userPositions]);

  return (
    <React.Fragment>
      <div className="w-full mt-7">
        <div className="w-full md:w-5/6 mx-auto mb-12">
          <div className="mb-5">
            <p className="text-kojiki-blue">positions</p>
            <span>create and manage all your staking positions</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 p-5 border">
            <Item
              type={"chain"}
              label={"total deposits value"}
              value={`$${formatNumber(
                ethers.utils.formatUnits(totalDeposit, 6),
                3
              )}`}
            />
            <Item
              type={"feature"}
              label={"total average apr"}
              value={`${formatUnits(avgAPY).toFixed(3)}%`}
            />
            <Item
              type={"jwerly"}
              label={"pending xSAKE rewards"}
              value={`${formatPrice(formatUnits(pendingXSake, 18).toFixed(3))}`}
            />
            <Item type={"symbol"} label={"pending sake rewards"} value={0} />
          </div>
        </div>
        <div className="w-full md:w-5/6 mx-auto">
          <PositionList positionList={userPositions} hasPotentials={false} />
        </div>
      </div>
    </React.Fragment>
  );
}
