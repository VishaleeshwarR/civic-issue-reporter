// Firebase Configuration (Demo - replace with actual config)
const firebaseConfig = {
  apiKey: "AIzaSyA_x4--QjSHO8ogt2m4MsQZInf2UyeFKwo",
  authDomain: "jan-drishti-40fdb.firebaseapp.com",
  databaseURL: "https://jan-drishti-40fdb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "jan-drishti-40fdb",
  storageBucket: "jan-drishti-40fdb.firebasestorage.app",
  messagingSenderId: "434086339486",
  appId: "1:434086339486:web:0161cfe5f62e414b946c8f",
  measurementId: "G-T7CZ7SK93S"
};

// Global State Management
const AppState = {
  currentUser: null,
  currentView: 'dashboard-view',
  currentStep: 1,
  reportData: {},
  isRecording: false,
  recordingStartTime: null,
  mediaRecorder: null,
  recordedBlob: null,
  theme: 'light',
  language: 'en',
  isAdmin: false,   
  imageUrl: null,
  audioUrl: null
};

// Mock Data (from provided JSON)
const MockData = {
  users: [
    {
      id: "user1",
      name: "Rahul Sharma", 
      aadhaar: "1234-5678-9012",
      phone: "+91-9876543210",
      address: "123 MG Road, Bangalore, Karnataka 560001",
      area: "MG Road"
    }
  ],
  issues: [
    {
      id: "issue1",
      title: "Large Pothole on Main Street", 
      description: "Deep pothole causing vehicle damage",
      category: "Road Infrastructure",
      status: "In Progress",
      priority: "High",
      location: "MG Road, Near Coffee Day",
      coordinates: {lat: 12.9716, lng: 77.5946},
      submittedBy: "user1",
      assignedTo: "Public Works Dept",
      submittedDate: "2024-11-10",
      votes: 23,
      hasUserVoted: false,
      images: ["pothole-image.jpg"],
      voiceNote: "Large pothole near Coffee Day outlet, multiple vehicles getting damaged",
      comments: [
        {user: "citizen2", text: "I also damaged my bike here yesterday", date: "2024-11-11"}
      ]
    },
    {
      id: "issue2", 
      title: "Street Light Not Working",
      description: "Street light has been non-functional for a week",
      category: "Street Lighting",
      status: "Reported", 
      priority: "Medium",
      location: "Park Street, Sector 5",
      coordinates: {lat: 12.9716, lng: 77.5946},
      submittedBy: "user2",
      assignedTo: "Electricity Board",
      submittedDate: "2024-11-12",
      votes: 8,
      hasUserVoted: true,
      images: ["street-light.jpg"],
      voiceNote: "यह स्ट्रीट लाइट एक हफ्ते से काम नहीं कर रही है",
      comments: []
    },
    {
      id: "issue3",
      title: "Garbage Overflow",
      description: "Garbage bin overflowing, creating hygiene issues", 
      category: "Waste Management",
      status: "Resolved",
      priority: "High",
      location: "Market Street",
      coordinates: {lat: 12.9716, lng: 77.5946},
      submittedBy: "user1",
      assignedTo: "Sanitation Dept",
      submittedDate: "2024-11-05",
      resolvedDate: "2024-11-08", 
      votes: 15,
      hasUserVoted: true,
      images: ["garbage-bin.jpg"],
      voiceNote: "Garbage is overflowing and attracting stray dogs",
      comments: [
        {user: "admin", text: "Issue resolved, additional bin installed", date: "2024-11-08"}
      ]
    }
  ],
  communityDrives: [
    {
      id: "drive1",
      title: "Clean Streets Initiative",
      description: "Community cleanup drive this Sunday",
      date: "2024-11-17",
      participants: 45,
      location: "City Park"
    },
    {
      id: "drive2", 
      title: "Tree Plantation Drive",
      description: "Plant 100 trees in residential areas",
      date: "2024-11-20", 
      participants: 67,
      location: "Various Locations"
    }
  ],
  analytics: {
    totalIssues: 156,
    resolvedIssues: 98,
    activeUsers: 1240,
    averageResolutionTime: 8.5,
    categoryBreakdown: {
      "Road Infrastructure": 45,
      "Street Lighting": 32, 
      "Waste Management": 28,
      "Water Supply": 25,
      "Drainage": 15,
      "Traffic Issues": 11
    }
  }
};


// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();


// Utility Functions
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, duration);
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
}

function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

function generateId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

// Authentication Functions
function sendOTP() {
  console.log('sendOTP function called');
  
  const phoneNumberEl = document.getElementById('phone-number');
  const phoneSection = document.getElementById('phone-input-section');
  const otpSection = document.getElementById('otp-input-section');
  
  console.log('Elements found:', {
    phoneNumberEl: !!phoneNumberEl,
    phoneSection: !!phoneSection,
    otpSection: !!otpSection
  });
  
  if (!phoneNumberEl || !phoneSection || !otpSection) {
    console.error('Required DOM elements not found');
    showToast('Technical error: Required elements not found', 'error');
    return;
  }
  
  const phoneNumber = phoneNumberEl.value;
  console.log('Phone number:', phoneNumber);
  
  if (!phoneNumber || phoneNumber.length < 10) {
    showToast('Please enter a valid phone number', 'error');
    return;
  }
  
  console.log('Showing OTP section...');
  
  // Hide phone input section and show OTP section
  phoneSection.style.display = 'none';
  otpSection.style.display = 'block';
  
  // Also use classList as backup
  phoneSection.classList.add('hidden');
  otpSection.classList.remove('hidden');
  
  console.log('OTP section should now be visible');
  
  showToast('OTP sent successfully via DigiLocker!', 'success');
  
  // Focus on OTP input
  setTimeout(() => {
    const otpInput = document.getElementById('otp-input');
    if (otpInput) {
      otpInput.focus();
    }
  }, 300);
}

function verifyOTP() {
  console.log('verifyOTP function called');
  
  const otpInput = document.getElementById('otp-input');
  if (!otpInput) {
    console.error('OTP input not found');
    return;
  }
  
  const otp = otpInput.value;
  console.log('OTP entered:', otp);
  
  if (!otp || otp.length !== 6) {
    showToast('Please enter a valid 6-digit OTP', 'error');
    return;
  }
  
  // Simulate successful verification
  showToast('Authentication successful! Welcome to CivicConnect.', 'success');
  AppState.currentUser = MockData.users[0];
  
  setTimeout(() => {
    const loginScreen = document.getElementById('login-screen');
    const mainApp = document.getElementById('main-app');
    
    if (loginScreen && mainApp) {
      loginScreen.classList.remove('active');
      mainApp.classList.add('active');
      initializeApp();
    }
  }, 1500);
}

function resendOTP() {
  showToast('OTP resent successfully!', 'success');
  const otpInput = document.getElementById('otp-input');
  if (otpInput) {
    otpInput.value = '';
  }
}

function logout() {
  AppState.currentUser = null;
  hideUserProfile();
  showToast('Logged out successfully', 'success');
  
  setTimeout(() => {
    const mainApp = document.getElementById('main-app');
    const loginScreen = document.getElementById('login-screen');
    
    if (mainApp && loginScreen) {
      mainApp.classList.remove('active');
      loginScreen.classList.add('active');
      
      // Reset login form
      const phoneSection = document.getElementById('phone-input-section');
      const otpSection = document.getElementById('otp-input-section');
      const otpInput = document.getElementById('otp-input');
      
      if (phoneSection) {
        phoneSection.style.display = 'block';
        phoneSection.classList.remove('hidden');
      }
      if (otpSection) {
        otpSection.style.display = 'none';
        otpSection.classList.add('hidden');
      }
      if (otpInput) {
        otpInput.value = '';
      }
    }
  }, 1000);
}

// Theme Management
function toggleTheme() {
  AppState.theme = AppState.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-color-scheme', AppState.theme);
  showToast(`Switched to ${AppState.theme} theme`, 'info');
}

// Language Management
function changeLanguage() {
  const languageSelector = document.getElementById('language-selector');
  if (languageSelector) {
    AppState.language = languageSelector.value;
    showToast(`Language changed to ${AppState.language}`, 'info');
  }
}

