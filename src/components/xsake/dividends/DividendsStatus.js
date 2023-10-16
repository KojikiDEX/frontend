import React from "react";
import Item from "../../Item";

export default function DividendsStatus(props) {
  const { curDistirbutionInUSD, curAPY, totalAllocation, deallocationFee } =
    props;

  return (
    <div className="flex flex-col lg:flex-row border p-5 mt-5 ">
      <Item
        type={"chain"}
        label={"current distribution"}
        value={`$${curDistirbutionInUSD}`}
      />
      <Item
        type={"feature"}
        label={"current apy"}
        value={`${curAPY.toFixed(2)}%`}
      />
      <Item
        type={"jwerly"}
        label={"total xSAKE allocations"}
        value={`${totalAllocation}`}
      />
      <Item
        type={"symbol"}
        label={"deallocation fee"}
        value={`${deallocationFee}%`}
      />
    </div>
  );
}
