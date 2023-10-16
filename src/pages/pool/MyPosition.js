import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useWeb3React } from "@web3-react/core";

import {
  checkWETHSymbol,
  formatNumber,
  formatUnits,
} from "../../hooks/contractHelper";

import {
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";
import { useETHPrice } from "../../hooks/useKojikiContext";

import LpABI from "../../assets/abi/LP.json";
import ERC20ABI from "../../assets/abi/ERC20.json";

import LoadingIcon from "../../components/Icons/LoadingIcon";
import { contracts } from "../../config/contracts";
import { CHAIN_ID, USDC_DECIMALS } from "../../hooks/connectors";

export default function MyPosition() {
  let { account } = useWeb3React();

  let { lpAddr } = useParams();
  let ethPrice = useETHPrice();

  const lpContract = getWeb3Contract(LpABI, lpAddr);

  const [tvl, setTvl] = useState(0);

  const [lpData, setLpData] = useState({});
  const [token0Data, setToken0Data] = useState({});
  const [token1Data, setToken1Data] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      console.log(account);
      if (account == undefined) return;

      const mc = MulticallContractWeb3();
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
    })();
  }, [ethPrice, account]);

  return (
    <React.Fragment>
      <div className="max-w-[1024px] mt-10 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link to={`/pool/overview/${lpAddr}`}>
            <button className="w-full default-outline">overview</button>
          </Link>
          <Link to={`/pool/myposition/${lpAddr}`}>
            <button className="w-full primary !py-[2px]">my position</button>
          </Link>
          <Link to={`/pool/deposit/${lpAddr}`}>
            <button className="w-full default-outline">deposit</button>
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
            <div className="mb-4">
              <p className="text-kojiki-blue">my position</p>
            </div>
            <div className="flex flex-col gap-7">
              <div className="grid grd-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1 border p-3">
                  <p className="mb-2">total value</p>
                  <span className="text-kojiki-blue">
                    {formatNumber(formatUnits(lpData.balance, 18), 18)} K-LP
                  </span>
                </div>
                <div className="flex flex-col gap-1 border p-3">
                  <p className="mb-2">lp balance</p>
                  <span className="text-kojiki-blue">
                    ${formatNumber((lpData.balance * tvl) / lpData.totalSupply)}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-2">assets</p>
                <div className="flex flex-col gap-1 border p-3">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <img
                        src={require(`../../assets/img/token/${checkWETHSymbol(
                          token0Data.symbol
                        ).toUpperCase()}.png`)}
                        width="18px"
                        alt="fromToken"
                      />
                      <span>{checkWETHSymbol(token0Data.symbol)}</span>
                    </div>
                    <div>
                      <span>
                        {formatNumber(
                          (lpData.balance / lpData.totalSupply) *
                            formatUnits(
                              token0Data.balance,
                              token0Data.decimals
                            ),
                          5
                        )}{" "}
                        {checkWETHSymbol(token0Data.symbol)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-1">
                      <img
                        src={require(`../../assets/img/token/${checkWETHSymbol(
                          token1Data.symbol
                        ).toUpperCase()}.png`)}
                        width="18px"
                        alt="fromToken"
                      />
                      <span>{checkWETHSymbol(token1Data.symbol)}</span>
                    </div>
                    <div>
                      <span>
                        {formatNumber(
                          (lpData.balance / lpData.totalSupply) *
                            formatUnits(
                              token1Data.balance,
                              token1Data.decimals
                            ),
                          5
                        )}{" "}
                        {checkWETHSymbol(token1Data.symbol)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2">earning</p>
                <div className="border p-3">
                  <p>
                    You are earning fees from every trade through the pool.
                    Earned fees are compounded to your position. The process is
                    automatic.
                  </p>
                  <input type="progress" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
