import React, { useContext, useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import Item from "../../components/Item";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { SCAN_URL, CHAIN_ID } from "../../hooks/connectors";

import { useLocation } from "react-router-dom";
import { KojikiContext } from "../../context/context";
import PositionList from "../../components/Position/PositionList";
import { trimAddress, formatPrice } from "../../hooks/contractHelper";

export default function NitroPoolsDetails() {
  // const poolInfo = {
  //   address: "0xa6c5C7D189fA4eB5Af8ba34E63dCDD3a635D433f",
  //   fromTokenSymbol: "SAKE",
  //   toTokenSymbol: "ETH",
  //   totalDepositValue: "0",
  //   totalAverageApr: "0",
  //   pendingShardRewards: "0",
  //   pendingKojikiRewards: "0",
  //   positionList: [],
  // };
  // const [tableDatas, setTableDatas] = useState(poolInfo.positionList);

  const location = useLocation();
  const poolInfo = location.state.poolInfo;

  const context = useContext(KojikiContext);
  // const [userPositions, setUserPositions] = useState([]);
  const [potentialPositions, setPotentialPositions] = useState([]);
  // let { positions } = useContext(KojikiContext);

  // useEffect(() => {
  //   if (!poolInfo){
  //       return;
  //   }

  //   if (!positions || positions.length === 0){
  //     return;
  //   }
  //   const userPositions = [];
  //   for (let position of positions){
  //     if (position.poolAddr == poolInfo.poolAddr){
  //       userPositions.push(position);
  //     }
  //   }
  //   setUserPositions(userPositions);

  //   }, [poolInfo, positions]);

  useEffect(() => {
    if (!poolInfo) {
      return;
    }

    if (!context || !context.pools) {
      return;
    }
    const availablePositions = [];
    if (context.pools.length > 0) {
      for (let nftPool of context.pools) {
        if (nftPool.poolAddr === poolInfo.poolAddr) {
          availablePositions.push(...nftPool.userPositions);
          setPotentialPositions(availablePositions);
          break;
        }
      }
    }
  }, [poolInfo, context]);

  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left">
        <div className="mb-5">
          <p className="text-kojiki-blue">raito pools</p>
          <span>
            deposit your staked position NFM's into a compatible Raito Pool and
            earn additional rewards Create staking positions for incentivized
            liquidity and earn SAKE
          </span>
          <Link className="flex items-center w-fit md:ml-0" to="/raito-pools">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
              />
            </svg>
            back to raito list
          </Link>
        </div>

        <div className="mx-auto border">
          <div className="px-2 py-5 md:p-5 ">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  <img
                    className="w-8 h-8 "
                    src={require(`../../assets/img/token/${poolInfo.token0.symbol}.png`)}
                    alt="Token Logo"
                  />
                  <img
                    className="w-8 h-8 "
                    src={require(`../../assets/img/token/${poolInfo.token1.symbol}.png`)}
                    alt="Token Logo"
                  />
                </div>
                <div>
                  <p>
                    {poolInfo.token0.symbol}-{poolInfo.token1.symbol}
                  </p>
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${poolInfo.nitroPoolAddr}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {trimAddress(poolInfo.nitroPoolAddr)}
                  </a>
                </div>
              </div>
              {/* <div>
                <button className="px-4 py-2 bg-kojiki-blue  ">
                  APY
                </button>
              </div> */}
            </div>
            <hr className="my-4 " />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <span>pool</span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>total value locked</span>
                <span className="text-kojiki-blue">
                  ${formatPrice(ethers.utils.formatUnits(poolInfo.tvl, 6))}
                </span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>daily emissions</span>
                <span className="text-kojiki-blue">
                  {ethers.utils.formatUnits(poolInfo.poolInfo[4])} SAKE
                </span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>apr range</span>
                <span className="text-kojiki-blue">
                  {ethers.utils.formatUnits(poolInfo.poolAPY, 4)}%
                </span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>xSAKE/SAKE ratio</span>
                <span className="text-kojiki-blue">80% / 20%</span>
              </div>
            </div>
            <hr className="my-4" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <span>settings</span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>max total multiplier</span>
                <span className="text-kojiki-blue">x3</span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>max lock duration</span>
                <span className="text-kojiki-blue">183 days</span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>max lock multiplier</span>
                <span className="text-kojiki-blue">x2</span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>max boost multiplier</span>
                <span className="text-kojiki-blue">x2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left border mt-10">
        <div className="flex flex-col lg:flex-row p-5">
          <Item
            type={"chain"}
            label={"total deposits value"}
            value={`$${ethers.utils.formatUnits(poolInfo.tvl, 6)}`}
          />
          <Item
            type={"feature"}
            label={"total average apr"}
            value={`$${ethers.utils.formatUnits(poolInfo.poolAPY, 4)}`}
          />
          <Item
            type={"jwerly"}
            label={"pending xSAKE rewards"}
            value={poolInfo.pendingShardRewards}
          />
          <Item
            type={"symbol"}
            label={"pending SAKE rewards"}
            value={poolInfo.pendingShardRewards}
          />
        </div>
      </div>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left mb-20">
        <PositionList
          positionList={poolInfo.userPositions}
          potentialPositions={potentialPositions}
          hasPotentials={true}
        />
      </div>
    </React.Fragment>
  );
}
