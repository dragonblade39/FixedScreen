import React, { useState, useEffect, useRef } from "react";
import "./TreeView1.css"; // Ensure to style your TreeView as necessary
import data from "../TreeViewContent.json"; // Replace with your JSON file path
import "bootstrap-icons/font/bootstrap-icons.css";

const TreeView = () => {
  const [treeData, setTreeData] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [isNavbarOpen, setIsNavbarOpen] = useState(window.innerWidth > 425);
  
  const navbarRef = useRef(null);

  useEffect(() => {
    setTreeData(data);

    const handleResize = () => {
      setIsNavbarOpen(window.innerWidth > 425);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = (label, currentNode) => {
    setExpandedNodes((prev) => {
      const newExpanded = { ...prev };
      const isOpen = prev[label];
      newExpanded[label] = !isOpen;

      // Send log request to the server
      logAction(label, isOpen ? 'Close' : 'Open'); 

      return newExpanded;
    });
  };

  const logAction = (label, action) => {
    fetch("/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ label, action }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    })
    .catch(error => {
      console.error("There was a problem with the log fetch operation:", error);
    });
  };

  const renderTree = (nodes) => (
    <div key={nodes.label} className={`tree-node`}>
      <div className="node-header node-label">
        {nodes.children && (
          <span
            className="arrow"
            onClick={() => handleToggle(nodes.label, nodes)}
          >
            {expandedNodes[nodes.label] ? (
              <i className="bi bi-arrow-down-circle-fill"></i>
            ) : (
              <i className="bi bi-arrow-right-circle"></i>
            )}
          </span>
        )}
        <span className={`${expandedNodes[nodes.label] ? "bold" : ""}`}>
          {nodes.label}
        </span>
      </div>
      {nodes.children && expandedNodes[nodes.label] && (
        <div className="node-children">
          {nodes.children.map((child) => renderTree(child))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <button
        className="navbar-toggle"
        onClick={() => setIsNavbarOpen(!isNavbarOpen)}
      >
        {isNavbarOpen ? (
          <i className="bi bi-arrow-left-circle"></i>
        ) : (
          <i className="bi bi-arrow-right-circle"></i>
        )}
      </button>
      <div
        className={`left-navbar ${isNavbarOpen ? "open" : "closed"}`}
        ref={navbarRef}
      >
        {treeData.map((node) => renderTree(node))}
      </div>
    </div>
  );
};

export default TreeView;