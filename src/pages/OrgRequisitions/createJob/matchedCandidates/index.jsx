import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import GridViewIcon from "@mui/icons-material/GridView";
import MapIcon from "@mui/icons-material/Map";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EditIcon from "@mui/icons-material/Edit";

import CandidateCard from "./CandidateCard";
  // import { useLazyGetMatchedCandidateDetailsQuery } from "../../../services/createRequisitionService";
import { toast } from "react-toastify";
import {useLazyGetMatchedCandidateDetailsQuery} from "../../../../redux/services/createRequesition/createRequesition"
const MatchedCandidates = () => {
  const location = useLocation();
  const [viewMode, setViewMode] = useState("tile");
  const navigate = useNavigate();
  const { candidates = [], job_details_id, requisitionData ,orgId} = location.state || {};

  const validCandidates = candidates.filter((candidate) => candidate?.id);


// inside component:
const [fetchCandidateDetails] = useLazyGetMatchedCandidateDetailsQuery();
const [loadingId, setLoadingId] = useState(null);

const handleViewProfile = async (candidate) => {
  setLoadingId(candidate.id);
  try {
    const result = await fetchCandidateDetails(candidate.id).unwrap();
    navigate("/account-manager//view-profile", {
      state: {
        profileResponse: result,   // already transformed → response.data
        job_details_id,
        status: candidate.status,
        list: validCandidates,
        orgId,
      },
    });
  } catch (err) {
    toast.error("Failed to load candidate profile.");
  } finally {
    setLoadingId(null);
  }
};


  return (
    <Box p={3}>
      {/* Top Action Bar */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        {/* Tile / Map Toggle */}
        <Box
          sx={{
            display: "flex",
            border: "1px solid #E5E7EB",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Button
            startIcon={<GridViewIcon />}
            onClick={() => setViewMode("tile")}
            sx={{
              textTransform: "none",
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              background: viewMode === "tile" ? "#00BBD4" : "#fff",
              color: viewMode === "tile" ? "#fff" : "#374151",
              "&:hover": {
                background: viewMode === "tile" ? "#009FB5" : "#F3F4F6",
              },
            }}
          >
            Tile
          </Button>
          <Button
            startIcon={<MapIcon />}
            onClick={() => setViewMode("map")}
            sx={{
              textTransform: "none",
              borderRadius: 0,
              px: 2,
              fontWeight: 600,
              borderLeft: "1px solid #E5E7EB",
              background: viewMode === "map" ? "#00BBD4" : "#fff",
              color: viewMode === "map" ? "#fff" : "#374151",
              "&:hover": {
                background: viewMode === "map" ? "#009FB5" : "#F3F4F6",
              },
            }}
          >
            Map
          </Button>
        </Box>

        {/* Request Additional Candidates */}
        <Button
          variant="outlined"
          startIcon={<PersonAddAltIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#00BBD4",
            color: "#00BBD4",
            fontWeight: 600,
            "&:hover": {
              borderColor: "#009FB5",
              background: "#F0FDFF",
            },
          }}
        >
          Request Additional Candidates
        </Button>

        {/* Edit Job */}
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={() =>
            navigate("/account-manager/create-requisition", {
              state: {
                editMode: true,
                requisitionData,
                orgId
              },
            })
          }
        >
          Edit Job
        </Button>
      </Box>

      {/* Page Header
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
        Matched Candidates
      </Typography>
      <Typography sx={{ color: "#6B7280", mb: 3 }}>
        Job ID: {job_details_id}
      </Typography> */}

      {/* Cards Grid — pt: 2 gives room for the overflowing status chip */}
      {validCandidates.length === 0 ? (
        <Typography>No matched candidates found.</Typography>
      ) : (
        <Grid
          container
          spacing={3}
          sx={{ pt: 2, display: 'flex', justifyContent: "center" }} // ← space for chip overflowing card top
        >
          {validCandidates.map((candidate, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={candidate.id}
              sx={{ display: "flex" }} // ← makes card fill cell height evenly
            >
              <CandidateCard
                candidate={candidate}
                index={index}
                handleClick={() => handleViewProfile(candidate)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MatchedCandidates;