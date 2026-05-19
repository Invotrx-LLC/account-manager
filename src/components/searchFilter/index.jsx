import {
  TextField,
  InputAdornment,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";

export default function SearchFilter({
  value,
  onChange,
  placeholder,
}) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      size="small"
      sx={{
        width: 220,
        "& .MuiOutlinedInput-root": {
          borderRadius: "10px",
          fontSize: 13,
          background: "#fff",
        },
      }}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18 }} />
            </InputAdornment>
          ),
        },
      }}
    />
  );
}