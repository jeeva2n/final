// DOM Elements
const logForm = document.getElementById('log-form');
const entriesList = document.getElementById('entries-list');
const calendarView = document.getElementById('calendar-view');
const totalHoursEl = document.getElementById('total-hours');
const totalEntriesEl = document.getElementById('total-entries');
const weekHoursEl = document.getElementById('week-hours');
const streakDaysEl = document.getElementById('streak-days');
const searchInput = document.getElementById('search');
const filterSubject = document.getElementById('filter-subject');
const filterCategory = document.getElementById('filter-category');
const filterTime = document.getElementById('filter-time');
const themeToggle = document.getElementById('theme-toggle');
const entryModal = document.getElementById('entry-modal');
const goalModal = document.getElementById('goal-modal');
const timerModal = document.getElementById('timer-modal');
const closeModals = document.querySelectorAll('.close-modal');
const editForm = document.getElementById('edit-form');
const goalForm = document.getElementById('goal-form');
const deleteEntryBtn = document.getElementById('delete-entry');
const deleteGoalBtn = document.getElementById('delete-goal');
const addGoalBtn = document.getElementById('add-goal-btn');
const goalsList = document.getElementById('goals-list');
const listViewBtn = document.getElementById('list-view-btn');
const calendarViewBtn = document.getElementById('calendar-view-btn');
const startTimerBtn = document.getElementById('start-timer-btn');
const timerStartBtn = document.getElementById('timer-start');
const timerPauseBtn = document.getElementById('timer-pause');
const timerResetBtn = document.getElementById('timer-reset');
const timerSaveBtn = document.getElementById('timer-save');
const timerHoursEl = document.getElementById('timer-hours');
const timerMinutesEl = document.getElementById('timer-minutes');
const timerSecondsEl = document.getElementById('timer-seconds');
const timerSubjectEl = document.getElementById('timer-subject');
const timerTopicEl = document.getElementById('timer-topic');
const timerSubjectInput = document.getElementById('timer-subject-input');
const timerTopicInput = document.getElementById('timer-topic-input');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');

// State
let entries = JSON.parse(localStorage.getItem('edulog-entries')) || [];
let goals = JSON.parse(localStorage.getItem('edulog-goals')) || [];
let subjects = new Set();
let darkMode = localStorage.getItem('edulog-dark-mode') === 'true';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let timerInterval = null;
let timerRunning = false;
let timerPaused = false;
let timerSeconds = 0;
let timerStartTime = 0;
let timerElapsedBeforePause = 0;

// Initialize the app
function init() {
    // Set initial theme
    if (darkMode) {
        document.body.classList.add('dark-theme');
        themeToggle.textContent = '☀️';
    }

    // Set today's date as default
    if (document.getElementById('date')) {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('date').value = today;
    }

    // Render entries and update stats
    if (entriesList) {
        updateSubjectFilter();
        renderEntries();
        updateStats();
    }

    // Render goals
    if (goalsList) {
        renderGoals();
    }

    // Mobile menu toggle
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }

    // Event listeners
    if (logForm) logForm.addEventListener('submit', addEntry);
    if (searchInput) searchInput.addEventListener('input', renderEntries);
    if (filterSubject) filterSubject.addEventListener('change', renderEntries);
    if (filterCategory) filterCategory.addEventListener('change', renderEntries);
    if (filterTime) filterTime.addEventListener('change', renderEntries);
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    if (editForm) editForm.addEventListener('submit', saveEditedEntry);
    if (goalForm) goalForm.addEventListener('submit', saveGoal);
    if (deleteEntryBtn) deleteEntryBtn.addEventListener('click', deleteEntry);
    if (deleteGoalBtn) deleteGoalBtn.addEventListener('click', deleteGoal);
    if (addGoalBtn) addGoalBtn.addEventListener('click', openAddGoalModal);
    if (listViewBtn) listViewBtn.addEventListener('click', showListView);
    if (calendarViewBtn) calendarViewBtn.addEventListener('click', showCalendarView);
    if (startTimerBtn) startTimerBtn.addEventListener('click', openTimerModal);
    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);
    if (timerSaveBtn) timerSaveBtn.addEventListener('click', saveTimerSession);
    
    // Close modals
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
            
            // If timer is running when modal is closed, ask if user wants to save
            if (timerRunning && modal === timerModal) {
                if (confirm('Timer is still running. Do you want to save this session?')) {
                    saveTimerSession();
                } else {
                    resetTimer();
                }
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        document.querySelectorAll('.modal').forEach(modal => {
            const modalElement = modal; // Declare modalElement here
            if (e.target === modalElement) {
                modalElement.style.display = 'none';
                
                // If timer is running when modal is closed, ask if user wants to save
                if (timerRunning && modalElement === timerModal) {
                    if (confirm('Timer is still running. Do you want to save this session?')) {
                        saveTimerSession();
                    } else {
                        resetTimer();
                    }
                }
            }
        });
    });

    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                question.classList.toggle('active');
                const answer = question.nextElementSibling;
                answer.classList.toggle('active');
            });
        });
    }

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formSuccess = document.getElementById('form-success');
            contactForm.style.display = 'none';
            formSuccess.classList.remove('hidden');
        });
    }
}

