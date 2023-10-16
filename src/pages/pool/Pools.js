import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { TokenContext } from "../../context/context";

import ArrowLeftIcon from "../../components/Icons/ArrowLeftIcon";
import LoadingIcon from "../../components/Icons/LoadingIcon";

import { formatNumber } from "../../hooks/contractHelper";

export default function Pools() {
  let navigate = useNavigate();
  const { tokens, lpTokens, setLpTokens } = useContext(TokenContext);

  const [keyword, setKeyword] = useState("");
  const [tvl, setTvl] = useState(0);

  let count = 0;
  let liquidity = 0;

  useEffect(() => {
    count = 0;
    liquidity = 0;

    Object.keys(lpTokens).map((addr, i) => {
      liquidity += Number(lpTokens[addr].liquidity);
    });
  }, [tokens, lpTokens, keyword]);

  useEffect(() => {
    setTvl(liquidity);
  }, [liquidity]);

  return (
    <React.Fragment>
      <div className="max-w-[1024px] mt-7 mx-auto">
        {Object.keys(tokens).length > 0 && Object.keys(lpTokens).length > 0 ? (
          <>
            <div>
              <p className="text-kojiki-blue mb-3">trending</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {Object.keys(lpTokens).map((addr, i) => {
                  if (lpTokens[addr].trend) {
                    return (
                      <Link to={`/pool/overview/${addr}`} key={i}>
                        <div className="px-3 py-4 border">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="flex">
                                <img
                                  src={require(`../../assets/img/token/${lpTokens[addr].token1.symbol}.png`)}
                                  width="30px"
                                  alt="token logo"
                                />
                                <img
                                  src={require(`../../assets/img/token/${lpTokens[addr].token2.symbol}.png`)}
                                  width="30px"
                                  alt="token logo"
                                />
                              </div>
                              <span>
                                ${lpTokens[addr].token1.symbol}/$
                                {lpTokens[addr].token2.symbol}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3 flex justify-between">
                            <span>liquidity</span>
                            <span className="text-kojiki-blue">
                              ${formatNumber(lpTokens[addr].liquidity, 5)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  }
                })}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-10">
              <p className="text-kojiki-blue">all pools</p>
              <input
                type="text"
                className="w-full max-w-[390px] border border-kojiki-blue text-sm leading-none p-1"
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                }}
              />
            </div>
            <div className="mt-5">
              <table className="w-full table-auto border-collapse border-spacing-2.5	">
                <thead>
                  <tr>
                    <td className="pb-2 text-kojiki-blue">pool</td>
                    <td className="hidden md:table-cell pb-2 text-kojiki-blue">
                      type
                    </td>
                    <td className="pb-2 text-kojiki-blue">tvl</td>
                    {/* <td className="hidden md:table-cell pb-2 text-kojiki-blue">
                  apr
                </td> */}
                    <td className="hidden md:table-cell pb-2 text-kojiki-blue text-right">
                      tvl ${formatNumber(tvl, 5)}
                    </td>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(lpTokens).map((addr, i) => {
                    if (
                      lpTokens[addr].token1.symbol
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                      lpTokens[addr].token2.symbol
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                      lpTokens[addr].token1.address
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                      lpTokens[addr].token2.address
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                      lpTokens[addr].address
                        .toLowerCase()
                        .includes(keyword.toLowerCase())
                    ) {
                      count++;
                      return (
                        <tr
                          key={i}
                          className="border hover:cursor-pointer"
                          onClick={() => {
                            navigate("/pool/overview/" + addr);
                          }}
                        >
                          <td className="flex gap-2 p-2">
                            <div className="flex items-center gap-1">
                              <img
                                src={require(`../../assets/img/token/${lpTokens[addr].token1.symbol}.png`)}
                                width="20px"
                                alt="token logo"
                              />
                              <span>{lpTokens[addr].token1.symbol}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <img
                                src={require(`../../assets/img/token/${lpTokens[addr].token2.symbol}.png`)}
                                width="20px"
                                alt="token logo"
                              />
                              <span>{lpTokens[addr].token2.symbol}</span>
                            </div>
                          </td>
                          <td className="hidden md:table-cell py-2">classic</td>
                          <td className="py-2">
                            ${formatNumber(lpTokens[addr].liquidity, 5)}
                          </td>
                          {/* <td className="hidden md:table-cell py-2">99.999%</td> */}
                          <td className="hidden md:flex flex-row justify-end p-2">
                            <ArrowLeftIcon />
                          </td>
                        </tr>
                      );
                    }
                  })}
                </tbody>
              </table>
              {count == 0 && (
                <div className="w-full flex flex-col justify-center items-center min-h-[250px]">
                  <span>no pool founded</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex gap-3 justify-center items-center min-h-[450px]">
            <LoadingIcon />
            <span>loading...</span>
          </div>
        )}
      </div>
    </React.Fragment>
  );
}
