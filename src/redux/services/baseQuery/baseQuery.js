import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  AC_ACCESS_TOKEN,
  AC_REFRESH_TOKEN,
  candidateClearLocalStorage,
  getItem,
  setItem,
} from "../../../utils/constants";

import { toast } from "react-toastify";

const baseUrl = import.meta.env.VITE_BASE_URL;
console.log(window.location.origin);
// base query
const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = getItem(AC_ACCESS_TOKEN);
    console.log("TOKEN:", token);
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

// custom base query with refresh logic
export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result?.error && [401, 403].includes(result.error.status)) {
    const refresh_token = getItem(AC_REFRESH_TOKEN);

    if (!refresh_token) {
      toast.error("Session expired, please login");
      candidateClearLocalStorage();
      window.location.href = "/login";
      return result;
    }

    // refresh call
    const refreshResult = await rawBaseQuery(
      {
        url: "/acc/account_manager_refresh-access-token",
        method: "POST",
        body: new URLSearchParams({ refresh_token }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
      api,
      extraOptions,
    );
    console.log("Refresh result:", refreshResult);
    if (refreshResult?.data) {
      const newAccessToken =
        refreshResult.data?.data?.access_token ||
        refreshResult.data?.access_token ||
        refreshResult.data?.token;

      if (newAccessToken) {
        //  store new token
        setItem(AC_ACCESS_TOKEN, newAccessToken);

        //  retry original request
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        return refreshResult;
      }
    } else {
      toast.error("Session expired, please login again");
      candidateClearLocalStorage();
      window.location.href = "/login";
      return refreshResult;
    }
  }

  return result;
};
