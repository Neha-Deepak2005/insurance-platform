import React, { useState, useEffect, useContext } from 'react';
import { policyService, customerService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function PoliciesPage() {
  const { user } = useContext(AuthContext);
  const [policies, setPolicies] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    policy_type: 'Life',
    premium_amount: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const policiesRes = await policyService.getAll();
      setPolicies(policiesRes.data || []);

      if (user?.role !== 'customer') {
        const customersRes = await customerService.getAll();
        setCustomers(customersRes.data || []);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch policies');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await policyService.create(formData);
      setFormData({
        customer_id: '',
        policy_type: 'Life',
        premium_amount: '',
        start_date: '',
        end_date: ''
      });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to create policy');
      console.error(err);
    }
  };

  const handleRenew = async (policyId) => {
    try {
      await policyService.renew(policyId);
      fetchData();
    } catch (err) {
      setError('Failed to renew policy');
    }
  };

  const handleCancel = async (policyId) => {
    if (window.confirm('Are you sure you want to cancel this policy?')) {
      try {
        await policyService.cancel(policyId);
        fetchData();
      } catch (err) {
        setError('Failed to cancel policy');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Policies</h1>
          {user?.role !== 'customer' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Create Policy'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded mb-4 text-red-700">{error}</div>
        )}

        {showForm && user?.role !== 'customer' && (
          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Create New Policy</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <select
                name="customer_id"
                value={formData.customer_id}
                onChange={handleChange}
                required
                className="col-span-2 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select
                name="policy_type"
                value={formData.policy_type}
                onChange={handleChange}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
              >
                <option value="Life">Life Insurance</option>
                <option value="Health">Health Insurance</option>
                <option value="Auto">Auto Insurance</option>
                <option value="Home">Home Insurance</option>
              </select>
              <input
                type="number"
                name="premium_amount"
                placeholder="Premium Amount"
                step="0.01"
                value={formData.premium_amount}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
              />
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
              />
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
              />
              <button
                type="submit"
                className="col-span-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Policy
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading policies...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premium
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {policies.map(policy => (
                  <tr key={policy.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.policy_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {policy.policy_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{policy.premium_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded ${
                        policy.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {user?.role !== 'customer' && (
                        <>
                          <button
                            onClick={() => handleRenew(policy.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Renew
                          </button>
                          <button
                            onClick={() => handleCancel(policy.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {policies.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No policies found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
