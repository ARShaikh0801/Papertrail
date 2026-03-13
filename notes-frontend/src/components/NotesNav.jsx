import '../styles/NotesNav.css'
import Spinner from './Spinner.jsx'
import ThemeToggle from './ThemeToggle.jsx'
/**
 * NotesNav
 *
 * Props:
 *  username      — string
 *  searchQuery   — string
 *  onSearch      — (e) => void
 *  onClear       — () => void
 *  onLogout      — () => void
 */
function NotesNav({ username, searchQuery, onSearch, onClear, onLogout, logOutLoading }) {
    return (
        <nav className="notes-nav">

            {/* Brand */}
            <h2 className="nav-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 2V5" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path opacity="0.4" d="M8 11H16" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path opacity="0.4" d="M8 16H12" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {username}'s Notes
            </h2>

            {/* Search */}
            <div className="search-area">
                <div className="search-input-wrap">
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Find Note..."
                        value={searchQuery}
                        onChange={onSearch}
                    />
                    <button className="clear-search" onClick={onClear}>&times;</button>
                </div>
            </div>

            {/* Theme + Logout */}
            <div className="nav-actions">
                <ThemeToggle />
                <button onClick={onLogout} disabled={logOutLoading}>
                    {logOutLoading ? <><Spinner />&nbsp;Logging Out…</> : 'Logout'}
                </button>
            </div>

        </nav>
    );
}

export default NotesNav;