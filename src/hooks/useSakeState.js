import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { getWeb3Contract, MulticallContractWeb3 } from "./contractHelper";
import { contracts } from "../config/contracts";
import { CHAIN_ID } from "./connectors";
import ERC20ABI from "../assets/abi/ERC20.json";
import MulticallABI from "../assets/abi/Multicall.json";

export function useSakeState(refetch) {
  const [data, setData] = useState({
    sakeSymbol: "",
    sakeDecimals: 18,
    sakeBalanceOf: 0,
    allowanceOfXSake: 0,
    allowanceOfDividends: 0,
    allowanceOfYieldbooster: 0,
    allowanceOfLaunchpad: 0,
    blockTimestamp: 0,
  });
  const { chainId, account } = useWeb3React();

  const sakeContract = getWeb3Contract(ERC20ABI, contracts[CHAIN_ID].saketoken);
  const multiCallContract = getWeb3Contract(
    MulticallABI,
    contracts[CHAIN_ID].MULTICALLCONTRACT
  );
  const mcContract = MulticallContractWeb3();

  useEffect(() => {
    const fetchData = async () => {
      if (!account) {
        return;
      }
      const fetchArray = [
        sakeContract.methods.decimals(),
        sakeContract.methods.balanceOf(account),
        sakeContract.methods.allowance(account, contracts[CHAIN_ID].XSakeTOKEN),
        sakeContract.methods.allowance(account, contracts[CHAIN_ID].DIVIDENDS),
        sakeContract.methods.allowance(
          account,
          contracts[CHAIN_ID].YIELDBOOSTER
        ),
        sakeContract.methods.allowance(account, contracts[CHAIN_ID].LAUNCHPAD),
        multiCallContract.methods.getCurrentBlockTimestamp(),
        sakeContract.methods.symbol(),
      ];

      const data = await mcContract.aggregate(fetchArray);

      setData({
        sakeSymbol: data[7],
        sakeDecimals: data[0],
        sakeBalanceOf: data[1],
        allowanceOfXSake: data[2],
        allowanceOfDividends: data[3],
        allowanceOfYieldbooster: data[4],
        allowanceOfLaunchpad: data[5],
        blockTimestamp: data[6],
      });
    };
    fetchData();
  }, [account, chainId, mcContract, sakeContract, multiCallContract, refetch]);

  return data;
}
