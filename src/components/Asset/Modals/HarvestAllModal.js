import React from "react";

import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from "@material-tailwind/react";

export default function HarvestAllModal(props) {
  const { openModal, handleModal, rewardAmount } = props;

  return (
    <React.Fragment>
      <Dialog
        className="max-w-[100%] min-w-[100%] md:max-w-[60%] md:min-w-[60%] lg:max-w-[40%] lg:min-w-[40%]"
        open={openModal}
        handler={() => handleModal(!openModal)}
        size={"lg"}
      >
        <DialogHeader className="border-b border-kojiki-blue">
          <span className="text-kojiki-blue font-normal">harvest all</span>
        </DialogHeader>
        <DialogBody>
          <div className="px-2">
            <p>Pending Reward</p>
            <div className="flex justify-between">
              <Typography variant="small">Total rewards</Typography>
              <Typography variant="small">{rewardAmount}</Typography>
            </div>
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-1">
          <div className="flex-1">
            <button className="w-full primary">harvest</button>
          </div>
          <div className="flex-1">
            <button className="w-full primary">cancel</button>
          </div>
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
}
