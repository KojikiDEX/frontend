import React from "react";
import { Typography } from "@material-tailwind/react";
import { Link } from "react-router-dom";
// import sakeBanner from "../../assets/img/bg/launchpad-banner.png"

export default function LaunchpadDetailHeader(props) {
  const { data } = props;

  return (
    <>
      {data !== undefined && (
        <>
          <p className="text-kojiki-blue text-left">{data.title}</p>
          <p className="mt-2 text-sm">
            <Link to={data.projectLink} target="_blank">
              {data.boldDescription}
            </Link>
            {data.description1}
          </p>
          {/* <img
              src={sakeBanner}
              width="100%"
              className="p-3 mt-5"
              alt="banner"
            /> */}
          {/* <img src={data.imageLink} width='100%' className="p-3 mt-5" alt="banner" /> */}
          <p className="mt-5 text-sm">{data.description2}</p>
        </>
      )}
    </>
  );
}
