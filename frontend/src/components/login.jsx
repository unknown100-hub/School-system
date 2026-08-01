import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "./api";

export default function Login() {
    const [form, setForm] = useState({
        email: "",
        password: "",
        role: ""
    });

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/login", form);
            if (res.status === 200) {
                localStorage.setItem("token", res.data.token);
                alert("Login successful");
            }
        } catch (err) {
            console.error(err);
            alert("Login failed");
        }
    };

    return (
        <form onSubmit={submit}>
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Welcome Back</h2>
            <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
            </select>
            <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Login</button>
            <div className="auth-links">
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>
        </form>
    );
}
