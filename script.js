
// State management
const state = {
  subjects: [],
  currentSubject: null,
  currentTopic: null,
  currentView: 'topics', // topics, calendar, analytics
  currentDate: new Date()
};

// Cover images for subjects (randomly assigned)
const coverImages = [
  'https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1543286386-713bdd548da4?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1483546416237-76fd26bbcdd1?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1620662736427-b8a198f52a4d?q=80&w=500&auto=format&fit=crop'
];

// XP levels configuration
const xpLevels = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 300 },
  { level: 3, minXp: 300, maxXp: 600 },
  { level: 4, minXp: 600, maxXp: 1000 },
  { level: 5, minXp: 1000, maxXp: 1500 }
];

// Status based on XP
const xpStatus = [
  { name: 'rookie', minXp: 0 },
  { name: 'intermediate', minXp: 200 },
  { name: 'master', minXp: 500 },
  { name: 'expert', minXp: 1000 }
];

// Load data from localStorage
function loadData() {
  const savedData = localStorage.getItem('aiStudyTracker');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    state.subjects = parsedData.subjects || [];
    
    // Add cover images if they don't exist
    state.subjects.forEach(subject => {
      if (!subject.coverImage) {
        subject.coverImage = coverImages[Math.floor(Math.random() * coverImages.length)];
      }
      if (!subject.xp) {
        subject.xp = 0;
      }
      
      // Ensure topics have necessary properties
      subject.topics.forEach(topic => {
        if (!topic.xp) {
          topic.xp = 0;
        }
        if (!topic.type) {
          topic.type = ['study', 'assignment', 'exam', 'practice'][Math.floor(Math.random() * 4)];
        }
        
        // Convert old format to new if necessary
        if (topic.progressData) {
          topic.progressData.forEach(point => {
            if (point.y && !isNaN(point.y) && !point.xp) {
              point.xp = point.y;
              point.type = 'study';
            }
          });
        }
      });
    });
  }
  renderSubjects();
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('aiStudyTracker', JSON.stringify({
    subjects: state.subjects
  }));
}

// DOM Elements
const subjectsList = document.getElementById('subjects-list');
const newSubjectInput = document.getElementById('new-subject-input');
const addSubjectBtn = document.getElementById('add-subject-btn');
const subjectDetail = document.getElementById('subject-detail');
const currentSubjectEl = document.getElementById('current-subject');
const topicsContainer = document.getElementById('topics-container');
const newTopicInput = document.getElementById('new-topic-input');
const addTopicBtn = document.getElementById('add-topic-btn');
const addTopicContainer = document.getElementById('add-topic-container');
const topicDetail = document.getElementById('topic-detail');
const currentTopicEl = document.getElementById('current-topic');
const backToSubjectBtn = document.getElementById('back-to-subject-btn');
const xValueInput = document.getElementById('x-value');
const yValueInput = document.getElementById('y-value');
const progressTypeInput = document.getElementById('progress-type');
const addProgressBtn = document.getElementById('add-progress-btn');
const takeNoteBtn = document.getElementById('take-note-btn');
const noteModal = document.getElementById('note-modal');
const closeNoteModalBtn = document.getElementById('close-note-modal');
const noteTopicNameEl = document.getElementById('note-topic-name');
const noteTextarea = document.getElementById('note-textarea');
const saveNoteBtn = document.getElementById('save-note-btn');
const summarizeNoteBtn = document.getElementById('summarize-note-btn');
const summaryResult = document.getElementById('summary-result');
const summaryContent = document.getElementById('summary-content');
const xpLevelEl = document.getElementById('xp-level');
const welcomeMessageEl = document.getElementById('welcome-message');
const subjectTabsEl = document.getElementById('subject-tabs');
const topicsTabEl = document.getElementById('topics-tab');
const calendarTabEl = document.getElementById('calendar-tab');
const analyticsTabEl = document.getElementById('analytics-tab');
const calendarViewEl = document.getElementById('calendar-view');
const calendarGridEl = document.getElementById('calendar-grid');
const calendarTitleEl = document.getElementById('calendar-title');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');
const todayBtn = document.getElementById('today-btn');
const analyticsViewEl = document.getElementById('analytics-view');

// Set today's date as default for date input
xValueInput.valueAsDate = new Date();

let progressChart = null;
let analyticsChart = null;