// Navigation Functions
function showView(viewId) {
  console.log('Showing view:', viewId);
  
  // Hide all views
  const views = document.querySelectorAll('.view');
  views.forEach(view => {
    view.classList.remove('active');
  });
  
  // Show selected view
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.add('active');
  } else {
    console.error('Target view not found:', viewId);
    return;
  }
  
  // Update navigation
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-view="${viewId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
  
  AppState.currentView = viewId;
  
  // Load view-specific data
  if (viewId === 'community-view') {
    loadCommunityIssues();
  } else if (viewId === 'progress-view') {
    loadUserIssues();
  } else if (viewId === 'admin-view') {
    loadAdminData();
  } else if (viewId === 'report-view') {
    resetReportSteps();
    setTimeout(() => initializeCamera(), 100);
  }
}

function goBack() {
  if (AppState.currentView === 'report-view') {
    resetReportSteps();
  }
  showView('dashboard-view');
}

function toggleAdminMode() {
  AppState.isAdmin = !AppState.isAdmin;
  if (AppState.isAdmin) {
    showView('admin-view');
    showToast('Admin mode activated', 'info');
  } else {
    showView('dashboard-view');
    showToast('Admin mode deactivated', 'info');
  }
}

// User Profile Functions
function showUserProfile() {
  const modal = document.getElementById('user-profile-modal');
  if (!modal) return;
  
  const user = AppState.currentUser;
  if (user) {
    const nameEl = document.getElementById('profile-name');
    const phoneEl = document.getElementById('profile-phone');
    const addressEl = document.getElementById('profile-address');
    const aadhaarEl = document.getElementById('profile-aadhaar');
    
    if (nameEl) nameEl.textContent = user.name;
    if (phoneEl) phoneEl.textContent = user.phone;
    if (addressEl) addressEl.textContent = user.address;
    if (aadhaarEl) aadhaarEl.textContent = `AADHAR: ****-****-${user.aadhaar.slice(-4)}`;
  }
  
  modal.classList.remove('hidden');
}

function hideUserProfile() {
  const modal = document.getElementById('user-profile-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Report Functions
function resetReportSteps() {
  AppState.currentStep = 1;
  AppState.reportData = {};
  
  // Reset UI
  const steps = document.querySelectorAll('.step');
  steps.forEach(step => {
    step.classList.remove('active', 'completed');
  });
  
  const firstStep = document.querySelector('[data-step="1"]');
  if (firstStep) {
    firstStep.classList.add('active');
  }
  
  const reportSteps = document.querySelectorAll('.report-step');
  reportSteps.forEach(step => {
    step.classList.remove('active');
  });
  
  const firstReportStep = document.getElementById('step-capture');
  if (firstReportStep) {
    firstReportStep.classList.add('active');
  }
  
  // Reset camera
  if (window.currentStream) {
    window.currentStream.getTracks().forEach(track => track.stop());
  }
  
  // Reset photo preview
  const photoPreview = document.getElementById('photo-preview');
  const cameraFeed = document.getElementById('camera-feed');
  if (photoPreview) photoPreview.classList.add('hidden');
  if (cameraFeed) cameraFeed.classList.remove('hidden');
}

function nextStep() {
  const currentStepEl = document.querySelector(`[data-step="${AppState.currentStep}"]`);
  const nextStepEl = document.querySelector(`[data-step="${AppState.currentStep + 1}"]`);
  
  if (nextStepEl) {
    if (currentStepEl) {
      currentStepEl.classList.remove('active');
      currentStepEl.classList.add('completed');
    }
    nextStepEl.classList.add('active');
    
    // Hide current step content
    const reportSteps = document.querySelectorAll('.report-step');
    reportSteps.forEach(step => {
      step.classList.remove('active');
    });
    
    AppState.currentStep++;
    
    // Show next step content
    const stepMap = {
      2: 'step-analysis',
      3: 'step-voice',
      4: 'step-submit'
    };
    
    const nextStepContent = document.getElementById(stepMap[AppState.currentStep]);
    if (nextStepContent) {
      nextStepContent.classList.add('active');
    }
    
    // Handle step-specific logic
    if (AppState.currentStep === 2) {
      startAIAnalysis(AppState.imageUrl);
    } else if (AppState.currentStep === 4) {
      populateReportPreview();
    }
  }
}

// Camera Functions
async function initializeCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' }, 
      audio: false 
    });
    
    const video = document.getElementById('camera-feed');
    if (video) {
      video.srcObject = stream;
      window.currentStream = stream;
    }
  } catch (error) {
    console.error('Camera access denied:', error);
    showToast('Camera not available. You can still upload from gallery.', 'warning');
  }
}

