import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import NotesNav from "../components/NotesNav";
import QuickCreateForm from "../components/QuickCreateForm";
import NoteCard from "../components/NoteCard";
import CreateNoteModal from "../components/CreateNoteModal";
import EditNoteModal from "../components/EditNoteModal";

import "./notes.css";

function Notes() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const bottomRef = useRef(null);

    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editNote, setEditNote] = useState(null);   // null = closed
    const [pinLoading, setPinLoading]           = useState(null);
    const [delLoading, setDelLoading]           = useState(null);
    const [logOutLoading,setLogOutLoading] = useState(false);

    // ── Scroll to bottom when notes list updates ───────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [notes]);

    

    // ── Initial fetch ──────────────────────────────────
    useEffect(() => { fetchNotes(); }, []);

    const fetchNotes = async () => {
        try {
            const { data } = await api.get('/notes/');
            setNotes(data);
        } catch (err) {
            if (err.response?.status === 401) navigate('/login');
        }
    };

    // ── Pin / Delete ───────────────────────────────────
    const handlePin = async (e, note) => {
        e.stopPropagation();
        setPinLoading(note.id);
        try {
            await api.patch(`/notes/${note.id}/`, { is_pinned: !note.is_pinned });
            fetchNotes();
        } catch (_) { }
        finally{
            setPinLoading(null);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setDelLoading(id);
        try {
            await api.delete(`/notes/${id}/`);
            fetchNotes();
        } catch (_) { }
        finally{
            setDelLoading(null);
        }
    };

    // ── Logout ─────────────────────────────────────────
    const handleLogout = () => {
        setLogOutLoading(true)
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setLogOutLoading(false)
        navigate('/login');
    };

    // ── Search ─────────────────────────────────────────
    const handleSearch = (e) => setSearchQuery(e.target.value);
    const handleClear = () => setSearchQuery('');

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (note.items && note.items.some(item =>
            item.text.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    );

    // ── API helpers passed to modals ───────────────────
    const apiPost = (payload) => api.post('/notes/', payload);
    const apiPatch = (id, payload) => api.patch(`/notes/${id}/`, payload);

    // ═══════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════
    return (
        <div className="notes-container">

            <NotesNav
                username={username}
                searchQuery={searchQuery}
                onSearch={handleSearch}
                onClear={handleClear}
                onLogout={handleLogout}
                logOutLoading={logOutLoading}
            />

            <QuickCreateForm 
                    onCreated={fetchNotes}
                    apiPost={apiPost}
            />

            {/* Notes grid */}
            {filteredNotes.length === 0 ? (
                (searchQuery.trim() && notes.length !== 0) ? (
                    <p className="empty-state">
                        No notes match "<strong>{searchQuery}</strong>" — try a different word.
                    </p>
                ) : (
                    <p className="empty-state">
                        Your notebook is empty — press <strong>+</strong> to write your first thought.
                    </p>
                )
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map((note, i) => (
                        <NoteCard
                            key={note.id}
                            note={note}
                            index={i}
                            onEdit={setEditNote}
                            onPin={handlePin}
                            pinLoading={pinLoading === note.id}
                            onDelete={handleDelete}
                            delLoading={delLoading === note.id}
                        />
                    ))}
                    
                </div>
            )}

            {/* Floating add button */}
            <button className="add-note-model-btn" onClick={() => setCreateOpen(true)}>+</button>

            {/* Modals */}
            {createOpen && (
                <CreateNoteModal
                    onClose={() => setCreateOpen(false)}
                    onCreated={fetchNotes}
                    apiPost={apiPost}
                />
            )}

            {editNote && (
                <EditNoteModal
                    note={editNote}
                    onClose={() => setEditNote(null)}
                    onSaved={fetchNotes}
                    apiPatch={apiPatch}
                />
            )}

        </div>
    );
}

export default Notes;