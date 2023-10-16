import React from "react";
import {
  Input,
  Button,
  IconButton,
  Typography,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import { XMarkIcon } from "@heroicons/react/24/outline";

export default function YieldBoosterDlg(props) {
  const { amount, open, onChange, handleOpen } = props;

  return (
    <Dialog
      size="xs"
      open={open}
      handler={handleOpen}
      className="min-w-[100%] max-w-[100%] lg:min-w-[25%] max-w-[25%]  border"
    >
      <DialogHeader className="justify-between gap-2 border-b ">
        <Typography variant="h5">Dividends calculator</Typography>
        <IconButton size="sm" variant="text" onClick={handleOpen}>
          <XMarkIcon strokeWidth={2} className="h-5 w-5" />
        </IconButton>
      </DialogHeader>
      <DialogBody className="pr-2 ">
        <Typography variant="h6" className="mb-4">
          xSAKE allocation
        </Typography>
        <div className="relative flex">
          <Input
            type="text"
            label="amount"
            value={amount}
            className=" placeholder-shown:placeholder-shown:border-t-kojiki-gray"
            onChange={onChange}
            containerProps={{
              className: "min-w-0",
            }}
          />
          <Button size="sm" className="primary !py-0">
            max
          </Button>
        </div>
        <Typography variant="small" className="mb-4 text-right">
          balance: {0}$
        </Typography>
      </DialogBody>
      <DialogFooter>
        <button className="w-full primary" onClick={handleOpen}>
          close
        </button>
      </DialogFooter>
    </Dialog>
  );
}
