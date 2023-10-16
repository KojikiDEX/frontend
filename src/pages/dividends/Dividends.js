import React from "react";
import { Typography } from "@material-tailwind/react";

import DividendsStatus from "../../components/xsake/dividends/DividendsStatus";
import CurrentEpoch from "../../components/xsake/dividends/CurrentEpoch";
import UserAllocation from "../../components/xsake/dividends/UserAllocation";
import DividendsCalculatorDialog from "../../components/xsake/dividends/components/DividendsCalculatorDialog";
import { useDividendsStatus } from "../../hooks/useDividendsStatus";
import AllocationDlg from "../../components/xsake/dividends/components/AllocationDlg";
import DeallocationDlg from "../../components/xsake/dividends/components/DeallocationDlg";
import { useXSakeState } from "../../hooks/useXSakeState";

export default function Dividends() {
  const {
    curDistirbutionInUSD,
    curAPY,
    curAPR,
    totalAllocation,
    deallocationFee,
    curEpochData,
    cooldown,
  } = useDividendsStatus();

  const { xSakeDecimals, allocatedOfDividends, redeems } = useXSakeState();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);

  const [allocOpen, setAllocOpen] = React.useState(false);
  const handleAllocOpen = () => setAllocOpen(!allocOpen);

  const [deallocOpen, setDeallocOpen] = React.useState(false);
  const handleDeallocOpen = () => setDeallocOpen(!deallocOpen);

  return (
    <React.Fragment>
      <div className="w-5/6 mx-auto mt-7">
        <p className="text-kojiki-blue">dividends</p>
        <span>
          allocate xSAKE here to earn a share of protocol earnings in the form
          of real yield
        </span>
        <DividendsStatus
          curDistirbutionInUSD={curDistirbutionInUSD}
          curAPY={curAPY}
          totalAllocation={totalAllocation}
          deallocationFee={deallocationFee}
        />
        <br />
        <DividendsCalculatorDialog
          open={open}
          handleOpen={handleOpen}
          totalAllocation={totalAllocation}
          curAPR={curAPR}
        />
        <AllocationDlg
          open={allocOpen}
          handleOpen={handleAllocOpen}
          totalAllocation={totalAllocation}
          curAPR={curAPR}
        />
        <DeallocationDlg
          open={deallocOpen}
          handleOpen={handleDeallocOpen}
          curAPR={curAPR}
          totalAllocation={totalAllocation}
          deallocationFee={deallocationFee}
        />
      </div>
      <div className="w-5/6 mx-auto flex flex-col lg:flex-row mt-3">
        <CurrentEpoch
          open={open}
          setOpen={setOpen}
          cooldown={cooldown}
          curEpochData={curEpochData}
        />
        <UserAllocation
          allocOpen={allocOpen}
          setAllocOpen={setAllocOpen}
          deallocOpen={deallocOpen}
          setDeallocOpen={setDeallocOpen}
          totalAllocation={totalAllocation}
          curEpochData={curEpochData}
          xSakeDecimals={xSakeDecimals}
          allocatedOfDividends={allocatedOfDividends}
          redeems={redeems}
        />
      </div>
    </React.Fragment>
  );
}
