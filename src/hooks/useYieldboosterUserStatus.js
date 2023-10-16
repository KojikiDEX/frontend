import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  formatUnits,
  formatValue,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import { contracts } from "../config/contracts";
import {
  CHAIN_ID,
  REFETCH_INTERVAL,
  XSake_DECIMALS,
  getWeb3,
} from "./connectors";
// import { BigNumber } from "ethers";
import YieldBoosterABI from "../assets/abi/YieldBooster.json";
import { BigNumber } from "@ethersproject/bignumber";

export function useYieldboosterUserStatus(
  positionInfo,
  amount = 0,
  alloc = true,
  fee = 0
) {
  const [data, setData] = useState({
    usersPositionsAllocation: 0,
    expectBonusMultiplier: 0,
    expectPoolShare: 0,
    expectBoostShare: 0,
    expectTotalAPR: 0,
    expectFarmBaseAPR: 0,
    expectBonusBaseAPR: 0,
    expectEarnedBaseAPR: 0,
    deallocationFeeAmount: 0,
  });
  const { account } = useWeb3React();
  const web3 = getWeb3();

  const yieldboosterContract = getWeb3Contract(
    YieldBoosterABI,
    contracts[CHAIN_ID].YIELDBOOSTER
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
      if (
        !account ||
        !positionInfo ||
        !web3.utils.isAddress(positionInfo.poolAddr)
      ) {
        return;
      }

      let fetchArray = [
        yieldboosterContract.methods.usersPositionsAllocation(
          account,
          positionInfo.poolAddr,
          positionInfo.tokenId
        ),
        yieldboosterContract.methods.getPoolTotalAllocation(
          positionInfo.poolAddr
        ),
      ];

      const _rawData = await mcContract.aggregate(fetchArray);

      let newUserAllocation = BigNumber.from(_rawData[0]).add(
        formatValue(amount, XSake_DECIMALS)
      );
      let newPoolTotalAllocation = BigNumber.from(_rawData[1]).add(
        formatValue(amount, XSake_DECIMALS)
      );

      if (!alloc) {
        newUserAllocation = BigNumber.from(_rawData[0]).sub(
          formatValue(amount, XSake_DECIMALS)
        );
        newPoolTotalAllocation = BigNumber.from(_rawData[1]).sub(
          formatValue(amount, XSake_DECIMALS)
        );
        newUserAllocation = newUserAllocation.gte(0) ? newUserAllocation : 0;
        newPoolTotalAllocation = newPoolTotalAllocation.gte(0)
          ? newPoolTotalAllocation
          : 0;
      }

      fetchArray = [
        yieldboosterContract.methods.getExpectedMultiplier(
          positionInfo.maxBoostMultiplier,
          positionInfo.amount,
          positionInfo.lpSupply,
          newUserAllocation,
          newPoolTotalAllocation
        ),
      ];
      const expectData = await mcContract.aggregate(fetchArray);

      const _data = {
        usersPositionsAllocation: formatUnits(_rawData[0], XSake_DECIMALS),
        expectBonusMultiplier: BigNumber.from(expectData[0]).toNumber(),
        expectPoolShare: BigNumber.from(positionInfo.amount)
          .mul(1000000)
          .div(positionInfo.lpSupply)
          .toNumber(),
        expectBoostShare:
          alloc ||
          BigNumber.from(_rawData[0]).gt(formatValue(amount, XSake_DECIMALS))
            ? BigNumber.from(newUserAllocation)
                .mul(100)
                .div(newPoolTotalAllocation)
                .toNumber()
            : 0,
        expectTotalAPR: 0,
        expectFarmBaseAPR: 0,
        expectBonusBaseAPR: 0,
        expectEarnedBaseAPR: 0,
        deallocationFeeAmount: (amount * fee) / 100,
      };

      setData(_data);
    };
    fetchData();
    // eslint-disable-next-line
  }, [account, refetch, positionInfo, amount, alloc, fee]);

  return data;
}
