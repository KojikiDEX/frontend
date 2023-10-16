import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import {
  checkWETHSymbol,
  formatNumber,
  formatUnits,
} from "../../hooks/contractHelper";

import {
  getContract,
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";
import { useETHPrice } from "../../hooks/useKojikiContext";

import LpABI from "../../assets/abi/LP.json";
import ERC20ABI from "../../assets/abi/ERC20.json";
import RouterABI from "../../assets/abi/KojikiSwapRouter.json";

import LoadingIcon from "../../components/Icons/LoadingIcon";
import { contracts } from "../../config/contracts";
import { getWeb3, CHAIN_ID, USDC_DECIMALS } from "../../hooks/connectors";

export default function Withdraw() {
  const { account, library } = useWeb3React();
  let { lpAddr } = useParams();
  let ethPrice = useETHPrice();

  const mc = MulticallContractWeb3();
  const lpContract = getWeb3Contract(LpABI, lpAddr);

  const [tvl, setTvl] = useState(0);

  const [percent, setPercent] = useState(100);
  const [allowance, setAllowance] = useState(0);

  const [lpData, setLpData] = useState({});
  const [token0Data, setToken0Data] = useState({});
  const [token1Data, setToken1Data] = useState({});

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const checkAllowance = async () => {
    if (lpContract != undefined) {
      const data = await mc.aggregate([
        lpContract.methods.allowance(account, contracts[CHAIN_ID].ROUTER),
      ]);

      setAllowance(data[0]);
    }
  };

  const approveLiquidity = async () => {
    setConfirming(true);
    try {
      let lpContract = getContract(LpABI, lpAddr, library);
      let tx = await lpContract.approve(
        contracts[CHAIN_ID].ROUTER,
        formatNumber((lpData.balance * percent) / 100),
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
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");

            checkAllowance();
            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const removeLiquidity = async () => {
    setConfirming(true);
    try {
      let routerContract = getContract(
        RouterABI,
        contracts[CHAIN_ID].ROUTER,
        library
      );

      let tx;
      if (
        lpData.token0Addr == contracts[CHAIN_ID].WETH ||
        lpData.token1Addr == contracts[CHAIN_ID].WETH
      ) {
        tx = await routerContract.removeLiquidityETH(
          lpData.token0Addr == contracts[CHAIN_ID].WETH
            ? lpData.token1Addr
            : lpData.token0Addr,
          formatNumber((lpData.balance * percent) / 100),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
          }
        );
      } else {
        tx = await routerContract.removeLiquidityETH(
          lpData.token0Addr,
          lpData.token1Addr,
          formatNumber((lpData.balance * percent) / 100),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
          }
        );
      }
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

            checkAllowance();
            initData();

            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
          }
        }
      }, 5000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const initData = async () => {
    if (account == undefined) return;

    const lpData = await mc.aggregate([
      lpContract.methods.totalSupply(),
      lpContract.methods.token0(),
      lpContract.methods.token1(),
      lpContract.methods.getReserves(),
      lpContract.methods.balanceOf(account),
    ]);

    setLpData({
      totalSupply: lpData[0],
      token0Addr: lpData[1],
      token1Addr: lpData[2],
      reserves: lpData[3],
      balance: lpData[4],
    });

    let token0Contract = getWeb3Contract(ERC20ABI, lpData[1]);
    let token1Contract = getWeb3Contract(ERC20ABI, lpData[2]);

    const tokenData = await mc.aggregate([
      token0Contract.methods.name(),
      token0Contract.methods.symbol(),
      token0Contract.methods.decimals(),
      token0Contract.methods.balanceOf(lpAddr),
      token1Contract.methods.name(),
      token1Contract.methods.symbol(),
      token1Contract.methods.decimals(),
      token1Contract.methods.balanceOf(lpAddr),
    ]);

    setToken0Data({
      name: tokenData[0],
      symbol: tokenData[1],
      decimals: tokenData[2],
      balance: tokenData[3],
    });

    setToken1Data({
      name: tokenData[4],
      symbol: tokenData[5],
      decimals: tokenData[6],
      balance: tokenData[7],
    });

    if (ethPrice == undefined) return;

    if (lpData[1].toLowerCase() == contracts[CHAIN_ID].WETH.toLowerCase()) {
      setTvl(
        formatUnits(ethPrice.toNumber(), USDC_DECIMALS) *
          formatUnits(tokenData[3], tokenData[2]) *
          2
      );
    } else if (
      lpData[2].toLowerCase() == contracts[CHAIN_ID].WETH.toLowerCase()
    ) {
      setTvl(
        formatUnits(ethPrice.toNumber(), USDC_DECIMALS) *
          formatUnits(tokenData[7], tokenData[6]) *
          2
      );
    } else if (
      lpData[1].toLowerCase() == contracts[CHAIN_ID].USDC.toLowerCase()
    ) {
      setTvl(1 * formatUnits(tokenData[3], tokenData[2]) * 2);
    } else if (
      lpData[2].toLowerCase() == contracts[CHAIN_ID].USDC.toLowerCase()
    ) {
      setTvl(1 * formatUnits(tokenData[7], tokenData[6]) * 2);
    } else {
      setTvl(0);
    }

    setLoading(false);
  };

  useEffect(() => {
    checkAllowance();
  }, [percent]);

  useEffect(() => {
    initData();
  }, [ethPrice, account]);

  return (
    <React.Fragment>
      <div className="max-w-[1024px] mt-10 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to={`/pool/overview/${lpAddr}`}>
            <button className="w-full default-outline">overview</button>
          </Link>
          <Link to={`/pool/myposition/${lpAddr}`}>
            <button className="w-full default-outline">my position</button>
          </Link>
          <Link to={`/pool/deposit/${lpAddr}`}>
            <button className="w-full default-outline">deposit</button>
          </Link>
          <Link to={`/pool/withdraw/${lpAddr}`}>
            <button className="w-full primary !py-[2px]">withdraw</button>
          </Link>
        </div>
        {account == undefined ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <span>not connected</span>
          </div>
        ) : loading ? (
          <div className="min-h-[300px] flex justify-center items-center">
            <LoadingIcon />
          </div>
        ) : (
          <div className="mt-12">
            <div className="mb-10">
              <p className="text-kojiki-blue">withdraw</p>
              <span>
                withdraw to receive pool tokens and earned trading fees
              </span>
            </div>
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      1
                    </span>
                    <span className="text-kojiki-blue">choose a percent</span>
                  </div>
                  <div>
                    <p className="text-xs">
                      choose how many lp shares you want to withdraw to receive
                      the corresponding pool tokens
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      2
                    </span>
                    <span className="text-kojiki-blue">single or balanced</span>
                  </div>
                  <div>
                    <p className="text-xs">
                      decide to receive a single token or all tokens in balanced
                      amounts
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      3
                    </span>
                    <span className="text-kojiki-blue">
                      funds will arrive shortly
                    </span>
                  </div>
                  <div>
                    <p className="text-xs">review and submit the transaction</p>
                    <p className="text-xs">
                      you will receive the funds one confirmed
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p>amount to withdraw</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col justify-between gap-2 border p-5">
                    <span className="text-kojiki-blue">
                      {formatNumber(formatUnits(lpData.balance, 18), 5)} K-LP
                    </span>
                    <div className="flex justify-between">
                      <span className="text-sm">
                        $
                        {formatNumber(
                          (((lpData.balance * tvl) / lpData.totalSupply) *
                            percent) /
                            100,
                          5
                        )}
                      </span>
                      <span className="text-sm">
                        available{" "}
                        {formatNumber(
                          (formatUnits(lpData.balance, 18) * percent) / 100,
                          5
                        )}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPercent(25);
                        }}
                        className={`${
                          percent == 25 ? "default" : "default-outline"
                        } text-xs !px-1`}
                      >
                        25%
                      </button>
                      <button
                        onClick={() => {
                          setPercent(50);
                        }}
                        className={`${
                          percent == 50 ? "default" : "default-outline"
                        } text-xs !px-1`}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => {
                          setPercent(75);
                        }}
                        className={`${
                          percent == 75 ? "default" : "default-outline"
                        } text-xs !px-1`}
                      >
                        75%
                      </button>
                      <button
                        onClick={() => {
                          setPercent(100);
                        }}
                        className={`${
                          percent == 100 ? "default" : "default-outline"
                        } text-xs !px-1`}
                      >
                        max
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 border p-3">
                    {/* <div className="grid grid-cols-2 gap-2">
                      <button className="default-outline">single</button>
                      <button className="default">balanced</button>
                    </div> */}
                    <div className="flex flex-col gap-2">
                      <p>you will receive all tokens in the balanced amounts</p>
                      <p className="text-sm text-kojiki-blue">
                        expected to receive
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={require(`../../assets/img/token/${checkWETHSymbol(
                              token0Data.symbol
                            ).toUpperCase()}.png`)}
                            width="18px"
                            alt="fromToken"
                          />
                          <span>
                            {formatNumber(
                              ((lpData.balance / lpData.totalSupply) *
                                formatUnits(
                                  token0Data.balance,
                                  token0Data.decimals
                                ) *
                                percent) /
                                100,
                              5
                            )}{" "}
                            {checkWETHSymbol(token0Data.symbol)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <img
                            src={require(`../../assets/img/token/${checkWETHSymbol(
                              token1Data.symbol
                            ).toUpperCase()}.png`)}
                            width="18px"
                            alt="fromToken"
                          />
                          <span>
                            {formatNumber(
                              ((lpData.balance / lpData.totalSupply) *
                                formatUnits(
                                  token1Data.balance,
                                  token1Data.decimals
                                ) *
                                percent) /
                                100,
                              5
                            )}{" "}
                            {checkWETHSymbol(token1Data.symbol)}
                          </span>
                        </div>
                      </div>
                      <div>
                        {account == undefined ? (
                          <button className="w-full primary mt-5">
                            connect
                          </button>
                        ) : confirming ? (
                          <button className="w-full primary mt-5">
                            confirming...
                          </button>
                        ) : allowance < (lpData.balance * percent) / 100 ? (
                          <button
                            className="w-full primary mt-5"
                            onClick={() => {
                              approveLiquidity();
                            }}
                          >
                            approve lp token
                          </button>
                        ) : (
                          <button
                            className="w-full primary mt-5"
                            onClick={() => {
                              removeLiquidity();
                            }}
                          >
                            remove liquidity
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* <div className="flex flex-col gap-2 border p-3">
                    <div className="flex justify-between items-center">
                      <span>collect as weth</span>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="flex justify-between">
                      <span>slippage</span>
                      <span className="text-kojiki-blue">0%</span>
                    </div>
                    <div>
                      <button className="w-full primary">connect</button>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
