import { Alert, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function AlertBanner() {
  return (
    <Alert
      severity="warning"
      action={
        <IconButton size="small">
          <CloseIcon />
        </IconButton>
      }
      sx={{ mb: 2 }}
    >
      Alert: 3 clinical programmers serving notice — post replacements now
    </Alert>
  );
}