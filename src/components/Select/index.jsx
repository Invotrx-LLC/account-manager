import React, { useState } from "react";
import { Box, Typography, ClickAwayListener } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select",
  width = 150,
  height = 200,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: "relative", width }}>
        {/* Trigger */}
        <Box
          onClick={() => !disabled && setOpen((prev) => !prev)}
          sx={{
            height: 36,
            border: "1px solid #d0d5dd",
            borderRadius: "8px",
            px: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: disabled ? "not-allowed" : "pointer",
            background: disabled ? "#f5f5f5" : "#fff",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <Typography
            sx={{
              fontSize: 12,
              fontFamily: "Helvetica",
              color: value ? "#333" : "#9CA3AF",
              textTransform: "capitalize",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
            }}
          >
            {value ? value.replace(/_/g, " ") : placeholder}
          </Typography>

          <KeyboardArrowDownIcon
            sx={{
              fontSize: 18,
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "0.2s",
            }}
          />
        </Box>

        {/* Dropdown */}
        {open && !disabled && (
          <Box
            sx={{
              position: "absolute",
              top: "42px",
              left: 0,
              width: "100%",
              bgcolor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              zIndex: 9999,
              maxHeight: height,
              overflowY: "auto",

              "&::-webkit-scrollbar": {
                width: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "#c1c1c1",
                borderRadius: 10,
              },
            }}
          >
            {options.length > 0 ? (
              options.map((item) => (
                <Box
                  key={item}
                  onClick={() => handleSelect(item)}
                  sx={{
                    px: 2,
                    py: 1,
                    fontSize: 13,
                    fontFamily: "Helvetica",
                    textTransform: "capitalize",
                    cursor: "pointer",

                    "&:hover": {
                      bgcolor: "#f5f5f5",
                    },
                  }}
                >
                  {item.replace(/_/g, " ")}
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  fontSize: 12,
                  color: "#9CA3AF",
                }}
              >
                No options
              </Box>
            )}
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}