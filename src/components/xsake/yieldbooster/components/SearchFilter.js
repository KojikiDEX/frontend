import React, { useState } from "react";
import { Checkbox, Typography } from "@material-tailwind/react";

export default function SearchFilter(props) {
  const [yieldBearing, setYieldBearing] = useState(false);
  const [locked, setLocked] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [nitroStaking, setNitroStaking] = useState(false);
  const { search, searchToken } = props;

  return (
    <div className="w-full flex flex-col">
      <div className="w-full lg:p-1 mt-1">
        <input
          className="w-full p-3  focus:outline-none active:outline-none"
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => searchToken(e)}
        />
      </div>
      <div className="w-full mt-1 mx-auto flex flex-col lg:flex-row justify-between items-center">
        <div className="w-1/2 lg:w-1/4 flex flex-row items-center justify-start">
          <Checkbox color="gray" ripple={yieldBearing} />
          <Typography variant="h6">Yield-bearing only</Typography>
        </div>
        <div className="w-1/2 lg:w-1/4 flex flex-row items-center justify-start">
          <Checkbox color="gray" ripple={locked} />
          <Typography variant="h6">Locked only</Typography>
        </div>
        <div className="w-1/2 lg:w-1/4 flex flex-row items-center justify-start">
          <Checkbox color="gray" ripple={boosted} />
          <Typography variant="h6">Boosted only</Typography>
        </div>
        <div className="w-1/2 lg:w-1/4 flex flex-row items-center justify-start">
          <Checkbox color="gray" ripple={nitroStaking} />
          <Typography variant="h6">RP-staking only</Typography>
        </div>
      </div>
    </div>
  );
}
