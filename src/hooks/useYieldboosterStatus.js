import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  formatUnits,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import { contracts } from "../config/contracts";
import { CHAIN_ID, REFETCH_INTERVAL, XSake_DECIMALS } from "./connectors";
// import { BigNumber } from "ethers";
import YieldBoosterABI from "../assets/abi/YieldBooster.json";
import XSakeABI from "../assets/abi/KojikiStakeToken.json";

export function useYieldboosterStatus() {
  const [data, setData] = useState({
    totalAllocation: 0,
    deallocationFee: 0,
  });
  const { account } = useWeb3React();

  const yieldboosterContract = getWeb3Contract(
    YieldBoosterABI,
    contracts[CHAIN_ID].YIELDBOOSTER
  );
  const xSakeContract = getWeb3Contract(
    XSakeABI,
    contracts[CHAIN_ID].XSakeTOKEN
  );
  const mcContract = MulticallContractWeb3();

  const [refetch, setRefetch] = useState(false);

  useEffect(() => {
    const timerID = setInterval(() => {
      setRefetch((prevData) => {
        return !prevData;
      });
    }, REFETCH_INTERVAL);

    return () => {
      clearInterval(timerID);
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const fetchArray = [
        yieldboosterContract.methods.totalAllocation(),
        xSakeContract.methods.usagesDeallocationFee(
          contracts[CHAIN_ID].YIELDBOOSTER
        ),
      ];

      const data = await mcContract.aggregate(fetchArray);

      setData({
        totalAllocation: formatUnits(data[0], XSake_DECIMALS),
        deallocationFee: data[1] / 100, // percent
      });
    };
    fetchData();
    // eslint-disable-next-line
  }, [account, refetch]);

  return data;
}
