import React from "react";
import RightCard from "./rightcard/Index";
import jwerly from "../../../assets/img/icon/big_jwerly.png";
import { formatUnits } from "../../../hooks/contractHelper";

export default function XSakeManagement(props) {
  const {
    decimals,
    allocatedOfDividends,
    allocatedOfYieldbooster,
    allocatedOfLaunchpad,
  } = props;

  return (
    <div className="flex flex-col gap-2 w-full lg:w-4/12">
      <RightCard
        label={"dividends"}
        content={
          "allocate your xSAKE here in order to get your share of the platform generated earnings."
        }
        value={formatUnits(allocatedOfDividends, decimals).toFixed(2)}
        link={"/xsake/dividends"}
      />
      <RightCard
        label={"yield booster"}
        content={
          "allocate your xSAKE to your staking positions to significantly boost your yield revenue."
        }
        value={formatUnits(allocatedOfYieldbooster, decimals).toFixed(2)}
        link={"/xsake/yieldbooster"}
      />
      <RightCard
        label={"launchpad"}
        content={
          "allocate your xSAKE here to get perks from every sale happening on Kojiki's launchpad."
        }
        value={formatUnits(allocatedOfLaunchpad, decimals).toFixed(2)}
        link={"/xsake/launchpad"}
      />
    </div>
  );
}
