import React, { useState, useContext, useEffect, useRef } from "react";
import { Typography, Tooltip } from "@material-tailwind/react";

import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";

import PrizeIcon from "../../components/Icons/PrizeIcon";
import ArrowUpIcon from "../../components/Icons/ArrowUpIcon";
import ArrowDownIcon from "../../components/Icons/ArrowDownIcon";
import DepositIcon from "../../components/Icons/DepositIcon";
import WithdrawIcon from "../../components/Icons/WithdrawIcon";
import HarvestIcon from "../../components/Icons/HarvestIcon";
import LockIcon from "../../components/Icons/LockIcon";
import RenewIcon from "../../components/Icons/RenewIcon";
import AddIcon from "../../components/Icons/AddIcon";
import RemoveIcon from "../../components/Icons/RemoveIcon";
import TransferIcon from "../../components/Icons/TransferIcon";
import SplitIcon from "../../components/Icons/SplitIcon";
import MergeIcon from "../../components/Icons/MergeIcon";
import UnLockIcon from "../../components/Icons/UnLockIcon";
import RocketIcon from "../../components/Icons/RocketIcon";
import FireIcon from "../../components/Icons/FireIcon";
import ThumbUpIcon from "../../components/Icons/ThumbUpIcon";
import { toast } from "react-toastify";
import { useWeb3React } from "@web3-react/core";
import { useNavigate } from "react-router-dom";

import DepositModal from "./Modals/DepositModal";
import WithdrawModal from "./Modals/WithdrawModal";
import LockModal from "./Modals/LockModal";
import BoostModal from "./Modals/BoostModal";
import UnboostModal from "./Modals/UnboostModal";
import TransferModal from "./Modals/TransferModal";
import SplitModal from "./Modals/SplitModal";
import MergeModal from "./Modals/MergeModal";
import { formatUnits, formatNumber } from "../../hooks/contractHelper";

import { getWeb3, CHAIN_ID } from "../../hooks/connectors";

