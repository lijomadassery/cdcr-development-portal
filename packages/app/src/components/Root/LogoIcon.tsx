import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  svg: {
    width: 'auto',
    height: 28,
  },
  path: {
    fill: '#7df3e1',
  },
});

const LogoIcon = () => {
  const classes = useStyles();

  return (
    <svg
      className={classes.svg}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 40 40"
    >
      {/* Simple icon version */}
      <text x="20" y="25" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" fill="#161616" textAnchor="middle">
        CDCR
      </text>
    </svg>
  );
};

export default LogoIcon;
