"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: string;
  email: string;
  role: string;
  faculty?: string;
}

const AdminUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [faculty, setFaculty] = useState("");

  const API_BASE = "http://localhost:8080";

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/user/all`);
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user
  const addUser = async () => {
    if (!email || !role) return alert("กรอก Email และ Role ให้ครบ");
    try {
      await axios.post(`${API_BASE}/user/${email}/${role}`);
      setEmail("");
      setRole("user");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเพิ่มผู้ใช้ได้");
    }
  };

  // Delete user
  const deleteUser = async (id: string) => {
    if (!confirm("คุณต้องการลบผู้ใช้นี้หรือไม่?")) return;
    try {
      await axios.delete(`${API_BASE}/user/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถลบผู้ใช้ได้");
    }
  };

  // Update faculty
  const updateFaculty = async (id: string) => {
    if (!faculty) return alert("กรอก Faculty ก่อน");
    try {
      await axios.put(`${API_BASE}/user/updatef`, { id, faculty });
      setFaculty("");
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถอัปเดต faculty ได้");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard - Manage Users</h1>

      {/* Add User Form */}
      <div className="mb-6 flex gap-2">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="user">User</option>
          <option value="officer">Officer</option>
          <option value="LE">LE</option>
        </select>
        <button onClick={addUser} className="bg-blue-500 text-white p-2 rounded">
          Add User
        </button>
      </div>

      {/* Users Table */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Faculty</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">
                <input
                  type="text"
                  placeholder="Faculty"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="border p-1 rounded w-full"
                />
              </td>
              <td className="border p-2 flex gap-2">
                <button
                  onClick={() => updateFaculty(user.id)}
                  className="bg-green-500 text-white p-1 rounded"
                >
                  Update Faculty
                </button>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersPage;
