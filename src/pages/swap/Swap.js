import React, { useEffect, useState, useContext } from "react";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import CurrencyInput from "../../components/CurrencyInput/CurrencyInput";
import swap_icon from "../../assets/img/icon/swap.png";

import {
  getContract,
  getWeb3Contract,
  formatValue,
  formatUnits,
  formatNumber,
  wrapAddress,
} from "../../hooks/contractHelper";

import { getWeb3, CHAIN_ID, ETH_DECIMALS } from "../../hooks/connectors";
import { zeroAddress, defaultTokens } from "../../config/tokens";
import { contracts } from "../../config/contracts";
import { TokenContext } from "../../context/context";
import { getCommonTokens, getTokens } from "../../hooks/tokenHelper";

import FactoryABI from "../../assets/abi/KojikiSwapFactory.json";
import RouterABI from "../../assets/abi/KojikiSwapRouter.json";
import ERC20ABI from "../../assets/abi/ERC20.json";
import LPABI from "../../assets/abi/LP.json";
import Settings from "../../components/Settings/Settings";

export default function Swap() {
  const { account, library } = useWeb3React();

  const { tokens, setTokens } = useContext(TokenContext);
  const [commonTokens, setCommonTokens] = useState([]);

  const [confirming, setConfirming] = useState(false);
  const [findingPair, setFindingPair] = useState(false);

  const [fromTokenAddress, setFromTokenAddress] = useState(
    defaultTokens[CHAIN_ID][0].toLowerCase()
  );
  const [toTokenAddress, setToTokenAddress] = useState(
    defaultTokens[CHAIN_ID][1].toLowerCase()
  );

  const [fromToken, setFromToken] = useState(tokens[fromTokenAddress]);
  const [toToken, setToToken] = useState(tokens[toTokenAddress]);

  const [fromAmount, setFromAmount] = useState(0);
  const [toAmount, setToAmount] = useState(0);
  // const [ratio, setRatio] = useState(0);

  const [fromAllowance, setFromAllowance] = useState(true);
  const [nativeSwap, setNativeSwap] = useState(0);

  const [pair, setPair] = useState(null);
  const [slippage, setSlippage] = useState(0);
  const [tradeSlippage, setTradeSlippage] = useState(0);

  const routerContract = getWeb3Contract(RouterABI, contracts[CHAIN_ID].ROUTER);
  const factoryContract = getWeb3Contract(
    FactoryABI,
    contracts[CHAIN_ID].FACTORY
  );

  const initSlippage = () => {
    let settings =
      JSON.parse(localStorage.getItem("settings" + CHAIN_ID)) ?? {};
    if (settings.slippage === undefined) setSlippage(0.3);
    else setSlippage(settings.slippage);
  };

  const approveToken = async (addr, amount) => {
    setConfirming(true);
    try {
      let tokenContract = getContract(ERC20ABI, addr, library);

      let tx = await tokenContract.approve(
        contracts[CHAIN_ID].ROUTER,
        formatValue(amount, tokens[addr].decimals).toString(),
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

            setFromAllowance(true);
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

      setConfirming(false);
    }
  };

  // const approveWETH = async (amount) => {
  //   setConfirming(true);
  //   try {
  //     let wethContract = getContract(
  //       ERC20ABI,
  //       contracts[CHAIN_ID].WETH,
  //       library
  //     );

  //     let tx = await wethContract.approve(
  //       contracts[CHAIN_ID].WETH,
  //       formatValue(amount, ETH_DECIMALS).toString(),
  //       {
  //         from: account,
  //       }
  //     );

  //     const resolveAfter3Sec = new Promise((resolve) =>
  //       setTimeout(resolve, 20000)
  //     );

  //     toast.promise(resolveAfter3Sec, {
  //       pending: "waiting for confirmation...",
  //     });

  //     var interval = setInterval(async function () {
  //       let web3 = getWeb3();
  //       var response = await web3.eth.getTransactionReceipt(tx.hash);
  //       if (response !== null) {
  //         if (response.status === true) {
  //           clearInterval(interval);
  //           toast.success("success! your transaction is success.");

  //           setFromAllowance(true);
  //           setConfirming(false);
  //         } else if (response.status === false) {
  //           clearInterval(interval);
  //           toast.error("error! your last transaction is failed.");

  //           setConfirming(false);
  //         } else {
  //           // toast.error("error! something went wrong.");
  //           // setConfirming(false);
  //         }
  //       }
  //     }, 20000);
  //   } catch (error) {
  //     toast.error("error! something went wrong.");

  //     setConfirming(false);
  //   }
  // };

  const swapToken = async () => {
    setConfirming(true);
    try {
      const routerContract = getContract(
        RouterABI,
        contracts[CHAIN_ID].ROUTER,
        library
      );

      const fToken = tokens[fromTokenAddress];
      const tToken = tokens[toTokenAddress];

      const fAmount = formatValue(fromAmount, fToken.decimals);

      let tx;
      if (fToken.native) {
        tx =
          await routerContract.swapExactETHForTokensSupportingFeeOnTransferTokens(
            0,
            [contracts[CHAIN_ID].WETH, toTokenAddress],
            account,
            zeroAddress,
            Date.now() + 3000,
            {
              from: account,
              value: fAmount,
            }
          );
      } else if (tToken.native) {
        tx =
          await routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
            fAmount,
            0,
            [fromTokenAddress, contracts[CHAIN_ID].WETH],
            account,
            zeroAddress,
            Date.now() + 3000,
            {
              from: account,
            }
          );
      } else {
        tx =
          await routerContract.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            fAmount,
            0,
            [fromTokenAddress, toTokenAddress],
            account,
            zeroAddress,
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

            setTokens(await getTokens(account));
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

  const getTradeDetail = async (pair, amountIn) => {
    const outAmount = await routerContract.methods
      .getAmountsOut(amountIn, pair)
      .call();
    return outAmount;
  };

  const findPair = async (
    startToken,
    targetToken,
    amountIn,
    tokens,
    pairs,
    depth
  ) => {
    if (depth === -1) return null;

    let bestAmount = 0;
    let bestEsAmount = [];
    let bestPairs = {};

    let newTokens = { ...tokens };
    let addrList = Object.keys(newTokens);

    for (let i = 0; i < addrList.length; i++) {
      if (wrapAddress(startToken.address) === wrapAddress(addrList[i])) {
        delete newTokens[addrList[i]];
        continue;
      }

      const pairAddress = await factoryContract.methods
        .getPair(wrapAddress(startToken.address), wrapAddress(addrList[i]))
        .call();

      if (pairAddress === zeroAddress) continue;

      if (newTokens[addrList[i]] === targetToken) {
        const nPairs = [
          ...pairs,
          wrapAddress(startToken.address),
          wrapAddress(targetToken.address),
        ];
        const outAmount = await getTradeDetail(nPairs, amountIn);

        if (Number(bestAmount) < Number(outAmount[outAmount.length - 1])) {
          bestAmount = outAmount[outAmount.length - 1];
          bestEsAmount = outAmount;
          bestPairs = nPairs;
        }
        continue;
      }

      const newStartToken = newTokens[addrList[i]];
      delete newTokens[addrList[i]];

      if (Object.keys(newTokens).length > 0) {
        const data = await findPair(
          newStartToken,
          targetToken,
          amountIn,
          newTokens,
          [...pairs, wrapAddress(startToken.address)],
          depth - 1
        );

        if (data !== null) {
          if (Number(bestAmount) < Number(data.amount)) {
            bestAmount = data.amount;
            bestEsAmount = data.esAmount;
            bestPairs = data.pairs;
          }
        }
      }
    }

    if (bestAmount > 0) {
      return { amount: bestAmount, esAmount: bestEsAmount, pairs: bestPairs };
    } else {
      return null;
    }
  };

  useEffect(() => {
    setFromToken(tokens[fromTokenAddress]);
    setToToken(tokens[toTokenAddress]);

    if (tokens[fromTokenAddress] !== undefined) {
      setFromAllowance(
        tokens[fromTokenAddress].native ||
          formatUnits(
            tokens[fromTokenAddress].allowance,
            tokens[fromTokenAddress].decimals
          ) >= Number(fromAmount)
      );
    }

    (async () => {
      if (fromAmount > 0) {
        try {
          if (
            tokens[fromTokenAddress] === undefined ||
            tokens[toTokenAddress] === undefined
          ) {
            return;
          }

          if (
            fromTokenAddress === zeroAddress &&
            toTokenAddress === contracts[CHAIN_ID].WETH.toLowerCase()
          ) {
            setNativeSwap(1);
            setToAmount(fromAmount);
          } else if (
            fromTokenAddress === contracts[CHAIN_ID].WETH.toLowerCase() &&
            toTokenAddress === zeroAddress
          ) {
            setNativeSwap(2);
            setToAmount(fromAmount);
          } else {
            setNativeSwap(0);
            setFindingPair(true);

            let tTokens = { ...commonTokens };
            if (tTokens[toTokenAddress] == undefined)
              tTokens[toTokenAddress] = toToken;
            delete tTokens[fromTokenAddress];

            let pairData = await findPair(
              tokens[fromTokenAddress],
              tokens[toTokenAddress],
              formatValue(fromAmount, tokens[fromTokenAddress].decimals),
              tTokens,
              [],
              3
            );

            if (pairData != null) {
              setPair(pairData.pairs);
              setToAmount(
                formatNumber(
                  formatUnits(pairData.amount, tokens[toTokenAddress].decimals)
                )
              );
              let slippageList = [];
              for (let i = 0; i < pairData.pairs.length - 1; i++) {
                const pairAddress = await factoryContract.methods
                  .getPair(pairData.pairs[i], pairData.pairs[i + 1])
                  .call();
                const pairContract = getWeb3Contract(LPABI, pairAddress);
                const reserves = await pairContract.methods
                  .getReserves()
                  .call();
                const fReserve =
                  pairData.pairs[i] < pairData.pairs[i + 1]
                    ? reserves[0]
                    : reserves[1];
                const tReserve =
                  pairData.pairs[i] > pairData.pairs[i + 1]
                    ? reserves[0]
                    : reserves[1];
                const estAmount = (pairData.esAmount[i] * tReserve) / fReserve;
                const newSlippage =
                  (estAmount - pairData.esAmount[i + 1]) / estAmount - 0.003;

                slippageList.push(newSlippage);
              }

              let totalSlippage = 1;
              for (let i = 0; i < slippageList.length; i++) {
                totalSlippage *= 1 - slippageList[i];
              }

              totalSlippage = Number(((1 - totalSlippage) * 100).toFixed(2));

              setTradeSlippage(totalSlippage < 0 ? 0 : totalSlippage);
            } else {
              setPair(null);
              setToAmount("");
            }

            setFindingPair(false);
          }
        } catch (error) {
          console.log(error);
          setFindingPair(false);
        }
      }
    })();
  }, [fromTokenAddress, toTokenAddress, fromAmount, tokens]);

  useEffect(() => {
    initSlippage();
  }, []);

  const updateCommonTokens = async (account) => {
    setCommonTokens(await getCommonTokens(account));
  };

  useEffect(() => {
    updateCommonTokens(account);
  }, [account]);

  return (
    <React.Fragment>
      <div className="flex justify-center py-7">
        <div className="w-full max-w-[390px]">
          <div className="flex justify-between items-center mb-4">
            <h1>swap tokens</h1>
            <Settings
              slippage={slippage}
              setSlippage={setSlippage}
              initSlippage={initSlippage}
            />
          </div>
          <div className="flex flex-col gap-4">
            <CurrencyInput
              label="from"
              balPos="bottom"
              amount={fromAmount}
              ratio={0}
              setAmount={setFromAmount}
              setOtherAmount={setToAmount}
              chosenAddress={fromTokenAddress}
              otherChosenAddress={toTokenAddress}
              setChosenTokenAddress={setFromTokenAddress}
              setOtherChosenTokenAddress={setToTokenAddress}
            />
            <div className="flex justify-center items-center mb-[-20px]">
              <img
                src={swap_icon}
                className="hover:cursor-pointer"
                onClick={() => {
                  setToTokenAddress(fromTokenAddress);
                  setFromTokenAddress(toTokenAddress);
                }}
              />
            </div>
            <CurrencyInput
              label="to"
              balPos="bottom"
              amount={toAmount}
              disabled={true}
              setAmount={setToAmount}
              chosenAddress={toTokenAddress}
              otherChosenAddress={fromTokenAddress}
              setChosenTokenAddress={setToTokenAddress}
              setOtherChosenTokenAddress={setFromTokenAddress}
              findingPair={findingPair}
            />
            {account !== undefined ? (
              <>
                {fromAmount != 0 && pair !== null && !findingPair && (
                  <>
                    <div className="flex justify-between items-center">
                      {pair.map((addr, key) => {
                        return (
                          <>
                            <div className="flex flex-col items-center">
                              <img
                                src={require(`../../assets/img/token/${tokens[addr].image}`)}
                                width="20px"
                                alt="input"
                              />
                              <p>{tokens[addr].symbol}</p>
                            </div>
                            {key < pair.length - 1 && (
                              <hr
                                className="border-dashed w-full mx-3 mb-[22px]"
                                key={key + 5}
                              />
                            )}
                          </>
                        );
                      })}
                    </div>
                    <div>
                      <div className="flex flex-row justify-between items-center">
                        <span className=" text-sm whitespace-nowrap">
                          1 {fromToken.symbol}
                        </span>
                        <hr className="border-dashed w-full mx-3" />
                        <span className=" text-sm whitespace-nowrap">
                          {formatNumber(toAmount / fromAmount, 5)}{" "}
                          {toToken.symbol}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between items-center">
                        <span className=" text-sm whitespace-nowrap">
                          1 {toToken.symbol}
                        </span>
                        <hr className="border-dashed w-full mx-3" />
                        <span className=" text-sm whitespace-nowrap">
                          {formatNumber(fromAmount / toAmount, 5)}{" "}
                          {fromToken.symbol}
                        </span>
                      </div>
                      <div className="flex flex-row justify-between items-center mt-3">
                        <span className=" text-sm whitespace-nowrap">
                          Slippage
                        </span>
                        <hr className="border-dashed w-full mx-3" />
                        <span className=" text-sm whitespace-nowrap">
                          {tradeSlippage} %
                        </span>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-center items-center gap-2 my-2">
                  {fromAmount <= 0 ? (
                    <button className="w-full danger" disabled>
                      input amount
                    </button>
                  ) : findingPair ? (
                    <button className="w-full primary" disabled>
                      loading pairs...
                    </button>
                  ) : pair === null ? (
                    <button className="w-full danger" disabled>
                      no valid liquidity pools
                    </button>
                  ) : fromToken.native === false && fromAllowance === false ? (
                    <button
                      className="w-full primary"
                      onClick={(e) => {
                        if (!confirming)
                          approveToken(fromToken.address, fromAmount);
                      }}
                    >
                      {confirming ? (
                        <>confirming...</>
                      ) : (
                        <>approve {fromToken.symbol}</>
                      )}
                    </button>
                  ) : (
                    <button
                      className={`w-full ${
                        Number(fromToken.balance) >=
                          Number(formatValue(fromAmount, fromToken.decimals)) &&
                        Number(tradeSlippage) <= Number(slippage)
                          ? "primary"
                          : "danger"
                      }`}
                      onClick={(e) => {
                        if (
                          !confirming &&
                          Number(fromToken.balance) >=
                            Number(
                              formatValue(fromAmount, fromToken.decimals)
                            ) &&
                          Number(tradeSlippage) <= Number(slippage)
                        )
                          swapToken();
                      }}
                    >
                      {confirming
                        ? "confirming..."
                        : Number(fromToken.balance) <
                          Number(formatValue(fromAmount, fromToken.decimals))
                        ? "incorrect amount"
                        : Number(tradeSlippage) > Number(slippage)
                        ? "price impact high"
                        : "swap"}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="my-5">
                <button className="w-full primary">connect your wallet</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
