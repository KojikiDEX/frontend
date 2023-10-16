import React from "react";
import { Typography } from "@material-tailwind/react";
// import { useWeb3React } from "@web3-react/core";

export default function IncomingSaleList() {
  // const { account } = useWeb3React()
  // React.useEffect(() => { }, []);

  return (
    <div className="w-full mb-3 lg:mr-3 lg:w-7/12 lg:mb-0">
      <span className="text-center lg:text-left">incoming sales perks</span>
      <div className="flex flex-col gap-3 border mt-5 p-5">
        <span>
          The sale will be conducted in three phases, the first two of which
          will be accessible only to whitelisted participants. xSAKE holders who
          allocate to the 'Launchpad' component will receive exclusive whitelist
          access allocations in addition to the project's own whitelist.
        </span>
        <span>
          xSAKE allocators will receive a guaranteed component of allocations
          during the first stage (12 hours), with the whitelisted amount
          proportional to the total amount of xSAKE allocated and a maximum
          amount per wallet.
        </span>
        <span>
          During the second stage (12 hours), these allocations will receive a
          5x multiplier incentive, making the sale a pseudo-FCFS for WL users.
        </span>
        <span>
          The final stage (lasting 48 hours) will be open to the public on a
          first-come, first-served basis for the remaining allocations.
        </span>
        <span>
          Considering that an individual's whitelist allocation is proportional
          to the total quantity of xSAKE allocated to the plugin, your ratio may
          change over time as the total allocations fluctuate.
        </span>
      </div>
    </div>
  );
}
