import React, { useContext } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { formatNumber, formatPrice } from "../../hooks/contractHelper";
import ArrowRightIcon from "../../components/Icons/ArrowRightIcon";
import { KojikiContext } from "../../context/context";

export default function YieldFarms() {
  const navigate = useNavigate();
  let contextdata = useContext(KojikiContext);

  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left">
        <div>
          <p className="text-kojiki-blue">yield farming</p>
          <span>
            create staking positions for incentivized liquidity and earn SAKE
          </span>
        </div>
        <div className="flex flex-col px-1 pb-1 mt-7 border">
          <div className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] text-left">
            <div className="p-3 whitespace-nowrap">name</div>
            <div className="hidden md:block p-3 whitespace-nowrap">tvl</div>
            <div className="flex gap-1 p-3 whitespace-nowrap">
              <span>apr</span> <span className="hidden md:block">range</span>
            </div>
            <div className="hidden md:block p-3 whitespace-nowrap">
              your deposit
            </div>
            <div className="flex gap-1 p-3 whitespace-nowrap">
              pending <span className="hidden md:block">rewards</span>
            </div>
          </div>
          <div>
            {contextdata.pools.map((tableData, i) => {
              return (
                <div
                  className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left hover:cursor-pointer"
                  key={i}
                  onClick={() => {
                    navigate(`/yield-farms/detail`, {
                      state: { poolInfo: tableData },
                    });
                  }}
                >
                  <div className="whitespace-nowrap px-1 md:p-3">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <div className="flex gap-1">
                        <img
                          className="w-6 md:w-9 my-auto "
                          src={require(`../../assets/img/token/${tableData.token0.symbol}.png`)}
                          alt="fromToken"
                        />
                        <img
                          className="w-6 md:w-9 my-auto "
                          src={require(`../../assets/img/token/${tableData.token1.symbol}.png`)}
                          alt="toToken"
                        />
                      </div>
                      <div>
                        <p className="leading-none">{tableData.symbol}</p>
                        <span>earn SAKE/xSAKE</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block whitespace-nowrap px-1 md:p-3 ">
                    <p className="text-kojiki-blue">
                      $
                      {formatPrice(
                        formatNumber(
                          ethers.utils.formatUnits(tableData.tvl, 6),
                          3
                        )
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col md:flex-row items-center px-1 md:p-3 ">
                    <span className="text-kojiki-blue">
                      {formatNumber(
                        ethers.utils.formatUnits(tableData.poolAPY),
                        3
                      )}
                      %
                    </span>
                    <ArrowRightIcon />
                    <span className="text-kojiki-blue">
                      {formatNumber(
                        ethers.utils.formatUnits(tableData.poolAPY),
                        3
                      )}
                      %
                    </span>
                  </div>
                  <div className="hidden md:block whitespace-nowrap px-1 md:p-3">
                    <p className="text-kojiki-blue">
                      $
                      {formatPrice(
                        formatNumber(
                          ethers.utils.formatUnits(
                            tableData.totalDepositInUsd,
                            6
                          ),
                          3
                        )
                      )}
                    </p>
                  </div>
                  <div className="whitespace-nowrap px-1 md:p-3">
                    <p className="text-kojiki-blue">
                      {formatPrice(
                        ethers.utils.formatUnits(tableData.pendingRewards, 18)
                      )}
                    </p>
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
