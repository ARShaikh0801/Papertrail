import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../api/axios';
import './register.css';

function Register() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/register/', formData);
            if (data.token) localStorage.setItem('token', data.token);
            if (data.username) localStorage.setItem('username', data.username);
            navigate('/notes');
        } catch (err) {
            if (err.response?.data?.error_view) {
                setError({ error_view: err.response?.data?.error_view });
            } else {
                setError(err.response?.data || {});
            }
        }
    };

    return (
        <div className="register-bg">
            <div className="register-div">

                {/* Header */}
                <div className="register-header">
                    <h2>Create account.</h2>
                    <p className="subtitle">Start writing your notes</p>
                    <div className="divider" />
                </div>

                {/* Error messages */}
                {error.error_view && <p className="error-line">{error.error_view}</p>}
                {error.username  && <p className="error-line">Username: {error.username[0]}</p>}
                {error.email     && <p className="error-line">Email: {error.email[0]}</p>}
                {error.password  && <p className="error-line">Password: {error.password[0]}</p>}

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        placeholder="choose a username"
                        onChange={handleChange}
                        autoComplete="username"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        onChange={handleChange}
                        autoComplete="email"
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        onChange={handleChange}
                        autoComplete="new-password"
                    />
                </div>

                <button onClick={handleSubmit}>Create Account</button>

                <p>Already have an account? <Link to="/login">Sign in</Link></p>
            </div>
        </div>
    );
}

export default Register;