// Add new subject
addSubjectBtn.addEventListener('click', () => {
  const subjectName = newSubjectInput.value.trim();
  if (subjectName) {
    const newSubject = {
      id: Date.now().toString(),
      name: subjectName,
      topics: [],
      xp: 0,
      coverImage: coverImages[Math.floor(Math.random() * coverImages.length)]
    };
    state.subjects.push(newSubject);
    saveData();
    renderSubjects();
    newSubjectInput.value = '';
    selectSubject(newSubject.id);
  }
});

newSubjectInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addSubjectBtn.click();
  }
});

// Render subjects list
function renderSubjects() {
  subjectsList.innerHTML = '';
  state.subjects.forEach((subject, index) => {
    const subjectEl = document.createElement('div');
    subjectEl.className = 'subject-item';
    if (state.currentSubject && state.currentSubject.id === subject.id) {
      subjectEl.classList.add('active');
    }
    
    // Assign a color property to the subject if it doesn't have one
    if (!subject.colorIndex) {
      subject.colorIndex = (index % 10) + 1;
    }
    
    // Store the color variable name to use in topic cards
    subject.colorVar = `--subject-color-${subject.colorIndex}`;
    
    const subjectNameEl = document.createElement('span');
    subjectNameEl.textContent = subject.name;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete Subject';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSubject(subject.id);
    });
    
    subjectEl.appendChild(subjectNameEl);
    subjectEl.appendChild(deleteBtn);
    
    subjectEl.addEventListener('click', () => {
      selectSubject(subject.id);
    });
    
    subjectsList.appendChild(subjectEl);
  });
  
  saveData();
}

// Select a subject
function selectSubject(subjectId) {
  state.currentSubject = state.subjects.find(s => s.id === subjectId);
  state.currentTopic = null;
  state.currentView = 'topics';
  
  // Update UI
  renderSubjects();
  currentSubjectEl.textContent = state.currentSubject.name;
  welcomeMessageEl.classList.add('hidden');
  addTopicContainer.classList.remove('hidden');
  topicDetail.classList.add('hidden');
  subjectDetail.classList.remove('hidden');
  subjectTabsEl.classList.remove('hidden');
  xpLevelEl.classList.remove('hidden');
  
  // Set active tab
  topicsTabEl.classList.add('active');
  calendarTabEl.classList.remove('active');
  analyticsTabEl.classList.remove('active');
  topicsContainer.classList.remove('hidden');
  calendarViewEl.classList.add('hidden');
  analyticsViewEl.classList.add('hidden');
  
  updateXpDisplay();
  renderTopics();
}

// Update XP display
function updateXpDisplay() {
  if (!state.currentSubject) return;
  
  const xp = state.currentSubject.xp;
  const badge = xpLevelEl.querySelector('.xp-badge');
  const levelText = xpLevelEl.querySelector('.xp-info div:first-child');
  const progressBar = xpLevelEl.querySelector('.xp-progress-bar');
  
  // Find current level
  const currentLevel = xpLevels.find((level, index) => 
    xp >= level.minXp && (index === xpLevels.length - 1 || xp < xpLevels[index + 1].minXp)
  );
  
  if (currentLevel) {
    badge.textContent = currentLevel.level;
    levelText.textContent = `Level ${currentLevel.level}`;
    
    // Calculate progress percentage to next level
    const progress = (xp - currentLevel.minXp) / (currentLevel.maxXp - currentLevel.minXp) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
}

// Delete subject
function deleteSubject(subjectId) {
  if (confirm('Are you sure you want to delete this subject and all its topics?')) {
    state.subjects = state.subjects.filter(s => s.id !== subjectId);
    if (state.currentSubject && state.currentSubject.id === subjectId) {
      state.currentSubject = null;
      state.currentTopic = null;
      currentSubjectEl.textContent = 'Select a subject';
      addTopicContainer.classList.add('hidden');
      topicsContainer.innerHTML = '';
      xpLevelEl.classList.add('hidden');
      subjectTabsEl.classList.add('hidden');
      welcomeMessageEl.classList.remove('hidden');
    }
    saveData();
    renderSubjects();
  }
}

// Add new topic
addTopicBtn.addEventListener('click', () => {
  const topicName = newTopicInput.value.trim();
  if (topicName && state.currentSubject) {
    const newTopic = {
      id: Date.now().toString(),
      name: topicName,
      type: 'study', // Default type
      xp: 0,
      progressData: [],
      notes: []
    };
    state.currentSubject.topics.push(newTopic);
    saveData();
    renderTopics();
    newTopicInput.value = '';
  }
});

newTopicInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    addTopicBtn.click();
  }
});

// Get XP status based on XP value
function getXpStatus(xp) {
  const status = xpStatus
    .slice()
    .reverse()
    .find(s => xp >= s.minXp);
  
  return status ? status.name : 'rookie';
}

