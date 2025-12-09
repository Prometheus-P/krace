'use client';

import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
  const [services, setServices] = useState([
    { name: 'KRA API', status: 'operational', lastChecked: new Date().toISOString() },
    { name: 'KSPO API', status: 'degraded', lastChecked: new Date().toISOString() },
  ]);
  const [overallStatus, setOverallStatus] = useState('degraded');

  const fetchStatus = () => {
    // In a real application, you would fetch this data from an API.
    const newServices = services.map(service => {
      const newStatus = Math.random() > 0.8 ? 'degraded' : 'operational';
      return {
        ...service,
        status: newStatus,
        lastChecked: new Date().toISOString(),
      };
    });
    setServices(newServices);

    const isAnyDegraded = newServices.some(service => service.status === 'degraded');
    setOverallStatus(isAnyDegraded ? 'degraded' : 'operational');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchStatus();
    }, 30000); // Auto-refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">System Status Dashboard</h1>
      <div className="mb-4">
        <strong>Overall Status:</strong> <span className={overallStatus === 'operational' ? 'text-green-500' : 'text-yellow-500'}>{overallStatus}</span>
      </div>
      <div className="space-y-4">
        {services.map(service => (
          <div key={service.name} className="p-4 border rounded">
            <h2 className="text-xl font-semibold">{service.name}</h2>
            <p>Status: <span className={service.status === 'operational' ? 'text-green-500' : 'text-yellow-500'}>{service.status}</span></p>
            <p>Last Checked: {new Date(service.lastChecked).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;
