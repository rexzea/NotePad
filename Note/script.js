class NotesApp {
    constructor() {
        this.notes = [];
        this.initElements();
        this.setupEventListeners();
        this.loadNotes();
        this.renderNotes();
    }

    initElements() {
        this.elements = {
            notesList: document.getElementById('notesList'),
            newNoteBtn: document.getElementById('newNoteBtn'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            modal: document.getElementById('noteModal'),
            modalTitle: document.getElementById('modalTitle'),
            titleInput: document.getElementById('noteTitleInput'),
            contentInput: document.getElementById('noteContentInput'),
            categorySelect: document.getElementById('noteCategory'),
            saveNoteBtn: document.getElementById('saveNoteBtn'),
            closeModalBtn: document.querySelector('.close-btn'),
            totalNotesCount: document.getElementById('totalNotesCount')
        };
    }

    setupEventListeners() {
        this.elements.newNoteBtn.addEventListener('click', () => this.openNoteModal());
        this.elements.closeModalBtn.addEventListener('click', () => this.closeNoteModal());
        this.elements.saveNoteBtn.addEventListener('click', () => this.saveNote());
        this.elements.searchInput.addEventListener('input', () => this.filterNotes());
        this.elements.sortSelect.addEventListener('change', () => this.sortNotes());
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    openNoteModal(note = null) {
        this.elements.modalTitle.textContent = note ? 'Edit Catatan' : 'Buat Catatan Baru';

        this.elements.titleInput.value = note ? note.title : '';
        this.elements.contentInput.value = note ? note.content : '';
        this.elements.categorySelect.value = note ? note.category : '';

        this.elements.titleInput.dataset.editId = note ? note.id : '';
        
        this.elements.modal.style.display = 'flex';
    }

    closeNoteModal() {
        this.elements.modal.style.display = 'none';
    }

    saveNote() {
        const title = this.elements.titleInput.value.trim();
        const content = this.elements.contentInput.value.trim();
        const category = this.elements.categorySelect.value;
        const editId = this.elements.titleInput.dataset.editId;

        if (!title || !content || !category) {
            alert('Silakan isi semua field!');
            return;
        }

        const noteData = {
            id: editId || this.generateId(),
            title,
            content,
            category,
            createdAt: editId ? this.findNoteById(editId).createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (editId) {
            const index = this.notes.findIndex(n => n.id === editId);
            this.notes[index] = noteData;
        } else {
            this.notes.push(noteData);
        }

        this.saveNotes();
        this.renderNotes();
        this.closeNoteModal();
    }

    findNoteById(id) {
        return this.notes.find(note => note.id === id);
    }

    renderNotes(notesToRender = this.notes) {
        this.elements.notesList.innerHTML = '';
        this.elements.totalNotesCount.textContent = notesToRender.length;

        notesToRender.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');
            noteCard.innerHTML = `
                <div class="note-card-header">
                    <span class="note-category">${this.getCategoryLabel(note.category)}</span>
                </div>
                <div class="note-card-content">
                    <h3>${note.title}</h3>
                    <p>${this.truncateText(note.content, 100)}</p>
                </div>
                <div class="note-actions">
                    <button onclick="notesApp.openNoteModal(${JSON.stringify(note).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button onclick="notesApp.deleteNote('${note.id}')">
                        <i class="bi bi-trash"></i> Hapus
                    </button>
                </div>
            `;
            this.elements.notesList.appendChild(noteCard);
        });
    }

    truncateText(text, length) {
        return text.length > length 
            ? text.substring(0, length) + '...' 
            : text;
    }

    getCategoryLabel(category) {
        const categories = {
            'personal': '🏠 Personal',
            'work': '💼 Pekerjaan',
            'study': '📚 Studi',
            'ideas': '💡 Ide',
            'shopping': '🛒 Belanja'
        };
        return categories[category] || category;
    }

    // hapus note
    deleteNote(id) {
        if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            this.notes = this.notes.filter(note => note.id !== id);
            this.saveNotes();
            this.renderNotes();
        }
    }

    filterNotes() {
        const searchTerm = this.elements.searchInput.value.toLowerCase();
        const filteredNotes = this.notes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) ||
            note.content.toLowerCase().includes(searchTerm)
        );
        this.renderNotes(filteredNotes);
    }

    sortNotes() {
        const sortMethod = this.elements.sortSelect.value;
        const sortedNotes = [...this.notes];

        switch(sortMethod) {
            case 'newest':
                sortedNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                break;
            case 'oldest':
                sortedNotes.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
                break;
            case 'alphabetical':
                sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }

        this.renderNotes(sortedNotes);
    }

    // Slocal torage
    saveNotes() {
        localStorage.setItem('notesAppNotes', JSON.stringify(this.notes));
    }

    // load dari local storage
    loadNotes() {
        const savedNotes = localStorage.getItem('notesAppNotes');
        this.notes = savedNotes ? JSON.parse(savedNotes) : [];
    }
}

const notesApp = new NotesApp();