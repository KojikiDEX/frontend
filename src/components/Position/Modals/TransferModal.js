import React, { useState } from "react";

import { useWeb3React } from "@web3-react/core";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import LoadingIcon from "../../Icons/LoadingIcon";

export default function TransferModal(props) {
  const { openModal, handleModal, positionData, safeTransferFrom } = props;

  const [loading, setLoading] = useState(0);

  const [address, setAddress] = useState("");
  const { account } = useWeb3React();
  const [confirming, setConfirming] = useState(false);

  return (
    <React.Fragment>
      <Dialog
        className="w-full max-w-[390px] min-w-[250px] rounded-none border border-kojiki-blue"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">
            transfer position
          </span>
        </DialogHeader>
        <DialogBody>
          {loading != 0 && (
            <div className="absolute flex justify-center items-center w-full h-full -ml-4">
              <div role="status">
                <LoadingIcon />
              </div>
              <p>loading ...</p>
            </div>
          )}
          <div className="mb-2">
            <p>destination address</p>
            <div className="flex w-full justify-between min-w-full md:min-w-[100px] p-1 border">
              <input
                type="text"
                className="w-full text-sm leading-none p-1"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => {
                if (!confirming)
                  safeTransferFrom(
                    positionData.poolAddr,
                    positionData.tokenId,
                    account,
                    address,
                    setConfirming
                  );
              }}
            >
              {confirming ? "confirming..." : "transfer"}
            </button>
          </div>
          <div className="flex-1">
            <button
              className="w-full primary"
              onClick={() => handleModal(false)}
            >
              cancel
            </button>
          </div>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