function capturePhoto() {
  const video = document.getElementById('camera-feed');
  const canvas = document.getElementById('photo-canvas');
  const preview = document.getElementById('photo-preview');
  
  if (!video || !canvas || !preview) {
    showToast('Camera elements not found', 'error');
    return;
  }
  
  if (!video.srcObject) {
    showToast('Please allow camera access or select from gallery', 'error');
    return;
  }
  
  // Set canvas dimensions
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  
  // Draw video frame to canvas
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  
  // Convert to blob and show preview
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    AppState.reportData.imageBlob = blob;
    AppState.reportData.imageUrl = url;
    
    preview.innerHTML = `<img src="${url}" alt="Captured photo">`;
    preview.classList.remove('hidden');
    video.classList.add('hidden');
    
    // Stop camera stream
    if (window.currentStream) {
      window.currentStream.getTracks().forEach(track => track.stop());
    }
    
    showToast('Photo captured successfully!', 'success');
    setTimeout(() => nextStep(), 1000);
  }, 'image/jpeg', 0.8);
}

// Upload and get URL
async function uploadImage(file) {
    const storageRef = storage.ref(`images/${file.name}`);
    await storageRef.put(file);   // upload
    const url = await storageRef.getDownloadURL(); // get URL
    AppState.imageUrl = url;
    console.log("Image URL:", url);
    return url;
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    showToast('Please select a valid image file', 'error');
    return;
  }
  await uploadImage(file)
  const url = URL.createObjectURL(file);
  AppState.reportData.imageBlob = file;
  AppState.reportData.imageUrl = url;
  
  const preview = document.getElementById('photo-preview');
  const cameraFeed = document.getElementById('camera-feed');
  
  if (preview && cameraFeed) {
    preview.innerHTML = `<img src="${url}" alt="Selected photo">`;
    preview.classList.remove('hidden');
    cameraFeed.classList.add('hidden');
  }
  
  showToast('Photo selected successfully!', 'success');
  setTimeout(() => nextStep(), 1000);
}

// AI Analysis Functions
async function startAIAnalysis(imageUrl) {
  const loadingEl = document.querySelector('.analysis-loading');
  const resultEl = document.querySelector('.analysis-result');
  
  if (loadingEl) loadingEl.classList.remove('hidden');
  if (resultEl) resultEl.classList.add('hidden');
  let randomNum = Math.floor(Math.random())
  imageUrl = imageUrl+"?v="+randomNum
  console.log(imageUrl)
  // Simulate AI processing
  const response = await fetch('https://serverless.roboflow.com/infer/workflows/civic-issue/custom-workflow', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        api_key: '9NnLUfhxelNQFcmIcU5s',
        inputs: {
            "image": {"type": "url", "value": imageUrl}
        }
    })
});

    const result = await response.json();
    console.log(result);
    console.log(result.outputs[0].output.output);
    const detectedTypeEl = document.getElementById('detected-type');
    if (detectedTypeEl) detectedTypeEl.textContent = result.outputs[0].output.output;
    if (loadingEl) loadingEl.classList.add('hidden');
    if (resultEl) resultEl.classList.remove('hidden');
  
}

function acceptAnalysis() {
  AppState.reportData.category = AppState.reportData.detectedType;
  showToast('Analysis accepted!', 'success');
  setTimeout(() => nextStep(), 1000);
}

function rejectAnalysis() {
  const resultEl = document.querySelector('.analysis-result');
  const manualEl = document.querySelector('.manual-category');
  
  if (resultEl) resultEl.classList.add('hidden');
  if (manualEl) manualEl.classList.remove('hidden');
  
  showToast('Please select the correct category', 'info');
}

