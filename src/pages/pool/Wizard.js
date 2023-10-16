import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";
import { toast } from "react-toastify";

import CurrencySelector from "../../components/CurrencySelector/CurrencySelector";

import { TokenContext } from "../../context/context";

import {
  wrapAddress,
  getContract,
  getWeb3Contract,
} from "../../hooks/contractHelper";
import { getWeb3, CHAIN_ID, ETH_DECIMALS } from "../../hooks/connectors";
import { getLpTokens } from "../../hooks/lpTokenHelper";

import { contracts } from "../../config/contracts";
import { zeroAddress, defaultTokens } from "../../config/tokens";

import FactoryABI from "../../assets/abi/KojikiSwapFactory.json";

export default function Wizard() {
  const { account, library } = useWeb3React();
  const { tokens, lpTokens, setLpTokens } = useContext(TokenContext);

  const [confirming, setConfirming] = useState(false);

  const [lpToken, setLpToken] = useState(zeroAddress);
  const [fToken, setFToken] = useState(
    defaultTokens[CHAIN_ID][0].toLowerCase()
  );
  const [tToken, setTToken] = useState(
    defaultTokens[CHAIN_ID][1].toLowerCase()
  );

  const factoryContract = getWeb3Contract(
    FactoryABI,
    contracts[CHAIN_ID].FACTORY
  );

  const findPool = async () => {
    const pairAddress = await factoryContract.methods
      .getPair(wrapAddress(fToken), wrapAddress(tToken))
      .call();
    setLpToken(pairAddress);
  };

  const createPool = async () => {
    setConfirming(true);
    try {
      let fContract = getContract(
        FactoryABI,
        contracts[CHAIN_ID].FACTORY,
        library
      );

      let tx = await fContract.createPair(fToken, tToken, {
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
          if (response.status === true) {
            clearInterval(interval);
            toast.success("success! your transaction is success.");

            await addPool();
            setConfirming(false);
          } else if (response.status === false) {
            clearInterval(interval);
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

  const addPool = async () => {
    if (tokens[fToken] === undefined || tokens[tToken] === undefined) {
      return;
    }

    const fAddress = wrapAddress(tokens[fToken]);
    const tAddress = wrapAddress(tokens[tToken]);

    const pairAddress = await factoryContract.methods
      .getPair(fToken, tToken)
      .call();
    setLpToken(pairAddress);

    let lpTokenList =
      JSON.parse(localStorage.getItem("lpTokenList" + CHAIN_ID)) ?? [];

    for (let i = 0; i < lpTokenList.length; i++) {
      if (lpTokenList[i].address.toLowerCase() === pairAddress.toLowerCase())
        return;
    }

    lpTokenList.push({
      symbol: `${tokens[fToken].symbol}-${tokens[tToken].symbol}`,
      address: pairAddress,
      token1: {
        symbol: tokens[fToken].symbol,
        address: fAddress,
        image: tokens[fToken].image,
      },
      token2: {
        symbol: tokens[tToken].symbol,
        address: tAddress,
        image: tokens[tToken].image,
      },
    });

    localStorage.setItem("lpTokenList" + CHAIN_ID, JSON.stringify(lpTokenList));

    setLpTokens(await getLpTokens());
  };

  useEffect(() => {
    findPool();
  }, [fToken, tToken]);

  return (
    <React.Fragment>
      <div className="max-w-[1024px] mt-7 mx-auto">
        <div>
          <p className="text-kojiki-blue mb-3">pool wizard</p>
          <span>let us help you find the best pools and manage them</span>
        </div>
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center mt-10">
          <div className="flex items-center gap-2">
            <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
              1
            </span>
            <span className="whitespace-nowrap">choose type</span>
          </div>
          <hr className="hidden md:block w-full" />
          <div className="flex items-center gap-2">
            <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
              2
            </span>
            <span className="whitespace-nowrap">choose tokens</span>
          </div>
          <hr className="hidden md:block w-full" />
          <div className="flex items-center gap-2">
            <span className="bg-kojiki-blue text-kojiki-white px-3 py-1">
              3
            </span>
            <span>complete</span>
          </div>
        </div>
        <div className="max-w-[320px] mx-auto mt-12 flex flex-col gap-5">
          <p className="text-kojiki-blue">choose</p>
          <div className="flex flex-col gap-1">
            <p>pool type</p>
            <button className="flex items-center gap-2 border p-1">
              classic
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <p>pool tokens</p>
            <CurrencySelector
              chosenAddress={fToken}
              otherChosenAddress={tToken}
              setChosenTokenAddress={setFToken}
              setOtherChosenTokenAddress={setTToken}
            />
            <CurrencySelector
              chosenAddress={tToken}
              otherChosenAddress={fToken}
              setChosenTokenAddress={setTToken}
              setOtherChosenTokenAddress={setFToken}
            />
          </div>
          <div>
            {account == undefined ? (
              <button className="w-full primary">connect wallet</button>
            ) : confirming == true ? (
              <button className="w-full primary">confirming...</button>
            ) : lpToken == zeroAddress ? (
              <button className="w-full primary" onClick={() => createPool()}>
                create pool
              </button>
            ) : (
              <Link to={`/pool/overview/${lpToken}`}>
                <button className="w-full primary">enter pool</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
