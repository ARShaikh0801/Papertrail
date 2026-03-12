import '../styles/Spinner.css';

function Spinner({ size = 14, color = 'currentColor' }) {
    return (
        <span
            className="spinner"
            style={{ width: size, height: size, borderTopColor: color }}
            aria-label="Loading"
        />
    );
}

export default Spinner;