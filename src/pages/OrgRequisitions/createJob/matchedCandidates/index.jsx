import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

import GridViewIcon from "@mui/icons-material/GridView";
import MapIcon from "@mui/icons-material/Map";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EditIcon from "@mui/icons-material/Edit";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import CandidateCard from "./CandidateCard";
import { toast } from "react-toastify";
import { useLazyGetMatchedCandidateDetailsQuery } from "../../../../redux/services/createRequesition/createRequesition";

// ─── Constants ────────────────────────────────────────────────────────────────
const CARD_WIDTH = 280;
const CARD_GAP = 24;
const SCROLL_STEP = CARD_WIDTH + CARD_GAP;

// ─── Map auto-recenter on prop change ────────────────────────────────────────
const MapAutoCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

// ─── Simple geocode via Nominatim (cached) ────────────────────────────────────
const geocodeCache = {};
const geocodeCity = async (city) => {
  if (!city || city === "Not specified") return null;
  const key = city.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data?.length) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache[key] = coords;
      return coords;
    }
  } catch {
    // silently fail
  }
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
const MatchedCandidates = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState("tile");
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Map state
  const [assignedCandidates, setAssignedCandidates] = useState([]); // [{city, coords, candidates[]}]
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]);    // default: India
  const [mapLoading, setMapLoading] = useState(false);
  const [openTooltipId, setOpenTooltipId] = useState(null);

  const sliderRef = useRef(null);

  const {
    candidates = [],
    orgEmpId,
    job_details_id,
    requisitionData,
    orgId,
  } = location.state || {};

  const validCandidates = candidates.filter((c) => c?.id);

  const [fetchCandidateDetails] = useLazyGetMatchedCandidateDetailsQuery();
  const [loadingId, setLoadingId] = useState(null);

  // ─── Geocode candidates whenever map mode is activated ────────────────────
  useEffect(() => {
    if (viewMode !== "map") return;

    const buildGroups = async () => {
      setMapLoading(true);

      // Group candidates by city
      const cityMap = {};
      for (const c of validCandidates) {
        const city = c.location || "Unknown";
        if (!cityMap[city]) cityMap[city] = [];
        cityMap[city].push(c);
      }

      // Geocode each unique city
      const groups = [];
      for (const [city, cands] of Object.entries(cityMap)) {
        const coords = await geocodeCity(city);
        if (coords) {
          groups.push({ city, coords, candidates: cands });
        }
      }

      setAssignedCandidates(groups);

      // Center map on first group
      if (groups.length > 0) setMapCenter(groups[0].coords);

      setMapLoading(false);
    };

    buildGroups();
  }, [viewMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Tile view handlers ────────────────────────────────────────────────────
  const handleViewProfile = async (candidate) => {
    setLoadingId(candidate.id);
    try {
      const result = await fetchCandidateDetails(candidate.id).unwrap();
      navigate("/account-manager/view-profile", {
        state: {
          profileResponse: result,
          job_details_id,
          status: candidate.status,
          list: validCandidates,
          orgId,
          orgEmpId,
          requisitionData,
          candidate,
        },
      });
    } catch {
      toast.error("Failed to load candidate profile.");
    } finally {
      setLoadingId(null);
    }
  };

  const hideEditButton = validCandidates.some(
    (c) =>
      c.status?.toLowerCase() === "shortlisted" ||
      c.status?.toLowerCase() === "rejected"
  );

  const syncArrows = () => {
    const el = sliderRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: "smooth" });
    setTimeout(syncArrows, 350);
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: SCROLL_STEP, behavior: "smooth" });
    setTimeout(syncArrows, 350);
  };

  const showArrows = validCandidates.length > 3;
  const centerCards = !showArrows;

  // ─── Marker icon factory ──────────────────────────────────────────────────
  const makeMarkerIcon = (city, count) =>
    L.divIcon({
      className: "",
      html: `
        <div style="
          display: flex;
          align-items: center;
          gap: 4px;
          color: #0288d1;
          font-size: 13px;
          font-weight: 700;
          background: rgba(255,255,255,0.95);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1.5px solid #0288d1;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" fill="#0288d1" height="16" viewBox="0 0 24 24" width="16">
            <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5c0-2.33-4.67-3.5-7-3.5z"/>
          </svg>
          ${city} (${count})
        </div>
      `,
      iconAnchor: [0, 0],
    });

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <Box p={3}>
      {/* ── Top Action Bar ── */}
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
              background: viewMode === "tile" ? "#FF5722" : "#fff",
              color: viewMode === "tile" ? "#fff" : "#374151",
              "&:hover": { background: viewMode === "tile" ? "#FF5722" : "#F3F4F6" },
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
              background: viewMode === "map" ? "#FF5722" : "#fff",
              color: viewMode === "map" ? "#fff" : "#374151",
              "&:hover": { background: viewMode === "map" ? "#FF5722" : "#F3F4F6" },
            }}
          >
            Map
          </Button>
        </Box>

        {/* Request Additional Candidates */}
        {/* <Button
          variant="outlined"
          startIcon={<PersonAddAltIcon />}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#FF5722",
            color: "#FF5722",
            fontWeight: 600,
            "&:hover": { borderColor: "#FF5722", background: "#FFF3F0" },
          }}
        >
          Request Additional Candidates
        </Button> */}

        {/* Edit Job */}
        {!hideEditButton && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() =>
              navigate("/account-manager/create-requisition", {
                state: {
                  editMode: true,
                  requisitionData,
                  orgId,
                  jobDetailsId: job_details_id,
                  fromMatchedCandidates: true,
                },
              })
            }
            sx={{
            textTransform: "none",
            borderRadius: 2,
            borderColor: "#FF5722",
            color: "#FF5722",
            fontWeight: 600,
            "&:hover": { borderColor: "#FF5722", background: "#FFF3F0" },
          }}
          >
            Edit Job
          </Button>
        )}
      </Box>

      {/* ── Empty State ── */}
      {validCandidates.length === 0 ? (
        <Typography>No matched candidates found.</Typography>
      ) : viewMode === "map" ? (
        /* ══════════════════════════════════════════════════════════════════
           MAP VIEW
        ══════════════════════════════════════════════════════════════════ */
        <Box
          sx={{
            width: "100%",
            height: "calc(100vh - 200px)",
            minHeight: 480,
            position: "relative",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E5E7EB",
          }}
        >
          {mapLoading ? (
            /* Loading spinner while geocoding */
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                background: "#F9FAFB",
                zIndex: 10,
              }}
            >
              <CircularProgress sx={{ color: "#FF5722" }} />
              <Typography sx={{ color: "#6B7280", fontSize: 14 }}>
                Locating candidates on map…
              </Typography>
            </Box>
          ) : assignedCandidates.length === 0 ? (
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              No candidates with valid locations found.
            </Typography>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
              doubleClickZoom={false}
              boxZoom={false}
            >
              <MapAutoCenter center={mapCenter} />
              <TileLayer url="https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png" />

              {assignedCandidates.map((group, groupIndex) => (
                <Marker
                  key={groupIndex}
                  position={group.coords}
                  icon={makeMarkerIcon(group.city, group.candidates.length)}
                  eventHandlers={{
                    mouseover: () => setOpenTooltipId(groupIndex),
                    click: () =>
                      setOpenTooltipId((prev) =>
                        prev === groupIndex ? null : groupIndex
                      ),
                  }}
                >
                  {openTooltipId === groupIndex && (
                    <Tooltip
                      direction="left"
                      offset={[0, 20]}
                      opacity={1}
                      permanent
                      interactive
                      className="custom-candidate-tooltip"
                    >
                      {/* Cards row inside tooltip */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "row",
                          gap: 2,
                          overflowX: "auto",
                          maxWidth: group.candidates.length === 1 ? 300 : 620,
                          p: 1,
                          "&::-webkit-scrollbar": { height: 4 },
                          "&::-webkit-scrollbar-thumb": {
                            background: "#D1D5DB",
                            borderRadius: 2,
                          },
                        }}
                        onMouseLeave={() => setOpenTooltipId(null)}
                      >
                        {group.candidates.map((candidate, idx) => (
                          <Box
                            key={candidate.id}
                            sx={{
                              flex: `0 0 ${CARD_WIDTH}px`,
                              width: CARD_WIDTH,
                              pt: "20px", // room for status badge
                            }}
                          >
                            <CandidateCard
                              candidate={candidate}
                              index={idx}
                              handleClick={() => handleViewProfile(candidate)}
                              orgId={orgId}
                            />
                          </Box>
                        ))}
                      </Box>
                    </Tooltip>
                  )}
                </Marker>
              ))}
            </MapContainer>
          )}
        </Box>
      ) : (
        /* ══════════════════════════════════════════════════════════════════
           TILE VIEW  (horizontal slider)
        ══════════════════════════════════════════════════════════════════ */
        <Box sx={{ position: "relative" }}>

          {/* Left Arrow */}
          {showArrows && (
            <IconButton
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              sx={{
                position: "absolute",
                left: -20,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                width: 40,
                height: 40,
                background: canScrollLeft ? "#FF5722" : "#E5E7EB",
                color: canScrollLeft ? "#fff" : "#9CA3AF",
                boxShadow: canScrollLeft ? "0 2px 8px rgba(255,87,34,0.35)" : "none",
                "&:hover": { background: canScrollLeft ? "#E64A19" : "#E5E7EB" },
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}

          {/* Scrollable outer (pt keeps badge visible, overflow-x scrolls) */}
          <Box
            ref={sliderRef}
            onScroll={syncArrows}
            sx={{
              pt: "20px",
              pb: "8px",
              overflowX: showArrows ? "auto" : "visible",
              overflowY: "visible",
              px: showArrows ? "8px" : 0,
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: `${CARD_GAP}px`,
                scrollSnapType: showArrows ? "x mandatory" : "none",
                width: showArrows ? "max-content" : "100%",
                justifyContent: centerCards ? "center" : "flex-start",
              }}
            >
              {validCandidates.map((candidate, index) => (
                <Box
                  key={candidate.id}
                  sx={{
                    flex: `0 0 ${CARD_WIDTH}px`,
                    width: CARD_WIDTH,
                    minWidth: CARD_WIDTH,
                    maxWidth: CARD_WIDTH,
                    scrollSnapAlign: "start",
                    "& *": { minWidth: 0 },
                  }}
                >
                  <CandidateCard
                    candidate={candidate}
                    index={index}
                    handleClick={() => handleViewProfile(candidate)}
                    orgId={orgId}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Arrow */}
          {showArrows && (
            <IconButton
              onClick={scrollRight}
              disabled={!canScrollRight}
              sx={{
                position: "absolute",
                right: -20,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                width: 40,
                height: 40,
                background: canScrollRight ? "#FF5722" : "#E5E7EB",
                color: canScrollRight ? "#fff" : "#9CA3AF",
                boxShadow: canScrollRight ? "0 2px 8px rgba(255,87,34,0.35)" : "none",
                "&:hover": { background: canScrollRight ? "#E64A19" : "#E5E7EB" },
                transition: "background 0.2s, box-shadow 0.2s",
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          )}

          {/* Dot Indicators */}
          {showArrows && (
            <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 1.5 }}>
              {validCandidates.map((c) => (
                <Box
                  key={c.id}
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "#D1D5DB",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* ── Leaflet tooltip global styles ── */}
      <style>{`
        .custom-candidate-tooltip {
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          max-width: none !important;
        }
        .custom-candidate-tooltip::before {
          display: none !important;
        }
        .leaflet-tooltip.custom-candidate-tooltip {
          pointer-events: auto !important;
        }
      `}</style>
    </Box>
  );
};

export default MatchedCandidates;