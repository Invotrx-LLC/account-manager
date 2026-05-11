// src/layout/index.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Typography } from '@mui/material';

const AmLayout = () => {
  return (
    <Box 
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY:"hidden"
      }}
    >
      <Container maxWidth="sm">
        {/* <Box sx={{ textAlign: 'center' }}>
          <Typography 
            variant="h4" 
            fontWeight={700}
            color="#ff5722"
            sx={{ letterSpacing: '-0.5px' }}
          >
            RI<span style={{ color: '#ff5722' }}>8</span>FIT
          </Typography>
          <Typography variant="body2" color="#666" sx={{ mt: 1 }}>
            Account Manager Portal
          </Typography>
        </Box> */}

        {/* This is where Login, Signup, Forgot Password pages will render */}
        <Outlet />
      </Container>
    </Box>
  );
};

export default AmLayout;