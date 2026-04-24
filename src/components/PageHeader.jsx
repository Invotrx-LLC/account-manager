// src/components/PageHeader.jsx
import React from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import Breadcrumbs from './Breadcrumbs';

const PageHeader = ({ 
  title, 
  subtitle, 
  tabs = [], 
  currentTab = 0, 
  onTabChange 
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs />

      {/* Title + Subtitle */}
      <Box sx={{ mt: 2, mb: 3 }}>
        <Typography variant="h5" fontWeight={600} color="#111">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="#666" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Sub Tabs */}
      {tabs.length > 0 && (
        <Tabs 
          value={currentTab} 
          onChange={onTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              textTransform: 'none',
              fontSize: '15px',
              fontWeight: 500,
              minHeight: 48,
              color: '#555',
            },
            '& .Mui-selected': {
              color: '#ff5722 !important',
              fontWeight: 600,
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#ff5722',
              height: 3,
            }
          }}
        >
          {tabs.map((tab, index) => (
            <Tab key={index} label={tab} />
          ))}
        </Tabs>
      )}
    </Box>
  );
};

export default PageHeader;