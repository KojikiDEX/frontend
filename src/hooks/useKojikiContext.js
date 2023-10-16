import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { getWeb3Contract, MulticallContractWeb3 } from "./contractHelper";
import nftPoolABI from "../assets/abi/NFTPool.json";
import nitroPoolABI from "../assets/abi/NitroPool.json";
import kojikiPairABI from "../assets/abi/KojikiSwapPair.json";
import IKojikiPairABI from "../assets/abi/IKojikiSwapPair.json";
import kojikiRouterABI from "../assets/abi/KojikiSwapRouter.json";
import PriceFeedABI from "../assets/abi/PriceFeed.json";
import masterABI from "../assets/abi/KojikiSwapMaster.json";
import erc20ABI from "../assets/abi/IERC20.json";
import { contracts } from "../config/contracts";
import { supportedNftPools } from "../config/nftPools";
import { supportedNitroPools } from "../config/nitroPools";
import { CHAIN_ID, SECONDS_PER_YEAR } from "./connectors";
import { ETH_USDC_PAIR } from "../config/contracts";
import { BigNumber, ethers } from "ethers";
import { tempAddress } from "../config/tokens";
import { useInterval } from "./use-interval";

export function useETHPrice() {
  let [ethPrice, setEthPrice] = useState();
  const ethUSDCPair = ETH_USDC_PAIR[CHAIN_ID].pairAddr;
  // const ethPriceFeed = contracts[CHAIN_ID].ETHPRICEFEED;

  useEffect(() => {
    (async () => {
      // const priceFeed = getWeb3Contract(PriceFeedABI, ethPriceFeed, CHAIN_ID);
      const pool = getWeb3Contract(kojikiPairABI, ethUSDCPair, CHAIN_ID);

      const mcContract = MulticallContractWeb3();
      const _data = await mcContract.aggregate([
        pool.methods.getReserves(),
        pool.methods.token0(),
        pool.methods.token1(),
        // priceFeed.methods.latestAnswer(),
      ]);

      let numerator = _data[0][1];
      let denominator = _data[0][0];
      if (_data[1] === ETH_USDC_PAIR[CHAIN_ID].usdc) {
        numerator = _data[0][0];
        denominator = _data[0][1];
      }

      const price = BigNumber.from(numerator)
        .mul(BigNumber.from("10").pow(18))
        .div(BigNumber.from(denominator));

      setEthPrice(price);
    })();
  }, [ethUSDCPair]);
  return ethPrice;
}

export function useAssetsPricesInLP(pollingKey) {
  let [lpPriceInUse, setLPPrice] = useState({});
  const chainNftPools = supportedNftPools[CHAIN_ID];

  const ethPriceInUsd = useETHPrice();
  useEffect(() => {
    if (!chainNftPools) {
      return;
    }
    if (!ethPriceInUsd) {
      return;
    }
    (async () => {
      const priceObjects = {};
      for (let chainNFTPool of chainNftPools) {
        let priceOfPair;
        const checkSumAddr = ethers.utils.getAddress(chainNFTPool.address);
        const WETH = contracts[CHAIN_ID].WETH;
        const pool = getWeb3Contract(
          kojikiPairABI,
          chainNFTPool.lpToken,
          CHAIN_ID
        );

        const router = getWeb3Contract(
          kojikiRouterABI,
          contracts[CHAIN_ID].ROUTER,
          CHAIN_ID
        );
        const token0 = chainNFTPool.token1.address;
        const token1 = chainNFTPool.token2.address;

        const reserves = await pool.methods.getReserves().call();

        const numerator = token0 < token1 ? reserves[0] : reserves[1];
        const denominator = token0 < token1 ? reserves[1] : reserves[0];

        if (token0 === WETH) {
          priceOfPair = BigNumber.from(numerator)
            .mul(ethPriceInUsd)
            .mul(2)
            .div(BigNumber.from(10).pow(18));
          priceObjects[checkSumAddr] = priceOfPair;
          continue;
        } else if (token1 === WETH) {
          priceOfPair = BigNumber.from(denominator)
            .mul(ethPriceInUsd)
            .mul(2)
            .div(BigNumber.from(10).pow(18));
          priceObjects[checkSumAddr] = priceOfPair;
          continue;
        }

        if (chainNFTPool.isPairedWithStable) {
          const usdBalance =
            token0 === contracts[CHAIN_ID].USDC ? numerator : denominator;
          priceOfPair = BigNumber.from(usdBalance).mul(2);
          priceObjects[checkSumAddr] = priceOfPair;
          continue;
        }

        const row = [];

        row.push(router.methods.getPair(token0, WETH));
        row.push(router.methods.getPair(token1, WETH));

        const mc = MulticallContractWeb3(CHAIN_ID);
        const pairs = await mc.aggregate(row);

        const poolForToken0 = getWeb3Contract(
          kojikiPairABI,
          pairs[0],
          CHAIN_ID
        );
        const poolForToken1 = getWeb3Contract(
          kojikiPairABI,
          pairs[1],
          CHAIN_ID
        );

        const reservesRow = [];
        reservesRow.push(poolForToken0.methods.getReserves());
        reservesRow.push(poolForToken1.methods.getReserves());
        const reservesForTokens = await mc.aggregate(reservesRow);

        const reserveETHforToken0 =
          token0 < WETH ? reservesForTokens[0][1] : reservesForTokens[0][0];
        const reserveETHforToken1 =
          token1 < WETH ? reservesForTokens[1][1] : reservesForTokens[1][0];

        priceOfPair = BigNumber.from(reserveETHforToken0)
          .add(BigNumber.from(reserveETHforToken1))
          .mul(ethPriceInUsd)
          .mul(2)
          .div(BigNumber.from(10).pow(18));

        priceObjects[checkSumAddr] = priceOfPair;
      }

      setLPPrice(priceObjects);
      // const reserves =  await pool.methods.getReserves().call();
    })();
  }, [chainNftPools, ethPriceInUsd, pollingKey]);
  return lpPriceInUse;
}

