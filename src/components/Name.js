import React from "react";
import { Typography } from "@material-tailwind/react";
import { GiTrophyCup } from "react-icons/gi";
import { IconContext } from "react-icons";

export default function Name(props) {
  const { fromToken, toToken, fromTokenSymbol, toTokenSymbol, imageSize } =
    props;

  return (
    <div className="w-full flex ">
      {fromToken !== undefined && (
        <>
          <div className="w-1/2 px-2 flex justify-start items-center gap-2 mt-4">
            <div className="px-2 flex items-center justify-start">
              <img
                src={require(`../assets/img/token/${fromToken}.png`)}
                width={`${imageSize}px`}
                alt="fromToken"
              />
              <img
                src={require(`../assets/img/token/${toToken}.png`)}
                width={`${imageSize}px`}
                alt="fromToken"
              />
              <div className="px-2 flex flex-col items-center">
                <Typography variant="small">
                  {`${fromTokenSymbol}-${toTokenSymbol}`}
                </Typography>
                {/* <Typography variant="small">
                {tokenAmount}($50)
              </Typography> */}
              </div>
            </div>
          </div>
          <div className="w-1/2 px-2 flex justify-start items-center gap-2 mt-4">
            <div className="px-2 flex items-center justify-start">
              {/* <IconContext.Provider value={{ className: 'mt-1', size: '2rem' }}>
              <GiTrophyCup />
            </IconContext.Provider> */}
              <img
                src={require(`../assets/img/token/xSAKE.png`)}
                width={`${imageSize}px`}
                alt="fromToken"
              />

              <div className="px-3 flex flex-col items-center">
                <Typography variant="small">xSAKE</Typography>
                {/* <Typography variant="small">
                0.0006($50)
              </Typography> */}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
