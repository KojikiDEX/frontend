import React from "react";
import LaunchpadTable from "./LaunchpadTable";

export default function LaunchpadBody(props) {
  return (
    <div className="w-full flex flex-col mb-3 lg:mr-3 mt-5 p-3 border">
      {/* <input
                className="w-full bg-kojiki-blue p-3 border-0  focus:outline-none active:outline-none"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => searchToken(e)}
            /> */}
      <LaunchpadTable />
    </div>
  );
}