export function useAssetPriceInLP(lpAddr) {
  let [lpPriceInUse, setLPPrice] = useState();

  const ethPriceInUsd = useETHPrice();
  useEffect(() => {
    if (!ethPriceInUsd) {
      return;
    }
    (async () => {
      let priceOfPair;
      const WETH = contracts[CHAIN_ID].WETH;
      const pool = getWeb3Contract(kojikiPairABI, lpAddr, CHAIN_ID);

      const router = getWeb3Contract(
        kojikiRouterABI,
        contracts[CHAIN_ID].ROUTER,
        CHAIN_ID
      );

      const mc = MulticallContractWeb3(CHAIN_ID);

      const query = [];
      query.push(pool.methods.token0());
      query.push(pool.methods.token1());
      query.push(pool.methods.getReserves());

      const queryResponse = await mc.aggregate(query);
      const token0 = String(queryResponse[0]).toLowerCase();
      const token1 = String(queryResponse[1]).toLowerCase();

      const reserves = queryResponse[2];

      const numerator = token0 < token1 ? reserves[0] : reserves[1];
      const denominator = token0 < token1 ? reserves[1] : reserves[0];

      if (token0 === WETH.toLowerCase()) {
        priceOfPair = BigNumber.from(numerator)
          .mul(ethPriceInUsd)
          .mul(2)
          .div(BigNumber.from(10).pow(18));
        priceOfPair(priceOfPair);
        // continue;
      } else if (token1 === WETH.toLowerCase()) {
        priceOfPair = BigNumber.from(denominator)
          .mul(ethPriceInUsd)
          .mul(2)
          .div(BigNumber.from(10).pow(18));
        setLPPrice(priceOfPair);
        // continue;
      }

      if (token0 !== WETH.toLowerCase() && token1 !== WETH.toLowerCase()) {
        const usdBalance =
          token0 === contracts[CHAIN_ID].USDC ? numerator : denominator;
        priceOfPair = BigNumber.from(usdBalance);
        setLPPrice(priceOfPair);
        // continue;
      }

      //   const row = [];

      //   row.push(router.methods.getPair(token0, WETH));
      //   row.push(router.methods.getPair(token1, WETH));

      //   const pairs = await mc.aggregate(row);

      //   const poolForToken0 = getWeb3Contract(
      //     kojikiPairABI,
      //     pairs[0],
      //     CHAIN_ID
      //   );
      //   const poolForToken1 = getWeb3Contract(
      //     kojikiPairABI,
      //     pairs[1],
      //     CHAIN_ID
      //   );

      //   const reservesRow = [];
      //   reservesRow.push(poolForToken0.methods.getReserves());
      //   reservesRow.push(poolForToken1.methods.getReserves());
      //   const reservesForTokens = await mc.aggregate(reservesRow);

      //   const reserveETHforToken0 =
      //     token0 < WETH ? reservesForTokens[0][1] : reservesForTokens[0][0];
      //   const reserveETHforToken1 =
      //     token1 < WETH ? reservesForTokens[1][1] : reservesForTokens[1][0];

      //   priceOfPair = BigNumber.from(reserveETHforToken0)
      //     .add(BigNumber.from(reserveETHforToken1))
      //     .mul(ethPriceInUsd)
      //     .mul(2)
      //     .div(BigNumber.from(10).pow(18));

      // setLPPrice(priceOfPair);
    })();
  }, [ethPriceInUsd]);
  return lpPriceInUse;
}

export function useSakeprice() {
  let [sakeprice, setSakeprice] = useState(BigNumber.from(0));
  const ethPrice = useETHPrice();

  const WETH = contracts[CHAIN_ID].WETH;
  const SAKE = contracts[CHAIN_ID].saketoken;
  useEffect(() => {
    if (!ethPrice) {
      return;
    }

    (async () => {
      const router = getWeb3Contract(
        kojikiRouterABI,
        contracts[CHAIN_ID].ROUTER,
        CHAIN_ID
      );
      const sakeEthPair = await router.methods.getPair(SAKE, WETH).call();
      const pool = getWeb3Contract(kojikiPairABI, sakeEthPair, CHAIN_ID);

      const mcContract = MulticallContractWeb3();
      const _data = await mcContract.aggregate([
        pool.methods.getReserves(),
        pool.methods.token0(),
        pool.methods.token1(),
      ]);

      let numerator = _data[0][1];
      let denominator = _data[0][0];
      if (_data[1] === WETH) {
        // token0 is WETH
        numerator = _data[0][0];
        denominator = _data[0][1];
      }
      // const reserves = await pool.methods.getReserves().call();

      // const numerator = SAKE < WETH ? reserves[1] : reserves[0];
      // const denominator = SAKE < WETH ? reserves[0] : reserves[1];
      const price = BigNumber.from(numerator)
        .mul(ethPrice)
        .div(BigNumber.from(denominator));
      setSakeprice(price);
    })();
  }, [ethPrice, WETH, SAKE]);
  return sakeprice;
}

