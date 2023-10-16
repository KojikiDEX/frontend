import React from "react";
import { Typography } from "@material-tailwind/react";
import Item from "../../components/Item";
import { Link } from "react-router-dom";
import { ethers } from "ethers";
import { CHAIN_ID, SCAN_URL } from "../../hooks/connectors";

import { useLocation } from "react-router-dom";
import PositionList from "../../components/Position/PositionList";
import {
  formatNumber,
  formatPrice,
  trimAddress,
} from "../../hooks/contractHelper";

export default function YieldFarmDetails() {
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
  const goToHome = () => {
    window.location.href = "/";
  };

  const location = useLocation();
  const poolInfo = location.state?.poolInfo;
  if (!poolInfo) {
    goToHome();
  }

  // const [userPositions, setUserPositions] = useState([]);
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

  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left">
        <div className="mb-5">
          <p className="text-kojiki-blue">yield farming</p>
          <span>
            create and manage all your staking positions
            <Link className="flex items-center w-fit md:ml-0" to="/yield-farms">
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
              back to farms list
            </Link>
          </span>
        </div>
        <div className="mx-auto border">
          <div className="px-2 py-5 md:p-5 ">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex gap-1">
                  <img
                    className="w-8 h-8 "
                    src={require(`../../assets/img/token/${poolInfo?.token0.symbol}.png`)}
                    alt="Token Logo"
                  />
                  <img
                    className="w-8 h-8 "
                    src={require(`../../assets/img/token/${poolInfo?.token1.symbol}.png`)}
                    alt="Token Logo"
                  />
                </div>
                <div>
                  <p className="mb-0 mr-2">
                    {poolInfo?.token0.symbol}-{poolInfo?.token1.symbol}
                  </p>
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${poolInfo.poolAddr}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {trimAddress(poolInfo.poolAddr)}
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
                  $
                  {formatPrice(
                    formatNumber(ethers.utils.formatUnits(poolInfo.tvl, 6), 3)
                  )}
                </span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>daily emissions</span>
                <span className="text-kojiki-blue">
                  {/* {ethers.utils.formatUnits(poolInfo.poolInfo[4])} Kojiki */}
                  0.0 SAKE
                </span>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <span>apr range</span>
                <span className="text-kojiki-blue">
                  {formatNumber(ethers.utils.formatUnits(poolInfo.poolAPY), 3)}%
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
            value={`$${formatPrice(
              formatNumber(ethers.utils.formatUnits(poolInfo.tvl, 6), 3)
            )}`}
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
          hasPotentials={false}
        />
      </div>
    </React.Fragment>
  );
}
