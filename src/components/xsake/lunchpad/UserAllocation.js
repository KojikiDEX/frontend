import React from "react";
import { Typography } from "@material-tailwind/react";
import { useWeb3React } from "@web3-react/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { DownCounter } from "../../DownCounter";

export default function UserAllocation(props) {
  const {
    allocOpen,
    setAllocOpen,
    deallocOpen,
    setDeallocOpen,
    totalAllocation,
    userAllocation,
    userCoolDown,
  } = props;
  const { account } = useWeb3React();
  // React.useEffect(() => { }, []);

  return (
    <div className="w-full lg:ml-3 lg:w-1/2">
      <div className="flex flex-col lg:flex-row mb-5 lg:mb-0">
        <span className="lg:mx-3 text-center lg:text-left my-auto">
          your allocation
        </span>
        {!account ? (
          <div className="mx-auto lg:mx-0 lg:ml-auto">
            <button className="default-outline">
              <span className=" mx-auto">not connected</span>
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mx-auto lg:mx-0 lg:ml-auto">
            <button
              className="default-outline"
              onClick={() => {
                setDeallocOpen(!deallocOpen);
              }}
            >
              <FontAwesomeIcon icon={faMinus} />
            </button>
            <button
              className="default-outline"
              onClick={() => {
                setAllocOpen(!allocOpen);
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col border mt-4">
        <div className="w-full flex flex-col p-5 gap-3">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <span>user allocation</span>
            <span>{userAllocation.toFixed(2)} xSAKE</span>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <span>total Share</span>
            <span>
              {totalAllocation && totalAllocation > 0
                ? ((userAllocation / totalAllocation) * 100).toFixed(2)
                : 0}{" "}
              %
            </span>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <span>Deallocation cooldown</span>
            <span>
              <DownCounter seconds={userCoolDown} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
