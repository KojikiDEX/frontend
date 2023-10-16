import React from "react";
import { Typography } from "@material-tailwind/react";

import GetxSAKE from "../../components/xsake/dashboard/GetxSAKE";
import Vesting from "../../components/xsake/dashboard/Vesting";
import XSakeStatus from "../../components/xsake/dashboard/XSakeStatus";
import XSakeManagement from "../../components/xsake/dashboard/XSakeManagement";
import { useXSakeState } from "../../hooks/useXSakeState";

import bigJwerly from "../../assets/img/icon/big_jwerly.png";

export default function XSAKE() {
  const {
    xSakeDecimals,
    totalAmount,
    availableAmount,
    allocatedAmount,
    redeemingAmount,
    allocatedOfDividends,
    allocatedOfYieldbooster,
    allocatedOfLaunchpad,
    redeems,
  } = useXSakeState();

  return (
    <React.Fragment>
      <div className="w-5/6 mt-7 mx-auto mb-5">
        <p className="text-kojiki-blue">dashboard</p>
        <span>
          convert your SAKE, redeem your xSAKE and manage your xSAKE plugins
          allocations
        </span>

        <div className="mt-16 flex flex-col flex-wrap lg:flex-row">
          <div className="w-full lg:flex items-center lg:justify-between">
            <XSakeStatus
              decimals={xSakeDecimals}
              totalAmount={totalAmount}
              availableAmount={availableAmount}
              allocatedAmount={allocatedAmount}
              redeemingAmount={redeemingAmount}
            />
            <div className="mx-auto lg:mb-2 w-2/6 hidden lg:flex">
              <img className="mx-auto h-fit" src={bigJwerly} alt="bigJwerly" />
            </div>
            <XSakeManagement
              decimals={xSakeDecimals}
              allocatedOfDividends={allocatedOfDividends}
              allocatedOfYieldbooster={allocatedOfYieldbooster}
              allocatedOfLaunchpad={allocatedOfLaunchpad}
            />
          </div>
        </div>
      </div>
      <div className="w-5/6 mt-20 mx-auto mb-10">
        <div className="w-full lg:flex lg:justify-between gap-3">
          <div className="flex flex-col w-full lg:w-1/3">
            <GetxSAKE type={"normal"} label={"Total xSAKE"} />
          </div>
          <div className="lg:pl-10 flex flex-col w-full lg:w-2/3">
            <Vesting
              type={"normal"}
              label={"Total xSAKE"}
              redeems={redeems}
              xSakeDecimals={xSakeDecimals}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
