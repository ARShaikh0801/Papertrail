import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import './login.css';
import LoginLoader from '../components/LoginLoader.jsx';

function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };


    useEffect(() => {
        const handleKeyUp = (event) => {
            if (event.key === 'Enter') {
                handleSubmit(event);
            }
        };

        document.addEventListener('keyup', handleKeyUp);

        return () => {
            document.removeEventListener('keyup', handleKeyUp);
        };
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const minDelay = new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // const { data } = await api.post('/auth/login/', formData);
            const [{ data }] = await Promise.all([api.post('/auth/login/', formData),
                minDelay
            ]);
            if (data.token) localStorage.setItem('token', data.token);
            if (data.username) localStorage.setItem('username', data.username);
            navigate('/notes');
        } catch (err) {
            await minDelay;
            setError(err.response?.data?.error_view || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-bg">
            {isLoading && <LoginLoader />}
            <div className="login-div">

                {/* Header */}
                <div className="login-header">
                    <h2>Welcome back.</h2>
                    <p className="subtitle">Sign in to your notes</p>
                    <div className="divider" />
                </div>

                {error && <p className="error-line">{error}</p>}

                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        placeholder="your username"
                        onChange={handleChange}
                        autoComplete="username"
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
                        autoComplete="current-password"
                    />
                </div>

                <button onClick={handleSubmit}>Sign In</button>

                <p>No account yet? <Link to="/register">Create one</Link></p>
            </div>
        </div>
    );
}

export default Login;