export function useAllNFTPools(priceOfLPs, sakeprice, pollingKey) {
  let [nftPools, setNftPools] = useState([]);
  const context = useWeb3React();
  const { account } = context;

  const chainNftPools = supportedNftPools[CHAIN_ID];

  useEffect(() => {
    // if (!account) {
    //   return;
    // }
    if (
      Object.values(priceOfLPs).length === 0 &&
      priceOfLPs.constructor === Object
    ) {
      return;
    }
    if (!sakeprice) {
      return;
    }
    (async () => {
      //   const nftFactory = getWeb3Contract(
      //     nftFactoryABI,
      //     contracts[CHAIN_ID].NFTPOOLFACTORY,
      //     chainId
      //   );
      //   const poolLength = await nftFactory.methods.poolsLength().call();

      //   const rows = [];

      //   for (let i = 0; i < poolLength; i++) {
      //     rows.push(nftFactory.methods.pools(i));
      //   }

      const mc = MulticallContractWeb3(CHAIN_ID);

      //   const pools = await mc.aggregate(rows);

      const poolRows = [];
      for (let pool of chainNftPools) {
        const nftPool = getWeb3Contract(nftPoolABI, pool.address, CHAIN_ID);
        const lpPair = getWeb3Contract(IKojikiPairABI, pool.lpToken, CHAIN_ID);
        const master = getWeb3Contract(
          masterABI,
          contracts[CHAIN_ID].SWAPMASTER,
          CHAIN_ID
        );
        poolRows.push(
          nftPool.methods.balanceOf(
            account == undefined ? tempAddress : account
          )
        );
        poolRows.push(nftPool.methods.getPoolInfo());
        poolRows.push(lpPair.methods.totalSupply());
        poolRows.push(master.methods.getPoolInfo(pool.address));
        poolRows.push(nftPool.methods.getMultiplierSettings());
      }
      const poolInfo = await mc.aggregate(poolRows);

      const poolInfos = [];
      let offset = 5;

      const poolToPositionMap = {};
      for (let pool of chainNftPools) {
        let index = chainNftPools.indexOf(pool);
        if (parseInt(poolInfo[index * offset], 10) > 0) {
          const nftPool = getWeb3Contract(nftPoolABI, pool.address, CHAIN_ID);
          const tokenIDsForPool = [];
          for (let i = 0; i < parseInt(poolInfo[index * offset], 10); i++) {
            const tokenId = await nftPool.methods
              .tokenOfOwnerByIndex(
                account == undefined ? tempAddress : account,
                i
              )
              .call();

            tokenIDsForPool.push(tokenId);
          }

          const rows = [];
          for (let tokenId of tokenIDsForPool) {
            rows.push(nftPool.methods.getStakingPosition(tokenId));
            rows.push(nftPool.methods.pendingRewards(tokenId));
          }

          const stakingInfoForTokenIds = await mc.aggregate(rows);

          poolToPositionMap[pool.address] = {
            tokenIDsForPool: tokenIDsForPool,
            stakingInfoForTokenIds: stakingInfoForTokenIds,
          };
        }
      }

      let index = 0;
      for (let pool of chainNftPools) {
        const poolRewardPerYear = BigNumber.from(SECONDS_PER_YEAR).mul(
          BigNumber.from(poolInfo[index * offset + 3][4]).add(
            poolInfo[index * offset + 3][3]
          )
        );
        const checkSumdAddr = ethers.utils.getAddress(pool.address);
        const tvl = BigNumber.from(poolInfo[index * offset + 1][5])
          .mul(priceOfLPs[checkSumdAddr])
          .div(BigNumber.from(poolInfo[index * offset + 2]));
        const poolRewardPerYearInUSD = poolRewardPerYear.mul(
          BigNumber.from(sakeprice)
        );
        const APY = tvl.eq(0) ? 0 : poolRewardPerYearInUSD.div(tvl).mul(100);
        const userBalance = parseInt(poolInfo[index * offset], 10);
        const lpTotalSupply = poolInfo[index * offset + 2];
        const lpAssetPrice = priceOfLPs[checkSumdAddr];
        let totalDeposit = BigNumber.from("0");
        let pendingRewards = BigNumber.from("0");
        const userPositions = [];

        if (userBalance > 0) {
          const tokenIDsForPool =
            poolToPositionMap[pool.address].tokenIDsForPool;
          const stakingInfoForTokenIds =
            poolToPositionMap[pool.address].stakingInfoForTokenIds;

          const offset_ = 2;
          let idex = 0;
          for (let tokenId of tokenIDsForPool) {
            let pending = BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][1]
            )
              .mul(BigNumber.from(poolInfo[index * offset + 1][4]))
              .div(BigNumber.from(10).pow(18))
              .sub(BigNumber.from(stakingInfoForTokenIds[idex * offset_][5]));
            //amountWithMultiplier * accRewardsPerShare / 10 ^ 18 - rewardDebt
            let kojikiStakeTokenRewards = pending
              .mul(BigNumber.from("8000"))
              .div(BigNumber.from(10000)); //pending * 0.8
            let kojikiTokenReward = pending.sub(kojikiStakeTokenRewards);
            userPositions.push({
              symbol: pool.symbol,
              tokenId: tokenId,
              poolAddr: pool.address,
              poolInfo: poolInfo[index * offset + 1],
              lpToken: poolInfo[index * offset + 1][0],
              kojikiToken: poolInfo[index * offset + 1][1],
              kojikiStakeToken: poolInfo[index * offset + 1][2],
              lastRewardTime: poolInfo[index * offset + 1][3],
              accRewardsPerShare: poolInfo[index * offset + 1][4],
              lpSupply: poolInfo[index * offset + 1][5],
              lpSupplyWithMultiplier: poolInfo[index * offset + 1][6],
              allocPoint: poolInfo[index * offset + 1][7],
              lpAssetPrice: lpAssetPrice,
              amount: stakingInfoForTokenIds[idex * offset_][0],
              amountInUSD: BigNumber.from(
                stakingInfoForTokenIds[idex * offset_][0]
              )
                .mul(lpAssetPrice)
                .div(lpTotalSupply),
              lpTotalSupply: lpTotalSupply,
              amountWithMultiplier: stakingInfoForTokenIds[idex * offset_][1],
              startLockTime: stakingInfoForTokenIds[idex * offset_][2],
              lockDuration: stakingInfoForTokenIds[idex * offset_][3],
              lockMultiplier: stakingInfoForTokenIds[idex * offset_][4],
              rewardDebt: stakingInfoForTokenIds[idex * offset_][5],
              boostMultiplier: BigNumber.from(
                stakingInfoForTokenIds[idex * offset_][7]
              )
                .sub(stakingInfoForTokenIds[idex * offset_][4])
                .toNumber(),
              boostPoints: stakingInfoForTokenIds[idex * offset_][6],
              totalMultiplier: stakingInfoForTokenIds[idex * offset_][7],
              pendingRewards: stakingInfoForTokenIds[idex * offset_ + 1],
              poolAPY: APY,
              isNitroPool: false,
              matchingNitro: pool.matchingNitro,
              kojikiTokenReward: kojikiTokenReward,
              kojikiStakeTokenRewards: kojikiStakeTokenRewards,
              totalPendingRewards: 0,
              totalPendingRewardsInUSD: 0,
              token0: pool.token1,
              token1: pool.token2,
              maxGlobalMultiplier: poolInfo[index * offset + 4][0],
              maxLockDuration: poolInfo[index * offset + 4][1],
              maxLockMultiplier: poolInfo[index * offset + 4][2],
              maxBoostMultiplier: poolInfo[index * offset + 4][3],
            });
            totalDeposit = totalDeposit.add(
              BigNumber.from(stakingInfoForTokenIds[idex * offset_][0])
            );
            pendingRewards = pendingRewards.add(
              BigNumber.from(stakingInfoForTokenIds[idex * offset_ + 1])
            );
            idex++;
          }
        }

        poolInfos.push({
          symbol: pool.symbol,
          poolAddr: pool.address,
          userBalance: userBalance,
          poolInfo: poolInfo,
          lpToken: poolInfo[index * offset + 1][0],
          kojikiToken: poolInfo[index * offset + 1][1],
          sKojikiToken: poolInfo[index * offset + 1][2],
          lastRewardTime: poolInfo[index * offset + 1][3],
          accRewardsPerShare: poolInfo[index * offset + 1][4],
          lpSupply: poolInfo[index * offset + 1][5],
          lpSupplyWithMultiplier: poolInfo[index * offset + 1][6],
          allocPoint: poolInfo[index * offset + 1][7],
          lpTotalSupply: lpTotalSupply,
          lpAssetPrice: lpAssetPrice,
          tvl: tvl,
          poolAPY: APY,
          token0: pool.token1,
          token1: pool.token2,
          isNitroPool: false,
          userPositions: userPositions,
          totalDeposit: totalDeposit, // total deposit amount for user
          totalDepositInUsd: totalDeposit.mul(lpAssetPrice).div(lpTotalSupply),
          pendingRewards: pendingRewards,
          matchingNitro: pool.matchingNitro,
          totalPendingRewards: 0,
          totalPendingRewardsInUSD: 0,
        });

        index++;
      }
      setNftPools(poolInfos);
    })();
  }, [account, priceOfLPs, sakeprice, pollingKey]);

  return nftPools;
}

