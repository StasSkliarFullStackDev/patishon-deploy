import { useState } from 'react';
import './index.css';
import {useNavigate} from "react-router-dom";
import {AUTH_LOGIN, AUTH_PASSWORD} from "../../constant";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const setCookie = (name, value, hours) => {
        const date = new Date();
        date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${value};${expires};path=/`;
    };

    const login = (e) => {
        e.preventDefault();

        if (email === AUTH_LOGIN && password === AUTH_PASSWORD) {
            setCookie('isAuthenticated', 'true', 1);
            navigate('/landing');
        } else {
            setError('Invalid credentials')
        }
    }

    return (
        <div className="login-box">
            <div className="login-container">
                <h2>Login</h2>
                <form onSubmit={login} autoComplete="on">
                    <label htmlFor="email">Email</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        tabIndex="1"
                        autoComplete="email"
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        tabIndex="2"
                        autoComplete="current-password"
                    />

                    {error && <p style={{color: 'red'}}>{error}</p>}

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default Login;
