import React,{ useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { formatToUserTimezone } from "../utils/dateFormatter";
import "./notes.css";

function Notes() {
    const navigate = useNavigate();
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const username = localStorage.getItem('username');

    // ── Create modal state ─────────────────────────────
    const [createOpen, setCreateOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isChecklist, setIsChecklist] = useState(false);
    const [items, setItems] = useState([]);       // [{text, checked}]
    const [itemInput, setItemInput] = useState('');

    // ── Edit modal state ───────────────────────────────
    const [editOpen, setEditOpen] = useState(false);
    const [editNote, setEditNote] = useState(null);     // full note object
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editItems, setEditItems] = useState([]);
    const [editItemInput, setEditItemInput] = useState('');

    const bottomRef = useRef(null);
    const prevItemsLengthRef = useRef(0);
    const prevEditItemsLengthRef = useRef(0);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [notes]);

    // Scroll to bottom ONLY when items are added (not removed) during creation
    useEffect(() => {
        if (items.length > prevItemsLengthRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevItemsLengthRef.current = items.length;
    }, [items]);

    // Scroll to bottom ONLY when items are added (not removed) during editing
    useEffect(() => {
        if (editItems.length > prevEditItemsLengthRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevEditItemsLengthRef.current = editItems.length;
    }, [editItems]); 

    useEffect(() => { fetchNotes(); }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get('/notes/');
            setNotes(data);
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    };

    // ════════════════════════════════════════
    // CREATE
    // ════════════════════════════════════════
    const openCreate = () => {
        setTitle(''); setContent(''); setIsChecklist(false);
        setItems([]); setItemInput(''); setError('');
        setCreateOpen(true);
    };

    const handleItemKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = itemInput.trim();
            if (val) { setItems([...items, { text: val, checked: false }]); setItemInput(''); }
        }
    };

    const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

    const handleCreate = async () => {
        if (!title) { setError('Title is required'); return; }
        if (!isChecklist && !content) { setError('Content is required'); return; }
        try {
            await api.post('/notes/', {
                title,
                content: isChecklist ? '' : content,
                is_checklist: isChecklist,
                items: isChecklist ? items : [],
            });
            setCreateOpen(false);
            fetchNotes();
        } catch (err) {
            setError('Failed to create note');
        }
    };

    // ════════════════════════════════════════
    // EDIT
    // ════════════════════════════════════════
    const openEdit = (note) => {
        setEditNote(note);
        setEditTitle(note.title);
        setEditContent(note.content || '');
        setEditItems(note.items ? note.items.map(i => ({ ...i })) : []);
        setEditItemInput('');
        setError('');
        setEditOpen(true);
    };

    const handleEditItemKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const val = editItemInput.trim();
            if (val) { setEditItems([...editItems, { text: val, checked: false }]); setEditItemInput(''); }
        }
    };

    const removeEditItem = (i) => setEditItems(editItems.filter((_, idx) => idx !== i));

    const toggleEditItem = (i) => {
        const updated = [...editItems];
        updated[i].checked = !updated[i].checked;
        setEditItems(updated);
    };

    const handleEdit = async () => {
        if (!editTitle) { setError('Title is required'); return; }
        try {
            await api.patch(`/notes/${editNote.id}/`, {
                title: editTitle,
                content: editNote.is_checklist ? '' : editContent,
                items: editNote.is_checklist ? editItems : [],
            });
            setEditOpen(false);
            fetchNotes();
        } catch (err) {
            setError('Failed to update note');
        }
    };

    // ════════════════════════════════════════
    // DELETE / PIN / LOGOUT
    // ════════════════════════════════════════
    const handleDelete = async (e,id) => {
        e.stopPropagation();
        try { await api.delete(`/notes/${id}/`); fetchNotes(); }
        catch (err) { setError('Failed to delete note'); }
    };

    const handlePin = async (e,note) => {
        e.stopPropagation();
        try { await api.patch(`/notes/${note.id}/`, { is_pinned: !note.is_pinned }); fetchNotes(); }
        catch (err) { setError('Failed to update note'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value)
    };

    const filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.items && note.items.some(item => item.text.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // ════════════════════════════════════════
    // RENDER
    // ════════════════════════════════════════
    return (
        <div className="notes-container">

            {/* Navbar */}
            <nav className="notes-nav">
                <h2>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                    <path d="M8 2V5" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 2V5" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path opacity="0.4" d="M8 11H16" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    <path opacity="0.4" d="M8 16H12" stroke="#292D32" strokeWidth="1.5" strokeMiterlimit="10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg> 
                    {username}'s Notes
                </h2>
                <div className="search-area">
                    <div className="search-input-wrap">
                    <input type="text" className="search-bar" placeholder="Find Note..." value={searchQuery} onChange={(e)=>handleSearch(e)}/>
                    <button className="clear-search" onClick={handleClearSearch}>&times;</button>
                    </div>
                </div>
                <button onClick={handleLogout}>Logout</button>
            </nav>

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <p className="empty-state">No notes yet — hit + to write your first one.</p>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note, i) => (
                        <div onClick={()=>openEdit(note)}
                            key={note.id}
                            className={`notes-cards ${note.is_pinned ? 'pinned-note' : 'not-pinned-note'}`}
                            style={{ animationDelay: `${i * 0.05}s` }}
                        >
                            {/* Card header */}
                            <div className="note-header">
                                <h3>{note.is_pinned && (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none"
                                        style={{ marginRight: '0.35rem', verticalAlign: 'middle', display: 'inline-block' }}>
                                        <path d="M12 2 L17 7 L15 13 L12 14 L9 13 L7 7 Z"
                                            fill="#faecd6" stroke="#c8883a" strokeWidth="1.4" strokeLinejoin="round" />
                                        <line x1="12" y1="4" x2="12" y2="12.5"
                                            stroke="#a0522d" strokeWidth="0.9" strokeLinecap="round" opacity="0.5" />
                                        <line x1="12" y1="14" x2="12" y2="21"
                                            stroke="#a0522d" strokeWidth="1.5" strokeLinecap="round" />
                                        <line x1="7" y1="7" x2="17" y2="7"
                                            stroke="#c8883a" strokeWidth="1.3" strokeLinecap="round" />
                                    </svg>
                                )}{note.title.length > 27 ? note.title.slice(0, 27) + '...' : note.title}</h3>

                            </div>

                            {/* Checklist or plain content */}
                            {note.is_checklist ? (
                                <ul className="checklist-display">
                                    {note.items && note.items.map((item, idx) => (
                                        <li key={idx} className={item.checked ? 'checked-item' : ''}>
                                            <span className="check-dot clickable">{item.checked ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="20px" height="20px" viewBox="3 0 35 22" id="icon">
                                                    <defs>
                                                        <style>{`.cls-1 { fill: none; }`}</style>
                                                    </defs>
                                                    <title>checkbox--checked--filled</title>
                                                    <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" transform="translate(0 0)" />
                                                    <path id="inner-path" className="cls-1" d="M14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" transform="translate(0 0)" />
                                                    <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="20px" height="20" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 23"><path d="m2.5.5h10c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2z" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 9)" /></svg>
                                            )}</span>
                                            {item.checked ? (<s>{item.text}</s>) : item.text}
                                        </li>
                            
                                    ))}
                                </ul>
                            ) : (
                                <p className="note-content">{note.content}</p>
                            )}


                            <small className="note-timestamp">
                                {formatToUserTimezone(note.created_at)}
                                {note.updated_at !== note.created_at && <span> · edited</span>}
                            </small>
                            <div className="btn-div">
                                <button onClick={(e) => handlePin(e,note)}>
                                    {note.is_pinned ? 'Unpin' : 'Pin'}
                                </button>
                                
                                <button className="delete-btn" onClick={(e) => handleDelete(e,note.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>

                    ))}
                </div>
            )}

            {/* Floating add button */}
            <button className="add-note-model-btn" onClick={openCreate}>+</button>

            {/* ── CREATE MODAL ── */}
            {createOpen && (
                <div className="modal-overlay" >
                    <div className="note-form" onClick={e => e.stopPropagation()}>
                        <div className="note-form-header">
                            <h3>New Note</h3>
                            <button className="model-close-btn" onClick={() => setCreateOpen(false)}>&times;</button>
                        </div>

                        {error && <p className="error-line">{error}</p>}

                        <input type="text"
                            placeholder="Title"
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

                        {isChecklist ? (
                            <div className="checklist-builder">
                                <input type="text"
                                    placeholder="Type item and press Enter..."
                                    value={itemInput}
                                    onChange={e => setItemInput(e.target.value)}
                                    onKeyDown={handleItemKeyDown}
                                    className="item-input"
                                />
                                <ul className="items-preview">
                                    {items.map((item, i) => (
                                        <React.Fragment key={i}>
                                        <li key={i}>
                                            <span className="check-dot">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 23"><path d="m2.5.5h10c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2z" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 9)" /></svg>
                                            </span>
                                            <span>{item.text}</span>
                                            <button className="remove-item-btn" onClick={() => removeItem(i)}>&times;</button>
                                        </li>
                                        <hr className="item-seperator"/>
                                        </React.Fragment>
                                    ))}
                                    <div ref={bottomRef} />
                                </ul>
                            </div>
                        ) : (
                            <textarea
                                placeholder="Write something..."
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={5}
                            />
                        )}

                        <button className="submit-btn" onClick={handleCreate}>Add Note</button>
                    </div>
                </div>
            )}

            {/* ── EDIT MODAL ── */}
            {editOpen && editNote && (
                <div className="modal-overlay">
                    <div className="note-form" onClick={e => e.stopPropagation()}>
                        <div className="note-form-header">
                            <h3>{editTitle}</h3>
                            <button className="model-close-btn" onClick={() => setEditOpen(false)}>&times;</button>
                        </div>

                        {error && <p className="error-line">{error}</p>}

                        <input
                            type="text"
                            placeholder="Title"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            
                        />

                        {editNote.is_checklist ? (
                            <div className="checklist-builder">
                                <input type="text"
                                    placeholder="Type item and press Enter..."
                                    value={editItemInput}
                                    onChange={e => setEditItemInput(e.target.value)}
                                    onKeyDown={handleEditItemKeyDown}
                                    className="item-input"
                                />
                                <ul className="items-preview">
                                    {editItems.map((item, i) => ( <React.Fragment key={i}>
                                        <li  className={item.checked ? 'checked-item' : ''} >

                                            <span
                                                className="check-dot clickable"
                                                onClick={() => toggleEditItem(i)}
                                            >
                                                {item.checked ? (<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="20px" height="20px" viewBox="3 0 35 22" id="icon">
                                                    <defs>
                                                        <style>{`.cls-1 { fill: none; }`}</style>
                                                    </defs>
                                                    <title>checkbox--checked--filled</title>
                                                    <path d="M26,4H6A2,2,0,0,0,4,6V26a2,2,0,0,0,2,2H26a2,2,0,0,0,2-2V6A2,2,0,0,0,26,4ZM14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" transform="translate(0 0)" />
                                                    <path id="inner-path" className="cls-1" d="M14,21.5,9,16.5427,10.5908,15,14,18.3456,21.4087,11l1.5918,1.5772Z" transform="translate(0 0)" />
                                                    <rect id="_Transparent_Rectangle_" data-name="&lt;Transparent Rectangle&gt;" className="cls-1" width="20px" height="20" />
                                                </svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 25 23"><path d="m2.5.5h10c1.1045695 0 2 .8954305 2 2v10c0 1.1045695-.8954305 2-2 2h-10c-1.1045695 0-2-.8954305-2-2v-10c0-1.1045695.8954305-2 2-2z" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" transform="translate(2 9)" /></svg>)}
                                            </span>
                                            <span onClick={() => toggleEditItem(i)}>{item.checked ? (<s>{item.text}</s>) : item.text}</span>
                                            <button className="remove-item-btn" onClick={() => removeEditItem(i)}>&times;</button>
                                        </li>
                                        <hr className="item-seperator"/>
                                        </React.Fragment>
                                    ))}
                                    <div ref={bottomRef} />
                                </ul>
                            </div>
                        ) : (
                            <textarea
                                placeholder="Write something..."
                                value={editContent}
                                onChange={e => setEditContent(e.target.value)}
                                rows={5}
                            />
                        )}

                        <button className="submit-btn" onClick={handleEdit}>Save Changes</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Notes;