// Add a new entry
function addEntry(e) {
    e.preventDefault();
    
    const newEntry = {
        id: Date.now(),
        subject: document.getElementById('subject').value.trim(),
        topic: document.getElementById('topic').value.trim(),
        date: document.getElementById('date').value,
        duration: parseFloat(document.getElementById('duration').value),
        category: document.getElementById('category').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    entries.unshift(newEntry);
    saveEntries();
    
    // Update UI
    logForm.reset();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.style.backgroundColor = 'var(--success-color)';
    successMsg.style.color = 'white';
    successMsg.style.padding = '0.5rem';
    successMsg.style.borderRadius = '4px';
    successMsg.style.marginTop = '1rem';
    successMsg.textContent = 'Entry added successfully!';
    logForm.appendChild(successMsg);
    
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

// Render entries based on filters
function renderEntries() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const subjectFilter = filterSubject ? filterSubject.value : '';
    const categoryFilter = filterCategory ? filterCategory.value : '';
    const timeFilter = filterTime ? filterTime.value : '';
    
    let filteredEntries = entries;
    
    // Apply subject filter
    if (subjectFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.subject === subjectFilter);
    }
    
    // Apply category filter
    if (categoryFilter) {
        filteredEntries = filteredEntries.filter(entry => entry.category === categoryFilter);
    }
    
    // Apply time filter
    if (timeFilter) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        
        if (timeFilter === 'today') {
            filteredEntries = filteredEntries.filter(entry => 
                new Date(entry.date).toDateString() === today.toDateString()
            );
        } else if (timeFilter === 'week') {
            filteredEntries = filteredEntries.filter(entry => 
                new Date(entry.date) >= startOfWeek
            );
        } else if (timeFilter === 'month') {
            filteredEntries = filteredEntries.filter(entry => 
                new Date(entry.date) >= startOfMonth
            );
        }
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredEntries = filteredEntries.filter(entry => 
            entry.subject.toLowerCase().includes(searchTerm) ||
            entry.topic.toLowerCase().includes(searchTerm) ||
            (entry.notes && entry.notes.toLowerCase().includes(searchTerm))
        );
    }
    
    // Clear entries list
    if (!entriesList) return;
    entriesList.innerHTML = '';
    
    if (filteredEntries.length === 0) {
        entriesList.innerHTML = '<p class="empty-state">No entries found. Try adjusting your filters.</p>';
        return;
    }
    
    // Render each entry
    filteredEntries.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card';
        entryCard.dataset.id = entry.id;
        
        const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        entryCard.innerHTML = `
            <div class="entry-header">
                <span class="entry-subject">${entry.subject}</span>
                <span class="entry-date">${formattedDate}</span>
            </div>
            <div class="entry-topic">${entry.topic}</div>
            <div>
                <span class="entry-duration">${entry.duration} hour${entry.duration !== 1 ? 's' : ''}</span>
                <span class="entry-category">${getCategoryLabel(entry.category || 'study')}</span>
            </div>
            <div class="entry-notes">${entry.notes || 'No notes'}</div>
        `;
        
        entryCard.addEventListener('click', () => openEditModal(entry.id));
        entriesList.appendChild(entryCard);
    });
}

