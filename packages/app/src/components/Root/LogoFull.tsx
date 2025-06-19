import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 30,
  },
  path: {
    fill: '#7df3e1',
  },
});

const LogoFull = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 240 40"
    >
      {/* Simple text-based logo */}
      <text x="10" y="25" fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="#161616">
        CDCR Developer Portal
      </text>
    </svg>
  );
};

export default LogoFull;
