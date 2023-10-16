import React, { useState } from "react";
import { Typography } from "@material-tailwind/react";

import { useWeb3React } from "@web3-react/core";

import PositionItem from "./PositionItem";
import CreateModal from "./Modals/CreateModal";

export default function PositionList(props) {
  const { positionList, potentialPositions, hasPotentials, UpdateInfo } = props;

  const { account } = useWeb3React();

  const [openCreateModal, setOpenCreateModal] = useState(false);
  return (
    <React.Fragment>
      <div className="flex flex-col md:flex-row items-center justify-between md:items-end gap-3 mb-4">
        <p className="text-kojiki-blue">your positions</p>
        <button
          className="default-outline"
          onClick={() => {
            setOpenCreateModal(true);
          }}
        >
          new position
        </button>
      </div>
      <div className="flex flex-col p-5 border">
        <div className="hidden md:grid grid-cols-[2fr_repeat(4,_1fr)] text-left">
          <div className="py-2 whitespace-nowrap">token</div>
          <div className="py-2 whitespace-nowrap">amount</div>
          <div className="py-2 whitespace-nowrap">settings</div>
          <div className="py-2 whitespace-nowrap">apr</div>
          <div className="py-2 whitespace-nowrap">pending rewards</div>
        </div>
        <div>
          {!positionList || positionList.length === 0 ? (
            <div>
              {account === undefined && (
                <div colSpan="5" className="whitespace-nowrap p-20">
                  <p className="text-center">not connected</p>
                </div>
              )}
            </div>
          ) : (
            positionList.map((positionData, i) => {
              return (
                <PositionItem
                  positionData={positionData}
                  key={i}
                  isPotentialPosition={false}
                  UpdateInfo={UpdateInfo}
                />
              );
            })
          )}
        </div>
        {hasPotentials && (
          <div>
            <br></br>
            {potentialPositions.length > 0 && (
              <>
                <span>available positions</span>
                {potentialPositions.map((positionData, i) => {
                  return (
                    <PositionItem
                      positionData={positionData}
                      key={i}
                      isPotentialPosition={true}
                      UpdateInfo={UpdateInfo}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
      <CreateModal
        openModal={openCreateModal}
        handleModal={setOpenCreateModal}
      />
    </React.Fragment>
  );
}
