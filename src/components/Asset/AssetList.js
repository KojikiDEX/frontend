import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";

import AssetItem from "./AssetItem";
import HarvestAllModal from "./Modals/HarvestAllModal";

export default function AssetList(props) {
  const { assetList } = props;
  const [openHarvestModal, setOpenHarvestModal] = useState(false);
  return (
    <React.Fragment>
      <div className="flex flex-col md:flex-row items-center justify-between md:items-end gap-3">
        <Typography variant="h4">Your assets</Typography>
        {/* <button
          className="py-1   min-w-[150px] py-1    "
          onClick={(e) => {
            setOpenHarvestModal(true);
          }}
        >
          Harvest All
        </button> */}
      </div>
      <div className="flex flex-col border px-1 mb-1 md:px-5 md:pb-5 mt-5 ">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_repeat(4,_1fr)] text-left  border-b-2">
                <div className="py-4 whitespace-nowrap">Token</div>
                <div className="py-4 whitespace-nowrap">Avg APR</div>
                <div className="py-4 whitespace-nowrap">Deposits</div>
                <div className="py-4 whitespace-nowrap">Pending Rewards</div>
                <div className="py-4 whitespace-nowrap"></div>
              </div>
              <div>
                {Object.values(assetList).map((value, i) => {
                  return <AssetItem assetData={value} />;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <HarvestAllModal
        openModal={openHarvestModal}
        handleModal={setOpenHarvestModal}
        rewardAmount="1000"
      />
    </React.Fragment>
  );
}
