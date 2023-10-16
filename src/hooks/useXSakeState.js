import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { getWeb3Contract, MulticallContractWeb3 } from "./contractHelper";
import { contracts } from "../config/contracts";
import { CHAIN_ID, REFETCH_INTERVAL } from "./connectors";
import { BigNumber } from "ethers";
import xSakeABI from "../assets/abi/KojikiStakeToken.json";

export function useXSakeState(refresh = false) {
  const [data, setData] = useState({
    xSakeSymbol: "",
    xSakeBalanceOf: 0,
    xSakeDecimals: 18,
    allowanceOfDividends: 0,
    allowanceOfYieldbooster: 0,
    allowanceOfLaunchpad: 0,
    totalAmount: 0,
    availableAmount: 0,
    allocatedAmount: 0,
    redeemingAmount: 0,
    allocatedOfDividends: 0,
    allocatedOfYieldbooster: 0,
    allocatedOfLaunchpad: 0,
    deallocationFeeOfDividends: 0,
    deallocationFeeOfYieldbooster: 0,
    deallocationFeeOfLaunchpad: 0,
    redeems: [],
  });
  const { chainId, account } = useWeb3React();

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
      if (!account) {
        return;
      }
      const userRedeemLength = await xSakeContract.methods
        .getUserRedeemsLength(account)
        .call();
      const fetchArray = [
        xSakeContract.methods.decimals(),
        xSakeContract.methods.balanceOf(account),
        xSakeContract.methods.getSakeStakeTokenBalance(account),
        xSakeContract.methods.getUsageAllocation(
          account,
          contracts[CHAIN_ID].DIVIDENDS
        ),
        xSakeContract.methods.getUsageAllocation(
          account,
          contracts[CHAIN_ID].YIELDBOOSTER
        ),
        xSakeContract.methods.getUsageAllocation(
          account,
          contracts[CHAIN_ID].LAUNCHPAD
        ),
        xSakeContract.methods.symbol(),
        xSakeContract.methods.getUsageApproval(
          account,
          contracts[CHAIN_ID].DIVIDENDS
        ),
        xSakeContract.methods.getUsageApproval(
          account,
          contracts[CHAIN_ID].YIELDBOOSTER
        ),
        xSakeContract.methods.getUsageApproval(
          account,
          contracts[CHAIN_ID].LAUNCHPAD
        ),
        xSakeContract.methods.usagesDeallocationFee(
          contracts[CHAIN_ID].DIVIDENDS
        ),
        xSakeContract.methods.usagesDeallocationFee(
          contracts[CHAIN_ID].YIELDBOOSTER
        ),
        xSakeContract.methods.usagesDeallocationFee(
          contracts[CHAIN_ID].LAUNCHPAD
        ),
      ];
      for (let index = 0; index < userRedeemLength; index++) {
        fetchArray.push(xSakeContract.methods.getUserRedeem(account, index));
      }

      const data = await mcContract.aggregate(fetchArray);

      setData({
        xSakeSymbol: data[6],
        xSakeBalanceOf: data[1],
        xSakeDecimals: data[0],
        totalAmount: BigNumber.from(data[1]).add(data[2][0]).add(data[2][1]),
        availableAmount: data[1],
        allocatedAmount: data[2][0],
        redeemingAmount: data[2][1],
        allowanceOfDividends: data[7],
        allowanceOfYieldbooster: data[8],
        allowanceOfLaunchpad: data[9],
        allocatedOfDividends: data[3],
        allocatedOfYieldbooster: data[4],
        allocatedOfLaunchpad: data[5],
        deallocationFeeOfDividends: data[10],
        deallocationFeeOfYieldbooster: data[11],
        deallocationFeeOfLaunchpad: data[12],
        redeems: data.slice(13),
      });
    };
    fetchData();
  }, [account, chainId, mcContract, xSakeContract, refresh, refetch]);

  return data;
}
