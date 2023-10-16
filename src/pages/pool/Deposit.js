import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import {
  formatNumber,
  formatUnits,
  formatValue,
  isWETH,
  checkWETHSymbol,
  trimAddress,
} from "../../hooks/contractHelper";
import {
  getContract,
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";
import { getLpTokens } from "../../hooks/lpTokenHelper";
import { getWeb3, CHAIN_ID, USDC_DECIMALS } from "../../hooks/connectors";

import LpABI from "../../assets/abi/LP.json";
import ERC20ABI from "../../assets/abi/ERC20.json";
import RouterABI from "../../assets/abi/KojikiSwapRouter.json";

import LoadingIcon from "../../components/Icons/LoadingIcon";

import { contracts } from "../../config/contracts";

import { TokenContext } from "../../context/context";
import { zeroAddress } from "../../config/tokens";

export default function Deposit() {
  const { account, library } = useWeb3React();
  const { tokens, lpTokens, setLpTokens } = useContext(TokenContext);

  let { lpAddr } = useParams();

  const mc = MulticallContractWeb3();
  const lpContract = getWeb3Contract(LpABI, lpAddr);
  const routerContract = getContract(
    RouterABI,
    contracts[CHAIN_ID].ROUTER,
    library
  );

  const [lpData, setLpData] = useState({});

  const [token0Contract, setToken0Contract] = useState(undefined);
  const [token1Contract, setToken1Contract] = useState(undefined);

  const [token0Data, setToken0Data] = useState({});
  const [token1Data, setToken1Data] = useState({});

  const [token0Value, setToken0Value] = useState(0);
  const [token1Value, setToken1Value] = useState(0);

  const [token0Allowance, setToken0Allowance] = useState(0);
  const [token1Allowance, setToken1Allowance] = useState(0);

  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const checkAllowance = async () => {
    if (token0Contract != undefined && token1Contract != undefined) {
      const data = await mc.aggregate([
        token0Contract.methods.allowance(account, contracts[CHAIN_ID].ROUTER),
        token1Contract.methods.allowance(account, contracts[CHAIN_ID].ROUTER),
      ]);

      setToken0Allowance(data[0]);
      setToken1Allowance(data[1]);
    }
  };

  const approveToken = async (addr, amount, decimals) => {
    setConfirming(true);
    try {
      let tokenContract = getContract(ERC20ABI, addr, library);
      let tx = await tokenContract.approve(
        contracts[CHAIN_ID].ROUTER,
        formatValue(amount, decimals).toString(),
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

      setConfirming(false);
    }
  };

  const addLiquidity = async () => {
    setConfirming(true);
    try {
      let tx;
      if (isWETH(lpData.token0Addr)) {
        tx = await routerContract.addLiquidityETH(
          lpData.token1Addr,
          formatValue(token1Value, token1Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
            value: formatValue(token0Value, token0Data.decimals),
          }
        );

        console.log(
          123,
          lpData.token1Addr,
          formatValue(token1Value, token1Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000
        );
      } else if (isWETH(lpData.token0Addr)) {
        tx = await routerContract.addLiquidityETH(
          lpData.token0Addr,
          formatValue(token0Value, token0Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
            value: formatValue(token1Value, token1Data.decimals),
          }
        );
        console.log(
          234,
          lpData.token0Addr,
          formatValue(token0Value, token0Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000
        );
      } else {
        tx = await routerContract.addLiquidity(
          lpData.token0Addr,
          lpData.token1Addr,
          formatValue(token0Value, token0Data.decimals),
          formatValue(token1Value, token1Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
          }
        );
        console.log(
          567,
          lpData.token0Addr,
          lpData.token1Addr,
          formatValue(token0Value, token0Data.decimals),
          formatValue(token1Value, token1Data.decimals),
          0,
          0,
          account,
          Date.now() + 3000
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

            await addLpToken(lpData.token0Addr, lpData.token1Addr);
            // await setTokens(await getTokens(account));
            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
            toast.error("error! your last transaction is failed.");

            setConfirming(false);
          } else {
            // toast.error("error! something went wrong.");
            // setConfirming(false);
          }
        }
      }, 20000);
    } catch (error) {
      toast.error("error! something went wrong.");
      console.log(error);

      setConfirming(false);
    }
  };

  const addLpToken = async (fTokenAddress, tTokenAddress) => {
    if (
      tokens[fTokenAddress] === undefined ||
      tokens[tTokenAddress] === undefined
    ) {
      return;
    }

    let lpTokenList =
      JSON.parse(localStorage.getItem("lpTokenList" + CHAIN_ID)) ?? [];

    for (let i = 0; i < lpTokenList.length; i++) {
      if (lpTokenList[i].address.toLowerCase() === lpAddr.toLowerCase()) return;
    }

    lpTokenList.push({
      symbol: `${token0Data.symbol}-${token1Data.symbol}`,
      address: lpAddr,
      token1: {
        symbol: token0Data.symbol,
        address: lpData.token0Addr,
        image: token0Data.symbol,
      },
      token2: {
        symbol: token1Data.symbol,
        address: lpData.token1Addr,
        image: token1Data.symbol,
      },
    });

    localStorage.setItem("lpTokenList" + CHAIN_ID, JSON.stringify(lpTokenList));

    setLpTokens(await getLpTokens());
  };

  useEffect(() => {
    checkAllowance();
  }, [token0Value, token1Value]);

  useEffect(() => {
    (async () => {
      const lpData = await mc.aggregate([
        lpContract.methods.totalSupply(),
        lpContract.methods.token0(),
        lpContract.methods.token1(),
        lpContract.methods.getReserves(),
      ]);

      setLpData({
        totalSupply: lpData[0],
        token0Addr: lpData[1],
        token1Addr: lpData[2],
        reserves: lpData[3],
      });

      let t0Contract = getWeb3Contract(ERC20ABI, lpData[1]);
      let t1Contract = getWeb3Contract(ERC20ABI, lpData[2]);

      setToken0Contract(t0Contract);
      setToken1Contract(t1Contract);

      const tokenData = await mc.aggregate([
        t0Contract.methods.name(),
        t0Contract.methods.symbol(),
        t0Contract.methods.decimals(),
        t0Contract.methods.balanceOf(lpAddr),
        t1Contract.methods.name(),
        t1Contract.methods.symbol(),
        t1Contract.methods.decimals(),
        t1Contract.methods.balanceOf(lpAddr),
        t0Contract.methods.balanceOf(
          account == undefined ? zeroAddress : account
        ),
        t1Contract.methods.balanceOf(
          account == undefined ? zeroAddress : account
        ),
      ]);

      setToken0Data({
        name: tokenData[0],
        symbol: tokenData[1],
        decimals: tokenData[2],
        balance: tokenData[3],
        accountBalance: tokenData[8],
      });

      setToken1Data({
        name: tokenData[4],
        symbol: tokenData[5],
        decimals: tokenData[6],
        balance: tokenData[7],
        accountBalance: tokenData[9],
      });

      setLoading(false);
    })();
  }, []);

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
            <button className="w-full primary !py-[2px]">deposit</button>
          </Link>
          <Link to={`/pool/withdraw/${lpAddr}`}>
            <button className="w-full default-outline">withdraw</button>
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
              <p className="text-kojiki-blue">deposit</p>
              <span>
                deposit tokens to start earning trading fees and more rewards
              </span>
            </div>
            <div className="flex flex-col gap-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      1
                    </span>
                    <span className="text-kojiki-blue">
                      put your assets to work
                    </span>
                  </div>
                  <div>
                    <p className="text-xs">
                      deposit tokens to provide liquidity for traders
                    </p>
                    <p className="text-xs">
                      you will receive lp tokens representing pool share
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      2
                    </span>
                    <span className="text-kojiki-blue">
                      earn from every trade
                    </span>
                  </div>
                  <div>
                    <p className="text-xs">
                      earn trading fees like professional market makers
                    </p>
                    <p className="text-xs">
                      earned fess are auto compounded in position
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      3
                    </span>
                    <span className="text-kojiki-blue">
                      manage your position
                    </span>
                  </div>
                  <div>
                    <p className="text-xs">
                      adjust, increase or decrease your position anytime by
                      deposit or withdrawal
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
                      4
                    </span>
                    <span className="text-kojiki-blue">
                      funds are always available
                    </span>
                  </div>
                  <div>
                    <p className="text-xs">
                      withdraw to receive pool tokens whenever you want earned
                      fees are already included
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <p>tokens to deposit</p>
                  <div className="flex justify-between gap-3 border p-1">
                    <div className="flex items-center gap-1">
                      <img
                        src={require(`../../assets/img/token/${checkWETHSymbol(
                          token0Data.symbol
                        ).toUpperCase()}.png`)}
                        alt="token logo"
                        width="18px"
                      />
                      <span>
                        <span>{checkWETHSymbol(token0Data.symbol)}</span>
                      </span>
                    </div>
                    <div className="w-full">
                      <input
                        className="w-full text-right"
                        type="number"
                        value={token0Value}
                        onChange={(e) => {
                          setToken0Value(e.target.value);
                          setToken1Value(
                            formatNumber(
                              (e.target.value *
                                formatUnits(
                                  token1Data.balance,
                                  token1Data.decimals
                                )) /
                                formatUnits(
                                  token0Data.balance,
                                  token0Data.decimals
                                )
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-between border p-1">
                    <div className="flex items-center gap-1">
                      <img
                        src={require(`../../assets/img/token/${checkWETHSymbol(
                          token1Data.symbol
                        ).toUpperCase()}.png`)}
                        alt="token logo"
                        width="18px"
                      />
                      <span>{checkWETHSymbol(token1Data.symbol)}</span>
                    </div>
                    <div className="w-full">
                      <input
                        className="w-full text-right"
                        type="number"
                        value={token1Value}
                        onChange={(e) => {
                          setToken1Value(e.target.value);
                          setToken0Value(
                            formatNumber(
                              (e.target.value *
                                formatUnits(
                                  token0Data.balance,
                                  token0Data.decimals
                                )) /
                                formatUnits(
                                  token1Data.balance,
                                  token1Data.decimals
                                )
                            )
                          );
                        }}
                      />
                    </div>
                  </div>
                  {account == undefined ? (
                    <button className="w-full primary mt-5">connect</button>
                  ) : confirming ? (
                    <button className="w-full primary mt-5">
                      confirming...
                    </button>
                  ) : formatUnits(token0Allowance, token0Data.decimals) <
                      token0Value && !isWETH(lpData.token0Addr) ? (
                    <button
                      className="w-full primary mt-5"
                      onClick={() =>
                        approveToken(
                          lpData.token0Addr,
                          token0Value,
                          token0Data.decimals
                        )
                      }
                    >
                      approve {token0Data.symbol}
                    </button>
                  ) : formatUnits(token1Allowance, token1Data.decimals) <
                      token1Value && !isWETH(lpData.token1Addr) ? (
                    <button
                      className="w-full primary mt-5"
                      onClick={() =>
                        approveToken(
                          lpData.token1Addr,
                          token1Value,
                          token1Data.decimals
                        )
                      }
                    >
                      approve {token1Data.symbol}
                    </button>
                  ) : (
                    <button
                      className="w-full primary mt-5"
                      onClick={() => {
                        addLiquidity();
                      }}
                    >
                      add liquidity
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <p>price</p>
                  <div className="flex items-center gap-1">
                    <img
                      src={require(`../../assets/img/token/${checkWETHSymbol(
                        token0Data.symbol
                      ).toUpperCase()}.png`)}
                      width="18px"
                      alt="fromToken"
                    />
                    <span>
                      {token1Data.balance == 0 ? 0 : 1}{" "}
                      {checkWETHSymbol(token0Data.symbol)}
                    </span>
                    <span className="px-2">=</span>
                    <img
                      src={require(`../../assets/img/token/${checkWETHSymbol(
                        token1Data.symbol
                      ).toUpperCase()}.png`)}
                      width="18px"
                      alt="fromToken"
                    />
                    <span>
                      {token0Data.balance == 0
                        ? 0
                        : formatNumber(
                            formatUnits(
                              token1Data.balance,
                              token1Data.decimals
                            ) /
                              formatUnits(
                                token0Data.balance,
                                token0Data.decimals
                              ),
                            5
                          )}{" "}
                      {checkWETHSymbol(token1Data.symbol)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <img
                      src={require(`../../assets/img/token/${checkWETHSymbol(
                        token1Data.symbol
                      ).toUpperCase()}.png`)}
                      width="18px"
                      alt="fromToken"
                    />
                    <span>
                      {token0Data.balance == 0 ? 0 : 1}{" "}
                      {checkWETHSymbol(token1Data.symbol)}
                    </span>
                    <span className="px-2">=</span>
                    <img
                      src={require(`../../assets/img/token/${checkWETHSymbol(
                        token0Data.symbol
                      ).toUpperCase()}.png`)}
                      width="18px"
                      alt="fromToken"
                    />
                    <span>
                      {token1Data.balance == 0
                        ? 0
                        : formatNumber(
                            formatUnits(
                              token0Data.balance,
                              token0Data.decimals
                            ) /
                              formatUnits(
                                token1Data.balance,
                                token1Data.decimals
                              ),
                            5
                          )}{" "}
                      {checkWETHSymbol(token0Data.symbol)}
                    </span>
                  </div>
                  {/* <div>
                    <span>my pool share </span>
                    <span className="text-kojiki-blue">&#60;0.0001%</span>
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
