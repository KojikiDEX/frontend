import React from "react";
import { useContext } from "react";
import { ethers } from "ethers";
// import useSharedState from "./../../hooks/useSharedState";
import { useNavigate } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { formatPrice } from "../../hooks/contractHelper";
// import Name from "../../components/Name";
// import { useKojikiContext } from "../../hooks/useKojikiContext";
// import { formatUnits } from "../../hooks/contractHelper";
// import LockIcon from "../../components/Icons/LockIcon";
// import RocketIcon from "../../components/Icons/RocketIcon";
// import FireIcon from "../../components/Icons/FireIcon";
// import ThumbUpIcon from "../../components/Icons/ThumbUpIcon";
// import PrizeIcon from "../../components/Icons/PrizeIcon";
import ArrowRightIcon from "../../components/Icons/ArrowRightIcon";
import { KojikiContext } from "../../context/context";

export default function NifroPools() {
  const navigate = useNavigate();
  let contextdata = useContext(KojikiContext);
  // let contextdata = {};
  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left mb-10">
        <div className="mb-7">
          <p className="text-kojiki-blue">raito pools</p>
          <span>
            deposit your staked position NFM's into a compatible Raito Pool and
            earn additional rewards Create staking positions for incentivized
            liquidity and earn SAKE
          </span>
        </div>
        <div className="flex flex-col border">
          <div className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] text-left">
            <div className="p-3 whitespace-nowrap">name</div>
            <div className="hidden md:block p-3 whitespace-nowrap">tvl</div>
            <div className="flex gap-1 p-3 whitespace-nowrap">
              <span>apr</span> <span className="hidden md:block">range</span>
            </div>
            <div className="hidden md:block p-3 whitespace-nowrap">
              total deposit
            </div>
            <div className="flex gap-1 p-3 whitespace-nowrap">
              pending <span className="hidden md:block">rewards</span>
            </div>
          </div>
          <div>
            {contextdata.nitroPools?.map((tableData, i) => {
              return (
                <div
                  className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left hover:cursor-pointer"
                  key={i}
                  onClick={() => {
                    navigate(`/raito-pools/detail`, {
                      state: { poolInfo: tableData },
                    });
                  }}
                >
                  <div className="whitespace-nowrap p-3">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="flex gap-1">
                        <img
                          className="w-6 md:w-9 my-auto"
                          src={require(`../../assets/img/token/ETH.png`)}
                          alt="fromToken"
                        />
                        <img
                          className="w-6 md:w-9 my-auto"
                          src={require(`../../assets/img/token/SAKE.png`)}
                          alt="toToken"
                        />
                      </div>
                      <div>
                        <p className="leading-none">{tableData.symbol}</p>
                        <span>earn SAKE/xSAKE</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block whitespace-nowrap p-3 ">
                    <p className="text-kojiki-blue">
                      ${formatPrice(ethers.utils.formatUnits(tableData.tvl, 6))}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center p-3 ">
                    <span className="text-kojiki-blue">
                      {ethers.utils.formatUnits(tableData.poolAPY, 4)}%
                    </span>
                    <ArrowRightIcon />
                    <span className="text-kojiki-blue">0%</span>
                  </div>
                  <div className="hidden md:block whitespace-nowrap p-3">
                    <span className="text-kojiki-blue">
                      {formatPrice(
                        ethers.utils.formatUnits(tableData.totalDeposit, 18)
                      )}
                    </span>
                  </div>
                  <div className="whitespace-nowrap p-3">
                    <span className="text-kojiki-blue">
                      {formatPrice(
                        ethers.utils.formatUnits(tableData.pendingRewards, 18)
                      )}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