export function useAllNitroPools(priceOfLPs, sakeprice, pollingKey) {
  const context = useWeb3React();
  const { account } = context;
  let [nitroPools, setNitroPools] = useState([]);
  const chainNitroPools = supportedNitroPools[CHAIN_ID];

  //   const priceOfLPs = useAssetsPricesInLP();
  // const sakeprice = useSakeprice();

  useEffect(() => {
    // if (!account) {
    //   return;
    // }

    if (
      Object.values(priceOfLPs).length === 0 &&
      priceOfLPs.constructor === Object
    ) {
      return;
    }
    if (!sakeprice) {
      return;
    }
    // if (Object.values(priceOfLPs).length === 0 && priceOfLPs.constructor === Object) {
    //     return;
    // }
    // if (!sakeprice){
    //     return;
    // }

    (async () => {
      //   const nitroPoolFactory = getWeb3Contract(
      //     nitroPoolFactoryABI,
      //     contracts[CHAIN_ID].NITROPOOLFACTORY,
      //     chainId
      //   );
      //   const poolLength = await nitroPoolFactory.methods
      //     .nitroPoolsLength()
      //     .call();

      //   const rows = [];

      //   for (let i = 0; i < poolLength; i++) {
      //     rows.push(nitroPoolFactory.methods.getNitroPool(i));
      //   }
      //   const pools = await mc.aggregate(rows);
      const mc = MulticallContractWeb3();

      const rowInfo = [];
      for (let pool of chainNitroPools) {
        const nitroPool = getWeb3Contract(nitroPoolABI, pool.address, CHAIN_ID);
        const nftPool = getWeb3Contract(nftPoolABI, pool.nftPool, CHAIN_ID);
        const lpPair = getWeb3Contract(IKojikiPairABI, pool.lpToken, CHAIN_ID);
        const master = getWeb3Contract(
          masterABI,
          contracts[CHAIN_ID].SWAPMASTER,
          CHAIN_ID
        );
        rowInfo.push(
          nitroPool.methods.userTokenIdsLength(
            account == undefined ? tempAddress : account
          )
        );
        rowInfo.push(nitroPool.methods.settings());
        rowInfo.push(nitroPool.methods.totalDepositAmount());
        rowInfo.push(
          nitroPool.methods.userInfo(
            account == undefined ? tempAddress : account
          )
        );
        rowInfo.push(nftPool.methods.getPoolInfo());
        rowInfo.push(lpPair.methods.totalSupply());
        rowInfo.push(master.methods.getPoolInfo(pool.nftPool));
        rowInfo.push(nitroPool.methods.rewardsToken1());
        rowInfo.push(
          nitroPool.methods.pendingRewards(
            account == undefined ? tempAddress : account
          )
        );
        rowInfo.push(nftPool.methods.getMultiplierSettings());
        rowInfo.push(nitroPool.methods.rewardsToken1PerSecond());
      }

      const poolInfos = await mc.aggregate(rowInfo);

      let index = 0;
      let offset = 11;
      const retInfo = [];
      for (let pool of chainNitroPools) {
        const lpSupply = poolInfos[index * offset + 2];
        const poolRewardPerYear = BigNumber.from(
          poolInfos[index * offset + 7][2]
        );
        const checkSumedAddr = ethers.utils.getAddress(pool.nftPool);
        const lpAssetPrice = priceOfLPs[checkSumedAddr];
        const poolRewardPerYearInUSD = poolRewardPerYear.mul(
          BigNumber.from(sakeprice)
        ); //.div(BigNumber.from(10).pow(6));
        const tvl = BigNumber.from(poolInfos[index * offset + 2])
          .mul(priceOfLPs[checkSumedAddr])
          .div(BigNumber.from(poolInfos[index * offset + 5]));
        const APY = tvl.eq(0)
          ? poolRewardPerYearInUSD.div(1000000).mul(100)
          : poolRewardPerYearInUSD.div(tvl).mul(100);

        // const poolRewardPerYear = BigNumber.from(SECONDS_PER_YEAR).mul(BigNumber.from(poolInfo[index * offset + 3][4]).add(poolInfo[index * offset + 3][3]));
        // const tvl = BigNumber.from(poolInfo[index * offset + 1][5]).mul(priceOfLPs[pool.address]).div(BigNumber.from(poolInfo[index * offset + 2]));
        // const poolRewardPerYearInUSD = poolRewardPerYear.mul(BigNumber.from(sakeprice));
        // const farmBasedAPY =
        const totalDeposit = poolInfos[index * offset + 3][0];
        const lpTotalSupply = poolInfos[index * offset + 5];
        let pendingRewards = BigNumber.from("0");
        const userPositions = [];
        const totalPendingRewards = BigNumber.from(
          poolInfos[index * offset + 7][2]
        );
        const totalPendingRewardsInUSD = totalPendingRewards.mul(
          BigNumber.from(sakeprice)
        );
        if (parseInt(poolInfos[index * offset]) > 0) {
          // userTokenIdLength > 0
          const nitroPoolContract = getWeb3Contract(nitroPoolABI, pool.address);
          const nftPool = getWeb3Contract(nftPoolABI, pool.nftPool, CHAIN_ID);
          const tokenIdForPool = [];
          for (let i = 0; i < parseInt(poolInfos[index * offset]); i++) {
            const tokenId = await nitroPoolContract.methods
              .userTokenId(account == undefined ? tempAddress : account, i)
              .call();
            tokenIdForPool.push(tokenId);
          }
          const rows = [];
          for (let tokenId of tokenIdForPool) {
            rows.push(nftPool.methods.getStakingPosition(tokenId));
            rows.push(
              nitroPoolContract.methods.pendingRewards(
                account == undefined ? tempAddress : account
              )
            );
          }
          const stakingInfoForTokenIds = await mc.aggregate(rows);

          let idex = 0;
          const offset_ = 2;

          for (let tokenId of tokenIdForPool) {
            let pending = BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][1]
            )
              .mul(BigNumber.from(poolInfos[index * offset + 4][4]))
              .div(BigNumber.from(10).pow(18))
              .sub(BigNumber.from(stakingInfoForTokenIds[idex * offset_][5]));
            //amountWithMultiplier * accRewardsPerShare / 10 ^ 18 - rewardDebt
            // let kojikiStakeTokenRewards = pending.mul(BigNumber.from("8000"))
            //   .div(BigNumber.from(10000)); //pending * 0.8
            let kojikiStakeTokenRewards = BigNumber.from(
              poolInfos[index * offset + 3][3]
            );
            let kojikiTokenReward = pending.sub(kojikiStakeTokenRewards);

            userPositions.push({
              symbol: pool.symbol,
              tokenId: tokenId,
              poolAddr: pool.nftPool,
              nitroPoolAddr: pool.address,
              poolInfo: poolInfos[index * offset + 4],
              lpToken: poolInfos[index * offset + 4][0],
              kojikiToken: poolInfos[index * offset + 4][1],
              kojikiStakeToken: poolInfos[index * offset + 4][2],
              lastRewardTime: poolInfos[index * offset + 4][3],
              accRewardsPerShare: poolInfos[index * offset + 4][4],
              lpSupply: lpSupply,
              lpSupplyWithMultiplier: poolInfos[index * offset + 4][6],
              allocPoint: poolInfos[index * offset + 4][7],
              lpAssetPrice: lpAssetPrice,
              rewardDebtToken1: poolInfos[index * offset + 3][1],
              rewardDebtToken2: poolInfos[index * offset + 3][2],
              pendingRewardsToken1: poolInfos[index * offset + 3][3], // can't be harvested before harvestStartTime
              pendingRewardsToken2: poolInfos[index * offset + 3][4], // can't be harvested before harvestStartTime
              amount: stakingInfoForTokenIds[idex * offset_][0],
              amountInUSD: BigNumber.from(
                stakingInfoForTokenIds[idex * offset_][0]
              )
                .mul(lpAssetPrice)
                .div(lpTotalSupply),
              lpTotalSupply: lpTotalSupply,
              amountWithMultiplier: stakingInfoForTokenIds[idex * offset_][1],
              startLockTime: stakingInfoForTokenIds[idex * offset_][2],
              lockDuration: stakingInfoForTokenIds[idex * offset_][3],
              lockMultiplier: stakingInfoForTokenIds[idex * offset_][4],
              rewardDebt: stakingInfoForTokenIds[idex * offset_][5],
              boostPoints: stakingInfoForTokenIds[idex * offset_][6],
              boostMultiplier: BigNumber.from(
                stakingInfoForTokenIds[idex * offset_][7]
              )
                .sub(stakingInfoForTokenIds[idex * offset_][4])
                .toNumber(),
              totalMultiplier: stakingInfoForTokenIds[idex * offset_][7],
              pendingRewards: BigNumber.from(
                stakingInfoForTokenIds[idex * offset_ + 1][0]
              ),
              poolAPY: APY,
              isNitroPool: true,
              kojikiTokenReward: kojikiTokenReward,
              kojikiStakeTokenRewards: kojikiStakeTokenRewards,
              totalPendingRewards: totalPendingRewards,
              totalPendingRewardsInUSD: totalPendingRewardsInUSD,
              nitroAPY: APY,
              token0: pool.token1,
              token1: pool.token2,
              maxGlobalMultiplier: poolInfos[index * offset + 9][0],
              maxLockDuration: poolInfos[index * offset + 9][1],
              maxLockMultiplier: poolInfos[index * offset + 9][2],
              maxBoostMultiplier: poolInfos[index * offset + 9][3],
            });
            pendingRewards = pendingRewards.add(
              BigNumber.from(stakingInfoForTokenIds[idex * offset_ + 1][0])
            );
            idex++;
          }
        }

        retInfo.push({
          symbol: pool.symbol,
          nitroPoolAddr: pool.address,
          // poolAddr: pool.nftPool,
          userBalance: poolInfos[index * offset],
          // userTokenIdLength: ,
          poolInfo: poolInfos[index * offset + 4],
          lpToken: poolInfos[index * offset + 4][0],
          kojikiToken: poolInfos[index * offset + 4][1],
          sKojikiToken: poolInfos[index * offset + 4][2],
          lastRewardTime: poolInfos[index * offset + 4][3],
          accRewardsPerShare: poolInfos[index * offset + 7][3], //nitroPool.methods.rewardsToken1()
          lpSupply: lpSupply,
          lpSupplyWithMultiplier: poolInfos[index * offset + 4][6],
          allocPoint: poolInfos[index * offset + 4][7],
          settings: poolInfos[index * offset + 1],
          token0Symbol: pool.token1.symbol,
          token1Symbol: pool.token2.symbol,
          poolAddr: pool.nftPool,
          token0: pool.token1,
          token1: pool.token2,
          isNitroPool: true,
          tvl: tvl,
          poolAPY: APY,
          lpSupply: lpSupply, // totalDepositAmount for pool.
          lpTotalSupply: lpTotalSupply, //
          lpAssetPrice: lpAssetPrice,
          totalDeposit: totalDeposit, //total deposit amount for user
          totalDepositInUsd: BigNumber.from(totalDeposit)
            .mul(lpAssetPrice)
            .div(lpTotalSupply),
          pendingRewards: pendingRewards,
          userPositions: userPositions,
          totalPendingRewards: totalPendingRewards,
          totalPendingRewardsInUSD: totalPendingRewardsInUSD,
          rewardsToken1PerSecond: poolInfos[index * offset + 10],
        });
        index++;
      }
      setNitroPools(retInfo);
    })();
  }, [account, priceOfLPs, sakeprice, pollingKey]);

  return nitroPools;
}