// Voice Recording Functions
function toggleRecording() {
  if (AppState.isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    AppState.mediaRecorder = new MediaRecorder(stream);
    AppState.recordingStartTime = Date.now();
    
    const chunks = [];
    AppState.mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };
    
     AppState.mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/wav' });
      AppState.recordedBlob = blob;
      
      const audio = document.getElementById('recorded-audio');
      if (audio) {
        audio.src = URL.createObjectURL(blob);
      }
      
      const playback = document.getElementById('voice-playback');
      if (playback) {
        playback.classList.remove('hidden');
      }
      
      showToast('Recording completed!', 'success');
      // Upload to Firebase and get URL
      const downloadURL = await uploadRecording(blob);
      AppState.audioUrl = downloadURL
      console.log('Firebase URL:', downloadURL);
    };
    
    AppState.mediaRecorder.start();
    AppState.isRecording = true;
    
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    
    if (recordBtn) recordBtn.textContent = '⏹️ Stop Recording';
    if (recordingStatus) recordingStatus.classList.remove('hidden');
    
    // Update recording timer
    const timerInterval = setInterval(() => {
      if (!AppState.isRecording) {
        clearInterval(timerInterval);
        return;
      }
      
      const elapsed = Math.floor((Date.now() - AppState.recordingStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      const timeEl = document.getElementById('recording-time');
      if (timeEl) {
        timeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
    
  } catch (error) {
    showToast('Microphone access required for voice recording', 'error');
  }
}

function stopRecording() {
  if (AppState.mediaRecorder && AppState.isRecording) {
    AppState.mediaRecorder.stop();
    AppState.isRecording = false;
    
    const recordBtn = document.getElementById('record-btn');
    const recordingStatus = document.getElementById('recording-status');
    
    if (recordBtn) recordBtn.textContent = '🎤 Start Recording';
    if (recordingStatus) recordingStatus.classList.add('hidden');
  }
}

function rerecord() {
  const playback = document.getElementById('voice-playback');
  if (playback) {
    playback.classList.add('hidden');
  }
  AppState.recordedBlob = null;
}

async function uploadRecording(blob) {
  try {
    const timestamp = Date.now();
    const fileName = `voice_recordings/recording_${timestamp}.wav`;
    const storageRef = storage.ref().child(fileName);
    
    const snapshot = await storageRef.put(blob);
    const downloadURL = await snapshot.ref.getDownloadURL();
    
    showToast('Recording uploaded!', 'success');
    console.log('Download URL:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    showToast('Failed to upload recording', 'error');
    console.error(error);
  }
}

async function getTranscriptText(transcriptId) {
  let status = "";
  let transcriptText = "";

  while (status !== "completed" && status !== "failed") {
    const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: { "authorization": "b84dbfe32f8f4add9f3c27b80e297025" }
    });
    const data = await response.json();
    status = data.status;

    if (status === "completed") {
      transcriptText = data.text; // The full transcript text
      return transcriptText;
    } else if (status === "failed") {
      throw new Error("Transcription failed");
    }

    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}


async function transcribe(audioUrl) {
  const response = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      "authorization": "b84dbfe32f8f4add9f3c27b80e297025",
      "content-type": "application/json"
    },
    body: JSON.stringify({ audio_url: audioUrl })
  });

  const data = await response.json();
  console.log(data);
  const text = await getTranscriptText(data.id)
  console.log(text);
  return text
}

async function proceedToSubmit() {
  const textDescription = document.getElementById('text-description');
  const textValue = textDescription ? textDescription.value : '';
  
  if (AppState.recordedBlob) {
    var text = await transcribe(AppState.audioUrl)
    AppState.reportData.voiceNote = text;
  } else if (textValue) {
    AppState.reportData.voiceNote = textValue;
  } else {
    AppState.reportData.voiceNote = 'No additional description provided';
  }
  
  nextStep();
}

function populateReportPreview() {
  const imagePreview = document.getElementById('final-image-preview');
  const issueType = document.getElementById('final-issue-type');
  const location = document.getElementById('final-location');
  const description = document.getElementById('final-description');
  const priority = document.getElementById('final-priority');
  
  if (imagePreview && AppState.reportData.imageUrl) {
    imagePreview.src = AppState.reportData.imageUrl;
  }
  if (issueType) {
    issueType.textContent = AppState.reportData.category || 'Road Infrastructure';
  }
  if (location) {
    location.textContent = 'MG Road, Bangalore';
  }
  if (description) {
    description.textContent = AppState.reportData.voiceNote || 'Issue reported via mobile app';
  }
  if (priority) {
    priority.textContent = AppState.reportData.severity || 'Medium';
    priority.className = `status status--${AppState.reportData.severity === 'High' ? 'error' : 'warning'}`;
  }
}

