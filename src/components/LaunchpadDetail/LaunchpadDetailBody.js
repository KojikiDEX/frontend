import React, { useContext } from "react";
import { ethers } from "ethers";
import { useWeb3React } from "@web3-react/core";
import { Typography } from "@material-tailwind/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import Input from "./Input";
import {
  ADMIN_ACCOUNT,
  ADMIN_ACCOUNT1,
  CHAIN_ID,
  ETH_DECIMALS,
  getWeb3,
  APP_PUBLIC_URL,
} from "../../hooks/connectors";
import { toast } from "react-toastify";
import { contracts } from "../../config/contracts";
import { TokenContext } from "../../context/context";
import {
  formatUnits,
  formatValue,
  getContract,
} from "../../hooks/contractHelper";
import FairAuctionABI from "../../assets/abi/FairAuction.json";
import Item from "../Item";

export default function LaunchpadDetailBody(props) {
  const {
    tokenPriceInUSD,
    userToken0,
    userToken1,
    userContribution,
    userReferral,
    userReferralPending,
    hasEnded,
    fairAuction,
    symbol,
  } = props;
  const { account, library } = useWeb3React();
  const [amount, setAmount] = React.useState(0);
  const [disabled] = React.useState();
  const [confirming, setConfirming] = React.useState(false);
  const { tokens } = useContext(TokenContext);

  const ethToken = tokens[contracts[CHAIN_ID].ETH];

  const claim = async () => {
    if (!account) {
      toast.warning("Please connect wallet to BASE Mainnet!");
      return;
    }

    setConfirming(true);
    try {
      const fairAuctionContract = getContract(
        FairAuctionABI,
        fairAuction[CHAIN_ID],
        library
      );

      const tx = await fairAuctionContract.claim({ from: account });

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
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
          setConfirming(false);
        }
      }, 20000);
    } catch (error) {
      console.log(error);
      if (error?.data?.data?.message) {
        toast.error(error?.data?.data?.message);
      } else {
        toast.error("error! something went wrong.");
      }

      setConfirming(false);
    }
  };

  const claimRefEarnings = async () => {
    if (!account) {
      toast.error("Please connect wallet to BASE Mainnet!");
      return;
    }

    setConfirming(true);
    try {
      const fairAuctionContract = getContract(
        FairAuctionABI,
        fairAuction[CHAIN_ID],
        library
      );

      const tx = await fairAuctionContract.claimRefEarnings({ from: account });

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
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
          setConfirming(false);
        }
      }, 20000);
    } catch (error) {
      console.log(error);
      if (error?.data?.data?.message) {
        toast.error(error?.data?.data?.message);
      } else {
        toast.error("error! something went wrong.");
      }

      setConfirming(false);
    }
  };

  const buyETH = async () => {
    if (!account) {
      toast.warning("Please connect wallet to BASE Mainnet!");
      return;
    }

    if (!amount) {
      toast.warning("input amount correctly!");
      return;
    }

    setConfirming(true);
    try {
      const amountValue = formatValue(amount, ETH_DECIMALS);
      let referrer = window.localStorage.getItem(
        "LAUNCHPAD_REFERRAL" + CHAIN_ID
      );
      referrer = ethers.utils.isAddress(referrer) ? referrer : ADMIN_ACCOUNT;
      referrer = account === ADMIN_ACCOUNT ? ADMIN_ACCOUNT1 : referrer;

      const fairAuctionContract = getContract(
        FairAuctionABI,
        fairAuction[CHAIN_ID],
        library
      );

      const tx = await fairAuctionContract.buyETH(referrer, {
        from: account,
        value: amountValue,
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
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");
          } else {
            toast.error("error! something went wrong.");
          }
          setConfirming(false);
        }
      }, 20000);
    } catch (error) {
      console.log(error);
      if (error?.data?.data?.message) {
        toast.error(error?.data?.data?.message);
      } else {
        toast.error("error! something went wrong.");
      }

      setConfirming(false);
    }
  };

  return (
    <div className="w-full max-w-[390px] flex flex-col mx-auto justify-center border p-5 ">
      {!hasEnded ? (
        <div className="w-full flex flex-col md:flex-row justify-between">
          <span className=" text-center md:mx-3 md:text-left">buy</span>
          <button
            className="flex flex-row mx-auto md:mx-0 hover:border-[#14a8d4] px-2 py-1  "
            onClick={(e) => {
              if (!account) {
                toast.warning("connect wallet to copy referral link!");
              } else if (navigator.clipboard) {
                navigator.clipboard.writeText(
                  `${APP_PUBLIC_URL}/launchpad/sake?ref=${account}`
                );
                toast.success("copy referral link success! 👍");
              }
            }}
          >
            <FontAwesomeIcon icon={faCopy} />
            <Typography variant="small" className="mx-1   text-center">
              referral Link
            </Typography>
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col md:flex-row text-left">
          <span className="text-kojiki-blue">claim</span>
        </div>
      )}
      <div className="w-full flex flex-col justify-center">
        {!hasEnded && (
          <Input amount={amount} disabled={disabled} setAmount={setAmount} />
        )}
        {!hasEnded && amount && amount > 0 && (
          <div className="w-full flex flex-col my-2">
            <div className="w-full flex flex-col md:flex-row md:justify-between">
              <span className="md:ml-4 text-center md:text-right ">spent</span>
              <span className="md:mr-4 text-center md:text-left ">
                {amount} ETH
              </span>
            </div>
            <div className="w-full flex flex-col md:flex-row md:justify-between">
              <span className="md:ml-4 text-center md:text-right ">
                your referral earning
              </span>
              <span className="md:mr-4 text-center md:text-left ">
                {userReferral.toFixed(2)} wETH
              </span>
            </div>
            <div className="w-full flex flex-col md:flex-row md:justify-between">
              <span className="md:ml-4 text-center md:text-right ">
                pending referral earning
              </span>
              <span className="md:mr-4 text-center md:text-left ">
                {userReferralPending.toFixed(2)} wETH
              </span>
            </div>
          </div>
        )}
        {hasEnded && (
          <div className="w-full flex flex-col md:flex-row mb-5 justify-center md:justify-between mt-5 p-5 border ">
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <Item
                type={"saketoken"}
                label={`$${symbol}`}
                value={`${userToken0.toFixed(2)} ($${(
                  tokenPriceInUSD * userToken0
                ).toFixed(2)})`}
              />
              <Item
                type={"xsaketoken"}
                label={`$x${symbol}`}
                value={`${userToken1.toFixed(2)} ($${(
                  tokenPriceInUSD * userToken1
                ).toFixed(2)})`}
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col my-auto text-left">
              <div>
                <p>contribution</p>
                <p className="text-kojiki-blue">
                  {userContribution.toFixed(2)} ETH
                </p>
              </div>
              <div>
                <p>your referral earning</p>
                <p className="text-kojiki-blue">
                  {userReferral.toFixed(2)} wETH
                </p>
              </div>
              <div>
                <p>pending referral earning</p>
                <p className="text-kojiki-blue">
                  {userReferralPending.toFixed(2)} wETH
                </p>
              </div>
            </div>
          </div>
        )}
        {!account ? (
          <button className="w-full md:w-1/2 mx-auto default-outline">
            not connected
          </button>
        ) : (
          <div className="w-full flex flex-col my-2 gap-3 justify-between">
            {!hasEnded ? (
              <button
                className="w-full default-outline"
                disabled={confirming}
                onClick={(e) => {
                  if (!confirming) buyETH();
                }}
              >
                {confirming
                  ? "buying..."
                  : ethToken &&
                    formatUnits(ethToken.balance, ETH_DECIMALS) - 0.002 >=
                      parseFloat(amount)
                  ? "buy"
                  : "incorrect amount"}
              </button>
            ) : (
              <button
                className="w-full py-1 px-2 default-outline"
                disabled={confirming}
                onClick={(e) => {
                  if (!confirming) claim();
                }}
              >
                {confirming ? "claiming..." : "claim"}
              </button>
            )}
            <button
              className="w-full py-1 px-2 default-outline"
              disabled={confirming}
              onClick={(e) => {
                if (!confirming) claimRefEarnings();
              }}
            >
              claim referral earning
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
