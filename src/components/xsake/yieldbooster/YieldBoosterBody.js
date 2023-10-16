import React, { useState } from "react";
import BoosterTable from "./components/BoosterTable";
// import AdvancedView from "./components/AdvancedView";
// import SearchFilter from "./components/SearchFilter";
import BoosterInfo from "./components/BoosterInfo";

export default function YieldBoosterBody(props) {
  const {
    allocOpen,
    setAllocOpen,
    deallocOpen,
    setDeallocOpen,
    userBalance,
    setPositionInfo,
  } = props;

  // const [search, setSearch] = useState("");
  const [enabled /*, setEnabled*/] = useState(false);
  // const [finding, setFinding] = useState(false);

  // const searchToken = async (e) => {
  //     setFinding(true);

  //     setFinding(false);
  // };

  return (
    <div className="w-full flex flex-col mt-5 p-2 lg:p-5 border ">
      {/* <AdvancedView
                enabled={enabled}
            /> */}
      {/* <SearchFilter
                search={search}
                searchToken={searchToken}
            /> */}
      <BoosterInfo userBalance={userBalance} />
      <BoosterTable
        advancedView={enabled}
        allocOpen={allocOpen}
        setAllocOpen={setAllocOpen}
        deallocOpen={deallocOpen}
        setDeallocOpen={setDeallocOpen}
        setPositionInfo={setPositionInfo}
      />
    </div>
  );
}