export function useUserPositions(pools, nitrPools, account, chainId) {
  let [userPositions, setUserPositions] = useState([]);
  useEffect(() => {
    // if (!account) {
    //   return;
    // }
    if (pools.length === 0) {
      return;
    }
    (async () => {
      const userDepositPools = [];
      for (let pool of pools) {
        if (pool.userBalance > 0) {
          userDepositPools.push(pool);
        }
      }

      const mc = MulticallContractWeb3();
      const tokenIDsForPool = [];

      for (let depositPool of userDepositPools) {
        const nftPool = getWeb3Contract(nftPoolABI, depositPool.poolAddr);
        for (let i = 0; i < depositPool.userBalance; i++) {
          const tokenId = await nftPool.methods
            .tokenOfOwnerByIndex(account, i)
            .call();
          tokenIDsForPool.push({
            tokenId: tokenId,
            pool: depositPool,
          });
        }
      }

      const rows = [];

      for (let element of tokenIDsForPool) {
        const nftPool = getWeb3Contract(nftPoolABI, element.pool.poolAddr);
        rows.push(nftPool.methods.getStakingPosition(element.tokenId));
        rows.push(nftPool.methods.pendingRewards(element.tokenId));
        rows.push(nftPool.methods.getMultiplierSettings());
      }

      const stakingInfoForTokenIds = await mc.aggregate(rows);

      let index = 0;
      const offset = 3;
      let positions = [];
      for (let element of tokenIDsForPool) {
        positions.push({
          symbol: element.pool.symbol,
          tokenId: element.tokenId,
          poolAddr: element.pool.poolAddr,
          poolInfo: element.pool.poolInfo,
          lpToken: element.pool.poolInfo[0],
          kojikiToken: element.pool.poolInfo[1],
          kojikiStakeToken: element.pool.poolInfo[2],
          lastRewardTime: element.pool.poolInfo[3],
          accRewardsPerShare: element.pool.poolInfo[4],
          lpSupply: element.pool.poolInfo[5],
          lpSupplyWithMultiplier: element.pool.poolInfo[6],
          allocPoint: element.pool.poolInfo[7],
          lpAssetPrice: element.pool.lpAssetPrice,
          amount: stakingInfoForTokenIds[index * offset][0],
          amountInUSD: BigNumber.from(stakingInfoForTokenIds[index * offset][0])
            .mul(element.pool.lpAssetPrice)
            .div(element.pool.lpTotalSupply),
          lpTotalSupply: element.pool.lpTotalSupply,
          amountWithMultiplier: stakingInfoForTokenIds[index * offset][1],
          startLockTime: stakingInfoForTokenIds[index * offset][2],
          lockDuration: stakingInfoForTokenIds[index * offset][3],
          lockMultiplier: stakingInfoForTokenIds[index * offset][4],
          boostMultiplier: BigNumber.from(
            stakingInfoForTokenIds[index * offset][7]
          )
            .sub(stakingInfoForTokenIds[index * offset][4])
            .toNumber(),
          rewardDebt: stakingInfoForTokenIds[index * offset][5],
          boostPoints: stakingInfoForTokenIds[index * offset][6],
          totalMultiplier: stakingInfoForTokenIds[index * offset][7],
          pendingRewards: stakingInfoForTokenIds[index * offset + 1],
          poolAPY: element.pool.poolAPY,
          maxGlobalMultiplier: stakingInfoForTokenIds[index * offset + 2][0],
          maxLockDuration: stakingInfoForTokenIds[index * offset + 2][1],
          maxLockMultiplier: stakingInfoForTokenIds[index * offset + 2][2],
          maxBoostMultiplier: stakingInfoForTokenIds[index * offset + 2][3],
        });
        index++;
      }
      setUserPositions(positions);
    })();
  }, [account, pools, chainId]);

  return userPositions;
}

