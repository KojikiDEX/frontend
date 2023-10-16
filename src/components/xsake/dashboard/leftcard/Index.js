import React from "react";
import { Typography } from "@material-tailwind/react";

import normalIcon from "../../../../assets/img/icon/jwerly.png";
import lockIcon from "../../../../assets/img/icon/jwerly_lock.png";
import allocatedIcon from "../../../../assets/img/icon/jwerly_allocated.png";
import timeIcon from "../../../../assets/img/icon/jwerly_time.png";

export default function LeftCard(props) {
  // const [isNavOpen, setIsNavOpen] = React.useState(false);

  React.useEffect(() => {}, []);

  return (
    <React.Fragment>
      <div className=" flex items-center w-full h-20 p-3 border">
        {/* {props.type === "normal" && (
          <img
            className="flex-none w-8 h-15 mr-5"
            src={normalIcon}
            alt="jwerly"
          />
        )}
        {props.type === "lock" && (
          <img
            className="flex-none w-8 h-15 mr-5"
            src={lockIcon}
            alt="jwerlyLock"
          />
        )}
        {props.type === "allocated" && (
          <img
            className="flex-none w-8 h-15 mr-5"
            src={allocatedIcon}
            alt="jwerlyLock"
          />
        )}
        {props.type === "time" && (
          <img
            className="flex-none w-8 h-15 mr-5"
            src={timeIcon}
            alt="jwerlyTime"
          />
        )} */}
        <div className="flex-auto">
          <p>{props.label}</p>
          <p className="text-kojiki-blue">{props.value}</p>
        </div>
      </div>
    </React.Fragment>
  );
}
