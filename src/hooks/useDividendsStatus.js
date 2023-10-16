import { useEffect, useState } from "react";
import {
  formatUnits,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import { contracts } from "../config/contracts";
import {
  CHAIN_ID,
  SAKE_DECIMALS,
  PAIR_DECIMALS,
  REFETCH_INTERVAL,
  SECONDS_PER_YEAR,
  XSake_DECIMALS,
  USDC_DECIMALS,
  ETH_DECIMALS,
} from "./connectors";
import dividendsABI from "../assets/abi/Dividends.json";
import xSakeABI from "../assets/abi/KojikiStakeToken.json";
import LpABI from "../assets/abi/KojikiSwapPair.json";
import ERC20ABI from "../assets/abi/ERC20.json";
import WETHABI from "../assets/abi/WETH.json";
import MulticallABI from "../assets/abi/Multicall.json";
import { ETH_USDC_PAIR } from "../config/contracts";
import { useETHPrice, useSakeprice } from "./useKojikiContext";
import { BigNumber } from "@ethersproject/bignumber";

export function useLpPriceOfUsdcPair(lpAddress) {
  const [lpPrice, setLpPrice] = useState(0);

  const lpContract = getWeb3Contract(LpABI, lpAddress);
  const wethContract = getWeb3Contract(WETHABI, contracts[CHAIN_ID].WETH);
  const mcContract = MulticallContractWeb3();

  let ethPrice = useETHPrice();

  useEffect(() => {
    const fetchData = async () => {
      const fetchArray = [
        lpContract.methods.totalSupply(),
        wethContract.methods.balanceOf(lpAddress),
      ];

      const data = await mcContract.aggregate(fetchArray);
      const _lpPrice = BigNumber.from(data[1])
        .mul(2)
        .mul(ethPrice)
        .div(BigNumber.from(data[0]))
        .div(10 ** 6);

      setLpPrice(_lpPrice.toNumber());
    };
    fetchData();
  }, [mcContract, lpContract, wethContract, lpAddress]);

  return lpPrice;
}

export function useDividendsStatus() {
  const [data, setData] = useState({
    curDistirbutionInUSD: 0,
    curAPY: 0,
    curAPR: 0,
    totalAllocation: 0,
    deallocationFee: 0,
    nextCycleStartTime: 0,
    blockTimestamp: 0,
    cooldown: 0,
    curEpochData: [
      {
        symbol: "",
        token: "",
        token0: "",
        token1: "",
        amount: 0,
        amountInUsd: 0,
      },
    ],
  });

  const dividendsContract = getWeb3Contract(
    dividendsABI,
    contracts[CHAIN_ID].DIVIDENDS
  );
  const xSakeContract = getWeb3Contract(
    xSakeABI,
    contracts[CHAIN_ID].XSakeTOKEN
  );
  const mcContract = MulticallContractWeb3();
  const sakeprice = useSakeprice();
  const multiCallContract = getWeb3Contract(
    MulticallABI,
    contracts[CHAIN_ID].MULTICALLCONTRACT
  );
  const ethUsdcLpPrice = useLpPriceOfUsdcPair(ETH_USDC_PAIR[CHAIN_ID].pairAddr);

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
      try {
        const distributedTokensLength = await dividendsContract.methods
          .distributedTokensLength()
          .call();

        let fetchArray = [
          xSakeContract.methods.symbol(),
          xSakeContract.methods.decimals(),
        ];
        const xSakeTokenInfo = await mcContract.aggregate(fetchArray);

        fetchArray = [];
        for (let index = 0; index < distributedTokensLength; index++) {
          fetchArray.push(dividendsContract.methods.distributedToken(index));
        }

        const distributedTokens = await mcContract.aggregate(fetchArray);

        fetchArray = [];
        for (let index = 0; index < distributedTokens.length; index++) {
          fetchArray.push(
            dividendsContract.methods.dividendsInfo(distributedTokens[index])
          );
        }

        const dividendsInfos = await mcContract.aggregate(fetchArray);

        let _curDistributionAmountInUSD = 0;
        let _curEpochData = [];
        let epochDataItem = {
          symbol: "",
          token: "",
          token0: "",
          token1: "",
          amount: 0,
          amountInUsd: 0,
        };
        for (let index = 0; index < distributedTokensLength; index++) {
          epochDataItem.token = distributedTokens[index];
          if (
            distributedTokens[index] === contracts[CHAIN_ID].saketoken ||
            distributedTokens[index] === contracts[CHAIN_ID].XSakeTOKEN
          ) {
            epochDataItem.symbol = xSakeTokenInfo[0];
            const _amount = formatUnits(
              dividendsInfos[index][0],
              xSakeTokenInfo[1]
            );
            const _amountInUsd =
              sakeprice
                .mul(dividendsInfos[index][0]) // currentDistributionAmount
                .div(BigNumber.from(10).pow(SAKE_DECIMALS))
                .toNumber() /
              10 ** USDC_DECIMALS;

            _curDistributionAmountInUSD += _amountInUsd;
            epochDataItem.amount = _amount;
            epochDataItem.amountInUsd = _amountInUsd;
          } else if (
            distributedTokens[index] === ETH_USDC_PAIR[CHAIN_ID].pairAddr
          ) {
            const _amount = formatUnits(
              dividendsInfos[index][0],
              PAIR_DECIMALS
            );

            const _amountInUsd = ethUsdcLpPrice * _amount;
            _curDistributionAmountInUSD += _amountInUsd;

            epochDataItem.symbol = "ETH-USDC";
            epochDataItem.amount = _amount;
            epochDataItem.amountInUsd = _amountInUsd;
            epochDataItem.token0 = ETH_USDC_PAIR[CHAIN_ID].weth;
            epochDataItem.token1 = ETH_USDC_PAIR[CHAIN_ID].usdc;
          } else {
            _curDistributionAmountInUSD +=
              0 * formatUnits(dividendsInfos[index][0], PAIR_DECIMALS);
          }
          _curEpochData.push(epochDataItem);
        }

        fetchArray = [
          dividendsContract.methods.totalAllocation(),
          dividendsContract.methods.cycleDurationSeconds(),
          dividendsContract.methods.nextCycleStartTime(),
          multiCallContract.methods.getCurrentBlockTimestamp(),
          xSakeContract.methods.usagesDeallocationFee(
            contracts[CHAIN_ID].DIVIDENDS
          ),
        ];

        const thirdInfos = await mcContract.aggregate(fetchArray);

        const _curApr =
          (_curDistributionAmountInUSD * SECONDS_PER_YEAR) /
          thirdInfos[1] /
          (formatUnits(thirdInfos[0], XSake_DECIMALS) * sakeprice);
        let _curAPY = 0;
        if (_curApr) {
          _curAPY = ((1 + _curApr / 365) ** 365 - 1) * 100;
        }

        setData({
          curDistirbutionInUSD: _curDistributionAmountInUSD.toFixed(2), // amount as USDC
          curAPY: _curAPY, // percent
          curAPR: _curApr * 100, // percent
          totalAllocation: formatUnits(thirdInfos[0], XSake_DECIMALS), // amount as xSAKE
          deallocationFee: parseInt(thirdInfos[4]) / 100, // percent
          nextCycleStartTime: thirdInfos[2],
          blockTimestamp: thirdInfos[3],
          cooldown: parseInt(thirdInfos[2]) - parseInt(thirdInfos[3]),
          curEpochData: _curEpochData,
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [mcContract, sakeprice, refetch]);

  return data;
}
