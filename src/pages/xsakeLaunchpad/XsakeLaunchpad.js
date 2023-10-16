import React from "react";
import { Typography } from "@material-tailwind/react";
import UserAllocation from "../../components/xsake/lunchpad/UserAllocation";
// import PastSaleList from "../../components/xsake/lunchpad/PastSaleList";
import IncomingSaleList from "../../components/xsake/lunchpad/IncomingSaleList";
import XSakeStatus from "../../components/xsake/lunchpad/XSakeStatus";
import { useXsakeLaunchpadStatus } from "../../hooks/useXsakeLaunchpadStatus";
import AllocationDlg from "../../components/xsake/lunchpad/components/AllocationDlg";
import DeallocationDlg from "../../components/xsake/lunchpad/components/DeallocationDlg";

export default function XsakeLaunchpad() {
  const {
    totalAllocation,
    cooldown,
    deallocationFee,
    userAllocation,
    // userAllocationTime,
    userCoolDown,
  } = useXsakeLaunchpadStatus();

  const [allocOpen, setAllocOpen] = React.useState(false);
  const handleAllocOpen = () => setAllocOpen(!allocOpen);

  const [deallocOpen, setDeallocOpen] = React.useState(false);
  const handleDeallocOpen = () => setDeallocOpen(!deallocOpen);

  return (
    <React.Fragment>
      <div className="w-5/6 mt-7 mx-auto">
        <p className="text-kojiki-blue">launchpad</p>
        <span>
          allocate xSAKE here to get perks and benefits from every sale
          happening on Kojiki's launchpad.
        </span>
        <XSakeStatus
          totalAllocation={totalAllocation}
          cooldown={cooldown}
          deallocationFee={deallocationFee}
        />
        {/* <PastSaleList /> */}
      </div>
      <div className="w-5/6 mx-auto flex flex-col lg:flex-row mt-10">
        <IncomingSaleList />
        <UserAllocation
          allocOpen={allocOpen}
          setAllocOpen={setAllocOpen}
          deallocOpen={deallocOpen}
          setDeallocOpen={setDeallocOpen}
          totalAllocation={totalAllocation}
          userAllocation={userAllocation}
          userCoolDown={userCoolDown}
        />
      </div>
      <br />
      <AllocationDlg
        open={allocOpen}
        handleOpen={handleAllocOpen}
        userAllocation={userAllocation}
        totalAllocation={totalAllocation}
      />
      <DeallocationDlg
        open={deallocOpen && userCoolDown <= 0}
        handleOpen={handleDeallocOpen}
        totalAllocation={totalAllocation}
        deallocationFee={deallocationFee}
        userAllocation={userAllocation}
        userCoolDown={userCoolDown}
      />
    </React.Fragment>
  );
}