// Get category label
function getCategoryLabel(category) {
    const categories = {
        'study': 'Study',
        'practice': 'Practice',
        'project': 'Project',
        'review': 'Review',
        'other': 'Other'
    };
    
    return categories[category] || category;
}

// Update statistics
function updateStats() {
    if (!totalEntriesEl || !totalHoursEl || !weekHoursEl || !streakDaysEl) return;
    
    // Total entries
    totalEntriesEl.textContent = entries.length;
    
    // Total hours
    const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0);
    totalHoursEl.textContent = totalHours.toFixed(1);
    
    // This week's hours
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekHours = entries
        .filter(entry => new Date(entry.date) >= startOfWeek)
        .reduce((sum, entry) => sum + entry.duration, 0);
    
    weekHoursEl.textContent = weekHours.toFixed(1);
    
    // Calculate streak
    calculateStreak();
}

// Calculate learning streak
function calculateStreak() {
    if (entries.length === 0 || !streakDaysEl) {
        if (streakDaysEl) streakDaysEl.textContent = '0 days';
        return;
    }
    
    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's an entry for today
    const hasEntryToday = sortedEntries.some(entry => 
        new Date(entry.date).toDateString() === today.toDateString()
    );
    
    // If no entry today, start checking from yesterday
    let currentDate = new Date(today);
    if (!hasEntryToday) {
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    let streak = 0;
    let checking = true;
    
    while (checking) {
        // Check if there's an entry for the current date
        const hasEntry = sortedEntries.some(entry => 
            new Date(entry.date).toDateString() === currentDate.toDateString()
        );
        
        if (hasEntry) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            checking = false;
        }
    }
    
    streakDaysEl.textContent = `${streak} day${streak !== 1 ? 's' : ''}`;
}

// Update subject filter dropdown
function updateSubjectFilter() {
    if (!filterSubject) return;
    
    // Clear existing options except the first one
    while (filterSubject.options.length > 1) {
        filterSubject.remove(1);
    }
    
    // Get unique subjects
    subjects = new Set(entries.map(entry => entry.subject));
    
    // Add subject options
    subjects.forEach(subject => {
        const option = document.createElement('option');
        option.value = subject;
        option.textContent = subject;
        filterSubject.appendChild(option);
    });
}

// Open edit modal
function openEditModal(id) {
    const entry = entries.find(entry => entry.id === parseInt(id));
    if (!entry) return;
    
    document.getElementById('edit-id').value = entry.id;
    document.getElementById('edit-subject').value = entry.subject;
    document.getElementById('edit-topic').value = entry.topic;
    document.getElementById('edit-date').value = entry.date;
    document.getElementById('edit-duration').value = entry.duration;
    document.getElementById('edit-category').value = entry.category || 'study';
    document.getElementById('edit-notes').value = entry.notes || '';
    
    entryModal.style.display = 'block';
}

// Save edited entry
function saveEditedEntry(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById('edit-id').value);
    const entryIndex = entries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) return;
    
    entries[entryIndex] = {
        id,
        subject: document.getElementById('edit-subject').value.trim(),
        topic: document.getElementById('edit-topic').value.trim(),
        date: document.getElementById('edit-date').value,
        duration: parseFloat(document.getElementById('edit-duration').value),
        category: document.getElementById('edit-category').value,
        notes: document.getElementById('edit-notes').value.trim()
    };
    
    saveEntries();
    entryModal.style.display = 'none';
}

// Delete entry
function deleteEntry() {
    const id = parseInt(document.getElementById('edit-id').value);
    
    if (confirm('Are you sure you want to delete this entry?')) {
        entries = entries.filter(entry => entry.id !== id);
        saveEntries();
        entryModal.style.display = 'none';
    }
}