function submitReport() {
  const privacyAgreed = document.getElementById('privacy-agree');
  if (!privacyAgreed || !privacyAgreed.checked) {
    showToast('Please agree to privacy terms', 'error');
    return;
  }
  
  // Create new issue
  const newIssue = {
    id: generateId(),
    title: `${AppState.reportData.category || 'Road Infrastructure'} Issue`,
    description: AppState.reportData.voiceNote || 'Issue reported via mobile app',
    category: AppState.reportData.category || 'Road Infrastructure',
    status: 'Reported',
    priority: AppState.reportData.severity || 'Medium',
    location: 'MG Road, Bangalore',
    coordinates: {lat: 12.9716, lng: 77.5946},
    submittedBy: AppState.currentUser.id,
    assignedTo: 'Auto-assigned',
    submittedDate: new Date().toISOString().split('T')[0],
    votes: 0,
    hasUserVoted: false,
    images: [AppState.reportData.imageUrl],
    voiceNote: AppState.reportData.voiceNote,
    comments: []
  };
  
  MockData.issues.unshift(newIssue);
  
  showToast('Report submitted successfully! Tracking ID: #' + newIssue.id.slice(-6).toUpperCase(), 'success');
  setTimeout(() => {
    resetReportSteps();
    showView('progress-view');
  }, 2000);
}

