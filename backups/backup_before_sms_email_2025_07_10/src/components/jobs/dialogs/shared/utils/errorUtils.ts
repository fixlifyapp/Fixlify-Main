
export const extractErrorMessage = (error: any): string => {
  let errorMessage = error || 'Unknown error occurred';
  
  // Only try to read properties if error is an object and not null
  if (error != null && typeof error === "object") {
    const errorObj = error as any;
    if ("message" in errorObj && errorObj.message) {
      errorMessage = errorObj.message;
    } else if ("error" in errorObj && errorObj.error) {
      errorMessage = errorObj.error;
    } else {
      errorMessage = JSON.stringify(errorObj);
    }
  }
  
  return errorMessage;
};
