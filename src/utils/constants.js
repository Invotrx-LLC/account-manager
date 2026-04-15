export const IS_AUTHENTICATED = "isAuthenticated"
export const USER_DATA = "user";
export const AUTH_DETAILS = "auth-details"
export const ACCESS_TOKEN = "accessToken";
export const REFRESH_TOKEN = "refreshToken";
export const EXPIRY_TIME = "expiryTime";
export const USER_TYPE = "userType";
export const CANDIDATE_ACCESS_TOKEN = "candidate_access_token"
export const CANDIDATE_REFRESH_TOKEN = "candidate_refresh_token"
export const AC_ACCESS_TOKEN = "candidate_access_token"
export const AC_REFRESH_TOKEN = "candidate_refresh_token"

export const AUTH_VERSION = "authVersion";
export const USER_ROLE = "userRole";
export const TIME_ZONE = "timeZone";
export const ID_TOKEN = "idToken";
export const PROFILE_VERSION = "profile_version";
export const EMPLOYEE_NAME = "employee_Name";


export const setItem = (key, value) => {
    localStorage.setItem(key, value)
}

export const getItem = (key) => {
    return localStorage.getItem(key)
}


// Better clear function
export const clearLocalStorage = () => {
  const keysToRemove = [
    EXPIRY_TIME,
    REFRESH_TOKEN,
    ACCESS_TOKEN,
    AUTH_DETAILS,
    USER_DATA,
    IS_AUTHENTICATED,
    USER_TYPE,
    USER_ROLE,
    TIME_ZONE,
    AUTH_VERSION,
    ID_TOKEN,
    PROFILE_VERSION,
    AC_ACCESS_TOKEN
  ];
  keysToRemove.forEach(key => localStorage.removeItem(key));
};


// export const clearLocalStorage = () => {
//     localStorage.removeItem(EXPIRY_TIME);
//     localStorage.removeItem(REFRESH_TOKEN);
//     localStorage.removeItem(ACCESS_TOKEN);
//     localStorage.removeItem(AUTH_DETAILS);
//     localStorage.removeItem(USER_DATA);
//     localStorage.removeItem(IS_AUTHENTICATED)
//     localStorage.removeItem(USER_TYPE);
//     localStorage.removeItem(USER_ROLE)
//     localStorage.removeItem(TIME_ZONE)
//     localStorage.removeItem(AUTH_VERSION);
// }
export const candidateClearLocalStorage = () => {
    localStorage.removeItem(CANDIDATE_ACCESS_TOKEN)
    localStorage.removeItem(CANDIDATE_REFRESH_TOKEN);
    localStorage.removeItem(IS_AUTHENTICATED);
    localStorage.removeItem(USER_TYPE);
}
// export const getUserData = () => {
//     const data = localStorage.getItem(USER_DATA);
//     return data && JSON.parse(data);
// }

export const getUserData = () => {
  const data = localStorage.getItem(USER_DATA);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse user data", e);
    return null;
  }
};
export const tokenData = () => {
    const data = localStorage.getItem(AUTH_DETAILS);
    return data && JSON.parse(data);
}

// ---------------- AUTH HELPERS ----------------
export const isLoggedIn = () => {
  return getItem(IS_AUTHENTICATED) === "true";
};

export const getUserRole = () => {
  return getItem(USER_ROLE);
};

export const getAuthVersion = () => {
  return getItem(AUTH_VERSION);
};