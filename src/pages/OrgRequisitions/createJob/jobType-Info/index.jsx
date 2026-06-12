import React, { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Autocomplete,
} from "@mui/material";
import { AppContext } from "../../../../AppContext.js";
import api from "../../../../api.js";
import { toast } from "react-toastify";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { Checkbox } from "@mui/material";
import { getItem } from "../../../../utils/helper.js";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const JobTypeInfo = ({
  handleNext,
  activeStep,
  handleStepClick,
  onSubmit,
  jobId,
  jobDetails,
  onSubmitSuccess,
}) => {
  const {
    formData = {},
    setFormData,
    setEmployerStepperData,
  } = useContext(AppContext);

  const jobTypes = ["Full Time", "Part Time", "Freelancer"];
  const ModeOfWork = ["Remote", "Hybrid", "Onsite"];
  const SalaryRangeOptions = ["Rate/hour", "CtC", "W7", "1099", "W2"];
  const salaryUnitOptions = ["1000", "10000", "1000000", "100000"];

  const [countries, setCountries] = useState([]);
  const [stateAndCityOptions, setStateAndCityOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStateAndCity, setSelectedStateAndCity] = useState("");

  const [localData, setLocalData] = useState({
    jobType: "",
    salaryRange: null,
    salaryUnit: null,
    country: "",
    modeOfWork: "",
    stateAndCity: "",
    selectedManager: null,
    selectedRectuiter: [],
    selectedRecruiterIds: [],
  });

  const [errors, setErrors] = useState({});
  const [hiringManagerList, setHiringManagerList] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const Approver = JSON.parse(localStorage.getItem("user"));
  console.log("Approver",Approver);
  
  const apiResApprover = hiringManagerList.find(
    (val) => val?.name?.toLowerCase() === Approver?.name?.toLowerCase(),
  );
  console.log("hiringManagerList",hiringManagerList)
  const handleAutoCompleteChange = (key) => (_e, value) => {
    setLocalData((prev) => ({ ...prev, [key]: value || "" }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get("/dropdown/countries");
        setCountries(response.data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };
    fetchCountries();
  }, []);

  // useEffect(() => {
  //   const fetchHiringManagers = async () => {
  //     const roles = ["super_admin", "admin", "hm_user"];
  //     try {
  //       const requests = roles.map((role) =>
  //         api
  //           .get(`/user-employees/by-role_v1?user_role=${role}`)
  //           .catch(() => ({ data: { data: [] } })),
  //       );
  //       const responses = await Promise.all(requests);

  //       let allUsers = responses.flatMap((res) => res?.data?.data || []);
  //       console.log("roles", allUsers);

  //       const uniqueMap = new Map();
  //       allUsers.forEach((user) => {
  //         if (user.id && user.name)
  //           uniqueMap.set(user.id, {
  //             id: user.id,
  //             name: user.name,
  //             designation: user.designation,
  //           });
  //       });

  //       const uniqueUsers = Array.from(uniqueMap.values()).sort((a, b) =>
  //         a.name.localeCompare(b.name),
  //       );
  //       setHiringManagerList(uniqueUsers);
  //     } catch (error) {
  //       console.error("Error fetching hiring managers:", error);
  //     }
  //   };
  //   fetchHiringManagers();
  // }, []);

  // useEffect(() => {
  //   const fetchRecruiters = async () => {
  //     const roles = ["super_admin", "admin", "hm_user"];
  //     try {
  //       const requests = roles.map((role) =>
  //         api
  //           .get(`/user-employees/by-role_v1?user_role=${role}`)
  //           .catch(() => ({ data: { data: [] } })),
  //       );
  //       const responses = await Promise.all(requests);
  //       let allUsers = responses.flatMap((res) => res?.data?.data || []);
  //       console.log("responses", allUsers);

  //       const uniqueMap = new Map();
  //       allUsers.forEach((user) => {
  //         if (user.id && user.name)
  //           uniqueMap.set(user.id, {
  //             id: user.id,
  //             name: user.name,
  //             designation: user.designation,
  //           });
  //       });

  //       const uniqueUsers = Array.from(uniqueMap.values()).sort((a, b) =>
  //         a.name.localeCompare(b.name),
  //       );
  //       setRecruitersList(uniqueUsers);
  //     } catch (error) {
  //       console.error("Error fetching recruiters:", error);
  //     }
  //   };
  //   fetchRecruiters();
  // }, []);
useEffect(() => {
  const fetchUsers = async () => {
    try {
      const roles = ["super_admin", "admin", "hm_user"];

      const requests = roles.map((role) =>
        api.get(`/user-employees/by-role_v1?user_role=${role}`)
      );

      const responses = await Promise.all(requests);
      const allUsers = responses.flatMap(res => res.data?.data || []);

      const uniqueUsers = Array.from(
        new Map(allUsers.map(u => [u.id, u])).values()
      );

      setHiringManagerList(uniqueUsers);
      setRecruitersList(uniqueUsers);
    } catch (err) {
      console.error(err);
    }
  };

  fetchUsers();
}, []);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country || "");
    setSelectedStateAndCity("");
    setLocalData((prev) => ({
      ...prev,
      country: country || "",
      stateAndCity: "",
    }));

    if (country) {
      const fetchCities = async () => {
        try {
          const response = await api.get(
            `/dropdown/locations?country=${country}`,
          );
          setStateAndCityOptions(response.data || []);
        } catch (error) {
          console.error("Error fetching cities:", error);
          setStateAndCityOptions([]);
        }
      };
      fetchCities();
    } else {
      setStateAndCityOptions([]);
    }
  };

  useEffect(() => {
    if (!jobDetails) return;

    const country = jobDetails.country || "";
    const city = jobDetails.city || "";

    setSelectedCountry(country);
    setSelectedStateAndCity(city);

    setLocalData((prev) => ({
      ...prev,
      country,
      stateAndCity: city,
      jobType: normalizeJobType(jobDetails.job_type) || "",
      modeOfWork: jobDetails.mode_of_work || "",
      salaryRange:
        country.toLowerCase() === "india"
          ? null
          : jobDetails.salary_range || null,
      salaryUnit:
        country.toLowerCase() === "india"
          ? null
          : jobDetails.salary_unit || null,
    }));

    if (jobDetails.hiring_manager && hiringManagerList.length > 0) {
      const matched = hiringManagerList.find(
        (m) => m.id === jobDetails.hiring_manager.id,
      );
      if (matched) {
        setLocalData((prev) => ({ ...prev, selectedManager: matched }));
      }
    }

    if (country) {
      const fetchCities = async () => {
        try {
          const response = await api.get(
            `/dropdown/locations?country=${country}`,
          );
          setStateAndCityOptions(response.data || []);
        } catch (error) {
          console.error("Error fetching cities on load:", error);
        }
      };
      fetchCities();
    }
  }, [jobDetails, hiringManagerList]);

  const normalizeJobType = (value) => {
    if (!value) return "";
    const lower = value.trim().toLowerCase();
    if (lower.includes("full")) return "Full Time";
    if (lower.includes("part")) return "Part Time";
    if (lower.includes("free")) return "Freelancer";
    return value;
  };

  const validateForm = () => {
    const newErrors = {
      country: !localData.country,
      jobType: !localData.jobType,
      modeOfWork: !localData.modeOfWork,
      selectedManager: !localData.selectedManager,
      // selectedRectuiter: !localData.selectedRectuiter,
      // selectedRectuiter: localData.selectedRectuiter.length === 0,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const isIndia = localData.country?.toLowerCase() === "india";

    const params = new URLSearchParams();

    params.append("job_type", localData.jobType || "");
    params.append("country", localData.country || "");
    params.append("salary_range", isIndia ? "" : localData.salaryRange || "");
    params.append("salary_unit", isIndia ? "" : localData.salaryUnit || "");
    params.append("mode_of_work", localData.modeOfWork || "");
    params.append("additional_skill_1", " ");
    params.append("additional_skill_2", " ");
    params.append("job_approver", localData.selectedManager?.id || "");

    params.append("recruiter", localData.selectedRecruiterIds.join(","));
    try {
      const response = await api.post(
        `/add-new-job_additional_details/${jobId}`,
        params.toString(),
        {
          headers: {
            accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (response?.data?.success) {
        setEmployerStepperData(response.data.data);
        onSubmitSuccess();
        toast.success("Job details saved successfully!");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to save job details.");
    }
  };
  useEffect(() => {
    if (apiResApprover && !localData.selectedManager) {
      setLocalData((prev) => ({
        ...prev,
        selectedManager: apiResApprover,
      }));
    }
  }, [apiResApprover]);
  return (
    <Grid container direction="column" spacing={3}>
      <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          id="jobTypeInfoForm"
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            p: { xs: 2, sm: 3, md: 3, lg: 4, xl: 4 },
            borderRadius: 2,
            border: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
                md: "1.2rem",
                lg: "1.3rem",
                xl: "1.4rem",
              },
              fontWeight: 500,
              mb: 2,
            }}
          >
            Job Type
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 }}>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                size="small"
                freeSolo
                fullWidth
                options={countries}
                value={jobDetails.country || localData.country || null}
                onChange={(e, value) => {
                  handleSelectCountry(value);
                  setErrors((prev) => ({ ...prev, country: "" }));

                  setSelectedStateAndCity("");
                  setLocalData((prev) => ({ ...prev, stateAndCity: "" }));
                  setErrors((prev) => ({ ...prev, stateAndCity: "" }));
                }}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Country"
                    error={!!errors.country}
                    helperText={errors.country ? "Country is required" : ""}
                    autoComplete="Country"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                      },
                    }}
                    required
                    InputLabelProps={{
                      sx: {
                        "& .MuiFormLabel-asterisk": {
                          color: "red",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                options={stateAndCityOptions}
                disabled={!jobDetails.country && !selectedCountry}
                value={jobDetails.city || selectedStateAndCity || ""}
                onChange={(e, value) => {
                  setSelectedStateAndCity(value);
                  setLocalData((prev) => ({
                    ...prev,
                    stateAndCity: value || "",
                  }));
                  setErrors((prev) => ({ ...prev, stateAndCity: "" }));
                }}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="City"
                    error={!!errors.stateAndCity}
                    helperText={errors.stateAndCity ? "City is required" : ""}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                      },
                    }}
                    // required
                    InputLabelProps={{
                      sx: {
                        "& .MuiFormLabel-asterisk": {
                          color: "red",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                freeSolo
                size="small"
                fullWidth
                options={jobTypes}
                value={
                  normalizeJobType(jobDetails?.job_type) ||
                  normalizeJobType(localData.jobType) ||
                  null
                }
                onChange={handleAutoCompleteChange("jobType")}
                isOptionEqualToValue={(option, value) => option === value}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Job Type"
                    error={!!errors.jobType}
                    helperText={errors.jobType ? "Job Type is required" : ""}
                    autoComplete="JobType"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                      },
                    }}
                    required
                    InputLabelProps={{
                      sx: {
                        "& .MuiFormLabel-asterisk": {
                          color: "red",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Grid container spacing={2}>
                <Grid item size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    size="small"
                    // disabled={localData.country?.toLowerCase() === "india"}
                    options={SalaryRangeOptions}
                    value={
                      jobDetails.salary_range || localData.salaryRange || null
                    }
                    onChange={handleAutoCompleteChange("salaryRange")}
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Salary Unit"
                        error={!!errors.salaryRange}
                        helperText={
                          errors.salaryRange ? "Salary Range is required" : ""
                        }
                        autoComplete="salary range"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#00BBD4" },
                            "&:hover fieldset": { borderColor: "#00BBD4" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#00BBD4",
                            },
                          },
                        }}
                        // required
                        InputLabelProps={{
                          sx: {
                            "& .MuiFormLabel-asterisk": {
                              color: "red",
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item size={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                  <Autocomplete
                    freeSolo
                    fullWidth
                    size="small"
                    // disabled={localData.country?.toLowerCase() === "india"}
                    options={salaryUnitOptions}
                    value={jobDetails.salary_unit || localData.salaryUnit || ""}
                    onChange={(e, value) => {
                      setLocalData((prev) => ({
                        ...prev,
                        salaryUnit: value || "",
                      }));
                      setErrors((prev) => ({ ...prev, salaryUnit: "" }));
                    }}
                    onInputChange={(e, value) => {
                      setLocalData((prev) => ({
                        ...prev,
                        salaryUnit: value || "",
                      }));
                      setErrors((prev) => ({ ...prev, salaryUnit: "" }));
                    }}
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Salary"
                        error={!!errors.salaryUnit}
                        helperText={
                          errors.salaryUnit ? "Salary Unit is required" : ""
                        }
                        autoComplete="salary unit"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && e.target.value) {
                            e.preventDefault();
                            setLocalData((prev) => ({
                              ...prev,
                              salaryUnit: e.target.value.trim(),
                            }));
                            setErrors((prev) => ({ ...prev, salaryUnit: "" }));
                          }
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#00BBD4" },
                            "&:hover fieldset": { borderColor: "#00BBD4" },
                            "&.Mui-focused fieldset": {
                              borderColor: "#00BBD4",
                            },
                          },
                        }}
                        // required
                        InputLabelProps={{
                          sx: {
                            "& .MuiFormLabel-asterisk": {
                              color: "red",
                            },
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                options={ModeOfWork}
                value={jobDetails?.mode_of_work || localData.modeOfWork || null}
                onChange={handleAutoCompleteChange("modeOfWork")}
                getOptionLabel={(option) => {
                  if (!option) return "";
                  return option
                    .toLowerCase()
                    .replace(/\b\w/g, (char) => char.toUpperCase());
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Mode Of Work"
                    error={!!errors.modeOfWork}
                    helperText={errors.modeOfWork ? "Mode is required" : ""}
                    autoComplete="modeOfWork"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                      },
                    }}
                    required
                    InputLabelProps={{
                      sx: {
                        "& .MuiFormLabel-asterisk": {
                          color: "red",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            {/* <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                multiple
                disabled
                size="small"
                freeSolo
                options={availableSkills}
                value={
                  jobDetails.additionalSkill_1 || localData?.itSkills || []
                }
                onChange={handleSkillsChange}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Additional skills 1"
                    placeholder="Type to add custom skills or select from list"
                    onKeyDown={handleCustomSkillAdd}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                        "& .MuiInputBase-input": {
                          height: "20px",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                multiple
                freeSolo
                size="small"
                disabled
                options={availableSkills}
                value={jobDetails.additionalSkill_2 || localData.itSkills || []}
                onChange={handleSkillsChange}
                getOptionLabel={(option) => option || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Additional skills 2"
                    placeholder="Type to add custom skills or select from list"
                    onKeyDown={handleCustomSkillAdd}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "#00BBD4" },
                        "&:hover fieldset": { borderColor: "#00BBD4" },
                        "&.Mui-focused fieldset": { borderColor: "#00BBD4" },
                        "& .MuiInputBase-input": {
                          height: "20px",
                        },
                      },
                    }}
                  />
                )}
              />
            </Grid> */}
          </Grid>
        </Box>
      </Grid>
      <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }}>
        <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            p: { xs: 2, sm: 3, md: 3, lg: 4, xl: 4 },
            borderRadius: 2,
            border: 1,
            borderColor: "#E5E7EB",
          }}
        >
          <Typography
            sx={{
              fontSize: {
                xs: "1rem",
                sm: "1.1rem",
                md: "1.2rem",
                lg: "1.3rem",
                xl: "1.4rem",
              },
              fontWeight: 500,
              mb: 2,
            }}
          >
            Team
          </Typography>
          <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5, lg: 3, xl: 3 }}>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                size="small"
                options={hiringManagerList}
                // value={apiResApprover || localData.selectedManager || null}
                value={localData.selectedManager || null}
                onChange={(e, value) => {
                  setLocalData((prev) => ({ ...prev, selectedManager: value }));
                  setErrors((prev) => ({ ...prev, selectedManager: "" }));
                }}
                getOptionLabel={(option) => {
                  console.log("option", option);
                  return `${option?.name} (${option?.designation})` || "";
                }}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Approver"
                    required
                    error={!!errors.selectedManager}
                    helperText={errors.selectedManager && "Required"}
                    sx={{
                      "& .MuiFormLabel-asterisk": {
                        color: "red",
                      },
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item size={{ xs: 12, sm: 6, md: 6, lg: 6, xl: 6 }}>
              <Autocomplete
                multiple
                size="small"
                // options={recruitersList}
                options={recruitersList.filter((user) => {
                  // console.log("user", user);

                  return (
                    user.id !== localData.selectedManager?.id
                     &&
                    user.designation !== "Super admin"
                  );
                })}
                value={localData.selectedRectuiter || []}
                // onChange={(e, value) => {
                //   console.log("ReqruterValue",value);
                //    const recruiterIds = value.map((item) => item.id);
                //   setLocalData((prev) => ({
                //     ...prev,
                //     // selectedRectuiter: value,
                //     selectedRectuiter: recruiterIds,
                //   }));
                //   setErrors((prev) => ({ ...prev, selectedRectuiter: "" }));
                // }}
                onChange={(e, value = []) => {
                  console.log("RecruiterValue", value);

                  const recruiterIds = value
                    .filter(Boolean) // safety
                    .map((item) => item.id); // extract ids

                  setLocalData((prev) => ({
                    ...prev,
                    selectedRectuiter: value, // ✅ objects (UI)
                    selectedRecruiterIds: recruiterIds, // ✅ ids (API)
                  }));

                  setErrors((prev) => ({ ...prev, selectedRectuiter: "" }));
                }}
                getOptionLabel={(option) => option?.name || ""}
                isOptionEqualToValue={(option, value) =>
                  option?.id === value?.id
                }
                disableCloseOnSelect
                renderOption={(props, option, { selected }) => (
                  <li {...props} style={{ fontSize: 12 }}>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                      size="small"
                      sx={{ padding: "0px 5px" }}
                    />
                    {console.log("localData", recruitersList)}
                    {`${option?.name} (${option?.designation})` || ""}
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Collaborators"
                    // required
                    error={!!errors.selectedRectuiter}
                    helperText={errors.selectedRectuiter && "Required"}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </Grid>
    </Grid>
  );
};

export default React.memo(JobTypeInfo);
