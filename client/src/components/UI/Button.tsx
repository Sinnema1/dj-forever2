import React from "react";
import MuiButton, { type ButtonProps } from "@mui/material/Button";

export const Button = <C extends React.ElementType = "button">(
  props: ButtonProps<C>
) => {
  return (
    <MuiButton
      variant={props.variant ?? "contained"}
      sx={{ borderRadius: 2, textTransform: "none" }}
      {...props}
    />
  );
};
