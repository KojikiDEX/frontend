import React, { useContext, useEffect, useState, useRef } from "react";
import { IconContext } from "react-icons";
import { ImWarning } from "react-icons/im";

import { Typography } from "@material-tailwind/react";
import { ethers } from "ethers";

import Name from "../../components/Name";
import Item from "../../components/Item";

import { useLocation } from "react-router-dom";
import { KojikiContext } from "../../context/context";
import PositionList from "../../components/Position/PositionList";
import { formatNumber, formatPrice } from "../../hooks/contractHelper";
import { getWeb3Contract } from "../../hooks/contractHelper";
import coreFarmingPoolABI from "../../assets/abi/NitroPool.json";
import { useNFTPool, useNitroPool } from "../../hooks/useKojikiContext";
export default function GenesisPoolsDetail() {
  const location = useLocation();
  const context = useContext(KojikiContext);
  const [potentialPositions, setPotentialPositions] = useState([]);
  const [poolInfo, setPoolInfo] = useState();
  const goToHome = () => {
    window.location.href = "/";
  };

  const Ref = useRef(null);
  // const { tableDatas } = useSharedState();

  const [currentDate, setCurrentDate] = React.useState(180);
  const [currentHour, setCurrentHour] = React.useState(0);
  const [currentMin, setCurrentMin] = React.useState(0);
  const [currentSecond, setCurrentSecond] = React.useState(0);

  const [buttonStatus, setButtonStatus] = React.useState(false);
  const [durationBtnStatus, setDurationBtnStatus] = React.useState(1);
  const [lpPrice, setLpPrice] = useState(0);
  const [lpAddr, setLpAddr] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [accRewardsPerShare, setAccRewardsPerShare] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [hasStarted, setHasStarted] = useState(0);
  const [updateIndex, setUpdateIndex] = useState(0);
  // useEffect(() => {

  // }, [buttonStatus, durationBtnStatus]);
  const UpdateInfo = () => {
    // const poolInfo_ = useNitroPool(poolInfo);
    // setPoolInfo(poolInfo_);
    let updateIndex_ = updateIndex;
    updateIndex_ = updateIndex_ + 1;
    setUpdateIndex(updateIndex_);
  };

  useEffect(() => {
    setPoolInfo(location.state?.poolInfo);
  }, []);

  useEffect(() => {
    // const poolInfo_ = useNitroPool(poolInfo);
    // setPoolInfo(poolInfo_);
  }, [updateIndex]);

  useEffect(() => {
    if (!poolInfo) {
      return;
    }

    if (!context || !context.pools) {
      return;
    }

    setLpPrice(poolInfo.lpAssetPrice);
    setLpAddr(poolInfo.lpToken);
    setTotalDeposit(poolInfo.lpSupply);
    setAccRewardsPerShare(poolInfo.accRewardsPerShare);
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
    (async () => {
      const cfpContract = getWeb3Contract(
        coreFarmingPoolABI,
        poolInfo.nitroPoolAddr
      );
      const settings = await cfpContract.methods.settings().call();
      setStartTime(Number(settings[0]));
      setEndTime(Number(settings[1]));
    })();
  }, [poolInfo, context]);

  React.useEffect(() => {
    if (startTime === 0) {
      return;
    }
    if (endTime === 0) {
      return;
    }
    const localNow = Date.now();
    var localDate = new Date();
    var utc = localDate.toISOString();
    var utcNow = Date.parse(utc);

    const hasStarted_ = startTime < utcNow / 1000;
    setHasStarted(hasStarted_);
    const downCounter = () => {
      // let time =
      //   currentDate * 24 * 60 ** 2 +
      //   currentHour * 60 ** 2 +
      //   currentMin * 60 +
      //   currentSecond;

      let time = 0;
      if (hasStarted_) {
        time = endTime - Date.now() / 1000;
      } else {
        time = startTime - Date.now() / 1000;
      }
      time = time - 1;

      setCurrentDate(Math.floor(time / 60 / 60 / 24));
      setCurrentHour(Math.floor((time / 60 / 60) % 24));
      setCurrentMin(Math.floor((time / 60) % 60));
      setCurrentSecond(Math.floor(time % 60));
    };

    const clearTimer = () => {
      if (Ref.current) clearInterval(Ref.current);
      const id = setInterval(() => {
        downCounter();
      }, 1000);
      Ref.current = id;
    };
    clearTimer();
  }, [currentDate, currentHour, currentMin, currentSecond, endTime]);

  if (!poolInfo) {
    return (
      <div className="text-center">
        <h1>loading</h1>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left  lg:pt-10  p-5   mb-10">
        <Typography variant="h3">Core Farming Pools</Typography>
        <Typography as="p" variant="small">
          Deposit staked positions into core farming pools to earn 6 months of
          additional xSAKE emissions.
        </Typography>
        {/* <div className="w-full mt-3 flex flex-row">
                <div className="m-2 bg-kojiki-blue p-3 border-0  flex lg:flex-row">
                    <IconContext.Provider value={{ className: 'my-auto hidden lg:flex' }}>
                        <ImWarning />
                    </IconContext.Provider>
                    <Typography variant='h6' className=' mx-3'>
                    xSAKE and position withdrawals are disabled until the RP Event.
                    </Typography>
                </div>
            </div> */}
        <div className="w-full border p-5 mt-10 mb-3 lg:mr-3  lg:mb-0">
          <div className="flex flex-col lg:flex-row mb-5  lg:mb-0">
            <Name
              fromToken={poolInfo.token0.symbol}
              toToken={poolInfo.token1.symbol}
              fromTokenSymbol={poolInfo.token0.symbol}
              toTokenSymbol={poolInfo.token1.symbol}
              tokenAmount={10}
              imageSize={32}
            />
            {/* <button
              className="border  mt-2 lg:mt-0 lg:ml-auto py-1 px-8"
              onClick={() => {
                setOpen(!open);
              }}
            >
              APY
            </button> */}
          </div>
          <div className="py-3 mb-3 border-b-2 border-dashed"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <Typography variant="h4">Pool</Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              <Typography variant="small">Total value locked</Typography>
              <Typography variant="small">
                $
                {formatPrice(
                  formatNumber(ethers.utils.formatUnits(poolInfo.tvl, 6), 3)
                )}
              </Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              <Typography variant="small">APR</Typography>
              <Typography variant="small">
                {formatNumber(ethers.utils.formatUnits(poolInfo.poolAPY), 3)}%
              </Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              <Typography variant="small">Pending rewards #1</Typography>
              <Typography variant="small">
                {formatNumber(
                  ethers.utils.formatUnits(poolInfo.totalPendingRewards),
                  3
                )}{" "}
                xSAKE($
                {formatPrice(
                  formatNumber(
                    ethers.utils.formatUnits(
                      poolInfo.totalPendingRewardsInUSD,
                      24
                    ),
                    3
                  )
                )}
                )
              </Typography>
            </div>
          </div>
          <div className="py-3 mb-3 border-b-2 border-dashed"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div>
              <Typography variant="h4">Status</Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              <Typography variant="small">Status</Typography>
              <Typography variant="small">
                {startTime < Date.now() / 1000 ? "Active" : "Inactive"}
              </Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              <Typography variant="small">Duration</Typography>
              <Typography variant="small">180 days</Typography>
            </div>
            <div className="flex flex-row md:flex-col justify-between">
              {hasStarted ? (
                <Typography variant="small">End in</Typography>
              ) : (
                <Typography variant="small">Start in</Typography>
              )}

              <Typography variant="small">
                {currentDate}D&nbsp;&nbsp;{currentHour}h&nbsp;&nbsp;{currentMin}
                m&nbsp;&nbsp;{currentSecond}s
              </Typography>
            </div>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row border p-5 mt-3 ">
          <Item
            type={"chain"}
            label={"Total Deposits Value"}
            value={`$${formatNumber(
              ethers.utils.formatUnits(poolInfo.tvl, 6),
              3
            )}`}
          />
          <Item
            type={"feature"}
            label={"Total average APR"}
            value={`${formatNumber(
              ethers.utils.formatUnits(poolInfo.poolAPY),
              3
            )}%`}
          />
          <Item
            type={"jwerly"}
            label={"Pending xSAKE rewards"}
            value={formatNumber(
              ethers.utils.formatUnits(poolInfo.totalPendingRewards),
              3
            )}
          />
          <Item type={"symbol"} label={"Pending SAKE rewards"} value={0} />
        </div>
      </div>
      <div className="w-full mt-7 md:w-5/6 mx-auto text-center md:text-left  lg:pt-10  p-5   mb-10">
        <PositionList
          positionList={poolInfo.userPositions}
          potentialPositions={potentialPositions}
          hasPotentials={true}
          UpdateInfo={UpdateInfo}
        />
      </div>
      {/* <Dialog
        size="xs"
        open={open}
        handler={handleOpen}
        className="min-w-[100%] max-w-[100%] lg:min-w-[25%] max-w-[25%]  border"
      >
        <DialogHeader className="justify-between gap-2 border-b ">
          <Typography variant="h5">
            APY calculator
          </Typography>
          <IconButton
           
            size="sm"
            variant="text"
            onClick={handleOpen}
          >
            <XMarkIcon strokeWidth={2} className="h-5 w-5" />
          </IconButton>
        </DialogHeader>
        <DialogBody className="pr-2 ">
          <Typography variant="small" className="mb-4">
            This calculator doesn't take into account the earnings from swap
            fees and farms incentives.
          </Typography>
          <Typography variant="h6" className="mb-4 ">
            Deposit value.
          </Typography>
          <div className="flex flex-row mb-6">
            <Button
              className={
                "w-full p-2   " +
                (buttonStatus
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setButtonStatus(!buttonStatus);
              }}
            >
              Tokens
            </Button>
            <Button
              className={
                "w-full p-2   " +
                (!buttonStatus
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setButtonStatus(!buttonStatus);
              }}
            >
              USD
            </Button>
          </div>
          <div className="relative flex">
            <Input
              type="text"
              label="amount"
              value={amount}
              className=" placeholder-shown:placeholder-shown:border-t-kojiki-gray"
              onChange={onChange}
              containerProps={{
                className: "min-w-0",
              }}
            />
            <Button
              size="sm"
              className="primary !py-0"
            >
              max
            </Button>
          </div>
          <Typography variant="small" className="mb-4 text-right">
            balance: {0}$
          </Typography>
          <Typography variant="h6" className="mb-4 ">
            Deposit duration.
          </Typography>
          <div className="flex gap-4">
            <Button
              className={
                "w-full p-2   " +
                (durationBtnStatus === 1
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setDurationBtnStatus(1);
              }}
            >
              1 day
            </Button>
            <Button
              className={
                "w-full p-2   " +
                (durationBtnStatus === 2
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setDurationBtnStatus(2);
              }}
            >
              7 days
            </Button>
            <Button
              className={
                "w-full p-2   " +
                (durationBtnStatus === 3
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setDurationBtnStatus(3);
              }}
            >
              30 days
            </Button>
            <Button
              className={
                "w-full p-2   " +
                (durationBtnStatus === 4
                  ? "bg-yellow-500 hover:bg-yellow-500 "
                  : "bg-blue-500/20 hover:bg-blue-500/20")
              }
              variant="text"
              size="sm"
              onClick={() => {
                setDurationBtnStatus(4);
              }}
            >
              35 days
            </Button>
          </div>
          <Typography variant="h6" className="my-4 ">
            RP Estimates
          </Typography>
          <div className="flex flex-row">
            <Typography variant="h6" className=" w-full">
              deposit USD value
            </Typography>
            <hr className="mx-1 bg-underline-pattern" />
            <Typography variant="h6" className=" ml-auto">
              ${0}
            </Typography>
          </div>
          <div className="flex flex-row">
            <Typography variant="h6" className=" w-full">
              projected xSAKE earnings
            </Typography>
            <hr class="flex-grow-1 mx-1" />
            <Typography variant="h6" className=" ml-auto">
              {0}xSAKE
            </Typography>
          </div>
          <div className="flex flex-row">
            <Typography variant="h6" className=" w-full">
              projected earnings value
            </Typography>
            <hr class="flex-grow-1 mx-1" />
            <Typography variant="h6" className=" ml-auto">
              ${0}
            </Typography>
          </div>
          <div className="flex flex-row">
            <Typography variant="h6" className=" w-full">
              projected APY
            </Typography>
            <hr class="flex-grow-1 mx-1" />
            <Typography variant="h6" className=" ml-auto">
              {0}%
            </Typography>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            className="w-full p-2 bg-yellow-500   hover:bg-yellow-500"
            variant="text"
            size="sm"
            onClick={handleOpen}
          >
            Clsoe
          </Button>
        </DialogFooter>
      </Dialog> */}
    </React.Fragment>
  );
}
