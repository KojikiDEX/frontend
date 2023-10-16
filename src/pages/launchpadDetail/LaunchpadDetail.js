import React from "react";
import { useParams } from "react-router-dom";
import LaunchpadDetailHeader from "../../components/LaunchpadDetail/LaunchpadDetailHeader";
import LaunchpadDetailStatus from "../../components/LaunchpadDetail/LaunchpadDetailStatus";
import LaunchpadDetailBody from "../../components/LaunchpadDetail/LaunchpadDetailBody";
import LaunchpadDetailData from "../../config/LaunchpadDetail.json";
import LaunchpadDetailFooter from "../../components/LaunchpadDetail/LaunchpadDetailFooter";
import { CHAIN_ID } from "../../hooks/connectors";
import { useLaunchpadDetailStatus } from "../../hooks/useLaunchpadDetailStatus";

export default function LaunchpadDetail() {
  const { token } = useParams();
  const data = LaunchpadDetailData[token];
  const {
    totalRaisedInETH,
    totalRaisedInUSD,
    tokenPriceInETH,
    tokenPriceInUSD,
    cirMarketcapInUSD,
    fdvInUSD,
    hasStarted,
    hasEnded,
    coolDown,
    // walletCap,
    userToken0,
    userToken1,
    userContribution,
    userReferral,
    userReferralPending,
  } = useLaunchpadDetailStatus(
    data.fairAuction[CHAIN_ID],
    data.token0[CHAIN_ID],
    data.token1[CHAIN_ID],
    data.treasuryList
  );

  return (
    <React.Fragment>
      <div className="w-full md:w-5/6 mx-auto lg:pt-10">
        <LaunchpadDetailHeader data={data} />
        <LaunchpadDetailStatus
          totalRaisedInETH={totalRaisedInETH}
          totalRaisedInUSD={totalRaisedInUSD}
          tokenPriceInETH={tokenPriceInETH}
          tokenPriceInUSD={tokenPriceInUSD}
          cirMarketcapInUSD={cirMarketcapInUSD}
          fdvInUSD={fdvInUSD}
          hasStarted={hasStarted}
          hasEnded={hasEnded}
          coolDown={coolDown}
          symbol={data.symbol}
        />
        <LaunchpadDetailBody
          hasStarted={hasStarted}
          hasEnded={hasEnded}
          coolDown={coolDown}
          symbol={data.symbol}
          fairAuction={data.fairAuction}
          userContribution={userContribution}
          userToken0={userToken0}
          userToken1={userToken1}
          userReferral={userReferral}
          userReferralPending={userReferralPending}
          tokenPriceInUSD={tokenPriceInUSD}
        />
        <LaunchpadDetailFooter data={data} />
      </div>
    </React.Fragment>
  );
}