// Open add goal modal
function openAddGoalModal() {
    document.getElementById('goal-id').value = '';
    document.getElementById('goal-title').value = '';
    document.getElementById('goal-description').value = '';
    document.getElementById('goal-target-hours').value = '';
    document.getElementById('goal-deadline').value = '';
    document.getElementById('goal-subject').value = '';
    
    deleteGoalBtn.classList.add('hidden');
    
    goalModal.style.display = 'block';
}

// Open edit goal modal
function openEditGoalModal(id) {
    const goal = goals.find(goal => goal.id === parseInt(id));
    if (!goal) return;
    
    document.getElementById('goal-id').value = goal.id;
    document.getElementById('goal-title').value = goal.title;
    document.getElementById('goal-description').value = goal.description || '';
    document.getElementById('goal-target-hours').value = goal.targetHours;
    document.getElementById('goal-deadline').value = goal.deadline || '';
    document.getElementById('goal-subject').value = goal.subject || '';
    
    deleteGoalBtn.classList.remove('hidden');
    
    goalModal.style.display = 'block';
}

// Save goal
function saveGoal(e) {
    e.preventDefault();
    
    const goalId = document.getElementById('goal-id').value;
    const isNewGoal = !goalId;
    
    const goal = {
        id: isNewGoal ? Date.now() : parseInt(goalId),
        title: document.getElementById('goal-title').value.trim(),
        description: document.getElementById('goal-description').value.trim(),
        targetHours: parseFloat(document.getElementById('goal-target-hours').value),
        deadline: document.getElementById('goal-deadline').value,
        subject: document.getElementById('goal-subject').value.trim(),
        completedHours: isNewGoal ? 0 : (goals.find(g => g.id === parseInt(goalId))?.completedHours || 0)
    };
    
    if (isNewGoal) {
        goals.unshift(goal);
    } else {
        const goalIndex = goals.findIndex(g => g.id === goal.id);
        if (goalIndex !== -1) {
            goals[goalIndex] = goal;
        }
    }
    
    saveGoals();
    goalModal.style.display = 'none';
}

// Delete goal
function deleteGoal() {
    const id = parseInt(document.getElementById('goal-id').value);
    
    if (confirm('Are you sure you want to delete this goal?')) {
        goals = goals.filter(goal => goal.id !== id);
        saveGoals();
        goalModal.style.display = 'none';
    }
}

// Render goals
function renderGoals() {
    if (!goalsList) return;
    
    goalsList.innerHTML = '';
    
    if (goals.length === 0) {
        goalsList.innerHTML = '<p class="empty-state">No goals set. Add your first learning goal!</p>';
        return;
    }
    
    goals.forEach(goal => {
        const progress = Math.min(Math.round((goal.completedHours / goal.targetHours) * 100), 100);
        
        const goalCard = document.createElement('div');
        goalCard.className = 'goal-card';
        goalCard.dataset.id = goal.id;
        
        let deadlineText = '';
        if (goal.deadline) {
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0) {
                deadlineText = `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`;
            } else if (daysLeft === 0) {
                deadlineText = 'Due today';
            } else {
                deadlineText = `${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''} overdue`;
            }
        }
        
        goalCard.innerHTML = `
            <div class="goal-header">
                <div class="goal-title">${goal.title}</div>
                ${goal.subject ? `<span class="goal-subject">${goal.subject}</span>` : ''}
            </div>
            <div class="goal-description">${goal.description || ''}</div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="goal-stats">
                    <span>${goal.completedHours} / ${goal.targetHours} hours</span>
                    <span>${progress}% complete</span>
                </div>
            </div>
            ${deadlineText ? `<div class="goal-deadline">${deadlineText}</div>` : ''}
        `;
        
        goalCard.addEventListener('click', () => openEditGoalModal(goal.id));
        goalsList.appendChild(goalCard);
    });
}

// Show list view
function showListView() {
    if (!listViewBtn || !calendarViewBtn || !entriesList || !calendarView) return;
    
    listViewBtn.classList.add('active');
    calendarViewBtn.classList.remove('active');
    entriesList.classList.remove('hidden');
    calendarView.classList.add('hidden');
}

