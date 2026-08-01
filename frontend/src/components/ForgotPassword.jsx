import { useState } from "react";
import { Link } from "react-router-dom";
import API from "./api";

export default function ForgotPassword() {
    const [form, setForm] = useState({
        email: "",
    });

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/forgot-password", form);
            if (res.status === 200) {
                alert("Check Your Email");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send reset email");
        }
    };

    return (
        <form onSubmit={submit}>
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Reset Password</h2>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                Enter your email and we'll send you a link to reset your password.
            </p>
            <input type="email" placeholder="Email Address" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <button type="submit">Send Reset Link</button>
            <div className="auth-links">
                <Link to="/login">Back to Login</Link>
            </div>
        </form>
    );
}
