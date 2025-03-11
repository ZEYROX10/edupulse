
// State management
const state = {
  subjects: [],
  currentSubject: null,
  currentTopic: null,
};

// Load data from localStorage
function loadData() {
  const savedData = localStorage.getItem('aiStudyTracker');
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    state.subjects = parsedData.subjects || [];
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
const addProgressBtn = document.getElementById('add-progress-btn');

// Set today's date as default for date input
xValueInput.valueAsDate = new Date();

let progressChart = null;

// Add new subject
addSubjectBtn.addEventListener('click', () => {
  const subjectName = newSubjectInput.value.trim();
  if (subjectName) {
    const newSubject = {
      id: Date.now().toString(),
      name: subjectName,
      topics: []
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
  state.subjects.forEach(subject => {
    const subjectEl = document.createElement('div');
    subjectEl.className = 'subject-item';
    if (state.currentSubject && state.currentSubject.id === subject.id) {
      subjectEl.classList.add('active');
    }
    
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
}

// Select a subject
function selectSubject(subjectId) {
  state.currentSubject = state.subjects.find(s => s.id === subjectId);
  state.currentTopic = null;
  
  // Update UI
  renderSubjects();
  currentSubjectEl.textContent = state.currentSubject.name;
  addTopicContainer.classList.remove('hidden');
  topicDetail.classList.add('hidden');
  subjectDetail.classList.remove('hidden');
  
  renderTopics();
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
      progressData: []
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

// Render topics
function renderTopics() {
  topicsContainer.innerHTML = '';
  if (!state.currentSubject) return;
  
  state.currentSubject.topics.forEach(topic => {
    const topicEl = document.createElement('div');
    topicEl.className = 'topic-card';
    
    const topicNameEl = document.createElement('span');
    topicNameEl.textContent = topic.name;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete Topic';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteTopic(topic.id);
    });
    
    topicEl.appendChild(topicNameEl);
    topicEl.appendChild(deleteBtn);
    
    topicEl.addEventListener('click', () => {
      selectTopic(topic.id);
    });
    
    topicsContainer.appendChild(topicEl);
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
  const yValue = parseFloat(yValueInput.value);
  
  if (!xValue || isNaN(yValue) || yValue < 0) {
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
      state.currentTopic.progressData[existingIndex].y = yValue;
    } else {
      // Add new entry
      state.currentTopic.progressData.push({
        x: xValue,
        y: yValue
      });
    }
    
    // Sort by date
    state.currentTopic.progressData.sort((a, b) => new Date(a.x) - new Date(b.x));
    
    saveData();
    renderProgressChart();
    
    // Reset inputs
    xValueInput.valueAsDate = new Date();
    yValueInput.value = '';
  }
});

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
    y: point.y
  }));
  
  progressChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: 'Study Hours',
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
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Hours'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Study Progress',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const hours = context.parsed.y;
              return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
            }
          }
        }
      }
    }
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadData();
});
