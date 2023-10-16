import React from "react";
import { Typography } from "@material-tailwind/react";

import jwerlyIcon from "../assets/img/icon/jwerly.png";
import chainsIcon from "../assets/img/icon/chains.png";
import featureIcon from "../assets/img/icon/feature.png";
import bigSymbolIcon from "../assets/img/icon/bigSymbol.png";
import fundsSymbolIcon from "../assets/img/icon/funds.png";
import sakeSymbolIcon from "../assets/img/icon/sake.png";
import fdvSymbolIcon from "../assets/img/icon/fdv.png";
import circSymbolIcon from "../assets/img/icon/circulate.png";
import sakeTokenIcon from "../assets/img/icon/SAKE_Token.png";
import xsakeTokenIcon from "../assets/img/icon/xSAKE_Token.png";
// TODO replace icon by design
import xSakeLPadAlloc from "../assets/img/icon/xSAKE_Token.png";
import xSakeLPadTimer from "../assets/img/icon/hourglass.png";
import xSakeDeallocFee from "../assets/img/icon/scale.png";

export default function Item(props) {
  // const [isNavOpen, setIsNavOpen] = React.useState(false);

  // React.useEffect(() => {

  // }, []);

  return (
    <React.Fragment>
      <div className="w-full flex flex-row justify-start mx-auto mb-2 lg:mb-0">
        {/* {props.type === "chain" && (
          <img className="w-8 h-15 mr-5" src={chainsIcon} alt="chain" />
        )}
        {props.type === "feature" && (
          <img className="w-8 h-15 mr-4" src={featureIcon} alt="feature" />
        )}
        {props.type === "jwerly" && (
          <img className="w-8 h-15 mr-4" src={jwerlyIcon} alt="jwerly" />
        )}
        {props.type === "symbol" && (
          <img
            className="w-8 h-15 mr-4"
            src={bigSymbolIcon}
            alt="bigSymbolIcon"
          />
        )}
        {props.type === "eth" && (
          <img className="w-8 h-15 mr-4" src={fundsSymbolIcon} alt="eth" />
        )}
        {props.type === "sakeprice" && (
          <img className="w-8 h-15 mr-4" src={sakeSymbolIcon} alt="sake" />
        )}
        {props.type === "circulate" && (
          <img className="w-8 h-15 mr-4" src={circSymbolIcon} alt="circulate" />
        )}
        {props.type === "fdv" && (
          <img className="w-8 h-15 mr-4" src={fdvSymbolIcon} alt="fdv" />
        )}
        {props.type === "saketoken" && (
          <img className="w-8 h-15 mr-4" src={sakeTokenIcon} alt="sake" />
        )}
        {props.type === "xsaketoken" && (
          <img className="w-8 h-15 mr-4" src={xsakeTokenIcon} alt="xsake" />
        )}
        {props.type === "xSakeLPadAlloc" && (
          <img className="w-8 h-15 mr-4" src={xSakeLPadAlloc} alt="alloc" />
        )}
        {props.type === "xSakeLPadTimer" && (
          <img className="w-8 h-15 mr-4" src={xSakeLPadTimer} alt="cooldown" />
        )}
        {props.type === "xSakeDeallocFee" && (
          <img
            className="w-8 h-15 mr-4"
            src={xSakeDeallocFee}
            alt="deallocFee"
          />
        )} */}
        <div className="flex flex-col gap-2">
          <span>{props.label}</span>
          <span className="text-kojiki-blue">{props.value}</span>
          {props.label2 && <span>{props.label2}</span>}
        </div>
      </div>
    </React.Fragment>
  );
}