// Show calendar view
function showCalendarView() {
    if (!listViewBtn || !calendarViewBtn || !entriesList || !calendarView) return;
    
    calendarViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
    calendarView.classList.remove('hidden');
    entriesList.classList.add('hidden');
    
    renderCalendar();
}

// Render calendar
function renderCalendar() {
    if (!calendarView) return;
    
    const date = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    
    let calendarHTML = `
        <div class="calendar-header">
            <h3>${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
            <div class="calendar-nav">
                <button id="prev-month" class="btn-outline">Previous</button>
                <button id="next-month" class="btn-outline">Next</button>
            </div>
        </div>
        <div class="calendar-grid">
    `;
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        calendarHTML += `<div class="calendar-day">${day}</div>`;
    });
    
    // Get the first day of the month
    const firstDayOfMonth = date.getDay();
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarHTML += `<div class="calendar-date empty"></div>`;
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(currentYear, currentMonth, day);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // Check if there are entries for this date
        const hasEntries = entries.some(entry => entry.date === dateString);
        
        // Check if this is today
        const isToday = currentDate.toDateString() === new Date().toDateString();
        
        calendarHTML += `
            <div class="calendar-date ${hasEntries ? 'has-entries' : ''} ${isToday ? 'today' : ''}" data-date="${dateString}">
                ${day}
            </div>
        `;
    }
    
    calendarHTML += `</div>`;
    
    calendarView.innerHTML = calendarHTML;
    
    // Add event listeners for calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    document.getElementById('next-month').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Add event listeners for calendar dates
    document.querySelectorAll('.calendar-date:not(.empty)').forEach(dateEl => {
        dateEl.addEventListener('click', () => {
            const dateString = dateEl.dataset.date;
            
            // Filter entries for this date
            if (filterTime) filterTime.value = '';
            if (searchInput) searchInput.value = '';
            if (filterSubject) filterSubject.value = '';
            if (filterCategory) filterCategory.value = '';
            
            // Show entries for this date
            showListView();
            
            // Filter entries manually
            const dateEntries = entries.filter(entry => entry.date === dateString);
            
            entriesList.innerHTML = '';
            
            if (dateEntries.length === 0) {
                entriesList.innerHTML = '<p class="empty-state">No entries for this date.</p>';
                return;
            }
            
            dateEntries.forEach(entry => {
                const entryCard = document.createElement('div');
                entryCard.className = 'entry-card';
                entryCard.dataset.id = entry.id;
                
                const formattedDate = new Date(entry.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
                entryCard.innerHTML = `
                    <div class="entry-header">
                        <span class="entry-subject">${entry.subject}</span>
                        <span class="entry-date">${formattedDate}</span>
                    </div>
                    <div class="entry-topic">${entry.topic}</div>
                    <div>
                        <span class="entry-duration">${entry.duration} hour${entry.duration !== 1 ? 's' : ''}</span>
                        <span class="entry-category">${getCategoryLabel(entry.category || 'study')}</span>
                    </div>
                    <div class="entry-notes">${entry.notes || 'No notes'}</div>
                `;
                
                entryCard.addEventListener('click', () => openEditModal(entry.id));
                entriesList.appendChild(entryCard);
            });
        });
    });
}

// Open timer modal
function openTimerModal() {
    resetTimer();
    timerModal.style.display = 'block';
}

// Start timer
function startTimer() {
    if (timerRunning && !timerPaused) return;
    
    timerRunning = true;
    timerPaused = false;
    timerStartBtn.disabled = true;
    timerPauseBtn.disabled = false;
    timerResetBtn.disabled = false;
    
    if (timerElapsedBeforePause === 0) {
        timerStartTime = Date.now();
    } else {
        timerStartTime = Date.now() - timerElapsedBeforePause;
    }
    
    timerInterval = setInterval(updateTimer, 1000);
    updateTimer();
}

