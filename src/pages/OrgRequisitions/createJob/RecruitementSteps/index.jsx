import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
} from "@mui/icons-material";
import ComputerIcon from "@mui/icons-material/Computer";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIcon from "@mui/icons-material/Assignment";

const RecruitmentSteps = ({ onSubmitSuccess }) => {
  const [steps, setSteps] = useState([
    {
      id: "step-1",
      title: "Technical Assessment",
      subtitle: "Assignment - Step 1",
      isExpanded: false ,
      skills: [],
    },
    {
      id: "step-2",
      title: "Chatbot",
      subtitle: "Chatbot - Step 2",
      isExpanded: false,
      skills: [],
    },
    {
      id: "step-3",
      title: "Technical Interview",
      subtitle: "Technical Interview - Step 3",
      isExpanded: false,
      skills: [],
    },
    {
      id: "step-4",
      title: "Telephonic",
      subtitle: "Telephonic Interview - Step 4",
      isExpanded: false,
      skills: [],
    },
  ]);

  const [openDialog, setOpenDialog] = useState(false);
  const [newStep, setNewStep] = useState({ title: "", subtitle: "" });

  const handleAddSkill = (index) => {
    const newSteps = [...steps];
    newSteps[index].skills = [
      ...(newSteps[index].skills || []),
      { skill: "", rating: "", feedback: "" },
    ];
    setSteps(newSteps);
  };

  const handleSkillChange = (stepIndex, skillIndex, field, value) => {
    const newSteps = [...steps];
    newSteps[stepIndex].skills[skillIndex][field] = value;
    setSteps(newSteps);
  };

  const handleDeleteSkill = (stepIndex, skillIndex) => {
    const newSteps = [...steps];
    newSteps[stepIndex].skills.splice(skillIndex, 1);
    setSteps(newSteps);
  };

  const handleToggleExpand = (index) => {
    const newSteps = [...steps];
    newSteps[index].isExpanded = !newSteps[index].isExpanded;
    setSteps(newSteps);
  };

  const handleDeleteStep = (index) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    setSteps(newSteps);
  };

  const handleSaveEvaluation = (index) => {
    console.log("Saving evaluation for step:", index, steps[index].skills);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewStep({ title: "", subtitle: "" });
  };

  const handleAddStep = () => {
    if (newStep.title.trim()) {
      setSteps([
        ...steps,
        {
          id: `step-${steps.length + 1}`,
          title: newStep.title,
          subtitle: newStep.subtitle || `Step ${steps.length + 1}`,
          isExpanded: false,
          skills: [],
        },
      ]);
      handleCloseDialog();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitSuccess();
  };

  const handleStepChange = (field, value) => {
    setNewStep({ ...newStep, [field]: value });
  };

const getStepIcon = (title, isSubtitle = false) => {
  if (isSubtitle) return null;
  const iconStyles = {
    width: 32, // Consistent size for the icon
    height: 32, // Consistent size for the icon
    display: 'flex', // Ensure centering
    alignItems: 'center', // Center vertically
    justifyContent: 'center', // Center horizontally
    borderRadius: '50%', // Circular background
    p: 0.75, // Reduced padding to fit icon better
    mr: 1, // Margin to separate from text
    verticalAlign: 'middle', // Align with text
    boxSizing: 'border-box', // Ensure padding doesn't affect size
  };
  switch (title.toLowerCase()) {
    case 'technical assessment':
      return (
        <ComputerIcon
          sx={{ ...iconStyles, color: '#9333EA', backgroundColor: '#F3E8FF' }}
        />
      );
    case 'chatbot':
      return (
        <SmartToyIcon
          sx={{ ...iconStyles, color: '#2563EB', backgroundColor: '#DBEAFE' }}
        />
      );
    case 'technical interview':
      return (
        <PersonIcon
          sx={{ ...iconStyles, color: '#16A34A', backgroundColor: '#DCFCE7' }}
        />
      );
    case 'telephonic':
      return (
        <PhoneIcon
          sx={{ ...iconStyles, color: '#A855F7', backgroundColor: '#F1E3FF' }}
        />
      );
    default:
      return (
        <PersonIcon
          sx={{ ...iconStyles, color: '#666', backgroundColor: '#E0E0E0' }}
        />
      );
  }
};

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newSteps = [...steps];
    const [reorderedItem] = newSteps.splice(result.source.index, 1);
    newSteps.splice(result.destination.index, 0, reorderedItem);
    setSteps(newSteps);
  };

  return (
    <Grid container 
      sx={{ 
          // maxWidth: { xs: "100%", sm: 700, md: 1000, lg: 1500, xl: 1500 },
          // width: { xs: "100%", sm: 550, md: 700, lg: 850, xl: 1140 },
          // margin: "auto",
          // border: 1,
          borderColor: "#E5E7EB",
          // mt: { xs: 8, sm: 10, lg: 2, xl: 2 },
          }}
      component="form"
      onSubmit={handleSubmit}
      id="recruitment"
    >
    <Grid item size={{ xs: 12, sm: 12, md: 12, lg: 12, xl: 12 }} >
        <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Configure Recruitment Steps
        </Typography>
        <Typography variant="body1" color="#3e3b3bff" mb={2}>
          Set up the interview process by adding and configuring each step
          candidates will go through.
        </Typography>
        <Box sx={{ textAlign: "right", mb: 2 }}>
          <Button
            variant="contained"
            sx={{ color: "#00BBD4", backgroundColor: "#E1FBFF" }}
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Recruitment Step
          </Button>
        </Box>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="steps">
            {(provided) => (
              <Box {...provided.droppableProps} ref={provided.innerRef}>
                {steps.map((step, stepIndex) => (
                  <Draggable
                    key={step.id}
                    draggableId={step.id}
                    index={stepIndex}
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        sx={{ mb: 2 }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            border: "1px solid #e0e0e0",
                            borderRadius: 1,
                          }}
                        >
                          <Grid container alignItems="center" spacing={1}>
                            <Grid item>
                              <IconButton
                                {...provided.dragHandleProps}
                                sx={{ cursor: "grab", mt: 1 }}
                              >
                                <DragIndicatorIcon />
                              </IconButton>
                            </Grid>
                            <Grid item size={{ xs: 6 }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mt: 1,
                                }}
                              >
                                <Box sx={{ mr: 1, mt: 1 }}>
                                  {getStepIcon(step.title)}
                                </Box>
                                <Box>
                                  <Typography variant="subtitle1">
                                    {step.title}
                                  </Typography>
                                  <Typography variant="caption">
                                    {step.subtitle}
                                  </Typography>
                                </Box>
                              </Box>
                            </Grid>
                            <Grid
                              item
                              sx={{
                                ml: "auto",
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              <Button
                                sx={{
                                  color: "#A855F7",
                                  minWidth: "auto",
                                  padding: "4px",
                                }}
                                variant="text"
                                startIcon={<AssignmentIcon />}
                                endIcon={
                                  <ExpandMoreIcon
                                    sx={{
                                      transform: step.isExpanded
                                        ? "rotate(180deg)"
                                        : "rotate(0deg)",
                                      transition: "transform 0.2s",
                                    }}
                                  />
                                }
                                onClick={() => handleToggleExpand(stepIndex)}
                              >
                                Add Evaluation Form
                              </Button>
                              <IconButton
                                onClick={() => handleDeleteStep(stepIndex)}
                                color="error"
                                sx={{ ml: 1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Grid>
                          </Grid>
                          {step.isExpanded && (
                            <Box sx={{ mt: 2 }}>
                              {step.skills.map((skill, skillIndex) => (
                                <Paper sx={{ p: 2, mb: 2 }} key={skillIndex}>
                                  <Grid
                                    container
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    <Grid item size={{ xs:3 }} >
                                      <Select
                                        value={skill.skill}
                                        onChange={(e) =>
                                          handleSkillChange(
                                            stepIndex,
                                            skillIndex,
                                            "skill",
                                            e.target.value
                                          )
                                        }
                                        fullWidth
                                        displayEmpty
                                      >
                                        <MenuItem value="">
                                          <Typography>Select skill</Typography>
                                        </MenuItem>
                                        <MenuItem value="SDTM">SDTM</MenuItem>
                                        <MenuItem value="ADaM">ADaM</MenuItem>
                                      </Select>
                                    </Grid>
                                    <Grid item size={{ xs: 3 }} >
                                      <Select
                                        value={skill.rating}
                                        onChange={(e) =>
                                          handleSkillChange(
                                            stepIndex,
                                            skillIndex,
                                            "rating",
                                            e.target.value
                                          )
                                        }
                                        fullWidth
                                        displayEmpty
                                      >
                                        <MenuItem value="">
                                          <Typography>Select rating</Typography>
                                        </MenuItem>
                                        <MenuItem value="1-10">1-10</MenuItem>
                                        <MenuItem value="1-5">1-5</MenuItem>
                                      </Select>
                                    </Grid>
                                    <Grid item size={{ xs: 5 }} >
                                      <TextField
                                        value={skill.feedback}
                                        onChange={(e) =>
                                          handleSkillChange(
                                            stepIndex,
                                            skillIndex,
                                            "feedback",
                                            e.target.value
                                          )
                                        }
                                        placeholder="Enter feedback"
                                        fullWidth
                                      />
                                    </Grid>
                                    <Grid item>
                                      <IconButton
                                        onClick={() =>
                                          handleDeleteSkill(
                                            stepIndex,
                                            skillIndex
                                          )
                                        }
                                        color="error"
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Grid>
                                  </Grid>
                                </Paper>
                              ))}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  mt: 2,
                                }}
                              >
                                <Button
                                  variant="text"
                                  color="success"
                                  startIcon={<AddIcon />}
                                  onClick={() => handleAddSkill(stepIndex)}
                                >
                                  + Add Skill
                                </Button>
                                {/* <Button
                                  sx={{ color: "#2563EB", backgroundColor: "#DBEAFE" }}
                                  variant="contained"
                                  onClick={() => handleSaveEvaluation(stepIndex)}
                                >
                                  Save Evaluation Form
                                </Button> */}
                              </Box>
                            </Box>
                          )}
                        </Paper>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Paper>
    </Grid>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add New Recruitment Step</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label="Step Title"
                value={newStep.title}
                onChange={(e) => handleStepChange("title", e.target.value)}
                fullWidth
                placeholder="e.g., Technical Assessment"
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <TextField
                label="Step Subtitle"
                value={newStep.subtitle}
                onChange={(e) => handleStepChange("subtitle", e.target.value)}
                fullWidth
                placeholder="e.g., Assignment - Step 1"
              />
            </Grid>
            <Grid item size={{ xs: 12 }}>
              <Typography variant="caption" color="textSecondary">
                Icon Preview: {getStepIcon(newStep.title || "New Step")}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAddStep}
            variant="contained"
            sx={{ color: "#00BBD4", backgroundColor: "#E1FBFF" }}
            disabled={!newStep.title.trim()}
          >
            Add Step
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default RecruitmentSteps;