import {
  getContract,
  getWeb3Contract,
  formatValue,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";

import erc20ABI from "../../assets/abi/IERC20.json";
import nftPoolABI from "../../assets/abi/NFTPool.json";
import kojikiStakeABI from "../../assets/abi/KojikiStakeToken.json";
import nitroPoolABI from "../../assets/abi/NitroPool.json";
import yiledBoosterABI from "../../assets/abi/YieldBooster.json";
import { MAX_UINT256 } from "../../config/constants";
import { contracts } from "../../config/contracts";
import { KojikiContext } from "../../context/context";
import {
  useSakeprice,
  useNFTPool,
  useNitroPool,
} from "../../hooks/useKojikiContext";
import { async } from "q";

// const ThumbUpIconForToolTip = React.forwardRef(function ThumbUpIconForToolTip(props, ref) {
//   //  Spread the props to the underlying DOM element.
//   return (
//     <ThumbUpIcon color="#14a8d4" />
//   );
// });

export default function PositionItem(props) {
  const { positionData, isPotentialPosition, UpdateInfo } = props;
  const context = useContext(KojikiContext);
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const [expand, setExpand] = useState(false);
  const { account, library } = useWeb3React();

  const [openDepositModal, setOpenDepositModal] = useState(false);
  const [openWithdrawModal, setOpenWithdrawModal] = useState(false);
  const [openLockModal, setOpenLockModal] = useState(false);
  const [openBoostModal, setOpenBoostModal] = useState(false);
  const [openUnboostModal, setOpenUnboostModal] = useState(false);
  const [openTransferModal, setOpenTransferModal] = useState(false);
  const [openSplitModal, setOpenSplitModal] = useState(false);
  const [openMergeModal, setOpenMergeModal] = useState(false);
  const [matchingNitro, setMatchingNitro] = useState({});
  const [userAllocation, setUserAllocation] = useState(0);
  const [userAllocationInUSD, setUserAllocationInUSD] = useState(0);
  const [lockDuration, setLockDuration] = useState(0);
  const [startLockTime, setStartLockTime] = useState(0);
  const [lockMultiplier, setLockMultiplier] = useState(0);
  const Ref = useRef(null);
  const [currentDate, setCurrentDate] = React.useState(0);
  const [currentHour, setCurrentHour] = React.useState(0);
  const [currentMin, setCurrentMin] = React.useState(0);
  const [currentSecond, setCurrentSecond] = React.useState(0);

  const sakeprice = useSakeprice();
  const kojikiRewardInUsd = BigNumber.from(positionData.kojikiTokenReward).mul(
    BigNumber.from(sakeprice)
  );
  const kojikiStakeRewardInUsd = BigNumber.from(
    positionData.kojikiStakeTokenRewards
  ).mul(BigNumber.from(sakeprice));

  useEffect(() => {
    if (!context) {
      return;
    }
    if (!positionData.isNitroPool && context.nitroPools.length !== 0) {
      const nitroPools = context.nitroPools;
      for (let nitroPool of nitroPools) {
        if (nitroPool.nitroPoolAddr === positionData.matchingNitro) {
          setMatchingNitro(nitroPool);
        }
      }
    }
  }, [context]);

  useEffect(() => {
    if (!positionData) {
      return;
    }

    if (!account) {
      return;
    }

    if (!sakeprice) {
      return;
    }

    (async () => {
      const mc = MulticallContractWeb3(CHAIN_ID);
      const queries = [];
      const yiledBoosterContract = getWeb3Contract(
        yiledBoosterABI,
        contracts[CHAIN_ID].YIELDBOOSTER
      );

      const nftPositionContract = getWeb3Contract(
        nftPoolABI,
        positionData.poolAddr
      );

      queries.push(
        yiledBoosterContract.methods.getUserPositionAllocation(
          account,
          positionData.poolAddr,
          positionData.tokenId
        )
      );
      queries.push(
        nftPositionContract.methods.getStakingPosition(positionData.tokenId)
      );

      const result = await mc.aggregate(queries);
      const allocation = result[0];
      const stakingInfo = result[1];
      // uint256 amount, uint256 amountWithMultiplier, uint256 startLockTime,
      // uint256 lockDuration, uint256 lockMultiplier, uint256 rewardDebt,
      // uint256 boostPoints, uint256 totalMultiplier
      const lockMultiplierCalc = (10000.0 + Number(stakingInfo[4])) / 10000.0;
      const userAllocationInUSD = formatUnits(
        BigNumber.from(allocation).mul(BigNumber.from(sakeprice)),
        24
      ).toFixed(4);
      const userAllocation = formatUnits(
        BigNumber.from(allocation),
        18
      ).toFixed(4);
      setUserAllocation(userAllocation);
      setUserAllocationInUSD(userAllocationInUSD);
      setStartLockTime(Number(stakingInfo[2]));
      setLockDuration(Number(stakingInfo[3]));
      setLockMultiplier(lockMultiplierCalc);
    })();
  }, [positionData, account, sakeprice]);

  // useEffect(() => {
  //   if (!context) {
  //     return;
  //   }

  //   if (!positionData.isNitroPool && context.nitroPools.length !== 0) {
  //     const nitroPools = context.nitroPools;
  //     for (let nitroPool of nitroPools) {
  //       if (nitroPool.nitroPoolAddr === positionData.matchingNitro) {
  //         setMatchingNitro(nitroPool);
  //       }
  //     }
  //   }
  // }, [context]);

  useEffect(() => {
    if (startLockTime === 0) {
      return;
    }
    if (lockDuration === 0) {
      return;
    }
    const downCounter = () => {
      // let time =
      //   currentDate * 24 * 60 ** 2 +
      //   currentHour * 60 ** 2 +
      //   currentMin * 60 +
      //   currentSecond;

      let time = startLockTime + lockDuration - Date.now() / 1000;
      time = time - 1;

      if (time < 0) {
        time = 0;
      }

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
  }, [
    currentDate,
    currentHour,
    currentMin,
    currentSecond,
    startLockTime,
    lockDuration,
  ]);

  const yieldBooster = contracts[CHAIN_ID].YIELDBOOSTER;
  const kojikiStakeToken = contracts[CHAIN_ID].XSakeTOKEN;
  const approveToken = async (addr, amount, setConfirming, setAllowance) => {
    setConfirming(true);
    try {
      let tokenContract = getContract(erc20ABI, addr, library);

      let tx = await tokenContract.approve(
        positionData.poolAddr,
        formatValue(amount, 18).toString(),
        {
          from: account,
        }
      );

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

            setAllowance(true);

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

      setConfirming(false);
    }
  };

  const deposit = async (poolAddr, tokenId, amount, setConfirming) => {
    setConfirming(true);
    try {
      const realAmount = formatValue(amount, 18);
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.addToPosition(tokenId, realAmount, {
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

  const withdraw = async (poolAddr, tokenId, amount, setConfirming) => {
    setConfirming(true);
    try {
      const realAmount = formatValue(amount, 18);
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.withdrawFromPosition(tokenId, realAmount, {
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

  const harvestPosition = async (poolAddr, tokenId) => {
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.harvestPosition(tokenId, {
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
          } else if (response.status === false) {
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);
    }
  };

  const harvestCFP = async (poolAddr) => {
    try {
      let nitroPoolContract = getContract(nitroPoolABI, poolAddr, library);

      let tx = await nitroPoolContract.harvest({
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
          } else if (response.status === false) {
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);
    }
  };

  const lockPosition = async (poolAddr, tokenId, duration) => {
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.lockPosition(tokenId, duration, {
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
          } else if (response.status === false) {
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);
    }
  };

  const allocate = async (poolAddr, tokenId, amount, setConfirming) => {
    setConfirming(true);
    try {
      const realAmount = formatValue(amount, 18);
      let tokenContract = getContract(
        kojikiStakeABI,
        kojikiStakeToken,
        library
      );

      const bytes = getWeb3().eth.abi.encodeParameters(
        ["address", "uint256"],
        [poolAddr, tokenId]
      );

      const bytes_test = getWeb3().eth.abi.encodeParameters(
        ["address", "uint256"],
        [poolAddr, tokenId]
      );

      let tx = await tokenContract.allocate(yieldBooster, realAmount, bytes, {
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

  const deallocate = async (poolAddr, tokenId, amount, setConfirming) => {
    setConfirming(true);
    try {
      const realAmount = formatValue(amount, 18);
      let tokenContract = getContract(
        kojikiStakeABI,
        kojikiStakeToken,
        library
      );
      const bytes = getWeb3().eth.abi.encodeParameters(
        ["address", "uint256"],
        [poolAddr, tokenId]
      );

      let tx = await tokenContract.deallocate(yieldBooster, realAmount, bytes, {
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

  const approveUsage = async (setConfirming, setIsAllowed) => {
    setConfirming(true);
    try {
      let tokenContract = getContract(
        kojikiStakeABI,
        kojikiStakeToken,
        library
      );

      let tx = await tokenContract.approveUsage(yieldBooster, MAX_UINT256, {
        from: account,
      });

      const resolveAfter3Sec = new Promise((resolve) =>
        setTimeout(resolve, 20000)
      );

      toast.promise(resolveAfter3Sec, {
        pending: "waiting for confirmation.",
      });

      var interval = setInterval(async function () {
        let web3 = getWeb3();
        var response = await web3.eth.getTransactionReceipt(tx.hash);
        if (response !== null) {
          clearInterval(interval);
          if (response.status === true) {
            toast.success("success! your transaction is success.");

            setIsAllowed(true);

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

      setConfirming(false);
    }
  };

  const splitPosition = async (poolAddr, tokenId, amount, setConfirming) => {
    setConfirming(true);
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);
      const realAmount = formatValue(amount, 18);

      let tx = await nftPoolContract.splitPosition(tokenId, realAmount, {
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

  const mergePositions = async (
    poolAddr,
    tokenIds,
    lockDuration,
    setConfirming
  ) => {
    setConfirming(true);
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.mergePositions(tokenIds, lockDuration, {
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

  const unstake = async (poolAddr, tokenId, UpdateInfo) => {
    try {
      let nitroPoolContract = getContract(nitroPoolABI, poolAddr, library);

      let tx = await nitroPoolContract.withdraw(tokenId, {
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
            if (UpdateInfo) {
              UpdateInfo();
            }
            // setConfirming(false);
          } else if (response.status === false) {
            toast.error("error! your last transaction is failed.");

            // setConfirming(false);
          } else {
            toast.error("error! something went wrong.");

            // setConfirming(false);
          }
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      // setConfirming(false);
    }
  };

  const safeTransferFrom = async (
    poolAddr,
    tokenId,
    from,
    to,
    setConfirming,
    UpdateInfo
  ) => {
    setConfirming(true);
    try {
      let nftPoolContract = getContract(nftPoolABI, poolAddr, library);

      let tx = await nftPoolContract.safeTransferFrom(from, to, tokenId, {
        from: account,
      });

      // let tx = await nftPoolContract.splitPosition(
      //   tokenId,
      //   "1000000000000000000",
      //   {
      //     from: account
      //   }
      // );

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
            if (UpdateInfo) {
              UpdateInfo();
            }
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
      <div className="grid grid-cols-[4fr_4fr_4fr_1fr] md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left ">
        <div className="whitespace-nowrap py-4 ">
          <div className="flex flex-col md:flex-row justify-start md:items-center gap-0 md:gap-2">
            <div className="hidden md:flex gap-1 pt-2">
              <img
                className="w-6 md:w-8 my-auto "
                src={require(`../../assets/img/token/${positionData.token0.symbol}.png`)}
                alt="fromToken"
              />
              <img
                className="w-6 md:w-8 my-auto "
                src={require(`../../assets/img/token/${positionData.token1.symbol}.png`)}
                alt="toToken"
              />
            </div>
            <div>
              <div className="flex flex-row items-center gap-1">
                <span>{positionData.symbol}</span>
                <div className="hidden md:block">
                  <PrizeIcon />
                </div>
              </div>
              <span className="text-sm">(#id-{positionData.tokenId})</span>
            </div>
          </div>
        </div>
        <div className="whitespace-nowrap py-4 ">
          <p className="mb-1">
            {/* {ethers.utils.formatUnits(BigNumber.from(positionData.amount), 18)} */}
            <span className="block md:hidden">amount</span>
            <span className="hidden md:block">
              {formatUnits(positionData.amount, 18).toFixed(3)}
            </span>
          </p>
          <p>${formatUnits(positionData.amountInUSD, 6).toFixed(3)}</p>
        </div>
        <div className="flex gap-1 md:gap-2 py-4 ">
          <Tooltip
            content="Yield Farm Position"
            placement="top"
            className="py-1"
          >
            <div>
              <ThumbUpIcon color="#14a8d4" />
            </div>
          </Tooltip>
          {lockDuration > 0 ? (
            <Tooltip content="Active lock" placement="top" className="py-1">
              <div>
                <LockIcon color="#14a8d4" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip content="No active lock" placement="top" className="py-1">
              <div>
                <LockIcon />
              </div>
            </Tooltip>
          )}
          <Tooltip content="No active boost" placement="top" className="py-1">
            <div>
              <RocketIcon />
            </div>
          </Tooltip>

          {positionData.isNitroPool ? (
            <Tooltip content="Staked in RP" placement="top" className="py-1">
              <div>
                <FireIcon color="#14a8d4" />
              </div>
            </Tooltip>
          ) : (
            <Tooltip
              content="Not staked in RP"
              placement="top"
              className="py-1 mb-1"
            >
              <div>
                <FireIcon />
              </div>
            </Tooltip>
          )}
        </div>
        <div className="hidden md:block whitespace-nowrap py-4">
          <p className="mb-1">
            {formatNumber(
              ethers.utils.formatUnits(positionData.poolAPY, 18),
              3
            )}
            %
          </p>
        </div>
        <div className="flex justify-between items-center">
          <div className="hidden md:block whitespace-nowrap py-4 ">
            <p className="mb-1">
              {formatNumber(
                ethers.utils.formatUnits(positionData.pendingRewards, 18),
                3
              )}
            </p>
            <p>
              $
              {formatNumber(
                ethers.utils.formatUnits(
                  BigNumber.from(positionData.pendingRewards).mul(
                    BigNumber.from(sakeprice)
                  ),
                  18
                ),
                3
              )}
            </p>
          </div>
          <div className="pr-0 md:pr-6">
            {isPotentialPosition ? (
              <button
                className="default-outline"
                onClick={() =>
                  safeTransferFrom(
                    positionData.poolAddr,
                    positionData.tokenId,
                    account,
                    matchingNitro.nitroPoolAddr,
                    setConfirming,
                    UpdateInfo
                  )
                }
              >
                deposit
              </button>
            ) : (
              <button onClick={() => setExpand(!expand)}>
                {expand === true ? <ArrowUpIcon /> : <ArrowDownIcon />}
              </button>
            )}
          </div>
        </div>
      </div>
      {expand === true && (
        <div className="position-item border">
          <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left mx-6 border-b-2 border-dashed">
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-4 ">
              <span className="  ">farm</span>
              <div className="flex gap-3 mt-1">
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => setOpenDepositModal(true)}
                >
                  <DepositIcon />
                  <span className="hidden md:block ">deposit</span>
                </button>
                <button
                  className={`flex items-center  gap-1 ${
                    positionData.isNitroPool ? "" : ""
                  }`}
                  onClick={() => setOpenWithdrawModal(true)}
                  disabled={positionData.isNitroPool}
                >
                  <WithdrawIcon />
                  <span className="hidden md:block ">withdraw</span>
                </button>
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => {
                    if (positionData.isNitroPool) {
                      harvestCFP(positionData.nitroPoolAddr);
                    } else {
                      harvestPosition(
                        positionData.poolAddr,
                        positionData.tokenId
                      );
                    }
                  }}
                >
                  <HarvestIcon />
                  <span className="hidden md:block">harvest</span>
                </button>
              </div>
            </div>
            <div className="flex flex-row md:hidden justify-between items-center whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">total apr</p>
              <div className="flex gap-3 mt-1">
                {formatUnits(positionData.poolAPY, 18).toFixed(3)}%
              </div>
            </div>
            <div className="flex flex-row md:hidden justify-between items-center whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">pending rewards</p>
              <div className="flex whitespace-nowrap ">
                <p className="mb-1">
                  {formatUnits(positionData.pendingRewards, 18).toFixed(3)} /{" "}
                </p>
                <p>
                  {" "}
                  ${formatUnits(positionData.pendingRewards, 18).toFixed(3)}
                </p>
              </div>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">pending xSAKE</p>
              <p>
                {formatUnits(positionData.kojikiStakeTokenRewards, 18).toFixed(
                  4
                )}{" "}
                <span>
                  (${formatUnits(kojikiStakeRewardInUsd, 24).toFixed(4)})
                </span>
              </p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">pending SAKE</p>
              <p>
                {formatUnits(positionData.kojikiTokenReward, 18).toFixed(4)}{" "}
                <span>(${formatUnits(kojikiRewardInUsd, 24).toFixed(4)})</span>
              </p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">farm base APR</p>
              <p>
                {formatNumber(
                  ethers.utils.formatUnits(positionData.poolAPY),
                  3
                )}
                %
              </p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">farm bonus APR</p>
              <p>0.002%</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left  mx-6  border-b-2 border-dashed">
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap pt-4 pb-1 md:py-4 ">
              <span className="  ">lock</span>
              <div className="flex gap-3 mt-1">
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => setOpenLockModal(true)}
                >
                  <LockIcon />
                  <span className="hidden md:block ">lock</span>
                </button>
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => setOpenLockModal(true)}
                >
                  <RenewIcon />
                  <span className="hidden md:block ">renew</span>
                </button>
              </div>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">status</p>
              {lockDuration > 0 ? (
                <p className="flex items-center gap-1">
                  <LockIcon />
                  <span>locked</span>
                </p>
              ) : (
                <p className="flex items-center gap-1">
                  <UnLockIcon />
                  <span>unlocked</span>
                </p>
              )}
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">lock duration</p>
              <p>{lockDuration / 3600 / 24} days</p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">lock bonus multiplier</p>
              <p>{lockMultiplier}</p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">unlocked In</p>
              <p>
                {currentDate}D&nbsp;&nbsp;{currentHour}h&nbsp;&nbsp;{currentMin}
                m&nbsp;&nbsp;{currentSecond}s
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left  mx-6  border-b-2 border-dashed">
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap pt-4 pb-1 md:py-4 ">
              <span className="  ">boost</span>
              <div className="flex gap-3 mt-1">
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => setOpenBoostModal(true)}
                >
                  <AddIcon />
                  <span className="hidden md:block ">add</span>
                </button>
                <button
                  className="flex items-center  gap-1 "
                  onClick={() => setOpenUnboostModal(true)}
                >
                  <RemoveIcon />
                  <span className="hidden md:block ">remove</span>
                </button>
              </div>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">your allocation</p>
              <p>{userAllocation} xSAKE</p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">external allocation</p>
              <p>{userAllocation} SAKE</p>
            </div>
            <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-1 md:py-4 ">
              <p className="mb-1">boost bonus multiplier</p>
              <p>x1</p>
            </div>
          </div>
          {!positionData.isNitroPool && (
            <div className="grid grid-cols-1 md:grid-cols-[2fr_repeat(4,_1fr)] items-center text-left  mx-6">
              <div className="flex flex-row md:flex-col justify-between whitespace-nowrap py-4 ">
                <span>manage</span>
                <div className="flex gap-3 mt-1">
                  <button
                    className="flex items-center  gap-1 "
                    onClick={() => setOpenTransferModal(true)}
                  >
                    <TransferIcon />
                    <span className="hidden md:block ">transfer</span>
                  </button>
                  <button
                    className="flex items-center  gap-1 "
                    onClick={() => setOpenSplitModal(true)}
                  >
                    <SplitIcon />
                    <span className="hidden md:block ">split</span>
                  </button>
                  <button
                    className="flex items-center  gap-1 "
                    onClick={() => setOpenMergeModal(true)}
                  >
                    <MergeIcon />
                    <span className="hidden md:block ">merge</span>
                  </button>
                </div>
              </div>
              <div></div>
              <div></div>
              <div></div>
              {/* <div className="text-left md:text-right pr-3">
                <button
                  className="px-3 py-2   hover:bg-kojiki-blue hover:"
                  onClick={() => {
                    navigate(`/core-pools/detail`, {
                      state: { poolInfo: matchingNitro },
                    });
                  }}
                >
                  MatchingCFPs
                </button>
              </div> */}
            </div>
          )}

          {positionData.isNitroPool && (
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_3fr] items-center text-left  mx-6">
              <div className="whitespace-nowrap py-4 ">
                <div className="flex gap-1 items-center text-sky-500">
                  <span>pool</span>
                  <FireIcon color="#fdff00" />
                </div>
                <div className="flex gap-3 mt-1">
                  <button
                    className="flex items-center  gap-1 "
                    onClick={() =>
                      unstake(
                        positionData.nitroPoolAddr,
                        positionData.tokenId,
                        UpdateInfo
                      )
                    }
                  >
                    <TransferIcon />
                    <span className="hidden md:block ">unstake</span>
                  </button>
                  {/* <button
                    className="flex items-center  gap-1 "
                    onClick={() => setOpenSplitModal(true)}
                  >
                    <SplitIcon />
                    <span className="hidden md:block ">split</span>
                  </button>
                  <button
                    className="flex items-center  gap-1 "
                    onClick={() => setOpenMergeModal(true)}
                  >
                    <MergeIcon />
                    <span className="hidden md:block ">merge</span>
                  </button> */}
                </div>
              </div>
              <div className="whitespace-nowrap py-4 ">
                <p className="mb-1">pool apr</p>
                <p>
                  {formatNumber(
                    ethers.utils.formatUnits(positionData.poolAPY),
                    3
                  )}
                  %
                </p>
              </div>
              <div className="py-4 ">
                <p>
                  this position is staked into a pool, limiting the interactions
                  you can have with it.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <DepositModal
        openModal={openDepositModal}
        handleModal={setOpenDepositModal}
        positionData={positionData}
        approveToken={approveToken}
        deposit={deposit}
      />
      <WithdrawModal
        openModal={openWithdrawModal}
        handleModal={setOpenWithdrawModal}
        positionData={positionData}
        withdraw={withdraw}
      />
      <LockModal
        openModal={openLockModal}
        handleModal={setOpenLockModal}
        positionData={positionData}
        lockPosition={lockPosition}
      />
      <BoostModal
        openModal={openBoostModal}
        handleModal={setOpenBoostModal}
        positionData={positionData}
        approveUsage={approveUsage}
        allocate={allocate}
        deallocate={deallocate}
      />
      <UnboostModal
        openModal={openUnboostModal}
        handleModal={setOpenUnboostModal}
        positionData={positionData}
        deallocate={deallocate}
      />
      <TransferModal
        openModal={openTransferModal}
        handleModal={setOpenTransferModal}
        positionData={positionData}
        safeTransferFrom={safeTransferFrom}
      />
      <SplitModal
        openModal={openSplitModal}
        handleModal={setOpenSplitModal}
        positionData={positionData}
        splitPosition={splitPosition}
      />
      <MergeModal
        openModal={openMergeModal}
        handleModal={setOpenMergeModal}
        positionData={positionData}
        mergePositions={mergePositions}
      />
    </React.Fragment>
  );
}
