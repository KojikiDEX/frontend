import React, { useContext } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import { formatNumber, formatPrice } from "../../hooks/contractHelper";
import ArrowRightIcon from "../../components/Icons/ArrowRightIcon";
import { KojikiContext } from "../../context/context";

export default function GenesisPools() {
  const navigate = useNavigate();
  let contextdata = useContext(KojikiContext);

  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left  lg:pt-10  p-5   mb-10">
        <Typography variant="h3">Core Farming Pools</Typography>
        <Typography as="p" variant="small">
          Deposit staked positions into core farming pools to earn 6 months of
          additional xSAKE emissions.
        </Typography>
        <div className="flex flex-col border px-1 pb-1 md:px-5 md:pb-5 mt-10 ">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden">
                <div className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] text-left  border-b-2">
                  <div className="px-6 py-4 whitespace-nowrap">Name</div>
                  <div className="hidden md:block px-1 py-4 whitespace-nowrap">
                    TVL
                  </div>
                  <div className="flex gap-1 px-1 py-4 whitespace-nowrap">
                    <span>APR</span>{" "}
                    <span className="hidden md:block">range</span>
                  </div>
                  <div className="hidden md:block px-1 py-4 whitespace-nowrap">
                    Your Deposit
                  </div>
                  <div className="flex gap-1 md:px-6 py-4 whitespace-nowrap">
                    Pending <span className="hidden md:block">Rewards</span>
                  </div>
                </div>
                <div>
                  {contextdata.nitroPools.map((tableData, i) => {
                    return (
                      <div
                        className="grid grid-cols-3 md:grid-cols-[2fr_repeat(4,_1fr)] items-center  text-left   hover:cursor-pointer hover:bg-kojiki-blue"
                        key={i}
                        onClick={() => {
                          navigate(`/core-pools/detail`, {
                            state: { poolInfo: tableData },
                          });
                        }}
                      >
                        <div className="whitespace-nowrap px-1 md:px-6 py-4">
                          <div className="flex flex-col md:flex-row items-center gap-2">
                            <div className="flex gap-1 pt-2">
                              <img
                                className="w-6 md:w-9 my-auto border-kojiki-blue "
                                src={require(`../../assets/img/token/${tableData.token0.symbol}.png`)}
                                alt="fromToken"
                              />
                              <img
                                className="w-6 md:w-9 my-auto border-kojiki-blue "
                                src={require(`../../assets/img/token/${tableData.token1.symbol}.png`)}
                                alt="toToken"
                              />
                            </div>
                            <div>
                              <Typography className=" mt-1 ">
                                {tableData.symbol}
                              </Typography>
                              <Typography as="p" className="hidden md:block  ">
                                EARN SAKE/xSAKE
                              </Typography>
                            </div>
                          </div>
                        </div>
                        <div className="hidden md:block whitespace-nowrap px-1 py-4 ">
                          <p>
                            $
                            {formatPrice(
                              formatNumber(
                                ethers.utils.formatUnits(tableData.tvl, 6),
                                3
                              )
                            )}
                          </p>
                          {/* <p>$0</p> */}
                        </div>
                        <div className="flex flex-col md:flex-row items-center px-1 py-4 ">
                          <span>
                            {formatNumber(
                              ethers.utils.formatUnits(tableData.poolAPY),
                              3
                            )}
                            %
                          </span>
                          {/* <span>0%</span> */}
                          <ArrowRightIcon />
                          {/* <span>{ethers.utils.formatUnits(tableData.poolAPY, 4)}%</span> */}
                          <span>
                            {formatNumber(
                              ethers.utils.formatUnits(tableData.poolAPY),
                              3
                            )}
                            %
                          </span>
                        </div>
                        <div className="hidden md:block whitespace-nowrap px-1 py-4 ">
                          <span>
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
                          </span>
                        </div>
                        <div className="whitespace-nowrap px-1 md:px-6 py-4 text-center	">
                          <span>
                            {formatPrice(
                              formatNumber(
                                ethers.utils.formatUnits(
                                  tableData.pendingRewards,
                                  18
                                ),
                                3
                              )
                            )}
                          </span>

                          {/* <p>0</p> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
