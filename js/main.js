// js/main.js
document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------
    // Greeting & Personalization
    // ----------------------------------------------------
    const greetingText = document.getElementById('dynamic-greeting');
    const savedUser = localStorage.getItem('dashflow_user');
    
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    if (savedUser) {
        const name = savedUser.charAt(0).toUpperCase() + savedUser.slice(1);
        greetingText.textContent = `${greeting}, ${name}.`;
    } else {
        greetingText.textContent = `${greeting}.`;
    }

    const profileImg = document.getElementById('profile-picture');
    if (profileImg) {
        profileImg.src = `https://ui-avatars.com/api/?name=${savedUser || 'User'}&background=4f46e5&color=fff&bold=true`;
    }

    // Fetch Daily Quote
    const fetchQuote = async () => {
        try {
            const response = await fetch('https://dummyjson.com/quotes/random');
            if (response.ok) {
                const data = await response.json();
                document.getElementById('daily-quote').textContent = `"${data.quote}"`;
                document.getElementById('quote-author').textContent = `- ${data.author}`;
            } else {
                throw new Error('Fallback');
            }
        } catch (e) {
            document.getElementById('daily-quote').textContent = `"The secret of getting ahead is getting started."`;
            document.getElementById('quote-author').textContent = `- Mark Twain`;
        }
    };
    fetchQuote();

    // ----------------------------------------------------
    // Weather API (Exp 8)
    // ----------------------------------------------------
    const fetchWeather = async () => {
        const weatherContainer = document.getElementById('weather-content');
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=19.0760&longitude=72.8777&current_weather=true');
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            const temp = data.current_weather.temperature;
            const wind = data.current_weather.windspeed;
            
            weatherContainer.innerHTML = `
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">Wind: ${wind} km/h</div>
                <div class="weather-desc" style="margin-top:1rem;">Location: Mumbai (Live Data)</div>
            `;
        } catch (error) {
            weatherContainer.innerHTML = `<div class="error-msg">Failed to load weather.</div>`;
        }
    };
    fetchWeather();

    // ----------------------------------------------------
    // Theme Toggle
    // ----------------------------------------------------
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn.addEventListener('click', () => {
        const html = document.documentElement;
        const isDark = html.getAttribute('data-theme') === 'dark';
        html.setAttribute('data-theme', isDark ? 'light' : 'dark');
        
        const icon = themeBtn.querySelector('i');
        const span = themeBtn.querySelector('span');
        if (isDark) {
            icon.className = 'fa-solid fa-sun';
            span.textContent = 'Light Mode';
        } else {
            icon.className = 'fa-solid fa-moon';
            span.textContent = 'Dark Mode';
        }
        
        // Update Chart colors if it exists
        if(window.productivityChart) {
            window.productivityChart.options.scales.x.grid.color = isDark ? '#e5e7eb' : '#1f2937';
            window.productivityChart.options.scales.y.grid.color = isDark ? '#e5e7eb' : '#1f2937';
            window.productivityChart.update();
        }
    });

    // ----------------------------------------------------
    // Notification Sound
    // ----------------------------------------------------
    const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    notificationSound.volume = 0.7;

    // ----------------------------------------------------
    // Focus Timer Logic
    // ----------------------------------------------------
    let timerInterval;
    let timerDuration = 25 * 60;
    let timeLeft = timerDuration;
    let isRunning = false;
    const timeDisplay = document.getElementById('time-display');
    const startBtn = document.getElementById('start-timer');
    const resetBtn = document.getElementById('reset-timer');
    const timerWidget = document.querySelector('.timer-widget');
    const timerInput = document.getElementById('timer-input');

    if (timerInput) {
        timerInput.addEventListener('change', () => {
            if (!isRunning) {
                let val = parseInt(timerInput.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > 120) val = 120;
                timerInput.value = val;
                timerDuration = val * 60;
                timeLeft = timerDuration;
                updateDisplay();
            }
        });
    }

    const updateDisplay = () => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    startBtn.addEventListener('click', () => {
        if (isRunning) {
            clearInterval(timerInterval);
            startBtn.textContent = 'Start Focus';
            timerWidget.classList.remove('timer-active');
            if (timerInput) timerInput.disabled = false;
        } else {
            if (timerInput) timerInput.disabled = true;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    notificationSound.play().catch(e => console.log("Audio play failed:", e));
                    alert("Focus session complete!");
                    timerWidget.classList.remove('timer-active');
                    if (timerInput) timerInput.disabled = false;
                }
            }, 1000);
            startBtn.textContent = 'Pause';
            timerWidget.classList.add('timer-active');
        }
        isRunning = !isRunning;
    });

    resetBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timeLeft = timerDuration;
        isRunning = false;
        startBtn.textContent = 'Start Focus';
        timerWidget.classList.remove('timer-active');
        if (timerInput) timerInput.disabled = false;
        updateDisplay();
    });

    // ----------------------------------------------------
    // V3: Chart.js Productivity Graph — driven by real habit streak data
    // ----------------------------------------------------
    const ctx = document.getElementById('productivityChart');
    if (ctx) {
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.5)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

        window.productivityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Day Streak',
                    data: [],
                    borderColor: '#4f46e5',
                    backgroundColor: gradient,
                    borderWidth: 2,
                    borderRadius: 8,
                    hoverBackgroundColor: 'rgba(79, 70, 229, 0.8)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#111827',
                        padding: 12,
                        callbacks: {
                            label: ctx => ` ${ctx.parsed.y} day streak`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(156, 163, 175, 0.1)' },
                        ticks: { stepSize: 1, precision: 0 }
                    },
                    x: { grid: { display: false } }
                }
            }
        });

        // Function to refresh chart from API — called on load and after habit changes
        window.refreshProductivityChart = function() {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', 'api/habits.php', true);
            xhr.onload = function() {
                try {
                    const res = JSON.parse(this.responseText);
                    if (res.status === 'success') {
                        const habits = res.data;
                        const labels = habits.map(h => h.title.length > 12 ? h.title.slice(0, 12) + '…' : h.title);
                        const data   = habits.map(h => parseInt(h.streak) || 0);
                        window.productivityChart.data.labels = labels;
                        window.productivityChart.data.datasets[0].data = data;
                        window.productivityChart.update();
                    }
                } catch(e) {}
            };
            xhr.send();
        };

        window.refreshProductivityChart();
    }

    // ----------------------------------------------------
    // V3: Reminder Engine Logic
    // ----------------------------------------------------
    let reminders = []; // Array of { time: 'HH:MM', msg: '...' }
    
    const reminderForm = document.getElementById('reminder-form');
    const toast = document.getElementById('reminder-toast');
    const activeRemindersContainer = document.getElementById('active-reminders');

    if(reminderForm) {
        reminderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = document.getElementById('reminder-msg').value;
            const time = document.getElementById('reminder-time').value;
            
            reminders.push({ time, msg, shown: false });
            
            // Visual update
            document.getElementById('reminder-msg').value = '';
            document.getElementById('reminder-time').value = '';
            
            updateActiveRemindersList();
            
            // Notification badge update
            const badge = document.getElementById('notif-badge');
            badge.textContent = parseInt(badge.textContent) + 1;
        });
    }

    function updateActiveRemindersList() {
        if(reminders.length === 0) {
            activeRemindersContainer.innerHTML = 'No active reminders today.';
            return;
        }
        
        let html = '<ul style="list-style:none; padding:0; margin:0;">';
        reminders.forEach(r => {
            if(!r.shown) html += `<li style="margin-bottom:0.25rem;"><i class="fa-regular fa-bell"></i> ${r.time} - ${r.msg}</li>`;
        });
        html += '</ul>';
        activeRemindersContainer.innerHTML = html;
    }

    // Checking Engine runs every 10 seconds
    setInterval(() => {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        reminders.forEach(reminder => {
            if (reminder.time === currentTime && !reminder.shown) {
                showToast(reminder.msg);
                reminder.shown = true;
                updateActiveRemindersList();
            }
        });
    }, 10000);

    function showToast(msg) {
        notificationSound.play().catch(e => console.log("Audio play failed:", e));
        document.getElementById('toast-msg').textContent = msg;
        toast.classList.add('show');
        
        // Auto hide after 8 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 8000);
    }

    // Close toast button
    const closeToastBtn = document.querySelector('.toast-close');
    if(closeToastBtn) {
        closeToastBtn.addEventListener('click', () => {
            toast.classList.remove('show');
        });
    }

    // ----------------------------------------------------
    // Handle Habit UI Interactions
    // ----------------------------------------------------
    const habitList = document.querySelector('.habit-list');
    const addHabitBtn = document.getElementById('add-habit-btn');

    // Use EVENT DELEGATION on the stable parent element so it works
    // for habits loaded dynamically via AJAX (the old approach attached
    // to zero elements because AJAX hadn't finished yet).
    if (habitList) {
        habitList.addEventListener('click', function(e) {
            const box = e.target.closest('.day-box');
            if (!box) return;

            const wasChecked = box.classList.contains('checked');
            box.classList.toggle('checked');
            const action = wasChecked ? 'decrement' : 'increment';

            const habitItem = box.closest('.habit-item');
            if (!habitItem) return;
            const habitId = habitItem.getAttribute('data-id');
            if (!habitId) return;
            const streakLabel = habitItem.querySelector('.streak');

            const xhr = new XMLHttpRequest();
            xhr.open('PUT', 'api/habits.php', true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.onload = function() {
                try {
                    const res = JSON.parse(this.responseText);
                    if (res.status === 'success' && streakLabel) {
                        streakLabel.innerHTML = `<i class="fa-solid fa-fire" style="color: var(--color-orange);"></i> ${res.streak} Day Streak`;
                        // Refresh productivity chart to reflect new streak
                        if (window.refreshProductivityChart) window.refreshProductivityChart();
                    }
                } catch(e) {}
            };
            xhr.send(JSON.stringify({ id: habitId, action: action }));
        });
    }

    // Add New Habit via Modal
    const habitModal = document.getElementById('habit-modal');
    const closeHabitModalBtn = document.getElementById('close-habit-modal');
    const saveHabitBtn = document.getElementById('save-habit-btn');
    const habitInput = document.getElementById('habit-input-name');

    if(addHabitBtn && habitList && habitModal) {
        addHabitBtn.addEventListener('click', () => {
            habitInput.value = '';
            habitModal.classList.remove('hidden');
            setTimeout(() => habitInput.focus(), 300); // Focus after transition
        });

        closeHabitModalBtn.addEventListener('click', () => {
             habitModal.classList.add('hidden');
        });

        saveHabitBtn.addEventListener('click', () => {
            const habitName = habitInput.value;
            if(habitName && habitName.trim() !== '') {
                const event = new CustomEvent('habitFormValidated', {
                    detail: { title: habitName.trim() }
                });
                document.dispatchEvent(event);
                habitModal.classList.add('hidden');
            }
        });
    }

    // ----------------------------------------------------
    // Dynamic Chart Updates (Listens for Task completions)
    // ----------------------------------------------------
    $(document).on('ajaxSuccessEvent', function(event, message) {
        if(window.productivityChart && message === 'Task marked complete') {
            // Increment the last day (Sunday/Today) by 1 visually
            const dataArray = window.productivityChart.data.datasets[0].data;
            dataArray[dataArray.length - 1] += 1;
            window.productivityChart.update();
        } else if (window.productivityChart && message === 'Task unmarked') {
            const dataArray = window.productivityChart.data.datasets[0].data;
            if(dataArray[dataArray.length - 1] > 0) {
                dataArray[dataArray.length - 1] -= 1;
                window.productivityChart.update();
            }
        }
    });

});
