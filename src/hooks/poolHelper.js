import { getWeb3Contract, MulticallContractWeb3 } from "./contractHelper";

import LPABI from "../assets/abi/LP.json";

import { supportedNftPools } from "../config/nftPools";
import { CHAIN_ID } from "./connectors";

export const getSupportedPools = async (account) => {
  const mc = MulticallContractWeb3();

  let poolList = {};

  for (let i = 0; i < supportedNftPools[CHAIN_ID].length; i++) {
    let pool = supportedNftPools[CHAIN_ID][i];

    pool.address = pool.address.toLowerCase();

    if (account === undefined) {
      pool["balance"] = 0;
      pool["allowance"] = 0;
    } else {
      const poolContract = getWeb3Contract(LPABI, pool.lpToken);

      const pooldata = await mc.aggregate([
        poolContract.methods.balanceOf(account),
        poolContract.methods.allowance(account, pool.address),
      ]);

      pool["balance"] = pooldata[0];
      pool["allowance"] = pooldata[1];
    }

    poolList[pool.address] = pool;
  }

  return poolList;
};
