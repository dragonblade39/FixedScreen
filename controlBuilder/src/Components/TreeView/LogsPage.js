import React, { useState, useEffect } from 'react';
import './LogsPage.css'; // Import CSS for styling

const LogsPage = () => {
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('http://localhost:3000/logs');
        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }
        const data = await response.text();
        setLogs(data.replace(/\\n/g, '<br />')); // Replace newline with <br />
      } catch (error) {
        console.error(error);
        setError('Error loading logs');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <p>Loading logs...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="logs-container">
      <h1>Application Logs</h1>
      <div className="logs-content" dangerouslySetInnerHTML={{ __html: logs }} />
      {/* Render logs with HTML formatting */}
    </div>
  );
};

export default LogsPage;