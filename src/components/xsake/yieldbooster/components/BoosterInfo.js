import React from "react";
import { Typography } from "@material-tailwind/react";
import { ImWarning } from "react-icons/im";
// import { AiOutlineCheckSquare } from "react-icons/ai"
// import { GrPowerReset } from "react-icons/gr"
import { IconContext } from "react-icons";

export default function BoosterInfo(props) {
  const { userBalance } = props;

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row justify-between items-center">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <p>remaining available balance : </p>
          <p className="text-kojiki-blue">{userBalance.toFixed(2)} xSAKE</p>
        </div>
        {/* <div className="flex flex-col lg:flex-row p-2">
                    <div className="flex flex-row m-1 p-1 bg-kojiki-blue ">
                        <IconContext.Provider value={{ className: 'my-auto' }}>
                            <AiOutlineCheckSquare />
                        </IconContext.Provider>
                        <Typography variant='small' className=' mx-auto lg:px-1'>
                            Apply all allocation
                        </Typography>
                    </div>
                    <div className="flex flex-row m-1 p-1 bg-kojiki-blue ">
                        <IconContext.Provider value={{ className: 'my-auto' }}>
                            <GrPowerReset />
                        </IconContext.Provider>
                        <Typography variant='small' className=' mx-auto lg:px-1'>
                            Reset
                        </Typography>
                    </div>
                </div> */}
      </div>
      <div className="w-full mt-3 flex flex-row">
        <div className="bg-kojiki-blue p-3 border-0  flex lg:flex-row">
          <IconContext.Provider
            value={{ className: "my-auto hidden lg:flex text-white" }}
          >
            <ImWarning fill="white" />
          </IconContext.Provider>
          <span className="text-kojiki-white mx-3">
            Only yield farming rewards can be boosted. Raito pools and swap fees
            APRs won't be affected by any YieldBooster allocation.
          </span>
        </div>
      </div>
    </>
  );
}
