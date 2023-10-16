import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import {
  checkWETHSymbol,
  formatNumber,
  formatUnits,
  trimAddress,
} from "../../hooks/contractHelper";

import {
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";
import { useETHPrice } from "../../hooks/useKojikiContext";

import LpABI from "../../assets/abi/LP.json";
import ERC20ABI from "../../assets/abi/ERC20.json";

import CopyIcon from "../../components/Icons/CopyIcon";
import LoadingIcon from "../../components/Icons/LoadingIcon";
import { contracts } from "../../config/contracts";
import { CHAIN_ID, USDC_DECIMALS } from "../../hooks/connectors";

export default function Overview() {
  const { lpAddr } = useParams();
  let ethPrice = useETHPrice();

  const lpContract = getWeb3Contract(LpABI, lpAddr);
  const [tvl, setTvl] = useState(0);

  const [lpData, setLpData] = useState({});
  const [token0Data, setToken0Data] = useState({});
  const [token1Data, setToken1Data] = useState({});

  const [direct, setDirect] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const mc = MulticallContractWeb3();
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
    })();
  }, [ethPrice]);

  return (
    <React.Fragment>
      <div className="max-w-[1024px] mt-10 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to={`/pool/overview/${lpAddr}`}>
            <button className="w-full primary !py-[2px]">overview</button>
          </Link>
          <Link to={`/pool/myposition/${lpAddr}`}>
            <button className="w-full default-outline">my position</button>
          </Link>
          <Link to={`/pool/deposit/${lpAddr}`}>
            <button className="w-full default-outline">deposit</button>
          </Link>
          <Link to={`/pool/withdraw/${lpAddr}`}>
            <button className="w-full default-outline">withdraw</button>
          </Link>
        </div>
        {loading ? (
          <div className="min-h-[300px] flex justify-center items-center">
            <LoadingIcon />
          </div>
        ) : (
          <div className="flex flex-col gap-7 mt-12">
            <div>
              <p className="text-kojiki-blue">classic pool</p>
              <div className="flex items-center gap-2">
                <p>contract {trimAddress(lpAddr)}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(lpAddr);
                  }}
                >
                  <CopyIcon />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div
                className="w-fit flex items-center gap-1 border px-3 py-2 hover:cursor-pointer"
                onClick={() => setDirect(!direct)}
              >
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
                    : direct
                    ? 1
                    : formatNumber(
                        formatUnits(token0Data.balance, token0Data.decimals) /
                          formatUnits(token1Data.balance, token1Data.decimals),
                        5
                      )}{" "}
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
                    : !direct
                    ? 1
                    : formatNumber(
                        formatUnits(token1Data.balance, token1Data.decimals) /
                          formatUnits(token0Data.balance, token0Data.decimals),
                        5
                      )}{" "}
                  {checkWETHSymbol(token1Data.symbol)}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 border p-3">
                  <p className="mb-2">assets in pool</p>
                  <div className="flex items-center gap-1">
                    <img
                      src={require(`../../assets/img/token/${checkWETHSymbol(
                        token0Data.symbol
                      ).toUpperCase()}.png`)}
                      width="18px"
                      alt="fromToken"
                    />
                    <span>
                      {formatNumber(
                        formatUnits(token0Data.balance, token0Data.decimals),
                        5
                      )}{" "}
                      {checkWETHSymbol(token0Data.symbol)}
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
                    {formatNumber(
                      formatUnits(token1Data.balance, token1Data.decimals),
                      5
                    )}{" "}
                    {checkWETHSymbol(token1Data.symbol)}
                  </div>
                </div>
                {/* <div className="flex flex-col gap-1 border p-3">
                  <p className="mb-2">lp rewards</p>
                  <div className="grid grid-cols-2">
                    <div>
                      <p>fee apr (24h)</p>
                      <span className="text-kojiki-blue">13.38%</span>
                    </div>
                    <div>
                      <p>fee apr (24h)</p>
                      <span className="text-kojiki-blue">13.38%</span>
                    </div>
                  </div>
                </div> */}
                <div className="flex flex-col gap-1 border p-3">
                  <p className="mb-2">total value locked</p>
                  <div className="">
                    <div>
                      <span className="text-kojiki-blue text-[22px]">
                        ${tvl > 0 ? formatNumber(tvl, 5) : 0}
                      </span>
                    </div>
                    {/* <div>
                      <p>fee apr (24h)</p>
                      <span className="text-kojiki-blue">13.38%</span>
                    </div> */}
                  </div>
                </div>
              </div>
              {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-3 border p-3">
                <div>
                  <p>tvl</p>
                  <span>$999,999,999.99</span>
                </div>
                <div>
                  <p>total apr</p>
                  <span>99.99%</span>
                </div>
                <div>
                  <p>volume (24)</p>
                  <span>$0</span>
                </div>
                <div>
                  <p>fees (24h)</p>
                  <span>$999,999</span>
                </div>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
