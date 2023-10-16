import React, { useState, useContext, useEffect } from "react";
import { Typography } from "@material-tailwind/react";
import ArrowCircleIcon from "../../components/Icons/ArrowCircleIcon";
import MinusIcon from "../../components/Icons/MinusIcon";
import PlusIcon from "../../components/Icons/PlusIcon";
import TokenSelect from "../../components/TokenSelect/TokenSelect";

import { defaultTokens } from "../../config/tokens";
import { CHAIN_ID } from "../../hooks/connectors";
import { TokenContext } from "../../context/context";
import { supportedNftPools } from "../../config/nftPools";
import { zeroAddress } from "../../config/tokens";
import { contracts } from "../../config/contracts";
import { KojikiContext } from "../../context/context";
import { formatNumber, formatUnits } from "../../hooks/contractHelper";
import { getWeb3Contract } from "../../hooks/contractHelper";
import ERC20ABI from "../../assets/abi/ERC20.json";
import { useWeb3React } from "@web3-react/core";
import { async } from "q";
import { ethers } from "ethers";

export default function Calculator() {
  const { tokens, setTokens } = useContext(TokenContext);
  const { account } = useWeb3React();

  const [fromTokenAddress, setFromTokenAddress] = useState(
    defaultTokens[CHAIN_ID][0].toLowerCase()
  );
  const [toTokenAddress, setToTokenAddress] = useState(
    defaultTokens[CHAIN_ID][1].toLowerCase()
  );
  const context = useContext(KojikiContext);

  const [poolAddress, setPoolAddress] = useState("");

  const [fromToken, setFromToken] = useState(tokens[fromTokenAddress]);
  const [toToken, setToToken] = useState(tokens[toTokenAddress]);

  const [lockMonths, setLockMonths] = useState(0);
  const [lockDays, setLockDays] = useState(0);
  const [amount, setAmount] = useState(0);
  const [xSakeBalance, setXSakeBalance] = useState(0.0);
  const [boostAmount, setBoostAmount] = useState(0.0);
  let [bonusPercent, setBonusPercent] = useState(0.0);
  let [poolAPR, setPoolAPY] = useState(0.0);
  let [cfpAPR, setCFPAPY] = useState(0.0);

  const WETH = contracts[CHAIN_ID].WETH;

  const handleLockPeriod = (lockMonths_, lockDays_) => {
    if (parseInt(lockDays_) > 31) {
      setLockMonths(Number(lockMonths_) + 1);
      setLockDays(0);
    } else if (lockDays_ < 0 && lockMonths_ < 1) {
      setLockMonths(0);
      setLockDays(0);
    } else if (lockDays_ < 0 && lockMonths_ >= 1) {
      setLockDays(30);
      setLockMonths(Number(lockMonths_) - 1);
    } else {
      setLockDays(lockDays_);
      setLockMonths(lockMonths_);
    }
    bonusPercent =
      (parseFloat(lockMonths_) + parseFloat(lockDays_ < 0 ? 0 : lockDays_)) *
      0.05;
    setBonusPercent(bonusPercent);
  };
  const handleReset = () => {
    setLockDays(0);
    setLockMonths(0);
    setBonusPercent(0.0);
    setAmount(0.0);
    setBoostAmount(0.0);
  };

  useEffect(() => {
    if (!account) {
      return;
    }
    (async () => {
      const tokenContract = getWeb3Contract(
        ERC20ABI,
        contracts[CHAIN_ID].XSakeTOKEN
      );
      const xSakeBalance_ = await tokenContract.methods.balanceOf(account);
      setXSakeBalance(
        formatNumber(ethers.utils.formatUnits(xSakeBalance_, 18), 3)
      );
    })();
  }, [account]);
  useEffect(() => {
    const from =
      fromTokenAddress === zeroAddress
        ? WETH.toLocaleLowerCase()
        : fromTokenAddress;
    const to =
      toTokenAddress === zeroAddress
        ? WETH.toLocaleLowerCase()
        : toTokenAddress;

    if (from === to) {
      setPoolAddress("");
      return;
    }

    const first = supportedNftPools[CHAIN_ID].filter((pool) => {
      return (
        pool.token1.address.toLowerCase() === from ||
        pool.token2.address.toLowerCase() === from
      );
    });
    const second = first.filter((pool) => {
      return (
        pool.token1.address.toLowerCase() === to ||
        pool.token2.address.toLowerCase() === to
      );
    });
    setPoolAddress(second.length > 0 ? second[0].address : "");
  }, [fromTokenAddress, toTokenAddress]);

  useEffect(() => {
    if (poolAddress === "") {
      setPoolAPY(0.0);
      setCFPAPY(0.0);
      return;
    }
    if (!context || context.pools.length === 0) {
      return;
    }

    const pools = context.pools.find((pool) => pool.poolAddr === poolAddress);
    const nitroPools = context.nitroPools.find(
      (pool) => pool.poolAddr === poolAddress
    );

    if (pools) {
      let apy = poolAPR;
      apy = apy + formatUnits(pools.poolAPY, 18);
      setPoolAPY(formatUnits(pools.poolAPY, 18));
    }

    if (nitroPools) {
      let apy = poolAPR;
      apy = apy + formatUnits(nitroPools.poolAPY, 18);
      setCFPAPY(formatUnits(nitroPools.poolAPY, 18));
    }
  }, [poolAddress, context]);

  const setInputAmount = (value) => {
    let valueStrs = value.toString().split(".");
    if (valueStrs.length == 2) {
      value = valueStrs[0].concat(".").concat(valueStrs[1].substr(0, 18));
    }
    setAmount(Number(value));
  };

  const handleBoostsAmount = (value) => {
    let valueStrs = value.toString().split(".");
    if (valueStrs.length == 2) {
      value = valueStrs[0].concat(".").concat(valueStrs[1].substr(0, 18));
    }
    setBoostAmount(Number(value));
  };
  return (
    <React.Fragment>
      <div className="w-full md:w-5/6 mx-auto  mb-20">
        <div className="w-full text-center md:text-left lg:pt-10">
          <Typography variant="h3">Calculator</Typography>
          {/* <Typography as="p" variant="small">
            Estimate projected earnings for any position on Kojiki.
          </Typography> */}

          {/* <Typography
            as="p"
            variant="small"
            className=" text-red-500"
          >
            Calculator is still under development.
          </Typography> */}
        </div>
        <div className="flex flex-col gap-4 border p-5 mt-10 ">
          <div className="flex justify-between items-center">
            <Typography variant="h4">Position settings</Typography>
            <button
              className="flex gap-1 items-center"
              onClick={() => handleReset()}
            >
              <ArrowCircleIcon />
              <Typography variant="small">Reset</Typography>
            </button>
          </div>
          <div className="flex justify-between items-start">
            <Typography variant="h6">Select an asset</Typography>
            <div className="flex ">
              <TokenSelect
                label="Token1"
                chosenAddress={fromTokenAddress}
                otherChosenAddress={toTokenAddress}
                setChosenTokenAddress={setFromTokenAddress}
                setOtherChosenTokenAddress={setToTokenAddress}
              />
              <TokenSelect
                label="Token2"
                chosenAddress={toTokenAddress}
                otherChosenAddress={fromTokenAddress}
                setChosenTokenAddress={setToTokenAddress}
                setOtherChosenTokenAddress={setFromTokenAddress}
              />
            </div>
          </div>
          <div className="flex justify-between items-start">
            <Typography variant="h6">amount</Typography>
            <div className="flex w-full justify-between max-w-[300px]  px-1 py-1">
              <input
                type="number"
                className="w-full text-sm leading-none"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  setInputAmount(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="flex justify-between mb-2">
            <div className="whitespace-nowrap">
              <Typography variant="h6">Lock duration</Typography>
              <button onClick={() => handleLockPeriod(6, 3)}>Set max</button>
            </div>
            <div className="grid grid-cols-4 gap-2 items-end">
              <div>
                <button
                  onClick={() =>
                    handleLockPeriod(lockMonths, Number(lockDays) - 1)
                  }
                >
                  <MinusIcon />
                </button>
              </div>
              <div>
                <p className="text-center   mb-1">Months</p>
                <input
                  type="number"
                  className="max-w-[40px] text-center "
                  value={lockMonths}
                  onChange={(e) => handleLockPeriod(e.target.value, lockDays)}
                />
              </div>
              <div>
                <p className="text-center   mb-1">Days</p>
                <input
                  type="number"
                  className="max-w-[40px] text-center "
                  value={lockDays}
                  onChange={(e) => handleLockPeriod(lockMonths, e.target.value)}
                />
              </div>
              <div>
                <button
                  onClick={() =>
                    handleLockPeriod(lockMonths, Number(lockDays) + 1)
                  }
                >
                  <PlusIcon color="#14a8d4" />
                </button>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-start">
            <div className="whitespace-nowrap">
              <Typography variant="h6">Yield Booster</Typography>
              <button>Get max bonus</button>
            </div>
            <div className="flex flex-col items-end gap-2 w-full">
              <div className="flex w-full justify-between max-w-[300px]  px-1 py-1">
                <input
                  type="number"
                  className="w-full text-sm leading-none"
                  placeholder="0"
                  value={boostAmount}
                  onChange={(e) => handleBoostsAmount(e.target.value)}
                />
                <button
                  className="bg-kojiki-blue    px-1 py-1  "
                  onClick={() => setBoostAmount(xSakeBalance)}
                >
                  max
                </button>
              </div>
              <Typography>Balance : {xSakeBalance} xSAKE</Typography>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-10">
            <div className="whitespace-nowrap">
              <Typography variant="h5">Estimates</Typography>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className=" whitespace-nowrap">Projected total APR</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap ">
                {(poolAPR + cfpAPR + bonusPercent).toFixed(3)}%
              </span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className=" whitespace-nowrap">
                Projected yearly earnings
              </span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">
                $
                {((amount * (poolAPR + cfpAPR + bonusPercent)) / 100).toFixed(
                  2
                )}
              </span>
            </div>
            {/* <div className="flex flex-row justify-between items-center mt-5">
              <span className=" whitespace-nowrap">Earned fees APR</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">0%</span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className=" whitespace-nowrap">Farm base APR</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">0%</span>
            </div> */}
            <div className="flex flex-row justify-between items-center">
              <span className=" whitespace-nowrap">Farm bonus APR</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">
                {bonusPercent.toFixed(2)}%
              </span>
            </div>
            <div className="flex flex-row justify-between items-center">
              <span className=" whitespace-nowrap">RP APR</span>
              <hr className="border-dashed w-full mx-3" />
              <span className=" whitespace-nowrap">{cfpAPR.toFixed(3)}%</span>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
