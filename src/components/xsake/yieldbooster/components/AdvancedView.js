import React from "react";
import { Typography, Switch } from "@material-tailwind/react";

export default function AdvancedView(props) {
  const { enabled } = props;

  return (
    <div className="w-full lg:w-2/5 flex flex-col justify-start my-3 items-center lg:flex-row">
      <Typography variant="h6" className=" lg:px-5">
        Advanced view
      </Typography>
      <div className="lg:mx-3 mt-1">
        <Switch defaultChecked={enabled} color="yellow" />
      </div>
    </div>
  );
}
