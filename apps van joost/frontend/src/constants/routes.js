// Route constants to avoid hardcoded paths and make navigation more maintainable
export const ROUTES = {
  // Admin routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    ROOMS: '/admin/rooms',
    NEW_ROOM: '/admin/rooms/nieuw-room',
    PATIENTS: '/admin/patients',
    NEW_PATIENT: '/admin/patients/nieuw-patient',
    USERS: '/admin/users',
    NEW_USER: '/admin/users/nieuw-account',
    NEW_PASSWORD: '/admin/nieuw-wachtwoord',
  },
  
  // Surgeon routes
  SURGEON: {
    DASHBOARD: '/chirurg/dashboard',
    VIEW_ROOM: '/chirurg/view',
  },
  
  // Common routes
  LOGIN: '/login',
  HOME: '/',
};

// Role-based redirect paths for after creating resources
export const getRedirectPathForRole = (role) => {
  const rolePaths = {
    'admin': ROUTES.ADMIN.ROOMS,
    'surgeon': ROUTES.SURGEON.DASHBOARD,
    'user': ROUTES.ADMIN.ROOMS, // fallback for regular users
  };
  return rolePaths[role] || ROUTES.ADMIN.ROOMS;
};
