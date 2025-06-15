import { Button as MuiButton, ButtonProps } from '@mui/material';

const Button = (props: ButtonProps) => {
  return <MuiButton variant="contained" {...props} />;
};

export default Button;
