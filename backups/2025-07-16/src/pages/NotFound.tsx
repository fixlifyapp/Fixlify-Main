
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-fixlyfy-bg-interface">
      <div className="w-16 h-16 rounded-xl fixlyfy-gradient flex items-center justify-center text-white text-2xl font-bold mb-6">
        F
      </div>
      <h1 className="text-4xl font-bold mb-2">404</h1>
      <p className="text-xl text-fixlyfy-text-secondary mb-6">Page not found</p>
      <p className="text-fixlyfy-text-secondary max-w-md text-center mb-8">
        Sorry, the page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        onClick={() => navigate('/')} 
        className="bg-fixlyfy hover:bg-fixlyfy/90"
      >
        Return to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
