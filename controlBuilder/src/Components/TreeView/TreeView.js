import React, { useState, useEffect, useRef } from 'react';
import './TreeView.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TreeView = () => {
  // treeData stores the tree structure.
  const [treeData, setTreeData] = useState([]);
  // expandedNodes: object keyed by node label indicating whether that node is expanded.
  const [expandedNodes, setExpandedNodes] = useState({});
  // loadedNodes: object keyed by node label indicating whether that node’s children have been fetched.
  const [loadedNodes, setLoadedNodes] = useState({});
  // Navbar open/close state (for responsiveness)
  const [isNavbarOpen, setIsNavbarOpen] = useState(window.innerWidth > 425);
  const navbarRef = useRef(null);

  useEffect(() => {
    // Initially, fetch the root level of the tree.
    fetch('/TreeViewContent.json')
      .then(response => response.json())
      .then(data => setTreeData(data))
      .catch(error => console.error("Error loading tree data:", error));

    const handleResize = () => setIsNavbarOpen(window.innerWidth > 425);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: Recursively update the node with given label by adding its children.
  const updateNodeChildren = (nodes, label, children) => {
    return nodes.map(node => {
      if (node.label === label) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateNodeChildren(node.children, label, children) };
      }
      return node;
    });
  };

  const fetchChildNodes = async (label) => {
    if (loadedNodes[label]) return; // already loaded
    // Log the fetch event
    await logToFile(`Fetching children for node: ${label} at ${new Date().toISOString()}`);
  
    try {
      const response = await fetch(`/children?label=${encodeURIComponent(label)}`);
      const childrenData = await response.json();
      
      console.log(`Fetched children for ${label}:`, childrenData);
      setTreeData(prevTree => updateNodeChildren(prevTree, label, childrenData));
      setLoadedNodes(prev => ({ ...prev, [label]: true }));
    } catch (error) {
      console.error("Error fetching child nodes:", error);
    }
  };
  const getISTDateTime = () => {
    const date = new Date();
    const options = {
      timeZone: 'Asia/Kolkata',
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };
    return new Intl.DateTimeFormat('en-IN', options).format(date).replace(/, /g, ' ');
  };
  const logToFile = async (message) => {
    const timestamp = getISTDateTime();
    const messageWithTimestamp = `${timestamp} - ${message}\\n`; // Append \\n for new lines
    try {
      await fetch('http://localhost:3000/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageWithTimestamp }),
      });
    } catch (error) {
      console.error('Error logging to file:', error);
    }
  };

  // Helper: Recursively collapse a node and all its descendants.
  const collapseTree = (node, state) => {
    state[node.label] = false;
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => collapseTree(child, state));
    }
  };

  const handleToggle = async (node, siblings) => {
    const isExpanding = !expandedNodes[node.label];
  
    // Log the toggle event for the current node
    await logToFile(`Toggling node: ${node.label} ${isExpanding ? 'opened' : 'closed'}`);
  
    if (isExpanding) {
      if (node.hasChildren && !loadedNodes[node.label]) {
        await fetchChildNodes(node.label);
      }
  
      const closedNodesSet = new Set(); // Using a Set to ensure unique log entries
  
      const newState = {
        ...expandedNodes, 
        [node.label]: true // Expanding the clicked node
      };
  
      // Iterate over siblings and collapse them
      for (const sibling of siblings) {
        if (sibling.label !== node.label) {
          // Only log if this sibling hasn't been closed before
          if (!closedNodesSet.has(sibling.label)) {
            collapseTree(sibling, newState);
  
            // Log the collapse action for the sibling node
            await logToFile(`Toggling node: ${sibling.label} closed due to expanding ${node.label}`);
            closedNodesSet.add(sibling.label); // Mark it as logged
          }
        }
      }
  
      setExpandedNodes(newState); // State update is called once after all changes
    } else {
      const newState = { ...expandedNodes };
      collapseTree(node, newState);
      setExpandedNodes(newState); // Close the node
    }
  };

  // Render the tree recursively.  
  // The second parameter "siblings" is an array of nodes at the same level as the current node.
  const renderTree = (node, siblings) => {
    // A node can be expandable if:
    //   • It has a flag "hasChildren" (i.e. might have children even if not loaded yet), OR
    //   • It already has a non-empty children array.
    const canExpand = node.hasChildren || (node.children && node.children.length > 0);
    const isExpanded = expandedNodes[node.label];

    return (
      <div key={node.label} className="tree-node">
        <div className="node-header node-label">
          {canExpand ? (
            <span className="arrow" onClick={() => handleToggle(node, siblings)}>
              {isExpanded ? (
                <i className="bi bi-arrow-down-circle-fill"></i>
              ) : (
                <i className="bi bi-arrow-right-circle"></i>
              )}
            </span>
          ) : null}
          <span className={isExpanded ? 'bold' : ''}>{node.label}</span>
        </div>
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="node-children">
            {node.children.map(child => renderTree(child, node.children))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <button className="navbar-toggle" onClick={() => setIsNavbarOpen(!isNavbarOpen)}>
        {isNavbarOpen ? (
          <i className="bi bi-arrow-left-circle"></i>
        ) : (
          <i className="bi bi-arrow-right-circle"></i>
        )}
      </button>
      <div className={`left-navbar ${isNavbarOpen ? 'open' : 'closed'}`}>
        {treeData.length > 0 ? (
          // For root nodes, pass treeData as the siblings list.
          treeData.map(node => renderTree(node, treeData))
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="content"></div>
    </div>
  );
};

export default TreeView;