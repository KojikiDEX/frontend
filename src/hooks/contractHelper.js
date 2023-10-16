import { ethers } from "ethers";
import { BigNumber } from "@ethersproject/bignumber";
import Multicall from "@dopex-io/web3-multicall";

import { getWeb3, CHAIN_ID } from "./connectors";
import { supportNetwork } from "./network";
import { contracts } from "../config/contracts";
import multicallABI from "../assets/abi/Multicall.json";
import { zeroAddress } from "../config/tokens";

export const getContract = (abi, address, library) => {
  try {
    return new ethers.Contract(address, abi, library.getSigner());
  } catch {
    return false;
  }
};

export const getWeb3Contract = (abi, address) => {
  let web3 = getWeb3();
  return new web3.eth.Contract(abi, address);
};

export const MulticallContractWeb3 = () => {
  let multicallAddress = contracts[CHAIN_ID].MULTICALLCONTRACT;

  let provider = supportNetwork[CHAIN_ID].rpc;
  const multicall = new Multicall({
    multicallAddress,
    provider,
  });

  return multicall;
};

export const MultiCallContractConnect = () => {
  let web3 = getWeb3();
  let multicallAddress = contracts[CHAIN_ID].MULTICALLCONTRACT;
  return new web3.eth.Contract(multicallABI, multicallAddress);
};

export const isWETH = (address) => {
  if (address.toLowerCase() == contracts[CHAIN_ID].WETH.toLowerCase())
    return true;
  return false;
};

export const checkWETHSymbol = (symbol) => {
  if (symbol == "WETH") return "ETH";
  return symbol;
};

export const wrapAddress = (orgAddress) => {
  if (orgAddress == zeroAddress) return contracts[CHAIN_ID].WETH.toLowerCase();
  return orgAddress.toLowerCase();
};

export const formatUnits = (value, decimals) => {
  return Number.parseFloat(
    ethers.utils.formatUnits(BigNumber.from(value), decimals)
  );
};

export const formatValue = (value, decimals) => {
  if (value === undefined || value === null || value === "") value = 0;
  return ethers.utils
    .parseUnits(Number(value).toFixed(decimals).toString(), decimals)
    .toString();
};

export const formatPrice = (num) => {
  return new Intl.NumberFormat("ja-JP").format(parseFloat(num).toFixed(7));
};

export const formatNumber = (num, decimals = 18) => {
  num = Number(num).toFixed(decimals).replace(/\.0+$/, "");
  if (Math.abs(num) < 1.0) {
    var e = parseInt(num.toString().split("e-")[1]);
    if (e) {
      num *= Math.pow(10, e - 1);
      num = "0." + new Array(e).join("0") + num.toString().substring(2);
    }
  } else {
    var e = parseInt(num.toString().split("+")[1]);
    if (e > 20) {
      e -= 20;
      num /= Math.pow(10, e);
      num += new Array(e + 1).join("0");
    }
  }

  if (num.split(".").length == 2) {
    for (let i = num.length - 1; i >= 0; i--) {
      if (num[i] == 0) {
        num = num.slice(0, -1);
      } else {
        break;
      }
    }
  }

  return num;
};

export const formatDecimal = (num, decimals) => {
  return Number(num.toFixed(decimals));
};

export const trimAddress = (addr) => {
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
};

export const showBigNumberAsFloat = (num, decimals) => {};
