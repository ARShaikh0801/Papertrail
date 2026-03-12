import React,{useState,useRef} from 'react';
import '../styles/ChecklistBuilder.css'

const UncheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 23">
        <path d="m2.5.5h10c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2z"
            fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 9)" />
    </svg>
);

const CheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="20px" height="20px" viewBox="3 0 35 22">
        <defs><style>{`.cls-1{fill:none}`}</style></defs>
        <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" />
        <path className="cls-1" d="M14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" />
        <rect className="cls-1" width="20px" height="20" />
    </svg>
);

/**
 * ChecklistBuilder
 *
 * Props:
 *  items        — [{ text, checked }]
 *  onAdd        — (text) => void
 *  onRemove     — (index) => void
 *  onToggle     — (index) => void   (optional — omit in create mode)
 *  bottomRef    — ref for auto-scroll anchor
 */
function ChecklistBuilder({ items, onAdd, onRemove, onToggle, bottomRef }) {
    const [inputVal, setInputVal] = useState('');
    const listRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            const val = inputVal.trim();
            if (val) {
                onAdd(val);
                setInputVal('');
                setTimeout(() => {
                    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
                }, 50);
            }
        }
    };

    return (
        <div className="checklist-builder">
            <input
                type="text"
                className="item-input"
                placeholder="Type item and press Enter…"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
            />
            <ul className="items-preview" ref={listRef}>
                {items.map((item, i) => (
                    <React.Fragment key={i}>
                        <li className={item.checked ? 'checked-item' : ''}>
                            <span
                                className={`check-dot ${onToggle ? 'clickable' : ''}`}
                                onClick={() => onToggle?.(i)}
                            >
                                {item.checked ? <CheckedIcon /> : <UncheckedIcon />}
                            </span>
                            <span onClick={() => onToggle?.(i)}>
                                {item.checked ? <s>{item.text}</s> : item.text}
                            </span>
                            <button className="remove-item-btn" onClick={() => onRemove(i)}>
                                &times;
                            </button>
                        </li>
                        <hr className="item-seperator" />
                    </React.Fragment>
                ))}
                <div ref={bottomRef} />
            </ul>
        </div>
    );
}

export default ChecklistBuilder;