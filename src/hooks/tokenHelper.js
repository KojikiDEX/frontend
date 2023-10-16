import { getWeb3 } from "./connectors";
import { getWeb3Contract, MulticallContractWeb3 } from "./contractHelper";

import { CHAIN_ID } from "./connectors";
import ERC20ABI from "../assets/abi/ERC20.json";

import { contracts } from "../config/contracts";
import { tokens } from "../config/tokens";

export const getTokens = async (account) => {
  const web3 = getWeb3();
  const mc = MulticallContractWeb3();

  const addedTokenList =
    JSON.parse(localStorage.getItem("tokenList" + CHAIN_ID)) ?? [];
  const basicTokenList = tokens[CHAIN_ID].concat(addedTokenList);

  let tokenList = {};

  for (let i = 0; i < basicTokenList.length; i++) {
    if (tokenList[basicTokenList[i].address] !== undefined) continue;
    let token = basicTokenList[i];

    token.address = token.address.toLowerCase();

    if (account === undefined) {
      token["balance"] = 0;
      token["allowance"] = 0;
    } else if (token.native === true) {
      token["balance"] = await web3.eth.getBalance(account);
      token["allowance"] = 0;
    } else {
      const tokenContract = getWeb3Contract(ERC20ABI, token.address);
      const tokendata = await mc.aggregate([
        tokenContract.methods.balanceOf(account),
        tokenContract.methods.allowance(account, contracts[CHAIN_ID].ROUTER),
      ]);

      token["balance"] = tokendata[0];
      token["allowance"] = tokendata[1];
    }

    tokenList[token.address] = token;
  }

  return tokenList;
};

export const getCommonTokens = async (account) => {
  const web3 = getWeb3();
  const mc = MulticallContractWeb3();

  const addedTokenList =
    JSON.parse(localStorage.getItem("tokenList" + CHAIN_ID)) ?? [];
  const basicTokenList = tokens[CHAIN_ID].concat(addedTokenList);

  let tokenList = {};

  for (let i = 0; i < basicTokenList.length; i++) {
    if (tokenList[basicTokenList[i].address] !== undefined) continue;
    if (basicTokenList[i].common != true) continue;
    let token = basicTokenList[i];

    token.address = token.address.toLowerCase();

    if (account === undefined) {
      token["balance"] = 0;
      token["allowance"] = 0;
    } else if (token.native === true) {
      token["balance"] = await web3.eth.getBalance(account);
      token["allowance"] = 0;
    } else {
      const tokenContract = getWeb3Contract(ERC20ABI, token.address);

      const tokendata = await mc.aggregate([
        tokenContract.methods.balanceOf(account),
        tokenContract.methods.allowance(account, contracts[CHAIN_ID].ROUTER),
      ]);

      token["balance"] = tokendata[0];
      token["allowance"] = tokendata[1];
    }

    tokenList[token.address] = token;
  }

  return tokenList;
};
