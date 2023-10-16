import React, { useEffect, useState } from "react";
import { Typography } from "@material-tailwind/react";
import { useWeb3React } from "@web3-react/core";

import { SCAN_URL, CHAIN_ID } from "../../hooks/connectors";
import { contracts, DEAD_ADDR, SAKE_ETH_PAIR } from "../../config/contracts";
import { formatNumber, trimAddress } from "../../hooks/contractHelper";
import { ethers, BigNumber } from "ethers";
import {
  getWeb3Contract,
  MulticallContractWeb3,
} from "../../hooks/contractHelper";

import sakeABI from "../../assets/abi/KojikiToken.json";
import xSakeABI from "../../assets/abi/KojikiStakeToken.json";
import { useAssetsPricesInLP } from "../../hooks/useKojikiContext";
import { tempAddress } from "../../config/tokens";
import { useGlobalData } from "../../context/GlobalData";
import Item from "../../components/Item";

export default function Info() {
  const [sakeBurned, setSakeBurned] = useState(0);
  const [sakeCirculating, setSakeCirculating] = useState(0);
  const [sakeTotal, setSakeTotal] = useState(0);
  const [sakeMax, setSakeMax] = useState(0);
  // const [sakeprice, setsakeprice] = useState(0);
  const [sakeMarketcap, setSakeMarketcap] = useState(0);
  const [sakeCirculatingMarketcap, setSakeCirculatingMarketcap] = useState(0);
  const [sakeFDV, setSakeFDV] = useState(0);
  const [sakeBalance, setSakeBalance] = useState(0);
  const [xSakeBalance, setXSakeBalance] = useState(0);
  const [queryResult, setQueryResult] = useState([]);

  const { account } = useWeb3React();

  const sakeETHPair = SAKE_ETH_PAIR[CHAIN_ID].pairAddr;
  const { totalLiquidityUSD, oneDayVolumeUSD } = useGlobalData();

  const lpAssets = useAssetsPricesInLP();
  const sakeprice = 50;

  useEffect(() => {
    if (
      Object.values(lpAssets).length === 0 &&
      lpAssets.constructor === Object
    ) {
      return;
    }

    (async () => {
      const sakeContract = getWeb3Contract(
        sakeABI,
        contracts[CHAIN_ID].saketoken
      );
      const xSakeContract = getWeb3Contract(
        xSakeABI,
        contracts[CHAIN_ID].XSakeTOKEN
      );
      // const router = getWeb3Contract(
      //   kojikigRouterABI,
      //   contracts[CHAIN_ID].ROUTER,
      //   CHAIN_ID
      // );
      const mc = MulticallContractWeb3(CHAIN_ID);
      const query = [];
      query.push(sakeContract.methods.elasticMaxSupply());
      query.push(
        sakeContract.methods.balanceOf(contracts[CHAIN_ID].XSakeTOKEN)
      );
      query.push(sakeContract.methods.balanceOf(sakeETHPair));
      query.push(sakeContract.methods.balanceOf(DEAD_ADDR));
      query.push(
        sakeContract.methods.balanceOf(
          account == undefined ? tempAddress : account
        )
      );
      query.push(
        xSakeContract.methods.balanceOf(
          account == undefined ? tempAddress : account
        )
      );

      const queryRs = await mc.aggregate(query);
      setQueryResult(queryRs);
    })();
  }, [lpAssets]);

  useEffect(() => {
    if (queryResult.length === 0) {
      return;
    }
    const elasticMaxSupply = BigNumber.from(queryResult[0]);
    const sakeBalanceInXSake = BigNumber.from(queryResult[1]);
    const sakeBalanceInPair = BigNumber.from(queryResult[2]);
    const sakeBalanceBurned = BigNumber.from(queryResult[3]);
    const maxSake = elasticMaxSupply.sub(sakeBalanceBurned);
    const sakeMarketcap = sakeBalanceInXSake.mul(BigNumber.from(sakeprice));
    const sakeCirculatingMC = sakeBalanceInPair.mul(BigNumber.from(sakeprice));
    const FDV = elasticMaxSupply.mul(BigNumber.from(sakeprice));
    let sakeBalance = BigNumber.from(queryResult[4]);
    let xSakeBalance = BigNumber.from(queryResult[5]);

    setSakeTotal(ethers.utils.formatUnits(sakeBalanceInXSake, 18));
    setSakeCirculating(ethers.utils.formatUnits(sakeBalanceInPair, 18));
    setSakeBurned(ethers.utils.formatUnits(sakeBalanceBurned, 18));
    setSakeMax(ethers.utils.formatUnits(maxSake, 18));
    setSakeMarketcap(ethers.utils.formatUnits(sakeMarketcap, 18));
    setSakeCirculatingMarketcap(
      ethers.utils.formatUnits(sakeCirculatingMC, 18)
    );
    setSakeFDV(ethers.utils.formatUnits(FDV, 18));
    setSakeBalance(ethers.utils.formatUnits(sakeBalance, 18));
    setXSakeBalance(ethers.utils.formatUnits(xSakeBalance, 18));
  }, [queryResult, sakeprice, account]);

  return (
    <React.Fragment>
      <div className="w-full md:w-5/6 mx-auto text-center md:text-left  lg:pt-10">
        <Typography variant="h3">Info</Typography>
        <Typography as="p" variant="small">
          Overview including AMM stats and SAKE/xSAKE supplies and valuations.
        </Typography>

        <div className="mx-auto  mb-20">
          <div className="flex flex-col lg:flex-row border p-5 mt-10 ">
            <Item
              type="chain"
              label="AMM total liquidity"
              value={`$${formatNumber(
                totalLiquidityUSD ? totalLiquidityUSD : 0,
                3
              )}`}
            />
            <Item
              type="feature"
              label="Volume (24h)"
              value={`$${formatNumber(
                oneDayVolumeUSD ? oneDayVolumeUSD : 0,
                3
              )}`}
            />
            <Item
              type="jwerly"
              label="24h Fees"
              value={`$${formatNumber(
                oneDayVolumeUSD ? oneDayVolumeUSD * 0.003 : 0,
                3
              )}`}
            />
          </div>
          <div className="border px-2 py-5 md:p-5 mt-10 ">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex">
                  <img
                    className="w-8 h-8 border-kojiki-blue "
                    src={require(`../../assets/img/token/SAKE.png`)}
                    alt="Token Logo"
                  />
                </div>
                <div>
                  <Typography variant="h4" className="mb-0">
                    SAKE token
                  </Typography>
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${contracts[CHAIN_ID].saketoken}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {trimAddress(contracts[CHAIN_ID].saketoken)}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="small">Your balance </Typography>
                <Typography variant="small">
                  {formatNumber(sakeBalance, 3)} SAKE
                </Typography>
                <Typography variant="small">
                  ${formatNumber(sakeBalance * sakeprice, 3)}
                </Typography>
              </div>
            </div>
            <hr className="my-4 !border-kojiki-gray" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <Typography variant="h4">Supply</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Total supply</Typography>
                <Typography variant="small">{sakeTotal} SAKE</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Circulating supply</Typography>
                <Typography variant="small">{sakeCirculating} SAKE</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Burn supply</Typography>
                <Typography variant="small">{sakeBurned} SAKE</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">max supply</Typography>
                <Typography variant="small">{sakeMax} SAKE</Typography>
              </div>
            </div>
            <hr className="my-4 !border-kojiki-gray" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <Typography variant="h4">Valuation</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Price</Typography>
                <Typography variant="small">${sakeprice}</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Marketcap</Typography>
                <Typography variant="small">${sakeMarketcap}</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Circulating Marketcap</Typography>
                <Typography variant="small">
                  ${sakeCirculatingMarketcap}
                </Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">FDV</Typography>
                <Typography variant="small">${sakeFDV}</Typography>
              </div>
            </div>
          </div>
          <div className="border px-2 py-5 md:p-5 mt-10 ">
            <div className="flex w-full justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex">
                  <img
                    className="w-8 h-8 border-kojiki-blue "
                    src={require(`../../assets/img/token/xSAKE.png`)}
                    alt="Token Logo"
                  />
                </div>
                <div>
                  <Typography variant="h4" className="mb-0">
                    xSAKE token
                  </Typography>
                  <a
                    href={`${SCAN_URL[CHAIN_ID]}address/${contracts[CHAIN_ID].XSakeTOKEN}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {trimAddress(contracts[CHAIN_ID].XSakeTOKEN)}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <Typography variant="small">Your balance </Typography>
                <Typography variant="small">
                  {formatNumber(xSakeBalance, 3)} xSAKE
                </Typography>
                <Typography variant="small">
                  ${formatNumber(xSakeBalance * sakeprice, 3)}
                </Typography>
              </div>
            </div>
            <hr className="my-4 !border-kojiki-gray" />
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              <div>
                <Typography variant="h4">Supply</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Circulating supply</Typography>
                <Typography variant="small">0.0 xSAKE</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Share of xSAKE supply</Typography>
                <Typography variant="small">0.0 xSAKE</Typography>
              </div>
              <div className="flex flex-row md:flex-col justify-between">
                <Typography variant="small">Allocated total</Typography>
                <Typography variant="small">0.0 xSAKE</Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
