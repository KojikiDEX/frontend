import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  formatUnits,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import ERC20ABI from "../assets/abi/ERC20.json";
import { useETHPrice } from "./useKojikiContext";
import {
  ETH_DECIMALS,
  SAKE_DECIMALS,
  XSake_DECIMALS,
  USDC_DECIMALS,
  REFETCH_INTERVAL,
  CHAIN_ID,
} from "./connectors";
import { BigNumber } from "@ethersproject/bignumber";
import { contracts } from "../config/contracts";
import FairAuctionABI from "../assets/abi/FairAuction.json";
import MulticallABI from "../assets/abi/Multicall.json";

const END_TIME_MANUAL = 1682694000;

export function useLaunchpadDetailStatus(
  fairAuction,
  token0,
  token1,
  treasuryList
) {
  const [data, setData] = useState({
    totalRaisedInETH: 0,
    totalRaisedInUSD: 0,
    tokenPriceInETH: 0,
    tokenPriceInUSD: 0,
    cirMarketcapInUSD: 0,
    fdvInUSD: 0,
    hasStarted: false,
    hasEnded: false,
    coolDown: 0,
    walletCap: 0,
    userToken0: 0,
    userToken1: 0,
    userAllocation: 0,
    userContribution: 0,
    userReferral: 0,
    userReferralPending: 0,
  });
  const { account } = useWeb3React();

  const fairAuctionContract = getWeb3Contract(FairAuctionABI, fairAuction);
  const token0Contract = getWeb3Contract(ERC20ABI, token0);
  const token1Contract = getWeb3Contract(ERC20ABI, token1);
  const mcContract = MulticallContractWeb3();
  const ethPriceInUSD = useETHPrice(); // should be divided by 10**6 to get price as usd
  const multiCallContract = getWeb3Contract(
    MulticallABI,
    contracts[CHAIN_ID].MULTICALLCONTRACT
  );

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
        fairAuctionContract.methods.totalRaised(),
        fairAuctionContract.methods.totalAllocation(),
        fairAuctionContract.methods.tokensToDistribute(),
        token0Contract.methods.totalSupply(),
        token1Contract.methods.totalSupply(),
        token0Contract.methods.balanceOf(fairAuction),
        token1Contract.methods.balanceOf(fairAuction),
        fairAuctionContract.methods.hasStarted(),
        fairAuctionContract.methods.hasEnded(),
        fairAuctionContract.methods.getRemainingTime(),
        fairAuctionContract.methods.MAX_PROJECT_TOKENS_TO_DISTRIBUTE(),
        fairAuctionContract.methods.MAX_PROJECT_TOKENS_2_TO_DISTRIBUTE(),
        fairAuctionContract.methods.MIN_TOTAL_RAISED_FOR_MAX_PROJECT_TOKEN(),
        fairAuctionContract.methods.CAP_PER_WALLET(),
        fairAuctionContract.methods.START_TIME(),
        multiCallContract.methods.getCurrentBlockTimestamp(),
      ];
      if (account) {
        fetchArray.push(fairAuctionContract.methods.userInfo(account));
        fetchArray.push(
          fairAuctionContract.methods.getExpectedClaimAmount(account)
        );
      }

      // for (let index = 0; index < treasuryList.length; index++) {
      //     fetchArray.push(
      //         token0Contract.methods.balanceOf(treasuryList[index])
      //     )
      // }
      // for (let index = 0; index < treasuryList.length; index++) {
      //     fetchArray.push(
      //         token1Contract.methods.balanceOf(treasuryList[index])
      //     )
      // }

      const _data = await mcContract.aggregate(fetchArray);

      const _totalRaisedInETH = formatUnits(_data[0], ETH_DECIMALS);
      const _totalRaisedInUSD = ethPriceInUSD
        ? _totalRaisedInETH * formatUnits(ethPriceInUSD, USDC_DECIMALS)
        : 0;
      const _tokenAmount = BigNumber.from(_data[10]).add(_data[11]);
      let _tokenPriceInETH;
      if (BigNumber.from(_data[0]).lt(_data[12])) {
        _tokenPriceInETH = BigNumber.from(_data[12])
          .mul(BigNumber.from(10).pow(ETH_DECIMALS))
          .div(_tokenAmount);
      } else {
        _tokenPriceInETH = BigNumber.from(_data[0])
          .mul(BigNumber.from(10).pow(ETH_DECIMALS))
          .div(_tokenAmount);
      }
      _tokenPriceInETH = formatUnits(_tokenPriceInETH, ETH_DECIMALS);
      const _tokenPriceInUSD = ethPriceInUSD
        ? _tokenPriceInETH * formatUnits(ethPriceInUSD, USDC_DECIMALS)
        : 0;
      // let _totalSupply = BigNumber.from(_data[3]).add(_data[4]);
      // let _cirSupply = _totalSupply.sub(_data[5]).sub(_data[6]);
      // for (let index = 18; index < _data.length; index++) {
      //     _cirSupply = _cirSupply.sub(_data[index])
      // }
      const _cirMarketcapInUSD =
        formatUnits(BigNumber.from(_data[10]), SAKE_DECIMALS) *
        _tokenPriceInUSD;
      const _fdvInUSD =
        formatUnits(BigNumber.from(_data[10]).add(_data[11]), SAKE_DECIMALS) *
        _tokenPriceInUSD;

      const _hasStarted = _data[7];
      // const _coolDown = !_hasStarted ? (_data[14] - _data[15]) : _data[9]
      const _coolDown = !_hasStarted
        ? _data[14] - _data[15]
        : END_TIME_MANUAL - _data[15];

      setData({
        totalRaisedInETH: _totalRaisedInETH,
        totalRaisedInUSD: _totalRaisedInUSD,
        tokenPriceInETH: _tokenPriceInETH,
        tokenPriceInUSD: _tokenPriceInUSD,
        cirMarketcapInUSD: _cirMarketcapInUSD,
        fdvInUSD: _fdvInUSD,
        hasStarted: _hasStarted,
        hasEnded: _data[8],
        coolDown: _coolDown,
        walletCap: formatUnits(_data[13], ETH_DECIMALS),
        userContribution: account ? formatUnits(_data[16][1], ETH_DECIMALS) : 0,
        userAllocation: account ? formatUnits(_data[16][0], ETH_DECIMALS) : 0,
        userReferral: account ? formatUnits(_data[16][5], ETH_DECIMALS) : 0,
        userReferralPending: account
          ? formatUnits(
              BigNumber.from(_data[16][5]).sub(_data[16][6]),
              ETH_DECIMALS
            )
          : 0,
        userToken0: account ? formatUnits(_data[17][0], SAKE_DECIMALS) : 0,
        userToken1: account ? formatUnits(_data[17][1], XSake_DECIMALS) : 0,
      });
    };
    fetchData();
    // eslint-disable-next-line
  }, [
    account,
    ethPriceInUSD,
    fairAuction,
    token0,
    token1,
    treasuryList,
    refetch,
  ]);

  return data;
}
