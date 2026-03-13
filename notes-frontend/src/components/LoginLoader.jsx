import { useEffect, useState } from 'react';
import '../styles/LoginLoader.css';



function LoginLoader({ messages }) {
    const [msgIndex, setMsgIndex] = useState(0);
    const [fading, setFading] = useState(false);


    useEffect(() => {
        const interval = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setMsgIndex(i => (i + 1) % messages.length);
                setFading(false);
            }, 350);
        }, 1800);
        return () => clearInterval(interval);
    }, [messages]);


    return (
        <div className="loader-overlay">
            <div className="loader-card">

                {/* Concentric spinning square rings */}
                <div className="loader-icon">
                    <div className="rings-wrap">
                        <div className="ring ring-1" />
                        <div className="ring ring-2" />
                        <div className="ring ring-3" />
                        <div className="ring ring-4" />
                    </div>
                </div>

                {/* Cycling text */}

                <p className={`loader-msg ${fading ? 'fade-out' : 'fade-in'}`}>
                    {messages[msgIndex]}
                </p>


                {/* Dot trail */}

                <div className="loader-dots">
                    <span /><span /><span />
                </div>
            </div>
        </div>
    );
}

export default LoginLoader;