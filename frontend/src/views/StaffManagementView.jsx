import React, { useState, useEffect } from 'react';
import { UserPlus, Shield, Users, Mail, Phone, Building } from 'lucide-react';
import { api } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function StaffManagementView({ onOpenNewStaff }) {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStaff() {
    setLoading(true);
    try {
      const data = await api.getUsers('staff');
      setStaffList(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStaff();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-[#714B67]" />
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Internal Staff Team (Admin Only)</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Brightloop internal team handles day-to-day customer quotations, invoices, and billing support
          </p>
        </div>

        <button
          onClick={onOpenNewStaff}
          className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#714B67] hover:bg-[#5B3952] shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading staff members...</div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No staff members configured.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department / Office</th>
                  <th className="py-3 px-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {st.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {st.email}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="staff" />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {st.companyName || 'Sales & Customer Success'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {st.createdAt ? st.createdAt.split('T')[0] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
