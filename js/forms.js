// js/forms.js
// ----------------------------------------------------
// Exp 5: Implement client-side form validations using JavaScript
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // Task Form Validation
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskError = document.getElementById('task-error');

    taskForm.addEventListener('submit', (e) => {
        // Prevent default submission to handle via AJAX later, but first validate
        e.preventDefault(); 
        
        let isValid = true;
        taskError.textContent = ''; // Clear previous errors
        taskTitleInput.style.borderColor = 'var(--border-color)';

        const titleValue = taskTitleInput.value.trim();

        if (titleValue === '') {
            taskError.textContent = 'Task title cannot be empty.';
            taskTitleInput.style.borderColor = 'var(--color-red)';
            isValid = false;
        } else if (titleValue.length < 3) {
            taskError.textContent = 'Task title must be at least 3 characters long.';
            taskTitleInput.style.borderColor = 'var(--color-red)';
            isValid = false;
        }

        if (isValid) {
            // Trigger a custom event that ajax_handlers.js will listen to
            const event = new CustomEvent('taskFormValidated', {
                detail: {
                    title: titleValue,
                    priority: document.getElementById('task-priority').value
                }
            });
            document.dispatchEvent(event);
        }
    });

    // Note Form Validation
    const noteForm = document.getElementById('note-form');
    const noteTitle = document.getElementById('note-title');
    const noteContent = document.getElementById('note-content');
    const noteError = document.getElementById('note-error');

    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        noteError.textContent = '';

        if (noteTitle.value.trim() === '') {
            noteError.textContent = 'Note title is required.';
            isValid = false;
        } else if (noteContent.value.trim() === '') {
            noteError.textContent = 'Note content cannot be empty.';
            isValid = false;
        }

        if (isValid) {
             const event = new CustomEvent('noteFormValidated', {
                detail: {
                    title: noteTitle.value.trim(),
                    content: noteContent.value.trim()
                }
            });
            document.dispatchEvent(event);
        }
    });
});
