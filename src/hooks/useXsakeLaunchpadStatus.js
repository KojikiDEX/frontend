import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  formatUnits,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import { contracts } from "../config/contracts";
import { CHAIN_ID, REFETCH_INTERVAL, XSake_DECIMALS } from "./connectors";
import MulticallABI from "../assets/abi/Multicall.json";
import xSakeABI from "../assets/abi/KojikiStakeToken.json";
import LaunchpadABI from "../assets/abi/Launchpad.json";

export function useXsakeLaunchpadStatus() {
  const [data, setData] = useState({
    totalAllocation: 0,
    cooldown: 0,
    deallocationFee: 0,
    userAllocation: 0,
    userAllocationTime: 0,
    userCoolDown: 0,
  });
  const { account } = useWeb3React();

  const launchpadContract = getWeb3Contract(
    LaunchpadABI,
    contracts[CHAIN_ID].LAUNCHPAD
  );
  const multiCallContract = getWeb3Contract(
    MulticallABI,
    contracts[CHAIN_ID].MULTICALLCONTRACT
  );
  const xSakeContract = getWeb3Contract(
    xSakeABI,
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
        launchpadContract.methods.totalAllocation(),
        launchpadContract.methods.deallocationCooldown(),
        xSakeContract.methods.usagesDeallocationFee(
          contracts[CHAIN_ID].LAUNCHPAD
        ),
        multiCallContract.methods.getCurrentBlockTimestamp(),
      ];
      if (account) {
        fetchArray.push(launchpadContract.methods.getUserInfo(account));
      }

      const data = await mcContract.aggregate(fetchArray);

      setData({
        totalAllocation: formatUnits(data[0], XSake_DECIMALS),
        cooldown: data[1],
        deallocationFee: parseInt(data[2]) / 100, // percent
        userAllocation: formatUnits(data[4][0], XSake_DECIMALS),
        userAllocationTime: data[4][1],
        userCoolDown:
          parseInt(data[4][1]) + parseInt(data[1]) - parseInt(data[3]),
      });
    };
    fetchData();
    // eslint-disable-next-line
  }, [account, refetch]);

  return data;
}
