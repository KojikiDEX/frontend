import React from "react";
import YieldBoosterStatus from "../../components/xsake/yieldbooster/YieldBoosterStatus";
import YieldBoosterHeader from "../../components/xsake/yieldbooster/YieldBoosterHeader";
import YieldBoosterBody from "../../components/xsake/yieldbooster/YieldBoosterBody";
// import YieldBoosterDlg from "../../components/xsake/yieldbooster/YieldBoosterDlg";
import { useYieldboosterStatus } from "../../hooks/useYieldboosterStatus";
import AllocationDlg from "../../components/xsake/yieldbooster/components/AllocationDlg";
import DeallocationDlg from "../../components/xsake/yieldbooster/components/DeallocationDlg";
import { useXSakeState } from "../../hooks/useXSakeState";
import { formatUnits } from "../../hooks/contractHelper";

export default function YieldBooster() {
  // const [amount, setAmount] = React.useState("");
  // const [open, setOpen] = React.useState(false);

  // const onChange = (target) => setAmount(target.value);
  // const handleOpen = () => setOpen(!open);

  const [allocOpen, setAllocOpen] = React.useState(false);
  const handleAllocOpen = () => setAllocOpen(!allocOpen);

  const [deallocOpen, setDeallocOpen] = React.useState(false);
  const handleDeallocOpen = () => setDeallocOpen(!deallocOpen);

  const [positionInfo, setPositionInfo] = React.useState({});

  const { totalAllocation, deallocationFee } = useYieldboosterStatus();

  const { xSakeDecimals, allocatedOfYieldbooster, availableAmount } =
    useXSakeState();

  return (
    <React.Fragment>
      <div className="w-5/6 mt-7 mx-auto   p-5  ">
        <YieldBoosterHeader />
        <YieldBoosterStatus
          userBalance={formatUnits(availableAmount, xSakeDecimals)}
          userAllocation={formatUnits(allocatedOfYieldbooster, xSakeDecimals)}
          totalAllocation={totalAllocation}
          deallocationFee={deallocationFee}
        />
        <YieldBoosterBody
          allocOpen={allocOpen}
          setAllocOpen={setAllocOpen}
          deallocOpen={deallocOpen}
          setDeallocOpen={setDeallocOpen}
          userBalance={formatUnits(availableAmount, xSakeDecimals)}
          setPositionInfo={setPositionInfo}
        />
        {/* <YieldBoosterDlg
                    amount={amount}
                    open={open}
                    onChange={onChange}
                    handleOpen={handleOpen}
                /> */}
      </div>
      <AllocationDlg
        open={allocOpen}
        handleOpen={handleAllocOpen}
        totalAllocation={totalAllocation}
        positionInfo={positionInfo}
      />
      <DeallocationDlg
        open={deallocOpen}
        handleOpen={handleDeallocOpen}
        totalAllocation={totalAllocation}
        deallocationFee={deallocationFee}
        positionInfo={positionInfo}
      />
    </React.Fragment>
  );
}