export function useNitroPool(poolInfo) {
  const context = useWeb3React();
  const { account } = context;
  let [nitroPool, setNitroPool] = useState({});
  const priceOfLP = useAssetPriceInLP(poolInfo.lpToken);
  const sakeprice = useSakeprice();

  useEffect(() => {
    if (!priceOfLP) {
      return;
    }

    if (!sakeprice) {
      return;
    }

    (async () => {
      const mc = MulticallContractWeb3();

      const rowInfo = [];
      const nitroPool = getWeb3Contract(
        nitroPoolABI,
        poolInfo.nitroPoolAddr,
        CHAIN_ID
      );
      const nftPool = getWeb3Contract(nftPoolABI, poolInfo.nftPool, CHAIN_ID);
      const lpPair = getWeb3Contract(
        IKojikiPairABI,
        poolInfo.lpToken,
        CHAIN_ID
      );
      const master = getWeb3Contract(
        masterABI,
        contracts[CHAIN_ID].SWAPMASTER,
        CHAIN_ID
      );
      rowInfo.push(
        nitroPool.methods.userTokenIdsLength(
          account == undefined ? tempAddress : account
        )
      );
      rowInfo.push(nitroPool.methods.settings());
      rowInfo.push(nitroPool.methods.totalDepositAmount());
      rowInfo.push(
        nitroPool.methods.userInfo(account == undefined ? tempAddress : account)
      );
      rowInfo.push(nftPool.methods.getPoolInfo());
      rowInfo.push(lpPair.methods.totalSupply());
      rowInfo.push(master.methods.getPoolInfo(poolInfo.nftPool));
      rowInfo.push(nitroPool.methods.rewardsToken1());
      rowInfo.push(
        nitroPool.methods.pendingRewards(
          account == undefined ? tempAddress : account
        )
      );
      rowInfo.push(nftPool.methods.getMultiplierSettings());
      rowInfo.push(nitroPool.methods.rewardsToken1PerSecond());

      const poolInfos = await mc.aggregate(rowInfo);

      const lpSupply = poolInfos[2];
      const poolRewardPerYear = BigNumber.from(poolInfos[7][2]);
      const checkSumedAddr = ethers.utils.getAddress(poolInfo.nftPool);
      const lpAssetPrice = priceOfLP;
      const poolRewardPerYearInUSD = poolRewardPerYear.mul(
        BigNumber.from(sakeprice)
      ); //.div(BigNumber.from(10).pow(6));
      const tvl = BigNumber.from(poolInfos[2])
        .mul(priceOfLP)
        .div(BigNumber.from(poolInfos[5]));
      const APY = tvl.eq(0)
        ? poolRewardPerYearInUSD.div(1000000).mul(100)
        : poolRewardPerYearInUSD.div(tvl).mul(100);

      // const poolRewardPerYear = BigNumber.from(SECONDS_PER_YEAR).mul(BigNumber.from(poolInfo[index * offset + 3][4]).add(poolInfo[index * offset + 3][3]));
      // const tvl = BigNumber.from(poolInfo[index * offset + 1][5]).mul(priceOfLPs[pool.address]).div(BigNumber.from(poolInfo[index * offset + 2]));
      // const poolRewardPerYearInUSD = poolRewardPerYear.mul(BigNumber.from(sakeprice));
      // const farmBasedAPY =
      const totalDeposit = poolInfos[3][0];
      const lpTotalSupply = poolInfos[5];
      let pendingRewards = BigNumber.from("0");
      const userPositions = [];
      const totalPendingRewards = BigNumber.from(poolInfos[7][2]);
      const totalPendingRewardsInUSD = totalPendingRewards.mul(
        BigNumber.from(sakeprice)
      );
      if (parseInt(poolInfos[0]) > 0) {
        // userTokenIdLength > 0
        const nitroPoolContract = getWeb3Contract(
          nitroPoolABI,
          poolInfo.address
        );
        const nftPool = getWeb3Contract(nftPoolABI, poolInfo.nftPool, CHAIN_ID);
        const tokenIdForPool = [];
        for (let i = 0; i < parseInt(poolInfos[0]); i++) {
          const tokenId = await nitroPoolContract.methods
            .userTokenId(account == undefined ? tempAddress : account, i)
            .call();
          tokenIdForPool.push(tokenId);
        }
        const rows = [];
        for (let tokenId of tokenIdForPool) {
          rows.push(nftPool.methods.getStakingPosition(tokenId));
          rows.push(
            nitroPoolContract.methods.pendingRewards(
              account == undefined ? tempAddress : account
            )
          );
        }
        const stakingInfoForTokenIds = await mc.aggregate(rows);

        let idex = 0;
        const offset_ = 2;

        for (let tokenId of tokenIdForPool) {
          let pending = BigNumber.from(
            stakingInfoForTokenIds[idex * offset_][1]
          )
            .mul(BigNumber.from(poolInfos[4][4]))
            .div(BigNumber.from(10).pow(18))
            .sub(BigNumber.from(stakingInfoForTokenIds[idex * offset_][5]));
          //amountWithMultiplier * accRewardsPerShare / 10 ^ 18 - rewardDebt
          // let kojikiStakeTokenRewards = pending.mul(BigNumber.from("8000"))
          //   .div(BigNumber.from(10000)); //pending * 0.8
          let kojikiStakeTokenRewards = BigNumber.from(poolInfos[3][3]);
          let kojikiTokenReward = pending.sub(kojikiStakeTokenRewards);

          userPositions.push({
            symbol: poolInfo.symbol,
            tokenId: tokenId,
            poolAddr: poolInfo.poolAddr,
            nitroPoolAddr: poolInfo.nitroPoolAddr,
            poolInfo: poolInfos[4],
            lpToken: poolInfos[4][0],
            kojikiToken: poolInfos[4][1],
            kojikiStakeToken: poolInfos[4][2],
            lastRewardTime: poolInfos[4][3],
            accRewardsPerShare: poolInfos[4][4],
            lpSupply: lpSupply,
            lpSupplyWithMultiplier: poolInfos[4][6],
            allocPoint: poolInfos[4][7],
            lpAssetPrice: lpAssetPrice,
            rewardDebtToken1: poolInfos[3][1],
            rewardDebtToken2: poolInfos[3][2],
            pendingRewardsToken1: poolInfos[3][3], // can't be harvested before harvestStartTime
            pendingRewardsToken2: poolInfos[3][4], // can't be harvested before harvestStartTime
            amount: stakingInfoForTokenIds[idex * offset_][0],
            amountInUSD: BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][0]
            )
              .mul(lpAssetPrice)
              .div(lpTotalSupply),
            lpTotalSupply: lpTotalSupply,
            amountWithMultiplier: stakingInfoForTokenIds[idex * offset_][1],
            startLockTime: stakingInfoForTokenIds[idex * offset_][2],
            lockDuration: stakingInfoForTokenIds[idex * offset_][3],
            lockMultiplier: stakingInfoForTokenIds[idex * offset_][4],
            rewardDebt: stakingInfoForTokenIds[idex * offset_][5],
            boostPoints: stakingInfoForTokenIds[idex * offset_][6],
            boostMultiplier: BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][7]
            )
              .sub(stakingInfoForTokenIds[idex * offset_][4])
              .toNumber(),
            totalMultiplier: stakingInfoForTokenIds[idex * offset_][7],
            pendingRewards: BigNumber.from(
              stakingInfoForTokenIds[idex * offset_ + 1][0]
            ),
            poolAPY: APY,
            isNitroPool: true,
            kojikiTokenReward: kojikiTokenReward,
            kojikiStakeTokenRewards: kojikiStakeTokenRewards,
            totalPendingRewards: totalPendingRewards,
            totalPendingRewardsInUSD: totalPendingRewardsInUSD,
            nitroAPY: APY,
            token0: poolInfo.token0,
            token1: poolInfo.token1,
            maxGlobalMultiplier: poolInfos[9][0],
            maxLockDuration: poolInfos[9][1],
            maxLockMultiplier: poolInfos[9][2],
            maxBoostMultiplier: poolInfos[9][3],
          });
          pendingRewards = pendingRewards.add(
            BigNumber.from(stakingInfoForTokenIds[idex * offset_ + 1][0])
          );
          idex++;
        }
      }
      setNitroPool({
        symbol: poolInfo.symbol,
        nitroPoolAddr: poolInfo.nitroPoolAddr,
        // poolAddr: pool.nftPool,
        userBalance: poolInfos[0],
        // userTokenIdLength: ,
        poolInfo: poolInfos[4],
        lpToken: poolInfos[4][0],
        kojikiToken: poolInfos[4][1],
        sKojikiToken: poolInfos[4][2],
        lastRewardTime: poolInfos[4][3],
        accRewardsPerShare: poolInfos[7][3], //nitroPool.methods.rewardsToken1()
        lpSupply: lpSupply,
        lpSupplyWithMultiplier: poolInfos[4][6],
        allocPoint: poolInfos[4][7],
        settings: poolInfos[1],
        token0Symbol: poolInfo.token0.symbol,
        token1Symbol: poolInfo.token1.symbol,
        poolAddr: poolInfo.poolAddr,
        token0: poolInfo.token0,
        token1: poolInfo.token1,
        isNitroPool: true,
        tvl: tvl,
        poolAPY: APY,
        lpSupply: lpSupply, // totalDepositAmount for pool.
        lpTotalSupply: lpTotalSupply, //
        lpAssetPrice: lpAssetPrice,
        totalDeposit: totalDeposit, //total deposit amount for user
        totalDepositInUsd: BigNumber.from(totalDeposit)
          .mul(lpAssetPrice)
          .div(lpTotalSupply),
        pendingRewards: pendingRewards,
        userPositions: userPositions,
        totalPendingRewards: totalPendingRewards,
        totalPendingRewardsInUSD: totalPendingRewardsInUSD,
        rewardsToken1PerSecond: poolInfos[10],
      });
    })();
  }, [account, priceOfLP, sakeprice]);

  return nitroPool;
}

