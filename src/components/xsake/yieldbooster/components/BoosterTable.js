import React, { useContext, useEffect, useState } from "react";

import { HiOutlineArrowLongRight } from "react-icons/hi2";
import { AiOutlineCheck } from "react-icons/ai";
import { IconContext } from "react-icons";
import { Typography } from "@material-tailwind/react";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  LP_DECIMALS,
  XSake_DECIMALS,
  USDC_DECIMALS,
} from "../../../../hooks/connectors";
import { KojikiContext } from "../../../../context/context";
import { formatUnits } from "../../../../hooks/contractHelper";
import ThumbUpIcon from "../../../Icons/ThumbUpIcon";
import LockIcon from "../../../Icons/LockIcon";
import RocketIcon from "../../../Icons/RocketIcon";
import FireIcon from "../../../Icons/FireIcon";
import { boostMultiplier } from "../../../../utils";

export default function BoosterTable(props) {
  const {
    advancedView,
    allocOpen,
    setAllocOpen,
    deallocOpen,
    setDeallocOpen,
    // userBalance,
    setPositionInfo,
  } = props;

  const contextData = useContext(KojikiContext);
  const [userBoostablePositions, setUserBoostablePositions] = useState([]);

  useEffect(() => {
    if (!contextData) {
      return;
    }
    const _userPositions = [];

    if (contextData.pools.length !== 0) {
      for (let pool of contextData.pools) {
        _userPositions.push(...pool.userPositions);
      }
    }

    setUserBoostablePositions(_userPositions);
  }, [contextData]);

  return (
    <div className="w-full mt-5 flex flex-col">
      {advancedView !== undefined && advancedView === false ? (
        <>
          {/* simple view */}
          <div className="hidden lg:flex">
            <table className="min-w-full text-left ">
              <thead className="border-x-0 border-t-0 border-slate-300 py-1">
                <tr>
                  <td scope="col pt-3">token</td>
                  <td scope="col pt-3">amount</td>
                  <td scope="col pt-3">setting</td>
                  <td scope="col pt-3">apr</td>
                  <td scope="col pt-3">boost</td>
                  <td scope="col pt-3"></td>
                </tr>
              </thead>
              {userBoostablePositions !== undefined &&
                userBoostablePositions.map((userBoostablePosition, i) => {
                  return (
                    <tbody key={i}>
                      <tr>
                        <td className="whitespace-nowrap mt-3">
                          <div className="w-full flex flex-col justify-start items-center lg:flex-row">
                            <div className="flex justify-start">
                              <img
                                src={require(`../../../../assets/img/token/${userBoostablePosition.token0.symbol}.png`)}
                                width="24px"
                                className="py-1"
                                alt="one"
                              />
                              <img
                                src={require(`../../../../assets/img/token/${userBoostablePosition.token0.symbol}.png`)}
                                width="24px"
                                className="py-1"
                                alt="two"
                              />
                            </div>
                            <div className="mx-3 px-1 pt-1 flex flex-col justify-center lg:justify-start">
                              <span className="text-center lg:text-left">
                                {`${userBoostablePosition.symbol}`}
                              </span>
                              <span className="text-center lg:text-left">
                                #id-{userBoostablePosition.tokenId}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-full pt-1 flex flex-col">
                            <span>
                              {formatUnits(
                                userBoostablePosition.amount,
                                LP_DECIMALS
                              ).toFixed(4)}
                            </span>
                            <span>
                              $
                              {formatUnits(
                                userBoostablePosition.amountInUSD,
                                USDC_DECIMALS
                              ).toFixed(4)}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex flex-row">
                            <ThumbUpIcon
                              color={`${
                                userBoostablePosition ? "#14a8d4" : "#64514f"
                              }`}
                            />
                            <LockIcon
                              color={`${
                                parseInt(userBoostablePosition.lockDuration) > 0
                                  ? "#14a8d4"
                                  : "#64514f"
                              }`}
                            />
                            <RocketIcon
                              color={`${
                                parseInt(
                                  userBoostablePosition.boostMultiplier
                                ) > 0
                                  ? "#14a8d4"
                                  : "#64514f"
                              }`}
                            />
                            <FireIcon
                              color={`${
                                userBoostablePosition.isNitroPool
                                  ? "#14a8d4"
                                  : "#64514f"
                              }`}
                            />
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex flex-row">
                            <span>
                              {formatUnits(
                                userBoostablePosition.poolAPY,
                                LP_DECIMALS
                              ).toFixed(3)}{" "}
                              %
                            </span>
                            {/* <IconContext.Provider value={{ className: 'mx-1', size: '1rem' }}>
                                                                <AiOutlineQuestionCircle />
                                                            </IconContext.Provider> */}
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-1/2 pt-1 flex flex-col">
                            <span>
                              {formatUnits(
                                userBoostablePosition.boostPoints,
                                XSake_DECIMALS
                              ).toFixed(2)}{" "}
                              xSAKE
                            </span>
                            <span>
                              x
                              {boostMultiplier(
                                userBoostablePosition.boostMultiplier
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-full flex flex-row gap-2 items-center gaps-1 justify-end">
                            <button
                              className="default-outline"
                              onClick={(e) => {
                                setPositionInfo(userBoostablePosition);
                                setDeallocOpen(!deallocOpen);
                              }}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <button
                              className="default-outline"
                              onClick={(e) => {
                                setPositionInfo(userBoostablePosition);
                                setAllocOpen(!allocOpen);
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
            </table>
          </div>
          <div className="flex lg:hidden">
            <table className="min-w-full text-left ">
              <thead className="hidden py-1">
                <tr>
                  <td scope="col pt-3">token</td>
                  <td scope="col pt-3">amount</td>
                  <td scope="col pt-3">setting</td>
                  <td scope="col pt-3">apr</td>
                  <td scope="col pt-3">boost</td>
                  <td scope="col pt-3"></td>
                </tr>
              </thead>
              {/* <tbody> */}
              {userBoostablePositions !== undefined &&
                userBoostablePositions.map((userBoostablePosition, i) => {
                  return (
                    <tbody key={i}>
                      <tr>
                        <td className="whitespace-nowrap mt-3">
                          <div className="w-full flex flex-col justify-start items-center">
                            <div className="flex justify-start">
                              <img
                                src={require(`../../../../assets/img/token/${userBoostablePosition.token0.symbol}.png`)}
                                width="24px"
                                className="py-1"
                                alt="one"
                              />
                              <img
                                src={require(`../../../../assets/img/token/${userBoostablePosition.token0.symbol}.png`)}
                                width="24px"
                                className="py-1"
                                alt="two"
                              />
                            </div>
                            <div className="pt-1 flex flex-col items-center">
                              <span>{`${userBoostablePosition.symbol}`}</span>
                              <span>#id-{userBoostablePosition.tokenId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-full pt-1 flex flex-col">
                            <span>
                              {formatUnits(
                                userBoostablePosition.amount,
                                LP_DECIMALS
                              ).toFixed(4)}
                            </span>
                            <span>
                              $
                              {formatUnits(
                                userBoostablePosition.amountInUSD,
                                USDC_DECIMALS
                              ).toFixed(4)}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="flex flex-row">
                              <ThumbUpIcon
                                color={`${
                                  userBoostablePosition ? "#14a8d4" : "#64514f"
                                }`}
                              />
                              <LockIcon
                                color={`${
                                  parseInt(userBoostablePosition.lockDuration) >
                                  0
                                    ? "#14a8d4"
                                    : "#64514f"
                                }`}
                              />
                            </div>
                            <div className="flex flex-row">
                              <RocketIcon
                                color={`${
                                  parseInt(
                                    userBoostablePosition.boostMultiplier
                                  ) > 0
                                    ? "#14a8d4"
                                    : "#64514f"
                                }`}
                              />
                              <FireIcon
                                color={`${
                                  userBoostablePosition.isNitroPool
                                    ? "#14a8d4"
                                    : "#64514f"
                                }`}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr className="border-x-0 border-t-0 border-slate-300 py-1">
                        <td className="whitespace-nowrap">
                          <div className="w-full flex flex-col items-center">
                            <span>
                              {formatUnits(
                                userBoostablePosition.poolAPY,
                                LP_DECIMALS
                              ).toFixed(3)}{" "}
                              %
                            </span>
                            {/* <IconContext.Provider value={{ className: 'mx-1', size: '1rem' }}>
                                                            <AiOutlineQuestionCircle />
                                                        </IconContext.Provider> */}
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-1/2 pt-1 flex flex-col items-center">
                            <span>
                              {formatUnits(
                                userBoostablePosition.boostPoints,
                                XSake_DECIMALS
                              ).toFixed(2)}
                            </span>
                            <span>xSAKE</span>
                            <span>
                              x
                              {boostMultiplier(
                                userBoostablePosition.boostMultiplier
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <div className="w-full flex flex-col lg:flex-row items-center lg:justify-end">
                            <button
                              className="border  py-1 lg:mr-2 px-2 hover:border-[#14a8d4]"
                              onClick={(e) => {
                                setPositionInfo(userBoostablePosition);
                                setDeallocOpen(!deallocOpen);
                              }}
                            >
                              <FontAwesomeIcon icon={faMinus} />
                            </button>
                            <button
                              className="border  py-1 px-2 hover:border-[#14a8d4]"
                              onClick={(e) => {
                                setPositionInfo(userBoostablePosition);
                                setAllocOpen(!allocOpen);
                              }}
                            >
                              <FontAwesomeIcon icon={faPlus} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  );
                })}
              {/* </tbody> */}
            </table>
          </div>
        </>
      ) : (
        <>
          {/* advanced view */}
          <table className="min-w-full text-left ">
            <thead>
              <tr>
                <th scope="col pt-3">token</th>
                <th scope="col pt-3">amount</th>
                <th scope="col pt-3">setting</th>
                <th scope="col pt-3">
                  <div className="flex ">
                    active allocation
                    <IconContext.Provider
                      value={{ className: "m-0.5", size: "1rem" }}
                    >
                      <HiOutlineArrowLongRight />
                    </IconContext.Provider>
                    new allocation
                  </div>
                </th>
                <th scope="col pt-3">
                  <div className="flex ">
                    active mul.
                    <IconContext.Provider
                      value={{ className: "m-0.5", size: "1rem" }}
                    >
                      <HiOutlineArrowLongRight />
                    </IconContext.Provider>
                    new mul.
                  </div>
                </th>
                <th scope="col pt-3"></th>
              </tr>
            </thead>
            <tbody>
              {userBoostablePositions !== undefined &&
                userBoostablePositions.map((userBoostablePosition, i) => {
                  return (
                    <tr key={i}>
                      <td className="whitespace-nowrap ">x</td>
                      <td className="whitespace-nowrap ">y</td>
                      <td className="whitespace-nowrap ">z</td>
                      <td className="whitespace-nowrap ">1</td>
                      <td className="whitespace-nowrap ">2</td>
                      <td className="whitespace-nowrap">
                        <button
                          className="w-2/3 p-2 m-2 flex flex-row mx-auto items-center border-[#14a8d4]"
                          onClick={(e) => {}}
                        >
                          <IconContext.Provider
                            value={{ className: "m-0.5", size: "1rem" }}
                          >
                            <AiOutlineCheck />
                          </IconContext.Provider>
                          <Typography
                            variant="small"
                            className=" hidden lg:flex mx-auto"
                          >
                            apply
                          </Typography>
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
