import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import CurrencyInput from "../../components/CurrencyInput/CurrencyInput";

import { getWeb3, CHAIN_ID, SCAN_URL } from "../../hooks/connectors";
import {
  getContract,
  getWeb3Contract,
  formatValue,
  formatUnits,
  formatDecimal,
  formatNumber,
  trimAddress,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";
import { getLpTokens } from "../../hooks/lpTokenHelper";

import { TokenContext } from "../../context/context";

import { contracts } from "../../config/contracts";
import { defaultTokens } from "../../config/tokens";

import ERC20ABI from "../../assets/abi/ERC20.json";
import LPABI from "../../assets/abi/LP.json";
import FactoryABI from "../../assets/abi/KojikiSwapFactory.json";
import RouterABI from "../../assets/abi/KojikiSwapRouter.json";

import { zeroAddress } from "../../config/tokens";

import LoadingIcon from "../../components/Icons/LoadingIcon";
import PlusIcon from "../../components/Icons/PlusIcon";

import AddLPModal from "./components/AddLPModal";
import LPDetailModal from "./components/LPDetailModal";

export default function Liquidity() {
  const { account, library } = useWeb3React();
  const { tokens, lpTokens, setLpTokens } = useContext(TokenContext);

  const [confirming, setConfirming] = useState(false);
  const [lpFetching, setLpFetching] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);

  const handleModal = () => {
    setOpenModal(!openModal);
  };

  const [choosenLiquidity, setChoosenLiquidity] = useState("");
  const handleDetailModal = (addr) => {
    if (lpTokens[addr] !== undefined) setChoosenLiquidity(lpTokens[addr]);
    setOpenDetailModal(!openDetailModal);
  };

  const [fromTokenAddress, setFromTokenAddress] = useState(
    defaultTokens[CHAIN_ID][0].toLowerCase()
  );
  const [toTokenAddress, setToTokenAddress] = useState(
    defaultTokens[CHAIN_ID][1].toLowerCase()
  );

  const [fromToken, setFromToken] = useState(tokens[fromTokenAddress]);
  const [toToken, setToToken] = useState(tokens[toTokenAddress]);

  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");

  const [fromAllowance, setFromAllowance] = useState(true);
  const [toAllowance, setToAllowance] = useState(true);

  const [poolInfo, setPoolInfo] = useState({
    rate1: 0,
    rate2: 0,
    address: zeroAddress,
  });

  const mc = MulticallContractWeb3();
  const routerContract = getContract(
    RouterABI,
    contracts[CHAIN_ID].ROUTER,
    library
  );
  const factoryContract = getWeb3Contract(
    FactoryABI,
    contracts[CHAIN_ID].FACTORY
  );

  useEffect(() => {
    setFromToken(tokens[fromTokenAddress]);
    setToToken(tokens[toTokenAddress]);

    (async () => {
      try {
        if (Object.keys(tokens).length > 0) {
          setLpFetching(true);
          const fAddress = tokens[fromTokenAddress].native
            ? contracts[CHAIN_ID].WETH
            : fromTokenAddress;
          const tAddress = tokens[toTokenAddress].native
            ? contracts[CHAIN_ID].WETH
            : toTokenAddress;

          const pairAddress = await factoryContract.methods
            .getPair(fAddress, tAddress)
            .call();

          if (pairAddress === zeroAddress) {
            setPoolInfo({
              rate1: 0,
              rate2: 0,
              address: pairAddress,
            });

            setFromAmount("");
            setToAmount("");
          } else {
            const lpContract = getWeb3Contract(LPABI, pairAddress);
            const lpData = await mc.aggregate([
              lpContract.methods.getReserves(),
              lpContract.methods.token0(),
              lpContract.methods.token1(),
            ]);

            let basicRate =
              fAddress < tAddress
                ? formatUnits(lpData[0][0], tokens[fromTokenAddress].decimals) /
                  formatUnits(lpData[0][1], tokens[toTokenAddress].decimals)
                : formatUnits(lpData[0][1], tokens[fromTokenAddress].decimals) /
                  formatUnits(lpData[0][0], tokens[toTokenAddress].decimals);

            setPoolInfo({
              rate1: 1 / basicRate,
              rate2: basicRate,
              address: pairAddress,
            });

            if (fromAmount > 0)
              setToAmount(
                formatNumber(
                  fromAmount / basicRate,
                  tokens[toTokenAddress].decimals
                )
              );
          }
          setLpFetching(false);
        }
      } catch (error) {
        setLpFetching(false);
        console.log(error);
      }
    })();
  }, [fromTokenAddress, toTokenAddress, tokens]);

  useEffect(() => {
    if (tokens[fromTokenAddress] !== undefined) {
      setFromAllowance(
        tokens[fromTokenAddress].native ||
          formatUnits(
            tokens[fromTokenAddress].allowance,
            tokens[fromTokenAddress].decimals
          ) >= Number(fromAmount)
      );
    }
  }, [fromAmount, fromTokenAddress]);

  useEffect(() => {
    if (tokens[toTokenAddress] !== undefined) {
      setToAllowance(
        tokens[toTokenAddress].native ||
          formatUnits(
            tokens[toTokenAddress].allowance,
            tokens[toTokenAddress].decimals
          ) >= Number(toAmount)
      );
    }
  }, [toAmount]);

  useEffect(() => {
    let addr = choosenLiquidity.address;
    let tlpTokens = { ...lpTokens };
    tlpTokens[addr] = choosenLiquidity;

    setLpTokens(tlpTokens);
  }, [choosenLiquidity]);

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

            if (addr === fromTokenAddress) setFromAllowance(true);
            if (addr === toTokenAddress) setToAllowance(true);

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
      const fToken = tokens[fromTokenAddress];
      const tToken = tokens[toTokenAddress];

      const fAmount = formatValue(fromAmount, fToken.decimals);
      const tAmount = formatValue(toAmount, tToken.decimals);

      let tx;
      if (fToken.native) {
        tx = await routerContract.addLiquidityETH(
          toTokenAddress,
          tAmount,
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
            value: fAmount,
          }
        );
      } else if (tToken.native) {
        tx = await routerContract.addLiquidityETH(
          fromTokenAddress,
          fAmount,
          0,
          0,
          account,
          Date.now() + 3000,
          {
            from: account,
            value: tAmount,
          }
        );
      } else {
        tx = await routerContract.addLiquidity(
          fromTokenAddress,
          toTokenAddress,
          fAmount,
          tAmount,
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

            await addLpToken(fromTokenAddress, toTokenAddress);
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

    const fAddress = tokens[fTokenAddress].native
      ? contracts[CHAIN_ID].WETH
      : fTokenAddress;
    const tAddress = tokens[tTokenAddress].native
      ? contracts[CHAIN_ID].WETH
      : tTokenAddress;

    const pairAddress = await factoryContract.methods
      .getPair(fAddress, tAddress)
      .call();

    let lpTokenList =
      JSON.parse(localStorage.getItem("lpTokenList" + CHAIN_ID)) ?? [];

    for (let i = 0; i < lpTokenList.length; i++) {
      if (lpTokenList[i].address.toLowerCase() === pairAddress.toLowerCase())
        return;
    }

    lpTokenList.push({
      symbol: `${tokens[fTokenAddress].symbol}-${tokens[tTokenAddress].symbol}`,
      address: pairAddress,
      token1: {
        symbol: tokens[fTokenAddress].symbol,
        address: fAddress,
        image: tokens[fTokenAddress].image,
      },
      token2: {
        symbol: tokens[tTokenAddress].symbol,
        address: tAddress,
        image: tokens[tTokenAddress].image,
      },
    });

    localStorage.setItem("lpTokenList" + CHAIN_ID, JSON.stringify(lpTokenList));

    setLpTokens(await getLpTokens());
  };

  return (
    <React.Fragment>
      <div className="flex justify-center items-center mt-7">
        {Object.keys(tokens).length > 0 && Object.keys(lpTokens).length > 0 ? (
          <div className="w-fit lg:pt-10">
            <div className="  ">
              <div className="mb-4 p-5 pb-4">
                <h1>Add Liquidity</h1>
              </div>
              <div className="flex flex-col lg:flex-row gap-3 px-5">
                <CurrencyInput
                  label="From"
                  balPos="bottom"
                  amount={fromAmount}
                  ratio={poolInfo.rate1}
                  setAmount={setFromAmount}
                  setOtherAmount={setToAmount}
                  chosenAddress={fromTokenAddress}
                  otherChosenAddress={toTokenAddress}
                  setChosenTokenAddress={setFromTokenAddress}
                  setOtherChosenTokenAddress={setToTokenAddress}
                />
                <CurrencyInput
                  label="To"
                  balPos="bottom"
                  amount={toAmount}
                  ratio={poolInfo.rate2}
                  setAmount={setToAmount}
                  setOtherAmount={setFromAmount}
                  chosenAddress={toTokenAddress}
                  otherChosenAddress={fromTokenAddress}
                  setChosenTokenAddress={setToTokenAddress}
                  setOtherChosenTokenAddress={setFromTokenAddress}
                />
              </div>
              {account !== undefined &&
              fromToken !== undefined &&
              toToken !== undefined > 0 ? (
                <>
                  <div className="flex justify-center items-center my-5  px-5 py-3">
                    {lpFetching === true ? (
                      <LoadingIcon />
                    ) : poolInfo.address !== zeroAddress ? (
                      <div className="flex flex-col justify-center gap-2 w-full">
                        <div className="flex flex-row justify-center md:justify-between items-center">
                          <span className="hidden md:block  whitespace-nowrap">
                            {fromToken.symbol} swap rate
                          </span>
                          <hr className="hidden md:block border-dashed w-full mx-3" />
                          <span className=" whitespace-nowrap">
                            1 {fromToken.symbol} ={" "}
                            {formatDecimal(poolInfo.rate1, 3)} {toToken.symbol}
                          </span>
                        </div>
                        <div className="flex flex-row justify-center md:justify-between items-center">
                          <span className="hidden md:block  whitespace-nowrap">
                            {toToken.symbol} swap rate
                          </span>
                          <hr className="hidden md:block border-dashed w-full mx-3" />
                          <span className=" whitespace-nowrap">
                            1 {toToken.symbol} ={" "}
                            {formatDecimal(poolInfo.rate2, 5)}{" "}
                            {fromToken.symbol}
                          </span>
                        </div>
                        <div className="flex flex-row justify-center md:justify-between items-center">
                          <span className="hidden md:block  whitespace-nowrap">
                            LP address
                          </span>
                          <hr className="hidden md:block border-dashed w-full mx-3" />
                          <a
                            href={`${SCAN_URL[CHAIN_ID]}address/${poolInfo.address}`}
                            target="_blank"
                          >
                            {trimAddress(poolInfo.address)}
                          </a>
                        </div>
                      </div>
                    ) : (
                      <h3>No Liquidity Added</h3>
                    )}
                  </div>
                  <div className="flex justify-center items-center gap-2 my-5">
                    {!fromAllowance && (
                      <button
                        className="w-full max-w-[200px]  bg-kojiki-blue   py-2 my-5"
                        onClick={(e) => {
                          if (!confirming)
                            approveToken(fromTokenAddress, fromAmount);
                        }}
                      >
                        {confirming
                          ? "approving..."
                          : `approve ${fromToken.symbol}`}
                      </button>
                    )}
                    {!toAllowance && (
                      <button
                        className="w-full max-w-[200px]  bg-kojiki-blue   py-2 my-5"
                        onClick={(e) => {
                          if (!confirming)
                            approveToken(toTokenAddress, toAmount);
                        }}
                      >
                        {confirming
                          ? "approving..."
                          : `approve ${toToken.symbol}`}
                      </button>
                    )}
                    {fromAllowance && toAllowance && (
                      <button
                        className="w-full max-w-[200px]  bg-kojiki-blue   py-2 my-5"
                        onClick={(e) => {
                          if (!confirming) addLiquidity();
                        }}
                      >
                        {confirming
                          ? "confirming..."
                          : Number(fromToken.balance) >=
                              Number(
                                formatValue(fromAmount, fromToken.decimals)
                              ) &&
                            Number(toToken.balance) >=
                              Number(formatValue(toAmount, toToken.decimals))
                          ? "Add Liquidity"
                          : "incorrect amount"}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex justify-center">
                  <button className="w-full max-w-[290px]  bg-kojiki-blue   py-2 my-5">
                    Connect Wallet
                  </button>
                </div>
              )}
            </div>
            <div className="   mt-10">
              <div className="flex justify-between items-center p-5 pb-4">
                <h2>Your Positions</h2>
                <button
                  className="flex items-center gap-1 px-2 py-1  hover:bg-kojiki-blue "
                  onClick={(e) => handleModal()}
                >
                  <PlusIcon />
                </button>
              </div>
              <div className="w-full min-h-[300px]">
                {account !== undefined ? (
                  Object.keys(lpTokens).length > 0 ? (
                    Object.keys(lpTokens).map((addr, i) => {
                      if (lpTokens[addr].balance > 0)
                        return (
                          <button
                            className="w-full flex flex-col items-start md:flex-row md:justify-between md:items-center gap-1 px-5 py-2 h-fit "
                            key={addr}
                            onClick={() => handleDetailModal(addr)}
                          >
                            <div className="flex flex-col justify-center md:justify-start md:flex-row w-full items-center gap-2">
                              <div className="flex gap-1">
                                <img
                                  src={require(`../../assets/img/token/${lpTokens[addr].token1.image}`)}
                                  width="35px"
                                />
                                <img
                                  src={require(`../../assets/img/token/${lpTokens[addr].token2.image}`)}
                                  width="35px"
                                />
                              </div>
                              <div className="text-center md:text-left">
                                <p>{lpTokens[addr].symbol}</p>
                                <p>{trimAddress(lpTokens[addr].address)}</p>
                              </div>
                            </div>
                            <div className="w-full md:w-fit text-center md:text-left">
                              <span className=" whitespace-nowrap">
                                Balance :{" "}
                                {Number(
                                  formatUnits(
                                    lpTokens[addr].balance,
                                    18
                                  ).toFixed(3)
                                )}
                              </span>
                            </div>
                            <hr className="block md:hidden w-full" />
                          </button>
                        );
                    })
                  ) : (
                    <div className="flex justify-center items-center h-full min-h-[300px]">
                      <span className="mx-auto my-auto">No Liquidity</span>
                    </div>
                  )
                ) : (
                  <div className="flex justify-center items-center h-full min-h-[300px]">
                    <span className="mx-auto my-auto">not connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-content items-center">
            <LoadingIcon />
            <h5 className=" mt-4">loading ...</h5>
          </div>
        )}
        <AddLPModal openModal={openModal} handleModal={handleModal} />
        <LPDetailModal
          openModal={openDetailModal}
          handleModal={handleDetailModal}
          choosenLiquidity={choosenLiquidity}
          setChoosenLiquidity={setChoosenLiquidity}
        />
      </div>
    </React.Fragment>
  );
}
