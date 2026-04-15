import React from "react";
import { Outlet } from "react-router-dom";

const AmLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AmLayout;