// Render topics
function renderTopics() {
  topicsContainer.innerHTML = '';
  if (!state.currentSubject) return;
  
  // Get the subject's color variable
  const subjectColor = `var(${state.currentSubject.colorVar || '--primary-color'})`;
  
  state.currentSubject.topics.forEach(topic => {
    const topicEl = document.createElement('div');
    topicEl.className = 'topic-card';
    
    // Calculate total XP
    const totalXp = topic.progressData.reduce((sum, point) => sum + (Number(point.xp) || 0), 0);
    topic.xp = totalXp;
    
    // Get status based on XP
    const status = getXpStatus(topic.xp);
    
    const coverImage = coverImages[Math.abs(topic.name.charCodeAt(0) % coverImages.length)];
    
    topicEl.innerHTML = `
      <div class="topic-cover" style="background-image: url('${coverImage}')">
        <div class="topic-badge" style="background-color: ${subjectColor}">${topic.type}</div>
        <div class="topic-controls">
          <button class="delete-topic-btn" data-id="${topic.id}"><i class="fas fa-trash"></i></button>
        </div>
      </div>
      <div class="topic-content">
        <div class="topic-title">${topic.name}</div>
        <div class="topic-type">
          <i class="fas fa-chart-line"></i> XP: ${topic.xp}
          <span class="topic-status ${status}">${status}</span>
        </div>
        <div class="topic-progress">
          <div class="topic-progress-bar" style="width: ${Math.min(topic.xp / 10, 100)}%; background-color: ${subjectColor}"></div>
        </div>
      </div>
    `;
    
    topicEl.addEventListener('click', (e) => {
      if (!e.target.closest('.delete-topic-btn')) {
        selectTopic(topic.id);
      }
    });
    
    topicsContainer.appendChild(topicEl);
  });
  
  // Add event listeners for delete buttons
  document.querySelectorAll('.delete-topic-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTopic(btn.getAttribute('data-id'));
    });
  });
}

// Select a topic
function selectTopic(topicId) {
  if (!state.currentSubject) return;
  
  state.currentTopic = state.currentSubject.topics.find(t => t.id === topicId);
  
  // Update UI
  currentTopicEl.textContent = state.currentTopic.name;
  subjectDetail.classList.add('hidden');
  topicDetail.classList.remove('hidden');
  
  // Set default progress type
  progressTypeInput.value = state.currentTopic.type || 'study';
  
  renderProgressChart();
}

// Delete topic
function deleteTopic(topicId) {
  if (confirm('Are you sure you want to delete this topic and all its progress data?')) {
    if (!state.currentSubject) return;
    
    state.currentSubject.topics = state.currentSubject.topics.filter(t => t.id !== topicId);
    
    if (state.currentTopic && state.currentTopic.id === topicId) {
      state.currentTopic = null;
    }
    
    // Recalculate subject XP
    updateSubjectXp();
    
    saveData();
    renderTopics();
  }
}

// Handle back button
backToSubjectBtn.addEventListener('click', () => {
  topicDetail.classList.add('hidden');
  subjectDetail.classList.remove('hidden');
  state.currentTopic = null;
});

// Add progress data point
addProgressBtn.addEventListener('click', () => {
  const xValue = xValueInput.value;
  const xpValue = parseInt(yValueInput.value, 10);
  const type = progressTypeInput.value;
  
  if (!xValue || isNaN(xpValue) || xpValue < 0) {
    alert('Please enter valid values');
    return;
  }
  
  if (state.currentTopic) {
    // Check if we already have data for this date
    const existingIndex = state.currentTopic.progressData.findIndex(
      item => item.x === xValue
    );
    
    if (existingIndex !== -1) {
      // Update existing entry
      state.currentTopic.progressData[existingIndex].xp = xpValue;
      state.currentTopic.progressData[existingIndex].type = type;
    } else {
      // Add new entry
      state.currentTopic.progressData.push({
        x: xValue,
        xp: xpValue,
        type: type
      });
    }
    
    // Sort by date
    state.currentTopic.progressData.sort((a, b) => new Date(a.x) - new Date(b.x));
    
    // Update total XP for the topic
    const totalXp = state.currentTopic.progressData.reduce((sum, point) => sum + Number(point.xp), 0);
    state.currentTopic.xp = totalXp;
    
    // Update subject total XP
    updateSubjectXp();
    
    saveData();
    renderProgressChart();
    
    // Reset inputs
    xValueInput.valueAsDate = new Date();
    yValueInput.value = '';
  }
});