// Update timer display
function updateTimer() {
    const elapsedTime = timerPaused ? timerElapsedBeforePause : Date.now() - timerStartTime;
    timerSeconds = Math.floor(elapsedTime / 1000);
    
    const hours = Math.floor(timerSeconds / 3600);
    const minutes = Math.floor((timerSeconds % 3600) / 60);
    const seconds = timerSeconds % 60;
    
    timerHoursEl.textContent = hours.toString().padStart(2, '0');
    timerMinutesEl.textContent = minutes.toString().padStart(2, '0');
    timerSecondsEl.textContent = seconds.toString().padStart(2, '0');
    
    // Update subject and topic if set
    if (timerSubjectInput.value) {
        timerSubjectEl.textContent = timerSubjectInput.value;
    }
    
    if (timerTopicInput.value) {
        timerTopicEl.textContent = timerTopicInput.value;
    }
}

// Pause timer
function pauseTimer() {
    if (!timerRunning || timerPaused) return;
    
    clearInterval(timerInterval);
    timerPaused = true;
    timerElapsedBeforePause = Date.now() - timerStartTime;
    
    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;
    timerPauseBtn.textContent = 'Resume';
}

// Reset timer
function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerPaused = false;
    timerSeconds = 0;
    timerElapsedBeforePause = 0;
    
    timerHoursEl.textContent = '00';
    timerMinutesEl.textContent = '00';
    timerSecondsEl.textContent = '00';
    
    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;
    timerResetBtn.disabled = true;
    timerPauseBtn.textContent = 'Pause';
    
    // Reset subject and topic
    timerSubjectEl.textContent = 'Not set';
    timerTopicEl.textContent = 'Not set';
}

// Save timer session
function saveTimerSession() {
    if (timerSeconds < 60) {
        alert('Session must be at least 1 minute to save.');
        return;
    }
    
    const subject = timerSubjectInput.value.trim();
    const topic = timerTopicInput.value.trim();
    
    if (!subject || !topic) {
        alert('Please enter a subject and topic for this session.');
        return;
    }
    
    // Convert seconds to hours
    const hours = timerSeconds / 3600;
    
    const newEntry = {
        id: Date.now(),
        subject: subject,
        topic: topic,
        date: new Date().toISOString().split('T')[0],
        duration: parseFloat(hours.toFixed(2)),
        category: 'study',
        notes: `Timed study session: ${timerHoursEl.textContent}:${timerMinutesEl.textContent}:${timerSecondsEl.textContent}`
    };
    
    entries.unshift(newEntry);
    saveEntries();
    
    // Update goals if the subject matches
    updateGoalProgress(subject, hours);
    
    // Reset timer and close modal
    resetTimer();
    timerModal.style.display = 'none';
    
    // Show success message
    alert('Study session saved successfully!');
}

// Update goal progress
function updateGoalProgress(subject, hours) {
    let updated = false;
    
    goals.forEach(goal => {
        if (goal.subject.toLowerCase() === subject.toLowerCase()) {
            goal.completedHours += hours;
            updated = true;
        }
    });
    
    if (updated) {
        saveGoals();
    }
}

// Toggle dark/light theme
function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-theme', darkMode);
    themeToggle.textContent = darkMode ? '☀️' : '🌙';
    localStorage.setItem('edulog-dark-mode', darkMode);
}

// Save entries to localStorage
function saveEntries() {
    localStorage.setItem('edulog-entries', JSON.stringify(entries));
    updateSubjectFilter();
    renderEntries();
    updateStats();
}

// Save goals to localStorage
function saveGoals() {
    localStorage.setItem('edulog-goals', JSON.stringify(goals));
    renderGoals();
}

// Create a common.js file for shared functionality across pages
function createCommonJS() {
    const commonJS = `
// Common functionality for all pages
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const darkMode = localStorage.getItem('edulog-dark-mode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-theme');
            themeToggle.textContent = '☀️';
        }
        
        themeToggle.addEventListener('click', function() {
            const isDarkMode = document.body.classList.toggle('dark-theme');
            themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
            localStorage.setItem('edulog-dark-mode', isDarkMode);
        });
    }
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    
    // FAQ functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                question.classList.toggle('active');
                const answer = question.nextElementSibling;
                answer.classList.toggle('active');
            });
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formSuccess = document.getElementById('form-success');
            contactForm.style.display = 'none';
            formSuccess.classList.remove('hidden');
        });
    }
});
    `;
    
    return commonJS;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);