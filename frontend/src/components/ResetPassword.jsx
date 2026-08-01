import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "./api";

export default function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const res = await API.post(`/auth/reset-password/${token}`, { password });
            if (res.status === 200) {
                alert("Password updated successfully");
                navigate('/login');
            }
        } catch (err) {
            console.error(err);
            alert("Failed to reset password");
        }
    };

    return (
        <form onSubmit={submit}>
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Create New Password</h2>
            <input type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} />
            <button type="submit">Update Password</button>
        </form>
    );
}
