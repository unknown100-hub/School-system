import { useState } from "react";
import API from "./api";

export default function Registration() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: ""
    });

    const submit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post("/auth/registration", form);
            if (res.status === 200) {
                localStorage.setItem("token", res.data.token);
                alert("Registration successful");
            }
        } catch (err) {
            console.error(err);
            alert("Registration failed");
        }
    };

    return (
        <form onSubmit={submit}>
            <h2 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>Create Account</h2>
            <select onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="secretary">Secretary</option>
            </select>

            <input placeholder="Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input placeholder="Email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
            <button type="submit">Register</button>
        </form>
    );
}
