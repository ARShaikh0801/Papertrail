import React, { useState, useEffect, useRef } from "react";
import ChecklistBuilder from "./ChecklistBuilder";
import '../styles/QuickCreateForm.css'
import Spinner from './Spinner.jsx'

function QuickCreateForm({ onCreated, apiPost }) {

    const [shouldShow, setShouldShow] = useState(false);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isChecklist, setIsChecklist] = useState(false);
    const [items, setItems] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    
    const setVisibility = () => {
        if((!isChecklist && content.trim() !== '') || (isChecklist && items.length > 0)){
            setShouldShow(true);
        }
        else{
            setShouldShow(false);
        }
    }

    useEffect(setVisibility,[items,content]);

    


    const addItem = (text) => setItems(prev => [...prev, { text, checked: false }]);
    const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));

    const toggleItem = (i) => setItems(prev =>
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
        } catch (err) {
            setError('Failed to create note');
        } finally {
            setLoading(false);
            setTitle('');
            setContent('');
            setItems([]);
            setIsChecklist(false);
            setShouldShow(false);
        }
    };



    return (<>
        <div className="quick-form-container" onKeyDown={e => { if (e.key === 'Enter') e.stopPropagation(); }}>

            <div className={`needed-focus ${shouldShow ? '' : 'hidden-quick-field'}`}>
                {error && <p className="error-line">{error}</p>}

                <input
                    type="text"
                    placeholder="Untitled"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    autoFocus
                />
            </div>

            <label className="checklist-toggle">
                <input
                    type="checkbox"
                    checked={isChecklist}
                    onChange={e => setIsChecklist(e.target.checked)}
                />
                <span>Checklist mode</span>
            </label>

            {isChecklist ? (

                <ChecklistBuilder
                    items={items}
                    onAdd={addItem}
                    onRemove={removeItem}
                    onToggle={toggleItem}
                    bottomRef={null}
                />

            ) : (
                <textarea
                    placeholder="Take a Note…"
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    rows={2}
                    autoFocus
                />
            )}

            <div className={`needed-focus ${shouldShow ? '' : 'hidden-quick-field'}`} >
                <button
                    className="submit-btn"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? <><Spinner/>&nbsp;Writing…</> : 'Add Note'}
                </button>
            </div>


        </div>
    </>);
}

export default QuickCreateForm;