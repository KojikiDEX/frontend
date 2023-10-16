import { useEffect, useState } from "react";
import { BigNumber, ethers } from "ethers";
import {
  formatUnits,
  getWeb3Contract,
  isWETH,
  MulticallContractWeb3,
} from "./contractHelper";

import LPABI from "../assets/abi/LP.json";
import ERC20ABI from "../assets/abi/ERC20.json";
import kojikiPairABI from "../assets/abi/KojikiSwapPair.json";

import { contracts, ETH_USDC_PAIR } from "../config/contracts";
import { lpTokens } from "../config/lpTokens";
import { CHAIN_ID, USDC_DECIMALS } from "./connectors";
import { zeroAddress } from "../config/tokens";

async function getETHPrice() {
  const ethUSDCPair = ETH_USDC_PAIR[CHAIN_ID].pairAddr;

  const pool = getWeb3Contract(kojikiPairABI, ethUSDCPair, CHAIN_ID);

  const mcContract = MulticallContractWeb3();
  const _data = await mcContract.aggregate([
    pool.methods.getReserves(),
    pool.methods.token0(),
    pool.methods.token1(),
  ]);

  let numerator = _data[0][1];
  let denominator = _data[0][0];
  if (_data[1] === ETH_USDC_PAIR[CHAIN_ID].usdc) {
    numerator = _data[0][0];
    denominator = _data[0][1];
  }

  const price = BigNumber.from(numerator)
    .mul(BigNumber.from("10").pow(18))
    .div(BigNumber.from(denominator));

  return price;
}

export const getLpTokens = async (account) => {
  const ethPrice = await getETHPrice();
  const mc = MulticallContractWeb3();

  const lpTokenList =
    JSON.parse(localStorage.getItem("lpTokenList" + CHAIN_ID)) ?? [];
  const basicTokenList = lpTokens[CHAIN_ID].concat(lpTokenList);

  let tokenList = {};

  for (let i = 0; i < basicTokenList.length; i++) {
    let token = basicTokenList[i];

    token.address = token.address.toLowerCase();

    const lpContract = getWeb3Contract(LPABI, token.address);
    const token1Contract = getWeb3Contract(
      ERC20ABI,
      token.token1.address == zeroAddress
        ? contracts[CHAIN_ID].WETH
        : token.token1.address
    );
    const token2Contract = getWeb3Contract(
      ERC20ABI,
      token.token2.address == zeroAddress
        ? contracts[CHAIN_ID].WETH
        : token.token2.address
    );

    const tokendata = await mc.aggregate([
      lpContract.methods.balanceOf(
        account == undefined ? zeroAddress : account
      ),
      lpContract.methods.allowance(
        account == undefined ? zeroAddress : account,
        contracts[CHAIN_ID].ROUTER
      ),
      lpContract.methods.totalSupply(),
      lpContract.methods.getReserves(),
      token1Contract.methods.decimals(),
      token2Contract.methods.decimals(),
    ]);

    token["balance"] = tokendata[0];
    token["allowance"] = tokendata[1];
    token["supply"] = tokendata[2];
    token["reserves"] = [
      formatUnits(
        token.token1.address < token.token2.address
          ? tokendata[3][0]
          : tokendata[3][1],
        tokendata[4]
      ),
      formatUnits(
        token.token1.address > token.token2.address
          ? tokendata[3][0]
          : tokendata[3][1],
        tokendata[5]
      ),
    ];

    token["supply"] = tokendata[2];
    token["liquidity"] = 0;

    if (token.token1.address == zeroAddress || isWETH(token.token1.address))
      token["liquidity"] =
        token["reserves"][0] * 2 * formatUnits(ethPrice, USDC_DECIMALS);
    else if (
      token.token2.address == zeroAddress ||
      isWETH(token.token2.address)
    )
      token["liquidity"] =
        token["reserves"][1] * 2 * formatUnits(ethPrice, USDC_DECIMALS);
    else if (
      token.token1.address.toLowerCase() ==
      contracts[CHAIN_ID].USDC.toLowerCase()
    )
      token["liquidity"] = token["reserves"][0] * 2;
    else if (
      token.token1.address.toLowerCase() ==
      contracts[CHAIN_ID].USDC.toLowerCase()
    )
      token["liquidity"] = token["reserves"][1] * 2;

    tokenList[token.address] = token;
  }

  return tokenList;
};
