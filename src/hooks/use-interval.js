import { useState, useEffect } from "react";

export function useInterval(POLLING_RATE) {
    let [buster, setBuster] = useState(Date.now());
  
    useEffect(() => {
      let id = setInterval(() => setBuster(Date.now()), POLLING_RATE);
      return () => {
        clearInterval(id);
      };
    }, [POLLING_RATE]);
  
    return buster;
  }
  