import { useState, useRef, useEffect } from 'react';
import ChecklistBuilder from './ChecklistBuilder';
import '../styles/Create&EditNoteModal.css'
import Spinner from './Spinner.jsx'

/**
 * EditNoteModal
 *
 * Props:
 *  note        — full note object to edit
 *  onClose     — () => void
 *  onSaved     — () => void   (triggers fetchNotes in parent)
 *  apiPatch    — (id, payload) => Promise   (api.patch(`/notes/${id}/`, payload))
 */
function EditNoteModal({ note, onClose, onSaved, apiPatch }) {
    const [title, setTitle]         = useState(note.title);
    const [content, setContent]     = useState(note.content || '');
    const [items, setItems]         = useState(note.items ? note.items.map(i => ({ ...i })) : []);
    const [error, setError]         = useState('');
    const [loading, setLoading]     = useState(false);

    const bottomRef = useRef(null);
    const  prevEditItemsLengthRef=useRef(0);

    useEffect(() => {
            if (items.length > prevEditItemsLengthRef.current) {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
            prevEditItemsLengthRef.current = items.length;
        }, [items]);

    // Reinitialise if a different note is passed in
    useEffect(() => {
        setTitle(note.title);
        setContent(note.content || '');
        setItems(note.items ? note.items.map(i => ({ ...i })) : []);
        setError('');
    }, [note.id]);

    const addItem    = (text) => setItems(prev => [...prev, { text, checked: false }]);
    const removeItem = (i)    => setItems(prev => prev.filter((_, idx) => idx !== i));
    const toggleItem = (i)    => setItems(prev =>
        prev.map((item, idx) => idx === i ? { ...item, checked: !item.checked } : item)
    );

    const handleSave = async () => {
        if (!title.trim()) { setError('Title is required'); return; }
        if (note.is_checklist && items.length === 0) { setError('Add at least one item'); return; }

        setLoading(true);
        setError('');
        try {
            await apiPatch(note.id, {
                title,
                content: note.is_checklist ? '' : content,
                items:   note.is_checklist ? items : [],
            });
            onSaved();
            onClose();
        } catch (err) {
            setError('Failed to update note');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="note-form" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="note-form-header">
                    <h3>{title || 'Edit Note'}</h3>
                    <button className="model-close-btn" onClick={onClose}>&times;</button>
                </div>

                {error && <p className="error-line">{error}</p>}

                {/* Title */}
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                />

                {/* Body */}
                {note.is_checklist ? (
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
                    />
                )}

                {/* Submit */}
                <button
                    className="submit-btn"
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? <><Spinner/>&nbsp;Re-writing…</> : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}

export default EditNoteModal;