// js/ajax_handlers.js
// ----------------------------------------------------
// Exp 9: Develop code to handle JavaScript Events using AJAX
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    const taskList = document.getElementById('task-list');
    const notesList = document.getElementById('notes-list');

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
                    
                    // Attach change events to checkboxes
                    attachCheckboxListeners();
                } catch(e) {
                    showMockTasks();
                }
            }
        };
        xhr.onerror = function() {
             showMockTasks();
        };
        xhr.send();
    };

    function showMockTasks() {
        taskList.innerHTML = `
            <div class="task-item high" data-id="1">
                <input type="checkbox" class="task-checkbox">
                <span>Review System Architecture</span>
            </div>
            <div class="task-item medium" data-id="2">
                <input type="checkbox" class="task-checkbox">
                <span>Design Landing Page</span>
            </div>
            <div class="task-item low" data-id="3">
                <input type="checkbox" class="task-checkbox" checked>
                <span style="text-decoration: line-through; color: var(--text-secondary);">Reply to Emails</span>
            </div>
        `;
        attachCheckboxListeners();
    }

    loadTasks();

    // Listen for task submission
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
                document.getElementById('task-error').textContent = 'Error parsing server response';
                loadTasks();
            }
        };
        xhr.onerror = function() {
            // Fallback: visually add task to UI
            const newItem = document.createElement('div');
            newItem.className = `task-item ${data.priority}`;
            newItem.innerHTML = `<input type="checkbox" class="task-checkbox"> <span>${data.title}</span>`;
            
            if(taskList.querySelector('.text-gray') || taskList.querySelector('.error-msg')) {
                taskList.innerHTML = '';
            }
            taskList.insertBefore(newItem, taskList.firstChild);
            
            document.getElementById('task-title').value = '';
            attachCheckboxListeners();
            $(document).trigger('ajaxSuccessEvent', ['Task added locally (Backend offline)']);
        };
        xhr.send(JSON.stringify(data));
    });

    // Checkbox toggling function
    function attachCheckboxListeners() {
        const checkboxes = document.querySelectorAll('.task-checkbox');
        checkboxes.forEach(box => {
            box.addEventListener('change', function() {
                const isChecked = this.checked;
                const taskItem = this.closest('.task-item');
                const span = taskItem.querySelector('span');
                
                if(isChecked) {
                    span.style.textDecoration = 'line-through';
                    span.style.color = 'var(--text-secondary)';
                } else {
                    span.style.textDecoration = 'none';
                    span.style.color = 'var(--text-primary)';
                }

                // Note: Normally we would send an AJAX POST here to update the DB status to 'done'.
                // Since our current tasks API only handles creating, we will just update UI for the demo.
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
                                        <button class="delete-note-btn" data-id="${note.id}" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 0.2rem; transition: 0.2s;"><i class="fa-solid fa-trash"></i></button>
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
                    if(notesList) {
                        notesList.innerHTML = output;
                        
                        document.querySelectorAll('.delete-note-btn').forEach(btn => {
                            btn.addEventListener('click', function() {
                                if (confirm('Are you sure you want to delete this note?')) {
                                    const noteId = this.getAttribute('data-id');
                                    const dXhr = new XMLHttpRequest();
                                    dXhr.open('DELETE', 'api/notes.php', true);
                                    dXhr.setRequestHeader('Content-type', 'application/json');
                                    dXhr.onload = function() {
                                        $(document).trigger('ajaxSuccessEvent', ['Note deleted']);
                                        loadNotes();
                                    };
                                    dXhr.send(JSON.stringify({id: noteId}));
                                }
                            });
                        });
                    }
                } catch(e) {
                    showMockNotes();
                }
            }
        };
        xhr.onerror = function() {
            showMockNotes();
        };
        xhr.send();
    };

    function showMockNotes() {
        if(!notesList) return;
        notesList.innerHTML = `
            <div style="background:var(--bg-color); padding:1rem; border-radius:0.75rem; border:1px solid var(--border-color);">
                <h4 style="margin-bottom:0.5rem; color:var(--primary-color);">Project Idea</h4>
                <p style="font-size:0.9rem; white-space:pre-wrap;">Build a habit tracker using JS.</p>
                <small class="text-gray" style="display:block; margin-top:0.5rem; font-size:0.75rem;">Just now</small>
            </div>
        `;
    }

    loadNotes();

    // Listen for note submission
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
                    $(document).trigger('ajaxSuccessEvent', ['Note saved successfully!']);
                    loadNotes();
                } else {
                    document.getElementById('note-error').textContent = res.message;
                }
            } catch(e) {
                document.getElementById('note-error').textContent = 'Error parsing server response';
                loadNotes();
            }
        };
        xhr.onerror = function() {
            const newNote = document.createElement('div');
            newNote.style.cssText = "background:var(--bg-color); padding:1rem; border-radius:0.75rem; border:1px solid var(--border-color);";
            newNote.innerHTML = `
                <h4 style="margin-bottom:0.5rem; color:var(--primary-color);">${data.title}</h4>
                <p style="font-size:0.9rem; white-space:pre-wrap;">${data.content}</p>
                <small class="text-gray" style="display:block; margin-top:0.5rem; font-size:0.75rem;">Just now</small>
            `;
            
            if(notesList.querySelector('.text-gray')) {
                notesList.innerHTML = '';
            }
            notesList.insertBefore(newNote, notesList.firstChild);
            
            document.getElementById('note-title').value = '';
            document.getElementById('note-content').value = '';
            $(document).trigger('ajaxSuccessEvent', ['Note saved locally (Backend offline)']);
        };
        xhr.send(JSON.stringify(data));
    });

    // ----------------------------------------------------
    // HABITS AJAX
    // ----------------------------------------------------
    const habitList = document.querySelector('.habit-list');
    
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
                                                <button class="delete-habit-btn icon-btn" data-id="${habit.id}" style="color: var(--color-red); padding: 5px; opacity: 0.7; transition: 0.3s; margin-left: 10px;">
                                                    <i class="fa-solid fa-trash"></i>
                                                </button>
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
                        } else {
                            output = '<div class="text-gray">No habits created yet.</div>';
                        }
                    } else {
                        output = '<div class="error-msg text-center">' + res.message + '</div>';
                    }
                    if (habitList) {
                        habitList.innerHTML = output;
                        
                        // Attach Delete Listeners
                        document.querySelectorAll('.delete-habit-btn').forEach(btn => {
                            btn.addEventListener('click', function(e) {
                                e.stopPropagation();
                                if (confirm('Are you sure you want to delete this habit?')) {
                                    const habitId = this.getAttribute('data-id');
                                    const dXhr = new XMLHttpRequest();
                                    dXhr.open('DELETE', 'api/habits.php', true);
                                    dXhr.setRequestHeader('Content-type', 'application/json');
                                    dXhr.onload = function() {
                                        const res = JSON.parse(this.responseText);
                                        if (res.status === 'success') {
                                            $(document).trigger('ajaxSuccessEvent', ['Habit deleted']);
                                            loadHabits();
                                        } else {
                                            alert(res.message);
                                        }
                                    };
                                    dXhr.send(JSON.stringify({id: habitId}));
                                }
                            });
                        });
                    }
                } catch(e) {}
            }
        };
        xhr.send();
    };

    if (habitList) loadHabits();

    document.addEventListener('habitFormValidated', (e) => {
        const data = e.detail;
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'api/habits.php', true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onload = function() {
            $(document).trigger('ajaxSuccessEvent', ['Habit created successfully!']);
            loadHabits();
            if (window.refreshProductivityChart) window.refreshProductivityChart();
        };
        xhr.send(JSON.stringify(data));
    });

});
