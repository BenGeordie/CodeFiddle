import { useNavigate } from "react-router-dom";
import { useState } from "react";

import axios from "axios";

import { Row, Col, Button, Modal, Input } from "antd";

export const LandingPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [path, setPath] = useState("");

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    // TODO: Path must start with $HOME
    if (!path.trim()) {
      alert('Please enter a valid path');
      return;
    }
    
    try {
      const encodedPath = encodeURIComponent(path);
      navigate(`/playground/${encodedPath}`);
    } catch (err) {
      console.error('Error encoding path:', err);
      alert('Invalid path format. Please try again.');
    }
  };

  return (
    <>
      <Row>
        <Col xxl={5} xl={5} lg={5} md={3} xs={2} />
        <Col xxl={14} xl={14} lg={14} md={18} xs={20}>
          <Button
            type="primary"
            style={{ fontSize: "40px", padding: "100px", top: "33vh" }}
            onClick={handleClick}
          >
            Open Project
          </Button>
        </Col>
        <Col xxl={5} xl={5} lg={5} md={3} xs={2} />
      </Row>
      
      <Modal
        title="Enter Project Path"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Input
          placeholder="Enter the full path to your project folder"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          onPressEnter={handleOk}
        />
      </Modal>
    </>
  );
};
