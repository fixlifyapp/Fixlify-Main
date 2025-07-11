
export const InsightsLoading = () => {
  return (
    <div className="fixlyfy-card h-full p-6 flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent text-fixlyfy rounded-full mr-2" />
      <span>Loading insights...</span>
    </div>
  );
};