// Community Functions
function showCommunityTab(tabName) {
  const tabButtons = document.querySelectorAll('#community-view .tab-btn');
  const tabs = document.querySelectorAll('.community-tab');
  
  // Remove active class from all
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Add active class to clicked button and corresponding tab
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  const targetTab = document.getElementById(`community-${tabName}`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  if (tabName === 'issues') {
    loadCommunityIssues();
  }
}

function loadCommunityIssues() {
  const container = document.getElementById('community-issues-list');
  const filter = document.getElementById('issues-filter')?.value || 'all';
  
  if (!container) return;
  
  let filteredIssues = MockData.issues;
  if (filter !== 'all') {
    filteredIssues = MockData.issues.filter(issue => issue.category === filter);
  }
  
  container.innerHTML = filteredIssues.map(issue => `
    <div class="issue-card">
      <img src="https://pplx-res.cloudinary.com/image/upload/v1754949358/pplx_project_search_images/9a4bd2a9b8b173f30baeb9cbb6fe9c56c25650a5.png" alt="${issue.title}" class="issue-image">
      <div class="issue-content">
        <div class="issue-header">
          <h4 class="issue-title">${issue.title}</h4>
          <span class="status status--${issue.status === 'Resolved' ? 'success' : issue.status === 'In Progress' ? 'warning' : 'info'}">${issue.status}</span>
        </div>
        <p>${issue.description}</p>
        <div class="issue-meta">
          <span>📍 ${issue.location}</span>
          <span>📅 ${formatTimeAgo(issue.submittedDate)}</span>
          <span>🏷️ ${issue.category}</span>
        </div>
        <div class="issue-actions">
          <div class="vote-buttons">
            <button class="vote-btn ${issue.hasUserVoted ? 'voted' : ''}" onclick="toggleVote('${issue.id}', true)">👍</button>
            <span class="vote-count">${issue.votes}</span>
            <button class="vote-btn" onclick="toggleVote('${issue.id}', false)">👎</button>
          </div>
          <button class="btn btn--secondary btn--sm" onclick="showIssueDetails('${issue.id}')">View Details</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleVote(issueId, isUpvote) {
  const issue = MockData.issues.find(i => i.id === issueId);
  if (!issue) return;
  
  if (issue.hasUserVoted && isUpvote) {
    issue.votes--;
    issue.hasUserVoted = false;
    showToast('Vote removed', 'info');
  } else if (!issue.hasUserVoted && isUpvote) {
    issue.votes++;
    issue.hasUserVoted = true;
    showToast('Upvoted successfully!', 'success');
  } else if (!isUpvote) {
    showToast('Downvote recorded', 'info');
  }
  
  loadCommunityIssues();
}

function showIssueDetails(issueId) {
  const issue = MockData.issues.find(i => i.id === issueId);
  if (issue) {
    showToast(`Viewing details for: ${issue.title}`, 'info');
  }
}

// Progress Functions
function loadUserIssues() {
  const container = document.getElementById('user-issues-list');
  if (!container || !AppState.currentUser) return;
  
  const userIssues = MockData.issues.filter(issue => issue.submittedBy === AppState.currentUser.id);
  
  container.innerHTML = userIssues.map(issue => `
    <div class="progress-item">
      <div class="progress-header">
        <h4>${issue.title}</h4>
        <span class="status status--${issue.status === 'Resolved' ? 'success' : issue.status === 'In Progress' ? 'warning' : 'info'}">${issue.status}</span>
      </div>
      <div class="progress-details">
        <div><strong>Category:</strong> ${issue.category}</div>
        <div><strong>Location:</strong> ${issue.location}</div>
        <div><strong>Submitted:</strong> ${formatDate(issue.submittedDate)}</div>
        <div><strong>Assigned to:</strong> ${issue.assignedTo}</div>
        <div><strong>Days:</strong> ${Math.floor((new Date() - new Date(issue.submittedDate)) / (1000 * 60 * 60 * 24))}</div>
      </div>
      <div class="progress-timeline">
        <div class="timeline-step completed">📝 Reported</div>
        <div class="timeline-step ${issue.status !== 'Reported' ? 'completed' : ''}">👁️ Reviewed</div>
        <div class="timeline-step ${issue.status === 'In Progress' || issue.status === 'Resolved' ? 'completed' : issue.status === 'In Progress' ? 'active' : ''}">🔧 In Progress</div>
        <div class="timeline-step ${issue.status === 'Resolved' ? 'completed' : ''}">✅ Resolved</div>
      </div>
    </div>
  `).join('');
}

// Admin Functions
function showAdminTab(tabName) {
  const tabButtons = document.querySelectorAll('#admin-view .tab-btn');
  const tabs = document.querySelectorAll('.admin-tab');
  
  // Remove active class from all
  tabButtons.forEach(btn => btn.classList.remove('active'));
  tabs.forEach(tab => tab.classList.remove('active'));
  
  // Add active class to clicked button and corresponding tab
  if (event && event.target) {
    event.target.classList.add('active');
  }
  
  const targetTab = document.getElementById(`admin-${tabName}`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  if (tabName === 'analytics') {
    setTimeout(() => initializeCharts(), 100);
  } else if (tabName === 'assignments') {
    loadAssignments();
  } else if (tabName === 'map') {
    loadAdminIssues();
  }
}

function loadAdminData() {
  loadAdminIssues();
}

function loadAdminIssues() {
  const container = document.getElementById('admin-issues-list');
  if (!container) return;
  
  container.innerHTML = MockData.issues.map(issue => `
    <div class="admin-issue-item">
      <div class="admin-issue-info">
        <h5>${issue.title}</h5>
        <p>${issue.location} • ${issue.category} • ${formatTimeAgo(issue.submittedDate)}</p>
        <span class="status status--${issue.status === 'Resolved' ? 'success' : issue.status === 'In Progress' ? 'warning' : 'info'}">${issue.status}</span>
      </div>
      <div class="admin-issue-actions">
        <select onchange="updateIssueStatus('${issue.id}', this.value)" class="form-control">
          <option value="Reported" ${issue.status === 'Reported' ? 'selected' : ''}>Reported</option>
          <option value="In Progress" ${issue.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
          <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
        <button class="btn btn--secondary btn--sm" onclick="assignIssue('${issue.id}')">Assign</button>
      </div>
    </div>
  `).join('');
}

function updateIssueStatus(issueId, newStatus) {
  const issue = MockData.issues.find(i => i.id === issueId);
  if (issue) {
    issue.status = newStatus;
    if (newStatus === 'Resolved') {
      issue.resolvedDate = new Date().toISOString().split('T')[0];
    }
    showToast(`Issue status updated to ${newStatus}`, 'success');
    loadAdminIssues();
    
    // Refresh other views if they're loaded
    if (AppState.currentView === 'progress-view') {
      loadUserIssues();
    }
    if (AppState.currentView === 'community-view') {
      loadCommunityIssues();
    }
  }
}

function assignIssue(issueId) {
  showToast('Assignment dialog would open here in full implementation', 'info');
}

function loadAssignments() {
  const container = document.getElementById('assignments-list');
  if (!container) return;
  
  const activeIssues = MockData.issues.filter(issue => issue.status !== 'Resolved');
  
  container.innerHTML = activeIssues.map(issue => `
    <div class="assignment-card">
      <div class="assignment-header">
        <h4>${issue.title}</h4>
        <span class="status status--${issue.status === 'In Progress' ? 'warning' : 'info'}">${issue.status}</span>
      </div>
      <div class="assignment-meta">
        <span>📍 ${issue.location}</span>
        <span>👤 ${issue.assignedTo}</span>
        <span>📅 ${formatTimeAgo(issue.submittedDate)}</span>
        <span>⭐ ${issue.priority} Priority</span>
      </div>
      <p>${issue.description}</p>
      <div class="assignment-actions">
        <button class="btn btn--primary btn--sm" onclick="updateIssueStatus('${issue.id}', 'In Progress')">Start Work</button>
        <button class="btn btn--success btn--sm" onclick="updateIssueStatus('${issue.id}', 'Resolved')">Mark Resolved</button>
      </div>
    </div>
  `).join('');
}

// Charts and Analytics
function initializeCharts() {
  // Category Chart
  const categoryCtx = document.getElementById('categoryChart')?.getContext('2d');
  if (categoryCtx && typeof Chart !== 'undefined') {
    new Chart(categoryCtx, {
      type: 'doughnut',
      data: {
        labels: Object.keys(MockData.analytics.categoryBreakdown),
        datasets: [{
          data: Object.values(MockData.analytics.categoryBreakdown),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Timeline Chart
  const timelineCtx = document.getElementById('timelineChart')?.getContext('2d');
  if (timelineCtx && typeof Chart !== 'undefined') {
    new Chart(timelineCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Issues Reported',
          data: [25, 32, 28, 35, 40, 38],
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4
        }, {
          label: 'Issues Resolved',
          data: [20, 28, 25, 30, 35, 36],
          borderColor: '#5D878F',
          backgroundColor: 'rgba(93, 135, 143, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Location Functions
function getCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationEl = document.getElementById('current-location');
        if (locationEl) {
          locationEl.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
      },
      () => {
        const locationEl = document.getElementById('current-location');
        if (locationEl) {
          locationEl.textContent = 'MG Road, Bangalore';
        }
      }
    );
  }
}

// PWA Functions
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
}

// App Initialization
function initializeApp() {
  console.log('Initializing app...');
  
  // Get current location
  getCurrentLocation();
  
  // Load initial data
  loadCommunityIssues();
  loadUserIssues();
  
  // Set up event listeners
  const issuesFilter = document.getElementById('issues-filter');
  if (issuesFilter) {
    issuesFilter.addEventListener('change', loadCommunityIssues);
  }
  
  // Set up manual category selection
  const manualCategorySelect = document.getElementById('manual-category-select');
  if (manualCategorySelect) {
    manualCategorySelect.addEventListener('change', function() {
      if (this.value) {
        AppState.reportData.category = this.value;
        showToast('Category selected!', 'success');
        setTimeout(() => nextStep(), 1000);
      }
    });
  }
  
  showToast('Welcome to CivicConnect!', 'success');
}

// Global Event Listeners
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  
  // Hide loading screen
  setTimeout(() => {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
    }
  }, 2000);
  
  // Register service worker
  registerServiceWorker();
  
  // Handle form submissions
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      const activeElement = document.activeElement;
      if (activeElement && activeElement.id === 'otp-input') {
        verifyOTP();
      }
    }
  });
});

// Expose functions globally for HTML onclick handlers
window.sendOTP = sendOTP;
window.verifyOTP = verifyOTP;
window.resendOTP = resendOTP;
window.logout = logout;
window.toggleTheme = toggleTheme;
window.changeLanguage = changeLanguage;
window.showView = showView;
window.goBack = goBack;
window.toggleAdminMode = toggleAdminMode;
window.showUserProfile = showUserProfile;
window.hideUserProfile = hideUserProfile;
window.capturePhoto = capturePhoto;
window.handleFileSelect = handleFileSelect;
window.acceptAnalysis = acceptAnalysis;
window.rejectAnalysis = rejectAnalysis;
window.toggleRecording = toggleRecording;
window.rerecord = rerecord;
window.proceedToSubmit = proceedToSubmit;
window.submitReport = submitReport;
window.showCommunityTab = showCommunityTab;
window.toggleVote = toggleVote;
window.showIssueDetails = showIssueDetails;
window.showAdminTab = showAdminTab;
window.updateIssueStatus = updateIssueStatus;
window.assignIssue = assignIssue;
