import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { policyService, claimService } from '../services/api';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    totalClaims: 0,
    approvedClaims: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const policiesRes = await policyService.getAll();
        const claimsRes = await claimService.getAll();

        const policies = policiesRes.data || [];
        const claims = claimsRes.data || [];

        setStats({
          totalPolicies: policies.length,
          activePolicies: policies.filter(p => p.status === 'active').length,
          totalClaims: claims.length,
          approvedClaims: claims.filter(c => c.status === 'approved').length
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Policies
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalPolicies}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Active Policies
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">
                {stats.activePolicies}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Claims
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                {stats.totalClaims}
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Approved Claims
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-blue-600">
                {stats.approvedClaims}
              </dd>
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Start</h2>
          <p className="text-gray-600 mb-4">
            Welcome to the Insurance Management Platform! Here's what you can do:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-600">
            {user?.role === 'admin' && (
              <>
                <li>Manage customers and their information</li>
                <li>Create and monitor insurance policies</li>
                <li>Review and approve/reject claims</li>
                <li>Assign claims to agents for verification</li>
                <li>Monitor business performance through reports</li>
              </>
            )}
            {user?.role === 'agent' && (
              <>
                <li>Register new customers</li>
                <li>Create insurance policies for customers</li>
                <li>Verify customer documents</li>
                <li>Review and process claims</li>
                <li>Track policy renewals and premium payments</li>
              </>
            )}
            {user?.role === 'customer' && (
              <>
                <li>View your active policies</li>
                <li>Pay premiums for your policies</li>
                <li>Submit insurance claims</li>
                <li>Upload required documents</li>
                <li>Track the status of your claims</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
