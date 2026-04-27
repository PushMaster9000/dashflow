// js/ajax_handlers.js
// ----------------------------------------------------
// Exp 9: Develop code to handle JavaScript Events using AJAX
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    const taskList = document.getElementById('task-list');
    const notesList = document.getElementById('notes-list');
    const habitList = document.querySelector('.habit-list');

    // ----------------------------------------------------
    // TASKS AJAX
    // ----------------------------------------------------
    const loadTasks = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/tasks.php', true);
        xhr.onload = function() {
            if(this.status === 200) {
                try {
                    const response = JSON.parse(this.responseText);
                    let output = '';
                    if (response.status === 'success') {
                        if (response.data.length > 0) {
                            response.data.forEach(task => {
                                output += `
                                    <div class="task-item ${task.priority}" data-id="${task.id}">
                                        <input type="checkbox" class="task-checkbox" ${task.status === 'done' ? 'checked' : ''}>
                                        <span style="${task.status === 'done' ? 'text-decoration: line-through; color: var(--text-secondary);' : ''}">${task.title}</span>
                                    </div>
                                `;
                            });
                        } else {
                            output = '<div class="text-gray">No tasks found.</div>';
                        }
                    } else {
                        output = '<div class="error-msg text-center">' + response.message + '</div>';
                    }
                    taskList.innerHTML = output;
                    attachCheckboxListeners();
                } catch(e) {
                    showMockTasks();
                }
            }
        };
        xhr.onerror = showMockTasks;
        xhr.send();
    };

    function showMockTasks() {
        if(!taskList) return;
        taskList.innerHTML = `
            <div class="task-item high" data-id="1"><input type="checkbox" class="task-checkbox"> <span>Review System Architecture</span></div>
            <div class="task-item medium" data-id="2"><input type="checkbox" class="task-checkbox"> <span>Design Landing Page</span></div>
        `;
        attachCheckboxListeners();
    }

    loadTasks();

    document.addEventListener('taskFormValidated', (e) => {
        const data = e.detail;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'api/tasks.php', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function() {
            try {
                const res = JSON.parse(this.responseText);
                if (res.status === 'success') {
                    document.getElementById('task-title').value = '';
                    $(document).trigger('ajaxSuccessEvent', ['Task added successfully!']);
                    loadTasks();
                } else {
                    document.getElementById('task-error').textContent = res.message;
                }
            } catch(e) {
                loadTasks();
            }
        };
        xhr.send(JSON.stringify(data));
    });

    function attachCheckboxListeners() {
        document.querySelectorAll('.task-checkbox').forEach(box => {
            box.addEventListener('change', function() {
                const isChecked = this.checked;
                const span = this.closest('.task-item').querySelector('span');
                span.style.textDecoration = isChecked ? 'line-through' : 'none';
                span.style.color = isChecked ? 'var(--text-secondary)' : 'var(--text-primary)';
                $(document).trigger('ajaxSuccessEvent', [isChecked ? 'Task marked complete' : 'Task unmarked']);
            });
        });
    }

    // ----------------------------------------------------
    // NOTES AJAX
    // ----------------------------------------------------
    const loadNotes = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/notes.php', true);
        xhr.onload = function() {
            if(this.status === 200) {
                try {
                    const response = JSON.parse(this.responseText);
                    let output = '';
                    if(response.status === 'success') {
                        if (response.data.length > 0) {
                            response.data.forEach(note => {
                                output += `
                                    <div style="background:var(--bg-color); padding:1rem; border-radius:0.75rem; border:1px solid var(--border-color); position: relative;">
                                        <button class="delete-note-btn icon-btn" data-id="${note.id}" style="position: absolute; top: 1rem; right: 1rem; color: var(--text-secondary); cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                                        <h4 style="margin-bottom:0.5rem; color:var(--primary-color); padding-right: 1.5rem;">${note.title}</h4>
                                        <p style="font-size:0.9rem; white-space:pre-wrap;">${note.content}</p>
                                        <small class="text-gray" style="display:block; margin-top:0.5rem; font-size:0.75rem;">${note.created_at}</small>
                                    </div>
                                `;
                            });
                        } else {
                            output = '<div class="text-gray">No saved notes found.</div>';
                        }
                    } else {
                        output = '<div class="error-msg text-center">' + response.message + '</div>';
                    }
                    if(notesList) notesList.innerHTML = output;
                } catch(e) {
                    showMockNotes();
                }
            }
        };
        xhr.onerror = showMockNotes;
        xhr.send();
    };

    function showMockNotes() {
        if(!notesList) return;
        notesList.innerHTML = `<div class="text-gray text-center">Backend offline. Please refresh.</div>`;
    }

    loadNotes();

    // Event Delegation for Notes Deletion
    if (notesList) {
        notesList.addEventListener('click', function(e) {
            const btn = e.target.closest('.delete-note-btn');
            if (btn) {
                e.stopPropagation();
                const noteId = btn.getAttribute('data-id');
                if (confirm('Delete this note?')) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'api/notes.php?action=delete', true);
                    xhr.setRequestHeader('Content-type', 'application/json');
                    xhr.onload = function() {
                        const res = JSON.parse(this.responseText);
                        if (res.status === 'success') {
                            $(document).trigger('ajaxSuccessEvent', ['Note deleted']);
                            loadNotes();
                        } else { alert(res.message); }
                    };
                    xhr.send(JSON.stringify({id: noteId}));
                }
            }
        });
    }

    document.addEventListener('noteFormValidated', (e) => {
        const data = e.detail;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'api/notes.php', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function() {
            try {
                const res = JSON.parse(this.responseText);
                if (res.status === 'success') {
                    document.getElementById('note-title').value = '';
                    document.getElementById('note-content').value = '';
                    $(document).trigger('ajaxSuccessEvent', ['Note saved!']);
                    loadNotes();
                } else { document.getElementById('note-error').textContent = res.message; }
            } catch(e) { loadNotes(); }
        };
        xhr.send(JSON.stringify(data));
    });

    // ----------------------------------------------------
    // HABITS AJAX
    // ----------------------------------------------------
    const loadHabits = () => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'api/habits.php', true);
        xhr.onload = function() {
            if (this.status === 200) {
                try {
                    const res = JSON.parse(this.responseText);
                    let output = '';
                    if (res.status === 'success') {
                        if (res.data.length > 0) {
                            res.data.forEach(habit => {
                                output += `
                                    <div class="habit-item" data-id="${habit.id}">
                                        <div class="habit-info">
                                            <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                                                <h4>${habit.title}</h4>
                                                <div>
                                                    <button class="delete-habit-btn icon-btn" data-id="${habit.id}" style="color: var(--color-red); margin-left: 10px;"><i class="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                            <span class="streak"><i class="fa-solid fa-fire text-orange"></i> ${habit.streak || 0} Day Streak</span>
                                        </div>
                                        <div class="habit-days">
                                            <div class="day-box tooltip" data-tooltip="Mon"></div>
                                            <div class="day-box tooltip" data-tooltip="Tue"></div>
                                            <div class="day-box tooltip" data-tooltip="Wed"></div>
                                            <div class="day-box tooltip" data-tooltip="Thu"></div>
                                            <div class="day-box tooltip" data-tooltip="Fri"></div>
                                            <div class="day-box tooltip" data-tooltip="Sat"></div>
                                            <div class="day-box tooltip" data-tooltip="Sun"></div>
                                        </div>
                                    </div>
                                `;
                            });
                        } else { output = '<div class="text-gray">No habits found.</div>'; }
                    }
                    if (habitList) habitList.innerHTML = output;
                } catch(e) {}
            }
        };
        xhr.send();
    };

    if (habitList) {
        loadHabits();
        // Event Delegation for Habits
        habitList.addEventListener('click', function(e) {
            const deleteBtn = e.target.closest('.delete-habit-btn');
            
            if (deleteBtn) {
                e.stopPropagation();
                const habitId = deleteBtn.getAttribute('data-id');
                if (confirm('Delete this habit?')) {
                    const xhr = new XMLHttpRequest();
                    xhr.open('POST', 'api/habits.php?action=delete', true);
                    xhr.setRequestHeader('Content-type', 'application/json');
                    xhr.onload = function() {
                        const res = JSON.parse(this.responseText);
                        if (res.status === 'success') {
                            $(document).trigger('ajaxSuccessEvent', ['Habit deleted']);
                            loadHabits();
                        } else { alert(res.message); }
                    };
                    xhr.send(JSON.stringify({id: habitId}));
                }
            }
        });
    }

    document.addEventListener('habitFormValidated', (e) => {
        const data = e.detail;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'api/habits.php', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function() {
            $(document).trigger('ajaxSuccessEvent', ['Habit created!']);
            loadHabits();
        };
        xhr.send(JSON.stringify(data));
    });

});
