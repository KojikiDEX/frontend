import React from "react";
import Item from "../../Item";

export default function YieldBoosterStatus(props) {
  const { userBalance, userAllocation, totalAllocation, deallocationFee } =
    props;

  return (
    <div className="flex flex-col lg:flex-row border p-5 mt-10 ">
      <Item
        type={"chain"}
        label={"your available xSAKE"}
        value={`${userBalance.toFixed(2)}`}
      />
      <Item
        type={"feature"}
        label={"your allocated xSAKE"}
        value={`${userAllocation.toFixed(2)}`}
      />
      <Item
        type={"jwerly"}
        label={"yotal xSAKE allocation"}
        value={`${totalAllocation.toFixed(2)}`}
      />
      <Item
        type={"symbol"}
        label={"deallocation fee"}
        value={`${deallocationFee.toFixed(1)}%`}
      />
    </div>
  );
}
