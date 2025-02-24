import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import containerIdStore from "../Store/containerIdStore";

import { Row, Col, Button, Input } from "antd";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState("/Users/benitogeordie/oyster");
  const [environment, setEnvironment] = useState("a37cd56ae12dbbdd8fe6e838c08257f8de5b960633215503dc25cdfc5261bdc1");
  const setContainerId = containerIdStore((state) => state.setContainerId);

  useEffect(() => {
    setContainerId(null);
  }, []);
  
  const handleSubmit = () => {
    if (!path.trim()) {
      alert('Please enter a valid path');
      return;
    }
    
    try {
      const encodedPath = encodeURIComponent(path);
      const encodedContainerId = encodeURIComponent(environment);
      navigate(`/playground/${encodedPath}?environment=${encodedContainerId}`);
    } catch (err) {
      console.error('Error encoding path:', err);
      alert('Invalid path format. Please try again.');
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={20} sm={16} md={12} lg={8}>
        <div style={{ 
          padding: "2rem",
          background: "#282a36",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
        }}>
          <h1 style={{ 
            color: "#f8f8f2",
            marginBottom: "2rem",
            textAlign: "center"
          }}>
            CodeFiddle
          </h1>
          
          <Input
            placeholder="Enter the full path to your project folder"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            style={{ marginBottom: "1rem" }}
            onPressEnter={handleSubmit}
          />
          
          <Input
            placeholder="Enter Container or Image ID (optional)"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            style={{ marginBottom: "1.5rem" }}
            onPressEnter={handleSubmit}
          />
          
          <Button
            type="primary"
            onClick={handleSubmit}
            style={{ width: "100%" }}
          >
            Go to Playground
          </Button>
        </div>
      </Col>
    </Row>
  );
};
