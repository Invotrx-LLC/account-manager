import React from "react";
import {
    Autocomplete,
    TextField,
    Checkbox,
    Chip,
    Paper,
    Tooltip,
    Box,
    Typography,
} from "@mui/material";
import { PRIMARY } from "../../theme/index";

const C = {
    primary: PRIMARY.primary,
    primaryLight: "#EBF0FB",
    border: "#E5E7EB",
    text: "#111827",
    textMuted: "#6B7280",
    tag: "#EBF0FB",
    tagText: "#1A4FB5",
    tagBorder: "#C7D8F8",
    selectedBg: "#EEF2FF",
    selectedCheck: "#E8532A",      // orange fill shown in screenshot
    selectedCheckBorder: "#E8532A",
};

export default function GroupedSkillAutocomplete({
    options = [],
    value = [],
    onChange,
    placeholder = "Select Skills",
    showTooltip = false,
}) {
    const hasGroups = options.some(
        (o) => o.primary_selected || o.mandatory_selected
    );
    return (
        <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            // groupBy={(option) => option.primary_selected || "Skills"}
            groupBy={
                hasGroups
                    ? (option) =>
                        option.primary_selected ||
                        option.mandatory_selected
                    : undefined
            }
            getOptionLabel={(option) => option.label}
            value={options.filter((o) => value.includes(o.key))}
            onChange={(_, selected) => onChange(selected.map((s) => s.key))}
            sx={{
                "& .MuiAutocomplete-tag": {
                    margin: "1px !important",
                },

                "& .MuiAutocomplete-inputRoot": {
                    gap: "2px",
                },
            }}
            PaperComponent={(props) => (
                <Paper
                    {...props}
                    elevation={3}
                    sx={{
                        borderRadius: "10px",
                        border: `1px solid ${C.border}`,
                        mt: "4px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                        "& .MuiAutocomplete-listbox": {
                            padding: "4px 0",
                            maxHeight: 280,
                        },
                        // Group header
                        "& .MuiAutocomplete-groupLabel": {
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: PRIMARY.fontFamily,
                            color: C.textMuted,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            lineHeight: "32px",
                            padding: "0 14px",
                            background: "#fff",
                        },
                        // Every option row
                        "& .MuiAutocomplete-option": {
                            fontFamily: PRIMARY.fontFamily,
                            fontSize: PRIMARY.label.fontSize,
                            color: C.text,
                            padding: "7px 14px",
                            gap: 8,
                            minHeight: "unset",
                            '&[aria-selected="true"]': {
                                background: C.selectedBg,
                            },
                            '&[aria-selected="true"].Mui-focused': {
                                background: C.selectedBg,
                            },
                            "&.Mui-focused": {
                                background: "#F5F7FF",
                            },
                        },
                    }}
                />
            )}
            renderGroup={(params) => {
                // const groupOptions = options.filter(
                //     (o) => (o.primary_selected || "Skills") === params.group
                // );
                const groupOptions = options.filter(
                    (o) =>
                        (o.primary_selected || o.mandatory_selected) ===
                        params.group
                );
                const groupKeys = groupOptions.map((o) => o.key);
                const allSelected = groupKeys.every((k) => value.includes(k));
                const someSelected = groupKeys.some((k) => value.includes(k));

                const handleGroupToggle = (e) => {
                    e.stopPropagation();
                    if (allSelected) {
                        onChange(value.filter((k) => !groupKeys.includes(k)));
                    } else {
                        onChange([...new Set([...value, ...groupKeys])]);
                    }
                };

                return (
                    <div key={params.key}>
                        <div
                            onClick={handleGroupToggle}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                cursor: "pointer",
                                userSelect: "none",
                                backgroundColor: allSelected ? "#EEF2FF" : someSelected ? "#F5F7FF" : "#fff",
                                borderBottom: `1px solid ${C.border}`,
                            }}
                        >
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected && !allSelected}
                                size="small"
                                onChange={handleGroupToggle}
                                onClick={(e) => e.stopPropagation()}
                                sx={{
                                    padding: "2px 8px 2px 0",
                                    color: C.border,
                                    "&.Mui-checked": { color: C.selectedCheck },
                                    "&.MuiCheckbox-indeterminate": { color: C.selectedCheck },
                                    "& .MuiSvgIcon-root": { fontSize: 18 },
                                }}
                            />
                            <span style={{
                                fontFamily: PRIMARY.fontFamily,
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.primary,
                                textTransform: "uppercase",
                                letterSpacing: "0.06em",
                            }}>
                                {params.group}
                            </span>
                        </div>
                        {params.children}
                    </div>
                );
            }}

            renderOption={(props, option, { selected }) => {
                const optionContent = (
                    <li {...props}>
                        <Checkbox
                            checked={selected}
                            size="small"
                            sx={{
                                padding: "2px 8px 2px 0",
                                color: C.border,
                                "&.Mui-checked": {
                                    color: C.selectedCheck,
                                },
                                "& .MuiSvgIcon-root": {
                                    fontSize: 18,
                                },
                            }}
                        />

                        <span
                            style={{
                                fontFamily: PRIMARY.fontFamily,
                                fontSize: PRIMARY.label.fontSize,
                                color: C.text,
                            }}
                        >
                            {option.label}
                        </span>
                    </li>
                );

                if (!showTooltip) return optionContent;

                return (
                    <Tooltip
                        placement="left"
                        arrow
                        enterDelay={300}
                        title={
                            <Box sx={{ p: 0.5 }}>
                                <Typography
                                    sx={{
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: "#FF5722",
                                        mb: 0.5,
                                    }}
                                >
                                    {option.label}
                                </Typography>

                                <Typography
                                    sx={{
                                        fontSize: 12,
                                        color: "#222",
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {option.description || "No description available"}
                                </Typography>
                            </Box>
                        }
                        slotProps={{
                            tooltip: {
                                sx: {
                                    backgroundColor: "#fff",
                                    color: "#111827",
                                    borderRadius: "8px",
                                    maxWidth: 320,
                                    boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                                },
                            },
                        }}
                    >
                        <div>{optionContent}</div>
                    </Tooltip>
                );
            }}

            renderTags={(tagValue, getTagProps) =>
                tagValue.map((option, index) => (
                    <Chip
                        label={option.label}
                        {...getTagProps({ index })}
                        key={option.key}
                        size="small"
                        sx={{
                            fontFamily: PRIMARY.fontFamily,
                            fontSize: "5px",
                            fontWeight: 500,
                            color: C.tagText,
                            background: C.tag,
                            border: `1px solid ${C.tagBorder}`,
                            borderRadius: "14px",
                            height: 20,
                            margin: "1px !important",
                            "& .MuiChip-label": {
                                px: 0.75,
                                py: 0,
                            },
                            "& .MuiChip-deleteIcon": {
                                fontSize: 12,
                                marginRight: "2px",
                                marginLeft: "-2px",
                                color: C.tagText,
                            },
                        }}
                    />
                ))
            }

            renderInput={(params) => (
                <TextField
                    {...params}
                    placeholder={placeholder}
                    size="small"
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            padding: "3px 6px !important",
                            minHeight: "38px",
                            alignItems: "center",
                        },
                        "& .MuiAutocomplete-input": {
                            fontFamily: PRIMARY.fontFamily,
                            fontSize: PRIMARY.label.fontSize,
                            padding: "2px 4px !important",
                            "&::placeholder": {
                                color: "#9CA3AF",
                                opacity: 1,
                            },
                        },
                    }}
                />
            )}
        />
    );
}