// Update subject total XP
function updateSubjectXp() {
  if (!state.currentSubject) return;
  
  const totalXp = state.currentSubject.topics.reduce((sum, topic) => sum + (topic.xp || 0), 0);
  state.currentSubject.xp = totalXp;
  
  updateXpDisplay();
}

// Render progress chart
function renderProgressChart() {
  if (!state.currentTopic) return;
  
  const ctx = document.getElementById('progress-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (progressChart) {
    progressChart.destroy();
  }
  
  const data = state.currentTopic.progressData.map(point => ({
    x: new Date(point.x),
    y: point.xp,
    type: point.type
  }));
  
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'XP Points',
        data: data,
        backgroundColor: 'rgba(108, 92, 231, 0.2)',
        borderColor: 'rgba(108, 92, 231, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(108, 92, 231, 1)',
        pointBorderColor: '#fff',
        pointRadius: 5,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            tooltipFormat: 'MMM d, yyyy'
          },
          title: {
            display: true,
            text: 'Date'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#95a5a6'
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'XP Points'
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#95a5a6'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Progress Tracking',
          font: {
            size: 16
          },
          color: '#ecf0f1'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const xp = context.parsed.y;
              const dataPoint = data[context.dataIndex];
              return `${xp} XP (${dataPoint.type})`;
            }
          }
        },
        legend: {
          labels: {
            color: '#ecf0f1'
          }
        }
      }
    }
  });
}

// Render analytics chart
function renderAnalyticsChart() {
  if (!state.currentSubject) return;
  
  const ctx = document.getElementById('analytics-chart').getContext('2d');
  
  // Destroy previous chart if it exists
  if (analyticsChart) {
    analyticsChart.destroy();
  }
  
  // Prepare data for topics
  const labels = state.currentSubject.topics.map(topic => topic.name);
  const xpData = state.currentSubject.topics.map(topic => topic.xp || 0);
  
  analyticsChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total XP by Topic',
        data: xpData,
        backgroundColor: [
          'rgba(52, 152, 219, 0.7)',
          'rgba(155, 89, 182, 0.7)',
          'rgba(46, 204, 113, 0.7)',
          'rgba(230, 126, 34, 0.7)',
          'rgba(231, 76, 60, 0.7)'
        ],
        borderColor: [
          'rgba(52, 152, 219, 1)',
          'rgba(155, 89, 182, 1)',
          'rgba(46, 204, 113, 1)',
          'rgba(230, 126, 34, 1)',
          'rgba(231, 76, 60, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#95a5a6'
          }
        },
        x: {
          grid: {
            color: 'rgba(255, 255, 255, 0.1)'
          },
          ticks: {
            color: '#95a5a6'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'XP Distribution by Topic',
          color: '#ecf0f1'
        },
        legend: {
          labels: {
            color: '#ecf0f1'
          }
        }
      }
    }
  });
}

// Update calendar view
function updateCalendarView() {
  if (!state.currentSubject) return;
  
  const date = new Date(state.currentDate);
  const month = date.getMonth();
  const year = date.getFullYear();
  
  // Update calendar title
  calendarTitleEl.textContent = `${date.toLocaleString('default', { month: 'long' })} ${year}`;
  
  // Clear grid
  calendarGridEl.innerHTML = '';
  
  // Add day headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  dayNames.forEach(day => {
    const dayHeader = document.createElement('div');
    dayHeader.className = 'calendar-day-header';
    dayHeader.textContent = day;
    calendarGridEl.appendChild(dayHeader);
  });
  
  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Create empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day';
    calendarGridEl.appendChild(emptyDay);
  }
  
  // Create calendar days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all topic events for the month
  const monthEvents = [];
  
  state.currentSubject.topics.forEach(topic => {
    topic.progressData.forEach(point => {
      const eventDate = new Date(point.x);
      if (eventDate.getMonth() === month && eventDate.getFullYear() === year) {
        monthEvents.push({
          date: eventDate.getDate(),
          topic: topic.name,
          type: point.type,
          xp: point.xp,
          topicId: topic.id
        });
      }
    });
  });
  
  // Create days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';
    
    const currentDate = new Date(year, month, day);
    if (currentDate.getTime() === today.getTime()) {
      dayEl.classList.add('today');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = day;
    dayEl.appendChild(dayNumber);
    
    // Add events for this day
    const dayEvents = monthEvents.filter(event => event.date === day);
    dayEvents.forEach(event => {
      const eventEl = document.createElement('div');
      eventEl.className = `calendar-event ${event.type}`;
      eventEl.textContent = `${event.topic}: ${event.xp} XP`;
      eventEl.addEventListener('click', () => {
        selectTopic(event.topicId);
      });
      dayEl.appendChild(eventEl);
    });
    
    calendarGridEl.appendChild(dayEl);
  }
}

