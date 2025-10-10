//Logger for debugging purposes without affecting production performance
export const debugLogger = (...message: any[]) => {
  if (process.env.DEBUG === "true") {
    console.log(...message);
  }
};
