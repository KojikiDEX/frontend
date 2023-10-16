import React, { useState } from "react";
import LaunchpadHeader from "../../components/Launchpad/LaunchpadHeader";
import LaunchpadBody from "../../components/Launchpad/LaunchpadBody";

export default function Launchpad() {
  const [search, setSearch] = useState("");
  const [finding, setFinding] = useState(false);

  const searchToken = async (e) => {
    setFinding(true);

    setFinding(false);
  };

  return (
    <React.Fragment>
      <div className="w-full mt-7 lg:w-5/6 mx-auto     mb-10">
        <LaunchpadHeader />
        <LaunchpadBody search={search} searchToken={searchToken} />
      </div>
    </React.Fragment>
  );
}