// Tab navigation
topicsTabEl.addEventListener('click', () => {
  state.currentView = 'topics';
  topicsTabEl.classList.add('active');
  calendarTabEl.classList.remove('active');
  analyticsTabEl.classList.remove('active');
  topicsContainer.classList.remove('hidden');
  calendarViewEl.classList.add('hidden');
  analyticsViewEl.classList.add('hidden');
  renderTopics();
});

calendarTabEl.addEventListener('click', () => {
  state.currentView = 'calendar';
  topicsTabEl.classList.remove('active');
  calendarTabEl.classList.add('active');
  analyticsTabEl.classList.remove('active');
  topicsContainer.classList.add('hidden');
  calendarViewEl.classList.remove('hidden');
  analyticsViewEl.classList.add('hidden');
  updateCalendarView();
});

analyticsTabEl.addEventListener('click', () => {
  state.currentView = 'analytics';
  topicsTabEl.classList.remove('active');
  calendarTabEl.classList.remove('active');
  analyticsTabEl.classList.add('active');
  topicsContainer.classList.add('hidden');
  calendarViewEl.classList.add('hidden');
  analyticsViewEl.classList.remove('hidden');
  renderAnalyticsChart();
});

// Calendar navigation
prevMonthBtn.addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() - 1);
  updateCalendarView();
});

nextMonthBtn.addEventListener('click', () => {
  state.currentDate.setMonth(state.currentDate.getMonth() + 1);
  updateCalendarView();
});

todayBtn.addEventListener('click', () => {
  state.currentDate = new Date();
  updateCalendarView();
});

// Note functionality
takeNoteBtn.addEventListener('click', () => {
  if (state.currentTopic) {
    noteTopicNameEl.textContent = state.currentTopic.name;
    
    // Load existing note if available
    const existingNote = state.currentTopic.notes && state.currentTopic.notes.length > 0 
      ? state.currentTopic.notes[state.currentTopic.notes.length - 1].content 
      : '';
    
    noteTextarea.value = existingNote;
    
    // Hide summary result
    summaryResult.classList.remove('active');
    summaryContent.innerHTML = '';
    
    // Show modal
    noteModal.classList.add('active');
  }
});

closeNoteModalBtn.addEventListener('click', () => {
  noteModal.classList.remove('active');
});

// Close modal when clicking outside content
noteModal.addEventListener('click', (e) => {
  if (e.target === noteModal) {
    noteModal.classList.remove('active');
  }
});

saveNoteBtn.addEventListener('click', () => {
  const noteText = noteTextarea.value.trim();
  
  if (noteText && state.currentTopic) {
    // Initialize notes array if it doesn't exist
    if (!state.currentTopic.notes) {
      state.currentTopic.notes = [];
    }
    
    // Add the note
    state.currentTopic.notes.push({
      id: Date.now().toString(),
      content: noteText,
      date: new Date().toISOString(),
      summary: ''
    });
    
    // Award XP for taking notes (optional feature)
    state.currentTopic.xp += 5;
    updateSubjectXp();
    
    // Save data
    saveData();
    
    // Show feedback
    alert('Note saved successfully!');
  }
});

summarizeNoteBtn.addEventListener('click', () => {
  const noteText = noteTextarea.value.trim();
  
  if (!noteText) {
    alert('Please write some notes first!');
    return;
  }
  
  // Show loading state
  summarizeNoteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Summarizing...';
  summarizeNoteBtn.disabled = true;
  
  // Open a new tab/window with ChatGPT prompt
  const prompt = encodeURIComponent(`Could you please summarize these notes in bullet points highlighting the key concepts and important information:\n\n${noteText}`);
  const chatGptUrl = `https://chat.openai.com/g/g-OF5ZvqQrp-summizer/c/?q=${prompt}`;
  
  // Open ChatGPT in a new tab
  window.open(chatGptUrl, '_blank');
  
  // Reset button state
  setTimeout(() => {
    summarizeNoteBtn.innerHTML = '<i class="fas fa-robot"></i> Summarize with AI';
    summarizeNoteBtn.disabled = false;
  }, 2000);
  
  // Note: In a real implementation, we might use the OpenAI API directly
  // to get a summary and then display it in the modal, but for simplicity,
  // we're redirecting to ChatGPT
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  state.currentDate = new Date();
});
