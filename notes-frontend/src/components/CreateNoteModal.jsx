import { useState, useRef, useEffect } from 'react';
import ChecklistBuilder from './ChecklistBuilder';
import Spinner from './Spinner.jsx'
import '../styles/Create&EditNoteModal.css';

/**
 * CreateNoteModal
 *
 * Props:
 *  onClose     — () => void
 *  onCreated   — () => void   (triggers fetchNotes in parent)
 *  apiPost     — (payload) => Promise   (api.post('/notes/', payload))
 */
function CreateNoteModal({ onClose, onCreated, apiPost }) {
    
    const [title, setTitle]               = useState('');
    const [content, setContent]           = useState('');
    const [isChecklist, setIsChecklist]   = useState(false);
    const [items, setItems]               = useState([]);
    const [error, setError]               = useState('');
    const [loading, setLoading]           = useState(false);
    

    const bottomRef = useRef(null);
    const prevItemsLengthRef=useRef(0);

    useEffect(() => {
        if (items.length > prevItemsLengthRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevItemsLengthRef.current = items.length;
    }, [items]);


    const addItem    = (text) => setItems(prev => [...prev, { text, checked: false }]);
    const removeItem = (i)    => setItems(prev => prev.filter((_, idx) => idx !== i));

    const toggleItem = (i)    => setItems(prev =>
        prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item)
    );

    const handleCreate = async () => {
        if (!isChecklist && !content.trim()) { setError('Content is required'); return; }
        if (isChecklist && items.length === 0) { setError('Add at least one item'); return; }

        setLoading(true);
        setError('');
        try {
            await apiPost({
                title: title.trim() ? title : "Untitled",
                content: isChecklist ? '' : content,
                is_checklist: isChecklist,
                items: isChecklist ? items : [],
            });
            onCreated();
            onClose();
        } catch (err) {
            setError('Failed to create note');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="modal-overlay">
            <div className="note-form" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="note-form-header">
                    <h3><span>·</span> New Note</h3>
                    <button className="model-close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <p className="error-line">{error}</p>}

                {/* Title */}
                <input
                    type="text"
                    placeholder="Untitled"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />

                {/* Checklist toggle */}
                <label className="checklist-toggle">
                    <input
                        type="checkbox"
                        checked={isChecklist}
                        onChange={e => setIsChecklist(e.target.checked)}
                    />
                    <span>Checklist mode</span>
                </label>

                {/* Body */}
                {isChecklist ? (
                    
                    <ChecklistBuilder
                        items={items}
                        onAdd={addItem}
                        onRemove={removeItem}
                        onToggle={toggleItem}
                        bottomRef={bottomRef}
                    />
                    
                ) : (
                    <textarea
                        placeholder="Write something…"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={5}
                        autoFocus
                    />
                )}

                {/* Submit */}
                <button
                    className="submit-btn"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? <><Spinner />&nbsp;Writing…</> : 'Add Note'}
                </button>
            </div>
        </div>
    );
}

export default CreateNoteModal;