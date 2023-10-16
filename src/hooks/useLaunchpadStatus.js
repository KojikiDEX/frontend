import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  formatUnits,
  getWeb3Contract,
  MulticallContractWeb3,
} from "./contractHelper";
import FairAuctionABI from "../assets/abi/FairAuction.json";
import { CHAIN_ID, ETH_DECIMALS, REFETCH_INTERVAL } from "./connectors";
import { BigNumber } from "@ethersproject/bignumber";
import { fairAuctions } from "../config/fairauctions";

export function useLaunchpadStatus() {
  const [data, setData] = useState([
    {
      hardCapState: false,
      wlStage: false,
      status: false,
      totalRaisedInETH: 0,
      userAllocation: 0,
      symbol: "",
      logo: "",
      fund: "",
    },
  ]);
  const { account } = useWeb3React();

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
      const _items = [];
      for (let index = 0; index < fairAuctions[CHAIN_ID].length; index++) {
        const fairAuctionContract = getWeb3Contract(
          FairAuctionABI,
          fairAuctions[CHAIN_ID][index].contract
        );
        const fetchArray = [
          fairAuctionContract.methods.totalRaised(),
          fairAuctionContract.methods.hasStarted(),
          fairAuctionContract.methods.hasEnded(),
          fairAuctionContract.methods.getRemainingTime(),
          fairAuctionContract.methods.MIN_TOTAL_RAISED_FOR_MAX_PROJECT_TOKEN(),
          fairAuctionContract.methods.MAX_RAISE_AMOUNT(),
          fairAuctionContract.methods.totalAllocation(),
        ];

        if (account) {
          fetchArray.push(fairAuctionContract.methods.userInfo(account));
        }

        const _data = await mcContract.aggregate(fetchArray);

        // const _hardCapState = BigNumber.from(_data[0]).gte(_data[6]);
        // const _softCapState = BigNumber.from(_data[0]).gte(_data[5]);
        const _status = _data[1] && !_data[2] && BigNumber.from(_data[3]).gt(0);
        const _totalRaisedInETH = formatUnits(_data[0], ETH_DECIMALS);
        const _userAllocation =
          account && BigNumber.from(_data[6]).gt(0)
            ? BigNumber.from(_data[7][0]).mul(1000000).div(_data[6])
            : BigNumber.from(0);
        const item = {
          hardCapState: fairAuctions[CHAIN_ID][index].hardcap,
          wlStage: fairAuctions[CHAIN_ID][index].wlStage,
          status: _status,
          totalRaisedInETH: _totalRaisedInETH,
          userAllocation: _userAllocation.toNumber() / 10000,
          symbol: fairAuctions[CHAIN_ID][index].token,
          logo: fairAuctions[CHAIN_ID][index].logo,
          fund: fairAuctions[CHAIN_ID][index].fund,
        };
        _items.push(item);
      }

      setData(_items);
    };
    fetchData();
    // eslint-disable-next-line
  }, [account, fairAuctions, refetch]);

  return data;
}
