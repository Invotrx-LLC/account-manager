import { makeStyles } from '@mui/styles';

const UseJobRequirementsStyles = makeStyles((theme) => ({
  title: {
    fontWeight: 600,
    // marginBottom: theme.spacing(3),
    textShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
    // color: theme.palette.text.primary,
    fontWeight: 700,
    mb: 4,
    // marginLeft:"20x"
  },
  subtitle: {
    textAlign: "left",
  },
  instructionsSection: {
    display: "flex",
    // gap: theme.spacing(2),
    alignItems: "center",
    // marginTop:"25px",
  },
 
  uploadSection: {
    display: "flex",
    justifyContent: "space-around",
    // marginTop:"-20px",
    // marginLeft:"120px"
    // marginTop: theme.spacing(2),
  },
  uploadText: {
    // marginBottom: theme.spacing(2),
  },
  uploadButton: {
    // borderRadius: "20px",
  },
  selectedFileText: {
    // marginTop: theme.spacing(1),
    fontStyle: "italic",
  },
  fileErrorText: {
    // marginTop: theme.spacing(2),
    color: "red",
},

 
}));

export default UseJobRequirementsStyles;
