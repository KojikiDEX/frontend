import React from "react";
import LeftCard from "./leftcard/Index";
import { formatUnits } from "../../../hooks/contractHelper";

export default function XSakeStatus(props) {
  const {
    decimals,
    totalAmount,
    availableAmount,
    allocatedAmount,
    redeemingAmount,
  } = props;

  return (
    <div className="flex flex-col justify-between gap-4 md:gap-12 w-full lg:w-1/5 h-full">
      <LeftCard
        type={"normal"}
        label={"total xSAKE"}
        value={formatUnits(totalAmount, decimals).toFixed(2)}
      />
      <LeftCard
        type={"lock"}
        label={"available xSAKE"}
        value={formatUnits(availableAmount, decimals).toFixed(2)}
      />
      <LeftCard
        type={"allocated"}
        label={"allocated xSAKE"}
        value={formatUnits(allocatedAmount, decimals).toFixed(2)}
      />
      <LeftCard
        type={"time"}
        label={"redemeeng xSAKE"}
        value={formatUnits(redeemingAmount, decimals).toFixed(2)}
      />
    </div>
  );
}
