import { useEffect, useState } from "react";
import { displayRemainTime } from "../../utils";

export const DownCounter = ({ seconds }) => {
    const [coolDown, setCoolDown] = useState(seconds)

    useEffect(() => {
        setCoolDown(seconds)
    }, [seconds])

    useEffect(() => {
        const timerID = setInterval(() => {
            setCoolDown((prevData) => {
                if (prevData > 0) {
                    return prevData - 1;
                }
                return 0;
            })
        }, 1000);

        return () => {
            clearInterval(timerID);
        };
        // eslint-disable-next-line
    }, []);

    return (
        <>
            {displayRemainTime(coolDown)}
        </>
    )
}