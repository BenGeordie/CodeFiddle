import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";

export const ResolvePath = () => {

  const { projectPathOrLink } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    redirectToEditor();
  }, []);

  const redirectToEditor = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resolve-project`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectPathOrLink }),
      });
 
      const data = await response.json();
      if (data.projectPath) {
        navigate(`/editor/${data.projectPath}?environment=${data.environment}`);
      }
    } catch (error) {
      console.error('Error resolving project:', error);
    }
  };
  
  return (
    <div style={{ 
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      Setting up your project...
    </div>
  );
};
