import React from "react";
import { FormControl, MenuItem, Select } from "@mui/material";
import { COLORS } from "../../../styles/theme";
import { useGetSubFunctionsQuery } from "../../../store/api/dashboardApi";

const PERIOD_OPTIONS = [
  { value: 3, label: "Last 3 months" },
  { value: 6, label: "Last 6 months" },
  { value: "all", label: "All" },
  // { value: 12, label: "Last 12 months" },
];

export const COUNTRY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "India", label: "India" },
  { value: "United States", label: "United States" },
];

const selectSx = {
  height: 28,
  fontSize: 11.5,
  borderRadius: "8px",
  bgcolor: "#F7F9FC",
  "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
  "& .MuiSelect-select": { py: "4px", pl: "10px" },
};

const menuPropsSx = { PaperProps: { sx: { "& .MuiMenuItem-root": { fontSize: 11.5 } } } };

// ── Period (monthly) selector — top-level dashboard filter bar ──────────────
const PeriodSelect = ({ value, onChange, disabled }) => (
  <FormControl size="small" sx={{ minWidth: 130 }} disabled={disabled}>
    <Select value={value} onChange={(e) => onChange(e.target.value)} sx={selectSx} MenuProps={menuPropsSx}>
      {PERIOD_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

// ── Country selector — top-level dashboard filter bar ───────────────────────
export const CountrySelect = ({ value, onChange, disabled }) => (
  <FormControl size="small" sx={{ minWidth: 140 }} disabled={disabled}>
    <Select value={value} onChange={(e) => onChange(e.target.value)} sx={selectSx} MenuProps={menuPropsSx}>
      {COUNTRY_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

// ── Sub-function selector — top-level dashboard filter bar ──────────────────
export const SubFunctionSelect = ({ value, onChange, disabled }) => {
  const { data: subFnRes, isLoading: subFnLoading } = useGetSubFunctionsQuery();
  const options = subFnRes?.data ?? [];

  return (
    <FormControl size="small" sx={{ minWidth: 190 }} disabled={disabled || subFnLoading}>
      <Select value={value} onChange={(e) => onChange(e.target.value)} displayEmpty sx={selectSx} MenuProps={menuPropsSx}>
        <MenuItem value="">All Sub-functions</MenuItem>
        {options.map((opt) => (
          <MenuItem key={opt.key} value={opt.key}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default PeriodSelect;
