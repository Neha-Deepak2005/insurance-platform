import React, { useState, useEffect, useContext } from 'react';
import { claimService, policyService } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function ClaimsPage() {
  const { user } = useContext(AuthContext);
  const [claims, setClaims] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [formData, setFormData] = useState({
    policy_id: '',
    claim_amount: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const claimsRes = await claimService.getAll(statusFilter);
      setClaims(claimsRes.data || []);

      if (user?.role === 'customer') {
        const policiesRes = await policyService.getAll();
        setPolicies(policiesRes.data || []);
      }

      setError('');
    } catch (err) {
      setError('Failed to fetch claims');
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
      await claimService.create(formData);
      setFormData({ policy_id: '', claim_amount: '', reason: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      setError('Failed to submit claim');
      console.error(err);
    }
  };

  const handleApprove = async (claimId) => {
    try {
      await claimService.approve(claimId, 'Approved');
      fetchData();
    } catch (err) {
      setError('Failed to approve claim');
    }
  };

  const handleReject = async (claimId) => {
    try {
      await claimService.reject(claimId, 'Rejected');
      fetchData();
    } catch (err) {
      setError('Failed to reject claim');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Claims</h1>
          {user?.role === 'customer' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'Submit Claim'}
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded mb-4 text-red-700">{error}</div>
        )}

        {/* Status Filter */}
        {user?.role !== 'customer' && (
          <div className="mb-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="verified">Verified</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        )}

        {showForm && user?.role === 'customer' && (
          <div className="bg-white p-6 rounded shadow mb-8">
            <h2 className="text-xl font-bold mb-4">Submit Insurance Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy</label>
                <select
                  name="policy_id"
                  value={formData.policy_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                >
                  <option value="">Select Policy</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.policy_number} - {p.policy_type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Claim Amount</label>
                <input
                  type="number"
                  name="claim_amount"
                  placeholder="Amount"
                  step="0.01"
                  value={formData.claim_amount}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  name="reason"
                  placeholder="Describe the claim reason"
                  value={formData.reason}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Submit Claim
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">Loading claims...</div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Claim Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  {user?.role !== 'customer' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map(claim => (
                  <tr key={claim.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {claim.claim_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₹{claim.claim_amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-white ${
                        claim.status === 'approved'
                          ? 'bg-green-600'
                          : claim.status === 'rejected'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                      }`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(claim.submission_date).toLocaleDateString()}
                    </td>
                    {user?.role !== 'customer' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {claim.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprove(claim.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(claim.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {claims.length === 0 && (
              <div className="px-6 py-4 text-center text-gray-500">
                No claims found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