export function useNFTPool(poolInfo) {
  let [nftPool, setNftPool] = useState({});
  const context = useWeb3React();
  const { account } = context;
  const priceOfLP = useAssetPriceInLP(poolInfo.lpToken);
  const sakeprice = useSakeprice();

  useEffect(() => {
    // if (!account) {
    //   return;
    // }
    if (!priceOfLP) {
      return;
    }

    if (!sakeprice) {
      return;
    }
    (async () => {
      const mc = MulticallContractWeb3(CHAIN_ID);

      const query = [];
      const nftPool = getWeb3Contract(nftPoolABI, poolInfo.poolAddr, CHAIN_ID);
      const lpPair = getWeb3Contract(
        IKojikiPairABI,
        poolInfo.lpToken,
        CHAIN_ID
      );
      const master = getWeb3Contract(
        masterABI,
        contracts[CHAIN_ID].SWAPMASTER,
        CHAIN_ID
      );
      query.push(
        nftPool.methods.balanceOf(account == undefined ? tempAddress : account)
      );
      query.push(nftPool.methods.getPoolInfo());
      query.push(lpPair.methods.totalSupply());
      query.push(master.methods.getPoolInfo(poolInfo.poolAddr));
      query.push(nftPool.methods.getMultiplierSettings());
      const queryResponse = await mc.aggregate(query);

      const poolInfos = [];

      const tokenIDsForPool = [];
      let stakingInfoForTokenIds = [];
      const userBalance = parseInt(queryResponse[0], 10);

      if (userBalance > 0) {
        const nftPool = getWeb3Contract(
          nftPoolABI,
          poolInfo.poolAddr,
          CHAIN_ID
        );
        for (let i = 0; i < parseInt(queryResponse[0], 10); i++) {
          const tokenId = await nftPool.methods
            .tokenOfOwnerByIndex(
              account == undefined ? tempAddress : account,
              i
            )
            .call();

          tokenIDsForPool.push(tokenId);
        }

        const rows = [];
        for (let tokenId of tokenIDsForPool) {
          rows.push(nftPool.methods.getStakingPosition(tokenId));
          rows.push(nftPool.methods.pendingRewards(tokenId));
        }

        stakingInfoForTokenIds = await mc.aggregate(rows);
      }

      const poolRewardPerYear = BigNumber.from(SECONDS_PER_YEAR).mul(
        BigNumber.from(queryResponse[3][4]).add(queryResponse[3][3])
      );
      const tvl = BigNumber.from(queryResponse[1][5])
        .mul(priceOfLP)
        .div(BigNumber.from(queryResponse[2]));
      const poolRewardPerYearInUSD = poolRewardPerYear.mul(
        BigNumber.from(sakeprice)
      );
      const APY = tvl.eq(0) ? 0 : poolRewardPerYearInUSD.div(tvl).mul(100);
      const lpTotalSupply = queryResponse[2];
      const lpAssetPrice = priceOfLP;
      let totalDeposit = BigNumber.from("0");
      let pendingRewards = BigNumber.from("0");
      const userPositions = [];

      if (userBalance > 0) {
        const offset_ = 2;
        let idex = 0;
        for (let tokenId of tokenIDsForPool) {
          let pending = BigNumber.from(
            stakingInfoForTokenIds[idex * offset_][1]
          )
            .mul(BigNumber.from(queryResponse[1][4]))
            .div(BigNumber.from(10).pow(18))
            .sub(BigNumber.from(stakingInfoForTokenIds[idex * offset_][5]));
          //amountWithMultiplier * accRewardsPerShare / 10 ^ 18 - rewardDebt
          let kojikiStakeTokenRewards = pending
            .mul(BigNumber.from("8000"))
            .div(BigNumber.from(10000)); //pending * 0.8
          let kojikiTokenReward = pending.sub(kojikiStakeTokenRewards);
          userPositions.push({
            symbol: poolInfo.symbol,
            tokenId: tokenId,
            poolAddr: poolInfo.poolAddr,
            queryResponse: queryResponse[1],
            lpToken: queryResponse[1][0],
            kojikiToken: queryResponse[1][1],
            kojikiStakeToken: queryResponse[1][2],
            lastRewardTime: queryResponse[1][3],
            accRewardsPerShare: queryResponse[1][4],
            lpSupply: queryResponse[1][5],
            lpSupplyWithMultiplier: queryResponse[1][6],
            allocPoint: queryResponse[1][7],
            lpAssetPrice: lpAssetPrice,
            amount: stakingInfoForTokenIds[idex * offset_][0],
            amountInUSD: BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][0]
            )
              .mul(lpAssetPrice)
              .div(lpTotalSupply),
            lpTotalSupply: lpTotalSupply,
            amountWithMultiplier: stakingInfoForTokenIds[idex * offset_][1],
            startLockTime: stakingInfoForTokenIds[idex * offset_][2],
            lockDuration: stakingInfoForTokenIds[idex * offset_][3],
            lockMultiplier: stakingInfoForTokenIds[idex * offset_][4],
            rewardDebt: stakingInfoForTokenIds[idex * offset_][5],
            boostMultiplier: BigNumber.from(
              stakingInfoForTokenIds[idex * offset_][7]
            )
              .sub(stakingInfoForTokenIds[idex * offset_][4])
              .toNumber(),
            boostPoints: stakingInfoForTokenIds[idex * offset_][6],
            totalMultiplier: stakingInfoForTokenIds[idex * offset_][7],
            pendingRewards: stakingInfoForTokenIds[idex * offset_ + 1],
            poolAPY: APY,
            isNitroPool: false,
            matchingNitro: poolInfo.matchingNitro,
            kojikiTokenReward: kojikiTokenReward,
            kojikiStakeTokenRewards: kojikiStakeTokenRewards,
            totalPendingRewards: 0,
            totalPendingRewardsInUSD: 0,
            token0: poolInfo.token0,
            token1: poolInfo.token1,
            maxGlobalMultiplier: queryResponse[4][0],
            maxLockDuration: queryResponse[4][1],
            maxLockMultiplier: queryResponse[4][2],
            maxBoostMultiplier: queryResponse[4][3],
          });
          totalDeposit = totalDeposit.add(
            BigNumber.from(stakingInfoForTokenIds[idex * offset_][0])
          );
          pendingRewards = pendingRewards.add(
            BigNumber.from(stakingInfoForTokenIds[idex * offset_ + 1])
          );
          idex++;
        }
      }

      setNftPool({
        symbol: poolInfo.symbol,
        poolAddr: poolInfo.poolAddr,
        userBalance: userBalance,
        queryResponse: queryResponse,
        lpToken: queryResponse[1][0],
        kojikiToken: queryResponse[1][1],
        sKojikiToken: queryResponse[1][2],
        lastRewardTime: queryResponse[1][3],
        accRewardsPerShare: queryResponse[1][4],
        lpSupply: queryResponse[1][5],
        lpSupplyWithMultiplier: queryResponse[1][6],
        allocPoint: queryResponse[1][7],
        lpTotalSupply: lpTotalSupply,
        lpAssetPrice: lpAssetPrice,
        tvl: tvl,
        poolAPY: APY,
        token0: poolInfo.token0,
        token1: poolInfo.token1,
        isNitroPool: false,
        userPositions: userPositions,
        totalDeposit: totalDeposit, // total deposit amount for user
        totalDepositInUsd: totalDeposit.mul(lpAssetPrice).div(lpTotalSupply),
        pendingRewards: pendingRewards,
        matchingNitro: poolInfo.matchingNitro,
        totalPendingRewards: 0,
        totalPendingRewardsInUSD: 0,
      });
    })();
  }, [account, priceOfLP, sakeprice]);

  return nftPool;
}

export function useKojikiContext() {
  // const sakeprice = useSakeprice();
  const sakeprice = "50000000";
  let pollingKey = useInterval(8_000);
  const priceOfLPs = useAssetsPricesInLP(pollingKey);
  let pools = useAllNFTPools(priceOfLPs, sakeprice, pollingKey);
  let nitroPools = useAllNitroPools(priceOfLPs, sakeprice, pollingKey);
  //   const userPositions = useUserPositions(pools, nitroPools, account, chainId);
  return {
    pools: pools,
    // positions: userPositions,
    nitroPools: nitroPools,
  };
}

export function useERC20BalanceOfUser(erc20Address) {
  const [balance, setBalance] = useState();
  const { account } = useWeb3React();

  useEffect(() => {
    // if (!account) {
    //   return;
    // }

    (async () => {
      const contractERC20 = getWeb3Contract(erc20ABI, erc20Address, CHAIN_ID);

      const reserves = await contractERC20.methods
        .balanceOf(account == undefined ? tempAddress : account)
        .call();

      setBalance(reserves);
    })();
  }, [account, erc20Address]);
  return balance;
}
