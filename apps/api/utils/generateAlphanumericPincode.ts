export const generateAlphanumericPincode = (length: number = 4): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let pincode = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    pincode += chars[randomIndex];
  }
  return pincode;
};
