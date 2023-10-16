import React from "react";
import Item from "../../Item";
import { displayTimeAmount } from "../../../utils";

export default function XSakeStatus(props) {
  const { totalAllocation, cooldown, deallocationFee } = props;

  return (
    <div className="flex flex-col justify-between itmes-center lg:flex-row border p-5 mt-5 ">
      <Item
        type={"xSakeLPadAlloc"}
        label={"total xSAKE allocations"}
        value={`${totalAllocation.toFixed(2)}`}
      />
      <Item
        type={"xSakeLPadTimer"}
        label={"deallocation cooldown"}
        value={`${displayTimeAmount(cooldown)}`}
      />
      <Item
        type={"xSakeDeallocFee"}
        label={"deallocation fee"}
        value={`${deallocationFee.toFixed(0)} %`}
      />
    </div>
  );
}
