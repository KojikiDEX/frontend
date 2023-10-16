import React from "react";
import { Typography } from "@material-tailwind/react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { GiCancel } from "react-icons/gi";
import { IconContext } from "react-icons";
import { useNavigate } from "react-router-dom";
import { useLaunchpadStatus } from "../../hooks/useLaunchpadStatus";
import sakeLogo from "../../assets/img/token/SAKE.png";

export default function LaunchpadTable() {
  const navigate = useNavigate();
  const items = useLaunchpadStatus();
  return (
    <div className="w-full flex flex-col">
      <>
        {/* simple view */}
        <div className="hidden lg:flex">
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <td scope="col pt-3">name</td>
                <td scope="col pt-3">hardcap</td>
                <td scope="col pt-3">referral stage</td>
                <td scope="col pt-3">status</td>
                <td scope="col pt-3">total raised</td>
                <td scope="col pt-3">your allocation</td>
              </tr>
            </thead>
            <tbody>
              {items !== undefined &&
                items.map((item, i) => {
                  return (
                    <tr
                      key={i}
                      className="hover:border-[#14a8d4] cursor-pointer"
                      onClick={(e) => {
                        navigate(`/launchpad/${item.symbol.toLowerCase()}`);
                      }}
                    >
                      <td className="whitespace-nowrap mt-3">
                        <div className="w-full flex flex-col justify-start items-center lg:flex-row">
                          <img
                            src={sakeLogo}
                            width="30px"
                            className="py-1"
                            alt="fromToken"
                          />
                          {/* <img src={item.logo} width='48px' className="py-1" alt="fromToken" /> */}
                          <div className="mx-3 px-1 pt-1 flex flex-col">
                            <span>{`${item.symbol}`}</span>
                            <span className="text-sm">Raising {item.fund}</span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        {item.hardCapState ? (
                          <IconContext.Provider
                            value={{
                              color: "yellow",
                              className: "px-auto",
                              size: "1.5rem",
                            }}
                          >
                            <AiOutlineCheckCircle />
                          </IconContext.Provider>
                        ) : (
                          // <IconContext.Provider value={{ color: 'gray', className: 'px-auto', size: '1.5rem' }}>
                          //     <GiCancel />
                          // </IconContext.Provider>
                          <span>infinite</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {item.softCapState ? (
                          <IconContext.Provider
                            value={{
                              color: "yellow",
                              className: "px-auto",
                              size: "1.5rem",
                            }}
                          >
                            <AiOutlineCheckCircle />
                          </IconContext.Provider>
                        ) : (
                          // <IconContext.Provider value={{ color: 'gray', className: 'px-auto', size: '1.5rem' }}>
                          //     <GiCancel />
                          // </IconContext.Provider>
                          <IconContext.Provider
                            value={{
                              color: "gray1",
                              className: "px-auto",
                              size: "1.5rem",
                            }}
                          >
                            <AiOutlineCheckCircle />
                          </IconContext.Provider>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {item.status ? (
                          <span>enabled</span>
                        ) : (
                          // <span>
                          <span>
                            {/* disabled */}
                            upcoming
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        {/* <span> */}
                        <span>
                          {`${item.totalRaisedInETH.toFixed(3)} ${item.fund}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <span>{`${item.userAllocation.toFixed(3)} %`}</span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="flex lg:hidden">
          <table className="min-w-full text-left ">
            <thead className="border-x-0 border-t-0 border-slate-300 py-1">
              <tr>
                <th scope="hidden col pt-3">name</th>
                <th scope="col pt-3">status</th>
                <th scope="col pt-3">raised</th>
              </tr>
            </thead>
            <tbody>
              {items !== undefined &&
                items.map((item, i) => {
                  return (
                    <tr
                      key={i}
                      className="hover:border-[#14a8d4] cursor-pointer"
                      onClick={(e) => {
                        navigate(`/launchpad/${item.symbol.toLowerCase()}`);
                      }}
                    >
                      <td className="whitespace-nowrap mt-3">
                        <div className="w-full flex flex-col justify-start">
                          <img
                            src={sakeLogo}
                            width="24px"
                            className="py-1"
                            alt="fromToken"
                          />
                          {/* <img src={item.logo} width='24px' className="py-1" alt="fromToken" /> */}
                          <span>{`${item.symbol}`}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="w-full flex flex-col">
                          {item.status ? (
                            <span>enabled</span>
                          ) : (
                            <span>
                              {/* <span> */}
                              {/* disabled */}
                              upcoming
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex flex-row">
                          <span>
                            {`${item.totalRaisedInETH.toFixed(3)} ${item.fund}`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    </div>
  );
}
