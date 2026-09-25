/**
 * Cooperative Service Marketplace – Worker App
 * Client-side logic for Worker Registration, Verification Lifecycle, Login & Dashboard
 */

(function () {
  'use strict';

  // Real-Time Cross-App Sync Bridge between Customer & Worker
  let marketplaceChannel = null;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      marketplaceChannel = new BroadcastChannel('coop_marketplace_channel');
    }
  } catch (e) {
    console.warn('BroadcastChannel unavailable', e);
  }

  function broadcastMarketplace(action, payload) {
    const eventData = { action, payload, timestamp: Date.now() };
    if (marketplaceChannel) {
      try { marketplaceChannel.postMessage(eventData); } catch (e) {}
    }
    try {
      localStorage.setItem('coop_marketplace_event', JSON.stringify(eventData));
    } catch (e) {}
  }

  // Shared Marketplace State & Initial Data
  const state = {
    currentScreen: 'welcome', // 'welcome' | 'registration' | 'verification' | 'login' | 'dashboard'
    currentTab: 'home',       // 'home' | 'jobs' | 'earnings' | 'profile'
    verificationState: 'under_review', // 'under_review' | 'approved' | 'rejected'
    isAvailable: true,        // "AVAILABLE FOR JOBS" main toggle
    lastIncomingRequest: null,

    // Current Authenticated Worker Profile
    currentWorker: {
      name: 'Ramesh Kumar',
      phone: '9845040201',
      email: 'ramesh.kumar@coopguild.org',
      role: 'Master Plumber & Pipe Specialist',
      category: 'Plumbing',
      memberId: '402',
      rating: '4.9 ★',
      reviewCount: 384,
      experience: '6-10 years',
      serviceArea: 'Indiranagar & Domlur',
      address: '#42, 6th Cross, Indiranagar, Bengaluru',
      avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
      idVerified: true,
      earningsToday: 1240.00,
      completedTodayCount: 3,
      bonusShare: 180.00
    },

    // Pre-registered Co-op Workers for Quick Demo Testing
    preloadedWorkers: {
      ramesh: {
        name: 'Ramesh Kumar',
        phone: '9845040201',
        email: 'ramesh.kumar@coopguild.org',
        role: 'Master Plumber & Pipe Specialist',
        category: 'Plumbing',
        memberId: '402',
        rating: '4.9 ★',
        reviewCount: 384,
        experience: '6-10 years',
        serviceArea: 'Indiranagar & Domlur',
        address: '#42, 6th Cross, Indiranagar, Bengaluru',
        avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
        idVerified: true,
        earningsToday: 1240.00,
        completedTodayCount: 3,
        bonusShare: 180.00
      },
      suresh: {
        name: 'Suresh Patil',
        phone: '9845031502',
        email: 'suresh.patil@coopguild.org',
        role: 'Senior Electrical Technician',
        category: 'Electrical',
        memberId: '315',
        rating: '4.8 ★',
        reviewCount: 290,
        experience: '8+ years',
        serviceArea: 'Koramangala & HSR',
        address: '#19, 4th Block, Koramangala, Bengaluru',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        idVerified: true,
        earningsToday: 980.00,
        completedTodayCount: 2,
        bonusShare: 140.00
      },
      vikram: {
        name: 'Vikram Sen',
        phone: '9880010801',
        email: 'vikram.sen@coopguild.org',
        role: 'Emergency Lead Responder',
        category: 'Plumbing & Emergency',
        memberId: '108',
        rating: '4.9 ★',
        reviewCount: 412,
        experience: '12+ years',
        serviceArea: 'Central Bengaluru',
        address: '#7, Artillery Rd, Central Bengaluru',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        idVerified: true,
        earningsToday: 1850.00,
        completedTodayCount: 4,
        bonusShare: 260.00
      }
    },

    // Marketplace Jobs (Synchronized with Customer App)
    jobs: {
      // Current active Job Details view model (Part 3)
      currentJobDetails: {
        bookingId: 'CP-9104',
        requestType: 'INSTANT',
        service: 'Plumbing Leakage & Pipe Repair',
        problem: 'Tap & Mixer Leak • High pressure joint failure under main washbasin.',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        customerLocation: 'Indiranagar 100ft Rd, Bengaluru',
        distance: '1.2 km away',
        workerLocation: 'CMH Road Co-op Depot, Indiranagar',
        estTravelTime: '12 mins',
        price: 348,
        status: 'JOB_ASSIGNED'
      },
      // Active Estimate (Part 4)
      currentEstimate: {
        problem: 'Main ceramic disc cartridge cracked & pipe nipple corroded',
        materials: 'Ceramic cartridge replacement + Teflon seal pack',
        materialsCost: 280,
        labour: 'Precision plumbing disassembly, valve reseat & pressure test',
        labourCost: 199,
        total: 479,
        notes: 'Includes 90-day cooperative workmanship warranty & high pressure testing.',
        status: 'draft'
      },
      // Active job assigned to Ramesh Kumar in Customer App
      activeJob: {
        id: 'CP-8841',
        service: 'Plumbing Leakage & Pipe Repair',
        subIssue: 'Tap & Mixer Leak',
        customerName: 'P. Vishnu Vardhan',
        customerPhone: '+91 98480 22338',
        address: 'Indiranagar 100ft Rd, Bengaluru',
        distance: '1.2 km',
        etaMinutes: 12,
        price: 348,
        status: 'Worker En Route'
      },
      // Emergency SOS Request
      emergencyRequest: {
        id: 'SOS-1092',
        service: 'Major Pipe Burst / Ceilings Flood',
        customerName: 'Deepa Krishnan',
        customerPhone: '+91 98450 11223',
        address: 'Indiranagar 100ft Rd, Bengaluru',
        distance: '1.1 km',
        etaWindow: '< 15 mins',
        price: 599,
        status: 'Broadcast'
      },
      // Available Queue
      availableJobs: [
        {
          id: '8850',
          service: 'Washbasin Drainage Blockage',
          customerName: 'Karthik Reddy',
          customerPhone: '+91 98800 33445',
          address: 'Defense Colony, Indiranagar',
          distance: '0.8 km',
          price: 249
        },
        {
          id: '8852',
          service: 'Water Pressure Pump Diagnostic',
          customerName: 'Meera Nambiar',
          customerPhone: '+91 99001 55667',
          address: 'Domlur 1st Stage',
          distance: '1.9 km',
          price: 449
        }
      ]
    }
  };

  // DOM Elements
  const el = {};

  function cacheDom() {
    el.screens = {
      welcome: document.getElementById('screen-welcome'),
      registration: document.getElementById('screen-registration'),
      verification: document.getElementById('screen-verification'),
      login: document.getElementById('screen-login'),
      dashboard: document.getElementById('screen-dashboard'),
      jobDetails: document.getElementById('screen-job-details')
    };

    el.tabs = {
      home: document.getElementById('tab-home'),
      jobs: document.getElementById('tab-jobs'),
      earnings: document.getElementById('tab-earnings'),
      profile: document.getElementById('tab-profile')
    };

    el.navItems = document.querySelectorAll('.bottom-nav .nav-item');
    el.globalToast = document.getElementById('global-toast');
    el.toastIcon = document.getElementById('toast-icon');
    el.toastMessage = document.getElementById('toast-message');

    // Welcome Screen Buttons
    el.btnWelcomeRegister = document.getElementById('btn-welcome-register');
    el.btnWelcomeLogin = document.getElementById('btn-welcome-login');

    // Registration Form Elements
    el.btnRegBack = document.getElementById('btn-reg-back');
    el.btnSubmitRegistration = document.getElementById('btn-submit-registration');
    el.regWorkerName = document.getElementById('reg-worker-name');
    el.regMobileNumber = document.getElementById('reg-mobile-number');
    el.regEmail = document.getElementById('reg-email');
    el.regAddress = document.getElementById('reg-address');
    el.regExperience = document.getElementById('reg-experience');
    el.regServiceArea = document.getElementById('reg-service-area');
    el.skillsGrid = document.getElementById('skills-selection-grid');
    el.inputProfilePhoto = document.getElementById('input-profile-photo');
    el.avatarPreviewImg = document.getElementById('avatar-preview-img');
    el.avatarPlaceholder = document.getElementById('avatar-placeholder');
    el.btnSampleAvatar = document.getElementById('btn-sample-avatar');
    el.docDropzone = document.getElementById('doc-dropzone-box');
    el.inputIdDoc = document.getElementById('input-id-doc');
    el.docPreviewCard = document.getElementById('doc-preview-card');
    el.docFileName = document.getElementById('doc-file-name');
    el.btnRemoveDoc = document.getElementById('btn-remove-doc');

    // Verification Screen Elements
    el.btnVerifBack = document.getElementById('btn-verif-back');
    el.demoStateReview = document.getElementById('demo-state-review');
    el.demoStateApproved = document.getElementById('demo-state-approved');
    el.demoStateRejected = document.getElementById('demo-state-rejected');
    el.stateUnderReview = document.getElementById('state-under-review');
    el.stateApproved = document.getElementById('state-approved');
    el.stateRejected = document.getElementById('state-rejected');
    el.btnSimulateApproval = document.getElementById('btn-simulate-approval');
    el.btnVerifCreateLogin = document.getElementById('btn-verif-create-login');
    el.btnResubmitApp = document.getElementById('btn-resubmit-application');
    el.approvedWorkerName = document.getElementById('approved-worker-name');
    el.approvedWorkerRole = document.getElementById('approved-worker-role');
    el.approvedWorkerAvatar = document.getElementById('approved-worker-avatar');

    // Login Screen Elements
    el.btnLoginBack = document.getElementById('btn-login-back');
    el.loginUsername = document.getElementById('login-username');
    el.loginPassword = document.getElementById('login-password');
    el.btnTogglePwd = document.getElementById('btn-toggle-pwd');
    el.pwdEyeIcon = document.getElementById('pwd-eye-icon');
    el.btnSubmitLogin = document.getElementById('btn-submit-login');
    el.btnForgotPassword = document.getElementById('btn-forgot-password');
    el.linkGotoRegister = document.getElementById('link-goto-register');
    el.autofillRamesh = document.getElementById('autofill-ramesh');
    el.autofillSuresh = document.getElementById('autofill-suresh');
    el.autofillVikram = document.getElementById('autofill-vikram');

    // Dashboard Elements
    el.dashWorkerName = document.getElementById('dash-worker-name');
    el.dashWorkerAvatar = document.getElementById('dash-worker-avatar');
    el.dashStatusDot = document.getElementById('dash-status-dot');
    el.dashWorkerBadge = document.getElementById('dash-worker-badge');
    el.toggleAvailability = document.getElementById('toggle-availability');
    el.availabilityCard = document.getElementById('availability-card');
    el.availabilityStatusText = document.getElementById('availability-status-text');
    el.offlineBanner = document.getElementById('offline-banner');
    el.dashEarningsAmount = document.getElementById('dash-earnings-amount');
    el.dashJobsCount = document.getElementById('dash-jobs-count');
    el.activeEmergencyCard = document.getElementById('active-emergency-card');
    el.btnAcceptEmergency = document.getElementById('btn-accept-emergency');
    el.btnDeclineEmergency = document.getElementById('btn-decline-emergency');
    el.emergencyCountBadge = document.getElementById('emergency-count-badge');
    el.jobCardCp8841 = document.getElementById('job-card-cp8841');
    el.btnCallCustomer = document.getElementById('btn-call-customer');
    el.btnNavCustomer = document.getElementById('btn-nav-customer');
    el.btnCompleteJobCp8841 = document.getElementById('btn-complete-job-cp8841');
    el.todayJobsCountBadge = document.getElementById('today-jobs-count-badge');
    el.availJobsBadge = document.getElementById('avail-jobs-badge');
    el.availableJobsList = document.getElementById('available-jobs-list');

    // Desktop Controls
    el.btnToggleFullscreen = document.getElementById('btn-toggle-fullscreen');
    el.btnResetDemo = document.getElementById('btn-reset-demo');
    el.btnWorkerNotifs = document.getElementById('btn-worker-notifs');
  }

  // Toast Notification Utility
  let toastTimer = null;
  function showToast(message, type = 'normal') {
    if (!el.globalToast) return;
    clearTimeout(toastTimer);

    el.globalToast.className = 'toast-notice show ' + type;
    if (el.toastMessage) el.toastMessage.textContent = message;

    toastTimer = setTimeout(() => {
      el.globalToast.className = 'toast-notice';
    }, 3200);
  }

  // Live Digital Clock in Status Bar
  function startClock() {
    function updateClock() {
      const timeEl = document.getElementById('current-clock-time');
      if (!timeEl) return;
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      minutes = minutes < 10 ? '0' + minutes : minutes;
      hours = hours < 10 ? '0' + hours : hours;
      timeEl.textContent = `${hours}:${minutes}`;
    }
    updateClock();
    setInterval(updateClock, 30000);
  }

  // Screen Switching
  function showScreen(screenId) {
    state.currentScreen = screenId;
    Object.keys(el.screens).forEach(id => {
      if (el.screens[id]) {
        if (id === screenId) {
          el.screens[id].classList.add('active');
          el.screens[id].scrollTop = 0;
        } else {
          el.screens[id].classList.remove('active');
        }
      }
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Bottom Navigation Tab Switching
  function switchTab(tabId) {
    state.currentTab = tabId;

    // Update nav items
    el.navItems.forEach(item => {
      if (item.dataset.tab === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update tab view
    Object.keys(el.tabs).forEach(id => {
      if (el.tabs[id]) {
        if (id === tabId) {
          el.tabs[id].classList.add('active');
        } else {
          el.tabs[id].classList.remove('active');
        }
      }
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Modals management
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('open');
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('open');
  }

  // ==============================================================
  // 1. WORKER REGISTRATION LOGIC
  // ==============================================================
  function setupRegistrationFlow() {
    // Skill chip selection
    if (el.skillsGrid) {
      el.skillsGrid.addEventListener('click', (e) => {
        const chip = e.target.closest('.skill-chip');
        if (!chip) return;
        document.querySelectorAll('#skills-selection-grid .skill-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
      });
    }

    // Demo Avatar generator
    if (el.btnSampleAvatar) {
      el.btnSampleAvatar.addEventListener('click', () => {
        const sampleUrl = 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80';
        if (el.avatarPreviewImg) {
          el.avatarPreviewImg.src = sampleUrl;
          el.avatarPreviewImg.style.display = 'block';
        }
        if (el.avatarPlaceholder) el.avatarPlaceholder.style.display = 'none';
        state.currentWorker.avatarUrl = sampleUrl;
        showToast('Demo profile photograph attached.', 'success');
      });
    }

    // Photo file input
    if (el.inputProfilePhoto) {
      el.inputProfilePhoto.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (evt) {
            if (el.avatarPreviewImg) {
              el.avatarPreviewImg.src = evt.target.result;
              el.avatarPreviewImg.style.display = 'block';
            }
            if (el.avatarPlaceholder) el.avatarPlaceholder.style.display = 'none';
            state.currentWorker.avatarUrl = evt.target.result;
            showToast('Photograph uploaded successfully!', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Document Dropzone trigger
    if (el.docDropzone && el.inputIdDoc) {
      el.docDropzone.addEventListener('click', () => {
        el.inputIdDoc.click();
      });

      el.inputIdDoc.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          if (el.docFileName) el.docFileName.textContent = file.name;
          if (el.docPreviewCard) el.docPreviewCard.style.display = 'flex';
          showToast(`Attached document: ${file.name}`, 'success');
        }
      });
    }

    if (el.btnRemoveDoc) {
      el.btnRemoveDoc.addEventListener('click', () => {
        if (el.docPreviewCard) el.docPreviewCard.style.display = 'none';
        if (el.inputIdDoc) el.inputIdDoc.value = '';
        showToast('Document removed.', 'normal');
      });
    }

    // Submit Registration -> "Application Under Review"
    if (el.btnSubmitRegistration) {
      el.btnSubmitRegistration.addEventListener('click', () => {
        const name = el.regWorkerName ? el.regWorkerName.value.trim() : '';
        const phone = el.regMobileNumber ? el.regMobileNumber.value.trim() : '';
        const email = el.regEmail ? el.regEmail.value.trim() : '';
        const address = el.regAddress ? el.regAddress.value.trim() : '';
        const selectedChip = document.querySelector('#skills-selection-grid .skill-chip.selected');
        const skill = selectedChip ? selectedChip.dataset.skill : 'Plumbing';
        const exp = el.regExperience ? el.regExperience.value : '6-10 years';
        const area = el.regServiceArea ? el.regServiceArea.value : 'Indiranagar & Domlur';

        if (!name) {
          showToast('Please enter your full name.', 'warning');
          return;
        }
        if (!phone || phone.length < 10) {
          showToast('Please enter a valid 10-digit mobile number.', 'warning');
          return;
        }

        // Save submitted registration into state
        state.currentWorker.name = name;
        state.currentWorker.phone = phone;
        state.currentWorker.email = email;
        state.currentWorker.address = address;
        state.currentWorker.category = skill;
        state.currentWorker.experience = exp;
        state.currentWorker.serviceArea = area;
        state.currentWorker.role = `Certified ${skill} Specialist`;

        // Update verification view labels
        if (el.approvedWorkerName) el.approvedWorkerName.textContent = name;
        if (el.approvedWorkerRole) el.approvedWorkerRole.textContent = `Certified ${skill} Specialist`;
        if (el.approvedWorkerAvatar && state.currentWorker.avatarUrl) {
          el.approvedWorkerAvatar.src = state.currentWorker.avatarUrl;
        }

        // Set status to Under Review
        setVerificationState('under_review');
        showScreen('verification');
        showToast('Application submitted! Status: Application Under Review', 'success');
      });
    }

    if (el.btnRegBack) {
      el.btnRegBack.addEventListener('click', () => {
        showScreen('welcome');
      });
    }
  }

  // ==============================================================
  // 2. VERIFICATION LIFECYCLE (Under Review / Approved / Rejected)
  // ==============================================================
  function setVerificationState(stateName) {
    state.verificationState = stateName;

    // Toggle demo pill active states
    if (el.demoStateReview) el.demoStateReview.classList.toggle('active', stateName === 'under_review');
    if (el.demoStateApproved) el.demoStateApproved.classList.toggle('active', stateName === 'approved');
    if (el.demoStateRejected) el.demoStateRejected.classList.toggle('active', stateName === 'rejected');

    // Show corresponding state container
    if (el.stateUnderReview) el.stateUnderReview.classList.toggle('active', stateName === 'under_review');
    if (el.stateApproved) el.stateApproved.classList.toggle('active', stateName === 'approved');
    if (el.stateRejected) el.stateRejected.classList.toggle('active', stateName === 'rejected');

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  function setupVerificationFlow() {
    // Interactive Demo Pills
    if (el.demoStateReview) {
      el.demoStateReview.addEventListener('click', () => {
        setVerificationState('under_review');
        showToast('Status switched to: Application Under Review', 'normal');
      });
    }

    if (el.demoStateApproved) {
      el.demoStateApproved.addEventListener('click', () => {
        setVerificationState('approved');
        showToast('Status switched to: Approved', 'success');
      });
    }

    if (el.demoStateRejected) {
      el.demoStateRejected.addEventListener('click', () => {
        setVerificationState('rejected');
        showToast('Status switched to: Rejected', 'warning');
      });
    }

    // Simulate instant approval button on Under Review card
    if (el.btnSimulateApproval) {
      el.btnSimulateApproval.addEventListener('click', () => {
        setVerificationState('approved');
        showToast('Verification passed! Your account has been approved.', 'success');
      });
    }

    // "Create Login" action from Approved state
    if (el.btnVerifCreateLogin) {
      el.btnVerifCreateLogin.addEventListener('click', () => {
        // Pre-fill login screen with approved worker credentials
        if (el.loginUsername) el.loginUsername.value = state.currentWorker.phone;
        if (el.loginPassword) el.loginPassword.value = 'coop1234';
        showScreen('login');
        showToast('Account active! Set password or sign in with your mobile.', 'success');
      });
    }

    // "Update & Resubmit" from Rejected state
    if (el.btnResubmitApp) {
      el.btnResubmitApp.addEventListener('click', () => {
        showScreen('registration');
        showToast('Please update your documents and resubmit.', 'normal');
      });
    }

    if (el.btnVerifBack) {
      el.btnVerifBack.addEventListener('click', () => {
        showScreen('welcome');
      });
    }
  }

  // ==============================================================
  // 3. WORKER LOGIN LOGIC
  // ==============================================================
  function setupLoginFlow() {
    // Show / Hide Password toggle
    if (el.btnTogglePwd && el.loginPassword) {
      el.btnTogglePwd.addEventListener('click', () => {
        const isPassword = el.loginPassword.type === 'password';
        el.loginPassword.type = isPassword ? 'text' : 'password';
        if (el.pwdEyeIcon) {
          el.pwdEyeIcon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
          if (window.lucide) window.lucide.createIcons();
        }
      });
    }

    // Quick Autofill helpers
    if (el.autofillRamesh) {
      el.autofillRamesh.addEventListener('click', () => {
        loadWorkerProfile(state.preloadedWorkers.ramesh);
        if (el.loginUsername) el.loginUsername.value = state.preloadedWorkers.ramesh.phone;
        if (el.loginPassword) el.loginPassword.value = 'coop1234';
        showToast('Autofilled: Ramesh Kumar (Plumbing #402)', 'success');
      });
    }

    if (el.autofillSuresh) {
      el.autofillSuresh.addEventListener('click', () => {
        loadWorkerProfile(state.preloadedWorkers.suresh);
        if (el.loginUsername) el.loginUsername.value = state.preloadedWorkers.suresh.phone;
        if (el.loginPassword) el.loginPassword.value = 'coop1234';
        showToast('Autofilled: Suresh Patil (Electrical #315)', 'success');
      });
    }

    if (el.autofillVikram) {
      el.autofillVikram.addEventListener('click', () => {
        loadWorkerProfile(state.preloadedWorkers.vikram);
        if (el.loginUsername) el.loginUsername.value = state.preloadedWorkers.vikram.phone;
        if (el.loginPassword) el.loginPassword.value = 'coop1234';
        showToast('Autofilled: Vikram Sen (Emergency #108)', 'success');
      });
    }

    // Login Action
    if (el.btnSubmitLogin) {
      el.btnSubmitLogin.addEventListener('click', () => {
        const username = el.loginUsername ? el.loginUsername.value.trim() : '';
        const password = el.loginPassword ? el.loginPassword.value.trim() : '';

        if (!username) {
          showToast('Please enter your mobile or username.', 'warning');
          return;
        }
        if (!password) {
          showToast('Please enter your password.', 'warning');
          return;
        }

        // Match against known workers or current registered worker
        if (username === state.preloadedWorkers.suresh.phone || username.toLowerCase().includes('suresh')) {
          loadWorkerProfile(state.preloadedWorkers.suresh);
        } else if (username === state.preloadedWorkers.vikram.phone || username.toLowerCase().includes('vikram')) {
          loadWorkerProfile(state.preloadedWorkers.vikram);
        } else {
          // Default to Ramesh or registered user
          if (username !== state.preloadedWorkers.ramesh.phone && username !== state.currentWorker.phone) {
            state.currentWorker.name = username;
          }
          applyWorkerToDashboard();
        }

        showScreen('dashboard');
        switchTab('home');
        showToast(`Welcome back, ${state.currentWorker.name}! Dispatch terminal online.`, 'success');
      });
    }

    // Forgot Password Trigger
    if (el.btnForgotPassword) {
      el.btnForgotPassword.addEventListener('click', () => {
        openModal('modal-forgot-pwd');
      });
    }

    if (el.linkGotoRegister) {
      el.linkGotoRegister.addEventListener('click', () => {
        showScreen('registration');
      });
    }

    if (el.btnLoginBack) {
      el.btnLoginBack.addEventListener('click', () => {
        showScreen('welcome');
      });
    }
  }

  function loadWorkerProfile(workerData) {
    state.currentWorker = { ...workerData };
    applyWorkerToDashboard();
  }

  function applyWorkerToDashboard() {
    if (el.dashWorkerName) el.dashWorkerName.innerHTML = `<span>${state.currentWorker.name}</span>`;
    if (el.dashWorkerBadge) {
      el.dashWorkerBadge.innerHTML = `<i data-lucide="shield-check" style="width: 12px; height: 12px;"></i><span>Verified Co-op Member #${state.currentWorker.memberId}</span>`;
    }
    if (el.dashWorkerAvatar) {
      el.dashWorkerAvatar.src = state.currentWorker.avatarUrl;
    }
    if (el.dashEarningsAmount) {
      el.dashEarningsAmount.textContent = `₹${state.currentWorker.earningsToday.toFixed(2)}`;
    }
    if (el.dashJobsCount) {
      el.dashJobsCount.textContent = `${state.currentWorker.completedTodayCount} Completed`;
    }

    // Update Profile Tab
    const profileAvatar = document.getElementById('profile-avatar-large');
    const profileName = document.getElementById('profile-name-large');
    const profileBadge = document.getElementById('profile-badge-pill');
    if (profileAvatar) profileAvatar.src = state.currentWorker.avatarUrl;
    if (profileName) profileName.textContent = state.currentWorker.name;
    if (profileBadge) profileBadge.textContent = `✓ Verified Co-op Member #${state.currentWorker.memberId}`;

    if (window.lucide) window.lucide.createIcons();
  }

  // ==============================================================
  // 4. WORKER DASHBOARD & AVAILABILITY TOGGLE
  // ==============================================================
  function setupDashboardFlow() {
    // MAIN TOGGLE: "AVAILABLE FOR JOBS"
    if (el.toggleAvailability) {
      el.toggleAvailability.addEventListener('change', (e) => {
        state.isAvailable = e.target.checked;
        updateAvailabilityUI(state.isAvailable);
      });
    }

    // Emergency Accept / Decline
    if (el.btnAcceptEmergency) {
      el.btnAcceptEmergency.addEventListener('click', () => {
        if (!state.isAvailable) {
          showToast('Turn ON availability toggle to accept new emergency requests.', 'warning');
          return;
        }

        // Accept emergency request
        state.currentWorker.earningsToday += 599;
        state.currentWorker.completedTodayCount += 1;
        applyWorkerToDashboard();

        if (el.activeEmergencyCard) {
          el.activeEmergencyCard.innerHTML = `
            <div style="background: var(--primary-green-light); border: 1.5px solid var(--primary-green); border-radius: var(--radius-md); padding: 14px; text-align: center;">
              <span style="font-size: 13px; font-weight: 800; color: var(--primary-green);">🚨 EMERGENCY DISPATCH ACCEPTED!</span>
              <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">You are dispatched to Deepa Krishnan (Indiranagar 100ft Rd). Siren navigation active.</p>
              <button class="btn-success" style="margin-top: 10px; width: 100%;" onclick="window.workerApp.openNavModal()">
                <i data-lucide="navigation" style="width: 14px; height: 14px;"></i>
                <span>Open Emergency GPS Route</span>
              </button>
            </div>
          `;
        }
        if (el.emergencyCountBadge) el.emergencyCountBadge.textContent = 'En Route';
        showToast('Emergency SOS accepted! Customer notified of your arrival in 8-12 mins.', 'emergency');
        if (window.lucide) window.lucide.createIcons();
      });
    }

    if (el.btnDeclineEmergency) {
      el.btnDeclineEmergency.addEventListener('click', () => {
        if (el.activeEmergencyCard) {
          el.activeEmergencyCard.style.display = 'none';
        }
        if (el.emergencyCountBadge) el.emergencyCountBadge.textContent = '0 Urgent';
        showToast('Emergency request rerouted to next nearest cooperative worker.', 'normal');
      });
    }

    // Active Job CP-8841 Actions
    if (el.btnCallCustomer) {
      el.btnCallCustomer.addEventListener('click', () => {
        callCustomer();
      });
    }

    if (el.btnNavCustomer) {
      el.btnNavCustomer.addEventListener('click', () => {
        openModal('modal-navigation');
      });
    }

    if (el.btnCompleteJobCp8841) {
      el.btnCompleteJobCp8841.addEventListener('click', () => {
        completeJobCp8841();
      });
    }
  }

  function updateAvailabilityUI(isAvailable) {
    const filterOnlinePill = document.getElementById('filter-online-pill');
    const filterOnlineText = document.getElementById('filter-online-text');

    if (isAvailable) {
      // Online State
      if (el.availabilityCard) {
        el.availabilityCard.className = 'availability-control-card online';
      }
      if (el.availabilityStatusText) {
        el.availabilityStatusText.className = 'online-text';
        el.availabilityStatusText.innerHTML = `
          <span class="live-radar-dot"></span>
          <span>ONLINE • Receiving Customer Requests</span>
        `;
      }
      if (el.dashStatusDot) {
        el.dashStatusDot.className = 'worker-status-dot';
      }
      if (el.offlineBanner) {
        el.offlineBanner.classList.remove('active');
      }
      if (filterOnlinePill && filterOnlineText) {
        filterOnlinePill.className = 'criteria-pill online';
        filterOnlineText.textContent = 'Online';
      }
      showToast('You are now ONLINE. Ready for customer requests.', 'success');
    } else {
      // Offline State
      if (el.availabilityCard) {
        el.availabilityCard.className = 'availability-control-card offline';
      }
      if (el.availabilityStatusText) {
        el.availabilityStatusText.className = 'offline-text';
        el.availabilityStatusText.innerHTML = `
          <span style="width: 8px; height: 8px; border-radius: 50%; background: #94A3B8; display: inline-block;"></span>
          <span>OFFLINE • Request Receiving Paused</span>
        `;
      }
      if (el.dashStatusDot) {
        el.dashStatusDot.className = 'worker-status-dot offline';
      }
      if (el.offlineBanner) {
        el.offlineBanner.classList.add('active');
      }
      if (filterOnlinePill && filterOnlineText) {
        filterOnlinePill.className = 'criteria-pill offline';
        filterOnlineText.textContent = 'Offline';
      }
      showToast('You are now OFFLINE. New requests will not be dispatched.', 'warning');
    }
  }

  function callCustomer() {
    showToast(`Calling customer P. Vishnu Vardhan (+91 98480 22338)...`, 'success');
  }

  function markArrived() {
    closeModal('modal-navigation');
    updateJobStatus('WORKER_ARRIVED');
  }

  function completeJobCp8841() {
    if (el.jobCardCp8841) {
      el.jobCardCp8841.style.borderLeftColor = 'var(--primary-green)';
      el.jobCardCp8841.innerHTML = `
        <div style="text-align: center; padding: 10px 0;">
          <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--primary-green-light); color: var(--primary-green); margin: 0 auto 8px; display: flex; align-items: center; justify-content: center;">
            <i data-lucide="check" style="width: 24px; height: 24px;"></i>
          </div>
          <h4 style="font-size: 15px; font-weight: 800; color: var(--primary-green);">Job CP-8841 Completed!</h4>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Customer: P. Vishnu Vardhan • ₹348 credited instantly.</p>
        </div>
      `;
    }

    state.currentWorker.earningsToday += 348;
    state.currentWorker.completedTodayCount += 1;
    applyWorkerToDashboard();

    if (el.todayJobsCountBadge) el.todayJobsCountBadge.textContent = '1 Remaining';
    showToast('Service completed! ₹348.00 added to Today\'s Earnings.', 'success');
    if (window.lucide) window.lucide.createIcons();
  }

  // ==============================================================
  // PART 2: MATCHING ENGINE & INCOMING REQUEST HANDLERS
  // ==============================================================

  function handleIncomingBookingRequest(data) {
    if (!data || !data.payload) return;
    const req = data.payload;
    state.lastIncomingRequest = req;

    // 1. Worker Availability Check
    if (!state.isAvailable) {
      showToast(`Incoming ${req.requestType} request ignored: You are currently OFFLINE.`, 'warning');
      return;
    }

    // 2. Worker Skill Category Matching
    const workerSkill = (state.currentWorker.category || 'Plumbing').toLowerCase();
    const reqCategory = (req.category || 'Plumbing').toLowerCase();
    const isEmergency = req.requestType === 'EMERGENCY';

    if (!isEmergency && !reqCategory.includes(workerSkill) && !workerSkill.includes(reqCategory)) {
      console.log(`[Matching Engine] Skipped request due to skill mismatch: Worker is ${workerSkill}, request is ${reqCategory}`);
      return;
    }

    // 3. Location Proximity Check (Sector Match)
    // Matches Indiranagar sector within current worker radius

    // 4. Route to specific incoming request view
    if (req.requestType === 'INSTANT') {
      showIncomingInstantModal(req);
    } else if (req.requestType === 'PRE-BOOKING') {
      showIncomingPrebookModal(req);
    } else if (req.requestType === 'EMERGENCY') {
      showIncomingEmergencyModal(req);
    }

    // Add or Update Card in Worker Jobs Screen
    addOrUpdateJobCard(req);
  }

  function showIncomingInstantModal(req) {
    state.currentModalJob = req;
    const sEl = document.getElementById('pop-instant-service');
    const idEl = document.getElementById('pop-instant-id');
    const lEl = document.getElementById('pop-instant-loc');
    const dEl = document.getElementById('pop-instant-dist');
    const tEl = document.getElementById('pop-instant-time');
    const pEl = document.getElementById('pop-instant-problem');

    if (sEl) sEl.textContent = req.service || 'Plumbing Leakage & Pipe Repair';
    if (idEl) idEl.textContent = `ID: #${req.bookingId || 'CP-9104'}`;
    if (lEl) lEl.textContent = req.customerLocation || 'Indiranagar 100ft Rd, Bengaluru';
    if (dEl) dEl.textContent = req.distance || '1.2 km away';
    if (tEl) tEl.textContent = req.requestTime || 'Just Now';
    if (pEl) pEl.textContent = req.problem || 'Tap & Mixer Leak • High pressure joint failure.';

    openModal('modal-incoming-instant');
    showToast(`⚡ New Instant Job request received! (ID #${req.bookingId})`, 'success');
    if (window.lucide) window.lucide.createIcons();
  }

  function showIncomingPrebookModal(req) {
    state.currentModalJob = req;
    const sEl = document.getElementById('pop-prebook-service');
    const idEl = document.getElementById('pop-prebook-id');
    const lEl = document.getElementById('pop-prebook-loc');
    const dtEl = document.getElementById('pop-prebook-date');
    const tmEl = document.getElementById('pop-prebook-time');
    const pEl = document.getElementById('pop-prebook-problem');

    if (sEl) sEl.textContent = req.service || 'Pipe Leakage & Joint Sealing';
    if (idEl) idEl.textContent = `ID: #${req.bookingId || 'CP-9208'}`;
    if (lEl) lEl.textContent = req.customerLocation || 'Indiranagar 100ft Rd, Bengaluru';
    if (dtEl) dtEl.textContent = req.scheduledDate || 'Tomorrow (24 Sep)';
    if (tmEl) tmEl.textContent = req.scheduledTime || '11:30 AM – 01:30 PM';
    if (pEl) pEl.textContent = req.problem || 'Concealed pipe joint seepage in bathroom wall.';

    openModal('modal-incoming-prebook');
    showToast(`📅 New Pre-Booking request received! (ID #${req.bookingId})`, 'success');
    if (window.lucide) window.lucide.createIcons();
  }

  function showIncomingEmergencyModal(req) {
    state.currentModalJob = req;
    const sEl = document.getElementById('pop-emergency-service');
    const idEl = document.getElementById('pop-emergency-id');
    const lEl = document.getElementById('pop-emergency-loc');
    const dEl = document.getElementById('pop-emergency-dist');
    const trEl = document.getElementById('pop-emergency-travel');
    const pEl = document.getElementById('pop-emergency-problem');

    if (sEl) sEl.textContent = req.service || 'Major Pipe Burst / Ceilings Flood';
    if (idEl) idEl.textContent = `ID: #${req.bookingId || 'SOS-5501'}`;
    if (lEl) lEl.textContent = req.customerLocation || 'Indiranagar 100ft Rd, Bengaluru';
    if (dEl) dEl.textContent = req.distance || '1.1 km away';
    if (trEl) trEl.textContent = req.estimatedTravelDistance || '1.1 km (8–12 mins drive)';
    if (pEl) pEl.textContent = req.problem || 'Main pipe connection fractured, flooding kitchen floor rapidly.';

    openModal('modal-incoming-emergency');
    showToast(`🚨 EMERGENCY JOB REQUEST received! (ID #${req.bookingId})`, 'emergency');
    if (window.lucide) window.lucide.createIcons();
  }

  function addOrUpdateJobCard(req) {
    const container = document.getElementById('worker-jobs-container');
    if (!container) return;

    const safeId = (req.bookingId || 'CP-9104').toLowerCase().replace(/[^a-z0-9]/g, '');
    let existingCard = document.getElementById(`job-card-${safeId}`);

    if (!existingCard) {
      existingCard = document.createElement('div');
      existingCard.className = `job-request-card ${req.requestType.toLowerCase().replace('-', '')}`;
      existingCard.id = `job-card-${safeId}`;
      existingCard.dataset.type = req.requestType.toLowerCase().replace('-', '');

      existingCard.innerHTML = `
        <div class="job-card-header-row">
          <div>
            <span class="badge-req-type ${req.requestType.toLowerCase().replace('-', '')}">
              ${req.requestType === 'INSTANT' ? '<i data-lucide="zap" style="width: 11px; height: 11px;"></i> INSTANT REQUEST' : ''}
              ${req.requestType === 'PRE-BOOKING' ? '<i data-lucide="calendar" style="width: 11px; height: 11px;"></i> PRE-BOOKING' : ''}
              ${req.requestType === 'EMERGENCY' ? '<i data-lucide="siren" style="width: 11px; height: 11px;"></i> EMERGENCY JOB REQUEST' : ''}
            </span>
            <h3 class="job-service-name" style="margin-top: 6px;">${req.service}</h3>
          </div>
          <span class="job-booking-id-tag">ID: #${req.bookingId}</span>
        </div>

        <div class="job-details-block">
          <div class="job-detail-line">
            <span>Customer Location:</span>
            <strong>${req.customerLocation}</strong>
          </div>
          <div class="job-detail-line">
            <span>Distance:</span>
            <strong style="color: var(--primary-blue);">${req.distance || '1.2 km'}</strong>
          </div>
          <div class="job-detail-line">
            <span>Time:</span>
            <strong>${req.requestTime || req.scheduledDate || 'Requested'}</strong>
          </div>
          <div style="margin-top: 4px; padding-top: 6px; border-top: 1px dashed var(--border-light);">
            <span style="font-size: 11px; color: var(--text-muted); display: block;">Problem Description:</span>
            <p class="job-problem-desc">${req.problem}</p>
          </div>
        </div>

        <div class="job-card-actions">
          <button class="btn-primary" onclick="window.workerApp.acceptJob('${req.bookingId}', '${req.requestType}')">
            <span>${req.requestType === 'EMERGENCY' ? 'ACCEPT EMERGENCY JOB' : 'ACCEPT JOB'}</span>
          </button>
          <button class="btn-secondary" onclick="window.workerApp.rejectJob('${req.bookingId}')">
            <span>REJECT</span>
          </button>
        </div>
      `;
      container.prepend(existingCard);
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function acceptCurrentModal(requestType) {
    if (state.currentModalJob) {
      acceptJob(state.currentModalJob.bookingId, requestType || state.currentModalJob.requestType);
    }
    closeModal('modal-incoming-instant');
    closeModal('modal-incoming-prebook');
    closeModal('modal-incoming-emergency');
  }

  // ==============================================================
  // ACCEPT & REJECT HANDLERS (Same Booking ID Synchronization)
  // ==============================================================

  function acceptJob(bookingId, requestType) {
    if (!state.isAvailable) {
      showToast('Turn ON "Available for Jobs" to accept new requests.', 'warning');
      return;
    }

    closeModal('modal-incoming-instant');
    closeModal('modal-incoming-prebook');
    closeModal('modal-incoming-emergency');

    const safeId = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const card = document.getElementById(`job-card-${safeId}`);

    if (requestType === 'INSTANT') {
      // Worker side changes to: "Job Assigned"
      if (card) {
        card.innerHTML = `
          <div style="background: var(--primary-green-light); border: 1.5px solid var(--primary-green); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="job-status-pill in-progress" style="background: var(--primary-green); color: #FFFFFF;">
                <i data-lucide="check" style="width: 12px; height: 12px;"></i> Job Assigned
              </span>
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Booking #${bookingId}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-top: 8px;">Plumbing Leakage & Pipe Repair</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Customer: P. Vishnu Vardhan • Indiranagar 100ft Rd</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(5, 150, 105, 0.2);">
              <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹348.00 Fixed</span>
              <div style="display: flex; gap: 6px;">
                <button class="btn-job-action nav" style="width: auto; padding: 6px 10px;" onclick="window.workerApp.openJobDetails('${bookingId}', 'INSTANT')">
                  <i data-lucide="file-text" style="width: 13px; height: 13px;"></i> Details
                </button>
                <button class="btn-job-action nav" style="width: auto; padding: 6px 10px;" onclick="window.workerApp.openNavModal()">
                  <i data-lucide="navigation" style="width: 13px; height: 13px;"></i> Route
                </button>
              </div>
            </div>
          </div>
        `;
      }

      state.currentWorker.earningsToday += 348;
      applyWorkerToDashboard();

      // Broadcast to Connected Customer App: Customer side changes to "Worker Assigned"
      broadcastMarketplace('WORKER_ACCEPTED_JOB', {
        bookingId: bookingId,
        requestType: 'INSTANT',
        workerName: state.currentWorker.name,
        workerId: state.currentWorker.memberId,
        workerPhone: state.currentWorker.phone
      });

      showToast(`Job Assigned! Customer side updated to "Worker Assigned" (ID #${bookingId}).`, 'success');

      // Seamlessly transition worker directly to Job Details Screen (Part 3)
      setTimeout(() => {
        openJobDetails(bookingId, 'INSTANT');
      }, 350);

    } else if (requestType === 'PRE-BOOKING') {
      // Worker side changes to: "Booking Accepted"
      if (card) {
        card.innerHTML = `
          <div style="background: #EEF2FF; border: 1.5px solid #C7D2FE; border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="job-status-pill scheduled" style="background: #4F46E5; color: #FFFFFF;">
                <i data-lucide="check" style="width: 12px; height: 12px;"></i> Booking Accepted
              </span>
              <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">Booking #${bookingId}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: var(--text-main); margin-top: 8px;">Pipe Leakage & Joint Sealing</h4>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">Scheduled for Tomorrow (24 Sep), 11:30 AM – 01:30 PM</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 8px; border-top: 1px solid rgba(79, 70, 229, 0.2);">
              <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹399.00 Fixed</span>
              <button class="btn-job-action nav" style="width: auto; padding: 6px 12px; background: #4F46E5; color: #FFFFFF;" onclick="window.workerApp.openJobDetails('${bookingId}', 'PRE-BOOKING')">
                <i data-lucide="file-text" style="width: 13px; height: 13px;"></i> View Details
              </button>
            </div>
          </div>
        `;
      }

      // Broadcast to Connected Customer App: Customer side changes to "Booking Reserved"
      broadcastMarketplace('WORKER_ACCEPTED_JOB', {
        bookingId: bookingId,
        requestType: 'PRE-BOOKING',
        workerName: state.currentWorker.name,
        workerId: state.currentWorker.memberId,
        workerPhone: state.currentWorker.phone
      });

      showToast(`Booking Accepted! Customer side updated to "Booking Reserved" (ID #${bookingId}).`, 'success');

      setTimeout(() => {
        openJobDetails(bookingId, 'PRE-BOOKING');
      }, 350);

    } else if (requestType === 'EMERGENCY') {
      // Worker side changes to: Emergency Worker Assigned / En Route
      if (card) {
        card.innerHTML = `
          <div style="background: var(--accent-red-light); border: 2px solid var(--accent-red); border-radius: var(--radius-md); padding: 14px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="emergency-pill">
                <i data-lucide="zap" style="width: 12px; height: 12px;"></i> EMERGENCY ACTIVE
              </span>
              <span style="font-size: 11px; font-weight: 800; color: var(--accent-red);">Booking #${bookingId}</span>
            </div>
            <h4 style="font-size: 14px; font-weight: 800; color: #991B1B; margin-top: 8px;">Major Pipe Burst / Ceilings Flood</h4>
            <p style="font-size: 12px; color: #7F1D1D; margin-top: 2px;">En route to Indiranagar 100ft Rd (ETA 8 mins)</p>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
              <span style="font-size: 14px; font-weight: 800; color: var(--primary-green);">₹599.00 Emergency Rate</span>
              <button class="btn-job-action nav" style="width: auto; padding: 6px 14px; background: var(--accent-red); color: #FFFFFF;" onclick="window.workerApp.openJobDetails('${bookingId}', 'EMERGENCY')">
                <i data-lucide="file-text" style="width: 14px; height: 14px;"></i> Details & Route
              </button>
            </div>
          </div>
        `;
      }

      state.currentWorker.earningsToday += 599;
      applyWorkerToDashboard();

      // Broadcast to Connected Customer App: Customer side changes to "Emergency Worker Assigned"
      broadcastMarketplace('WORKER_ACCEPTED_JOB', {
        bookingId: bookingId,
        requestType: 'EMERGENCY',
        workerName: state.currentWorker.name,
        workerId: state.currentWorker.memberId,
        workerPhone: state.currentWorker.phone
      });

      showToast(`🚨 Emergency Job Accepted! Customer side updated to "Emergency Worker Assigned" (ID #${bookingId}).`, 'emergency');

      setTimeout(() => {
        openJobDetails(bookingId, 'EMERGENCY');
      }, 350);
    }

    if (window.lucide) window.lucide.createIcons();
  }

  // Available nearby job card actions (Jobs tab)
  // These are separate from modal requests but use the same marketplace
  // acceptance/rejection path and Booking ID synchronization.
  function acceptAvailableJob(bookingId, service, customerName, address, price) {
    if (!state.isAvailable) {
      showToast('Turn ON "Available for Jobs" to accept new requests.', 'warning');
      return;
    }

    const safeId = String(bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const card = document.querySelector(`[onclick*="acceptAvailableJob('${bookingId}'"]`)?.closest('.job-request-card');

    if (card) {
      card.innerHTML = `
        <div style="background: var(--primary-green-light); border: 1.5px solid var(--primary-green); border-radius: var(--radius-md); padding: 14px;">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <span class="job-status-pill in-progress" style="background:var(--primary-green); color:#fff;">
              <i data-lucide="check" style="width:12px;height:12px;"></i> Job Accepted
            </span>
            <span style="font-size:11px;font-weight:700;color:var(--text-muted);">Booking #${bookingId}</span>
          </div>
          <h4 style="font-size:14px;font-weight:800;color:var(--text-main);margin-top:8px;">${service || 'Service Request'}</h4>
          <p style="font-size:12px;color:var(--text-muted);margin-top:2px;">Customer: ${customerName || 'Customer'} • ${address || 'Location shared'}</p>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:8px;border-top:1px solid rgba(5,150,105,.2);">
            <span style="font-size:14px;font-weight:800;color:var(--primary-green);">₹${Number(price || 0).toFixed(2)}</span>
            <button type="button" class="btn-job-action nav" style="width:auto;padding:7px 12px;" onclick="window.workerApp.openJobDetails('${bookingId}', 'INSTANT')">
              <i data-lucide="file-text" style="width:13px;height:13px;"></i> Details
            </button>
          </div>
        </div>`;
    }

    state.jobs.currentJobDetails = {
      ...state.jobs.currentJobDetails,
      bookingId: String(bookingId),
      requestType: 'INSTANT',
      service: service || 'Service Request',
      customerName: customerName || 'Customer',
      customerLocation: address || 'Location shared',
      price: Number(price || 0),
      status: 'JOB_ASSIGNED'
    };

    broadcastMarketplace('WORKER_ACCEPTED_JOB', {
      bookingId: String(bookingId),
      requestType: 'INSTANT',
      workerName: state.currentWorker.name,
      workerId: state.currentWorker.memberId,
      workerPhone: state.currentWorker.phone
    });

    showToast(`Job #${bookingId} accepted. Customer has been notified.`, 'success');
    if (window.lucide) window.lucide.createIcons();

    setTimeout(() => openJobDetails(String(bookingId), 'INSTANT'), 250);
  }

  function declineAvailableJob(bookingId) {
    const safeId = String(bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const card = document.querySelector(`[onclick*="declineAvailableJob('${bookingId}'"]`)?.closest('.job-request-card');
    if (card) {
      card.style.opacity = '0';
      card.style.transform = 'translateX(20px)';
      setTimeout(() => card.remove(), 180);
    }
    showToast(`Request #${bookingId} passed. It remains available to other cooperative workers.`, 'normal');
  }

  function rejectJob(bookingId) {
    closeModal('modal-incoming-instant');
    closeModal('modal-incoming-prebook');
    closeModal('modal-incoming-emergency');

    const safeId = (bookingId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const card = document.getElementById(`job-card-${safeId}`);
    if (card) {
      card.remove();
    }

    showToast(`Request #${bookingId} rejected. Forwarded to other cooperative members.`, 'normal');
  }

  // ==============================================================
  // PART 3: WORKER JOB DETAILS & CUSTOMER LOCATION LOGIC
  // ==============================================================

  function openJobDetails(bookingId, requestType) {
    const bId = bookingId || state.jobs.currentJobDetails.bookingId || 'CP-9104';
    const reqType = requestType || state.jobs.currentJobDetails.requestType || 'INSTANT';

    // Retrieve details from last incoming request or known presets
    let service = 'Plumbing Leakage & Pipe Repair';
    let problem = 'Tap & Mixer Leak • High pressure joint failure under main washbasin.';
    let customerName = 'P. Vishnu Vardhan';
    let customerPhone = '+91 98480 22338';
    let customerLocation = 'Indiranagar 100ft Rd, Bengaluru';
    let distance = '1.2 km away';
    let price = 348;
    let workerLocation = 'CMH Road Co-op Depot, Indiranagar';
    let estTravelTime = '12 mins';

    if (state.lastIncomingRequest && (state.lastIncomingRequest.bookingId === bId || bId === 'CP-9104')) {
      service = state.lastIncomingRequest.service || service;
      problem = state.lastIncomingRequest.problem || problem;
      customerName = state.lastIncomingRequest.customerName || customerName;
      customerPhone = state.lastIncomingRequest.customerPhone || customerPhone;
      customerLocation = state.lastIncomingRequest.customerLocation || customerLocation;
      distance = state.lastIncomingRequest.distance || distance;
      price = state.lastIncomingRequest.price || price;
    } else if (bId.includes('9208')) {
      service = 'Pipe Leakage & Joint Sealing';
      problem = 'Concealed pipe joint seepage in bathroom wall requiring sealant injection.';
      customerName = 'P. Vishnu Vardhan';
      customerLocation = 'Indiranagar 100ft Rd, Bengaluru';
      price = 399;
    } else if (bId.includes('5501') || bId.includes('SOS')) {
      service = 'Major Pipe Burst / Ceilings Flood';
      problem = 'Main pipe connection fractured, water flooding kitchen floor rapidly.';
      customerName = 'Deepa Krishnan';
      customerLocation = 'Indiranagar 100ft Rd, Bengaluru';
      distance = '1.1 km away';
      price = 599;
    }

    state.jobs.currentJobDetails = {
      bookingId: bId,
      requestType: reqType,
      service,
      problem,
      customerName,
      customerPhone,
      customerLocation,
      distance,
      workerLocation,
      estTravelTime,
      price,
      status: state.jobs.currentJobDetails.status || 'JOB_ASSIGNED'
    };

    renderJobDetailsUI();
    showScreen('jobDetails');
  }

  function renderJobDetailsUI() {
    const job = state.jobs.currentJobDetails;

    const sName = document.getElementById('jd-service-name');
    const bIdTag = document.getElementById('jd-booking-id-tag');
    const reqTypeBadge = document.getElementById('jd-request-type-badge');
    const reqTypeText = document.getElementById('jd-request-type-text');
    const payout = document.getElementById('jd-payout-amount');
    const cName = document.getElementById('jd-customer-name');
    const cLoc = document.getElementById('jd-customer-location');
    const cDist = document.getElementById('jd-distance');
    const cPhone = document.getElementById('jd-customer-phone');
    const pDesc = document.getElementById('jd-problem-desc');
    const cAvatar = document.getElementById('jd-customer-avatar');

    if (sName) sName.textContent = job.service;
    if (bIdTag) bIdTag.textContent = `ID: #${job.bookingId}`;
    if (reqTypeBadge && reqTypeText) {
      reqTypeBadge.className = `badge-req-type ${job.requestType.toLowerCase().replace('-', '')}`;
      reqTypeText.textContent = job.requestType;
    }
    if (payout) payout.textContent = `₹${job.price}.00`;
    if (cName) cName.textContent = job.customerName;
    if (cLoc) cLoc.textContent = job.customerLocation;
    if (cDist) cDist.textContent = job.distance;
    if (cPhone) cPhone.textContent = job.customerPhone;
    if (pDesc) pDesc.textContent = job.problem;
    if (cAvatar) {
      const initials = (job.customerName || 'PV').split(' ').map(w => w[0]).join('').substring(0, 2);
      cAvatar.textContent = initials;
    }

    updateProgressionStages(job.status);
  }

  function updateProgressionStages(status) {
    const stageAssigned = document.getElementById('jd-stage-assigned');
    const stageOntheway = document.getElementById('jd-stage-ontheway');
    const stageArrived = document.getElementById('jd-stage-arrived');
    const bannerCustomerVerified = document.getElementById('jd-customer-verified-banner');
    const stageInspection = document.getElementById('jd-stage-inspection');
    const stageEstimateReview = document.getElementById('jd-stage-estimate-review');
    const stageWaitingApproval = document.getElementById('jd-stage-waiting-approval');
    const stageEstimateAccepted = document.getElementById('jd-stage-estimate-accepted');
    const stageEstimateRejected = document.getElementById('jd-stage-estimate-rejected');
    const stageInprogress = document.getElementById('jd-stage-inprogress');
    const stageCompletionConfirm = document.getElementById('jd-stage-completion-confirm');
    const stageWaitingPayment = document.getElementById('jd-stage-waiting-payment');
    const stageJobClosed = document.getElementById('jd-stage-job-closed');

    const statusText = document.getElementById('jd-status-text');
    const headerPill = document.getElementById('jd-header-status-pill');

    const step1 = document.getElementById('tracker-step-1');
    const step2 = document.getElementById('tracker-step-2');
    const step3 = document.getElementById('tracker-step-3');
    const step4 = document.getElementById('tracker-step-4');
    const step5 = document.getElementById('tracker-step-5');
    const line1 = document.getElementById('tracker-line-1');
    const line2 = document.getElementById('tracker-line-2');
    const line3 = document.getElementById('tracker-line-3');
    const line4 = document.getElementById('tracker-line-4');

    // Hide all stage boxes
    const allStages = [
      stageAssigned, stageOntheway, stageArrived, stageInspection,
      stageEstimateReview, stageWaitingApproval, stageEstimateAccepted,
      stageEstimateRejected, stageInprogress, stageCompletionConfirm,
      stageWaitingPayment, stageJobClosed
    ];
    allStages.forEach(s => { if (s) s.style.display = 'none'; });

    // Reset tracker steps
    const steps = [step1, step2, step3, step4, step5];
    const lines = [line1, line2, line3, line4];
    steps.forEach(st => { if (st) st.className = 'tracker-step'; });
    lines.forEach(ln => { if (ln) ln.className = 'tracker-line'; });

    if (status === 'JOB_ASSIGNED') {
      if (stageAssigned) stageAssigned.style.display = 'block';
      if (statusText) statusText.textContent = 'JOB ASSIGNED';
      if (headerPill) {
        headerPill.textContent = 'JOB ASSIGNED';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      if (step1) step1.className = 'tracker-step active';
    } else if (status === 'ON_THE_WAY') {
      if (stageOntheway) stageOntheway.style.display = 'block';
      if (statusText) statusText.textContent = 'On the Way';
      if (headerPill) {
        headerPill.textContent = 'On the Way';
        headerPill.style.background = 'var(--primary-blue-light)';
        headerPill.style.color = 'var(--primary-blue)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line active';
      if (step2) step2.className = 'tracker-step active';
    } else if (status === 'WORKER_ARRIVED') {
      if (stageArrived) stageArrived.style.display = 'block';
      if (bannerCustomerVerified) bannerCustomerVerified.style.display = 'none';
      if (statusText) statusText.textContent = 'Customer Verification';
      if (headerPill) {
        headerPill.textContent = 'Customer Verification';
        headerPill.style.background = '#FEF3C7';
        headerPill.style.color = '#B45309';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line active';
      if (step3) step3.className = 'tracker-step active';
    } else if (status === 'CUSTOMER_VERIFIED') {
      if (stageArrived) stageArrived.style.display = 'block';
      if (bannerCustomerVerified) bannerCustomerVerified.style.display = 'block';
      if (statusText) statusText.textContent = 'Customer Verified';
      if (headerPill) {
        headerPill.textContent = 'Customer Verified';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line active';
      if (step4) step4.className = 'tracker-step active';
    } else if (status === 'INSPECTION') {
      if (stageInspection) stageInspection.style.display = 'block';
      if (statusText) statusText.textContent = 'Inspect Customer Problem';
      if (headerPill) {
        headerPill.textContent = 'Inspection';
        headerPill.style.background = 'var(--primary-blue-light)';
        headerPill.style.color = 'var(--primary-blue)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line active';
      if (step4) step4.className = 'tracker-step active';
    } else if (status === 'ESTIMATE_CREATED') {
      if (stageEstimateReview) stageEstimateReview.style.display = 'block';
      if (statusText) statusText.textContent = 'Estimate Created';
      if (headerPill) {
        headerPill.textContent = 'Estimate Ready';
        headerPill.style.background = 'var(--primary-blue-light)';
        headerPill.style.color = 'var(--primary-blue)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line active';
      if (step4) step4.className = 'tracker-step active';
    } else if (status === 'WAITING_APPROVAL') {
      if (stageWaitingApproval) stageWaitingApproval.style.display = 'block';
      if (statusText) statusText.textContent = 'Waiting for Customer Approval';
      if (headerPill) {
        headerPill.textContent = 'Awaiting Approval';
        headerPill.style.background = '#EFF6FF';
        headerPill.style.color = '#2563EB';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line active';
      if (step4) step4.className = 'tracker-step active';
    } else if (status === 'ESTIMATE_ACCEPTED') {
      if (stageEstimateAccepted) stageEstimateAccepted.style.display = 'block';
      if (statusText) statusText.textContent = 'Estimate Accepted';
      if (headerPill) {
        headerPill.textContent = 'Estimate Accepted';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line completed';
      if (step4) step4.className = 'tracker-step completed';
      if (line4) line4.className = 'tracker-line active';
      if (step5) step5.className = 'tracker-step active';
    } else if (status === 'ESTIMATE_REJECTED') {
      if (stageEstimateRejected) stageEstimateRejected.style.display = 'block';
      if (statusText) statusText.textContent = 'Estimate Rejected';
      if (headerPill) {
        headerPill.textContent = 'Estimate Rejected';
        headerPill.style.background = '#FFE4E6';
        headerPill.style.color = '#E11D48';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line completed';
      if (step4) step4.className = 'tracker-step completed';
    } else if (status === 'WORK_IN_PROGRESS' || status === 'JOB_IN_PROGRESS') {
      if (stageInprogress) stageInprogress.style.display = 'block';
      if (statusText) statusText.textContent = 'WORK IN PROGRESS';
      if (headerPill) {
        headerPill.textContent = 'WORK IN PROGRESS';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      if (step1) step1.className = 'tracker-step completed';
      if (line1) line1.className = 'tracker-line completed';
      if (step2) step2.className = 'tracker-step completed';
      if (line2) line2.className = 'tracker-line completed';
      if (step3) step3.className = 'tracker-step completed';
      if (line3) line3.className = 'tracker-line completed';
      if (step4) step4.className = 'tracker-step completed';
      if (line4) line4.className = 'tracker-line active';
      if (step5) step5.className = 'tracker-step active';
    } else if (status === 'COMPLETION_CONFIRM') {
      if (stageCompletionConfirm) stageCompletionConfirm.style.display = 'block';
      if (statusText) statusText.textContent = 'Confirm Work Completion';
      if (headerPill) {
        headerPill.textContent = 'Sign-Off';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      if (step5) step5.className = 'tracker-step active';
    } else if (status === 'WAITING_CUSTOMER_PAYMENT') {
      if (stageWaitingPayment) stageWaitingPayment.style.display = 'block';
      if (statusText) statusText.textContent = 'Waiting for Customer Payment';
      if (headerPill) {
        headerPill.textContent = 'Awaiting Payment';
        headerPill.style.background = '#FEF3C7';
        headerPill.style.color = '#B45309';
      }
      if (step5) step5.className = 'tracker-step active';
    } else if (status === 'JOB_CLOSED') {
      if (stageJobClosed) stageJobClosed.style.display = 'block';
      if (statusText) statusText.textContent = 'Job Closed • Settled';
      if (headerPill) {
        headerPill.textContent = 'Closed & Settled';
        headerPill.style.background = 'var(--primary-green-light)';
        headerPill.style.color = 'var(--primary-green)';
      }
      steps.forEach(st => { if (st) st.className = 'tracker-step completed'; });
      lines.forEach(ln => { if (ln) ln.className = 'tracker-line completed'; });
    }

    if (window.lucide) window.lucide.createIcons();
  }

  function updateJobStatus(newStatus) {
    state.jobs.currentJobDetails.status = newStatus;
    updateProgressionStages(newStatus);

    const job = state.jobs.currentJobDetails;

    if (newStatus === 'ON_THE_WAY') {
      broadcastMarketplace('JOB_STATUS_UPDATED', {
        status: 'ON_THE_WAY',
        bookingId: job.bookingId,
        workerName: state.currentWorker.name,
        workerLocation: 'En route from CMH Road (0.8 km away)',
        eta: '8 - 10 mins'
      });
      showToast('Status updated: "On the Way". Customer app notified.', 'success');
    } else if (newStatus === 'WORKER_ARRIVED') {
      broadcastMarketplace('JOB_STATUS_UPDATED', {
        status: 'WORKER_ARRIVED',
        bookingId: job.bookingId,
        workerName: state.currentWorker.name,
        otp: '4092'
      });
      showToast('Status updated: "I HAVE ARRIVED". Customer app notified.', 'success');
    }
  }

  // Part 4 Requirement 1: OTP Verification & Customer Verified
  function verifyArrivalOtp() {
    const o1 = document.getElementById('w-otp-1')?.value || '';
    const o2 = document.getElementById('w-otp-2')?.value || '';
    const o3 = document.getElementById('w-otp-3')?.value || '';
    const o4 = document.getElementById('w-otp-4')?.value || '';
    const entered = `${o1}${o2}${o3}${o4}`.trim();

    if (entered === '4092') {
      state.jobs.currentJobDetails.status = 'CUSTOMER_VERIFIED';
      updateProgressionStages('CUSTOMER_VERIFIED');

      broadcastMarketplace('OTP_VERIFIED', {
        bookingId: state.jobs.currentJobDetails.bookingId,
        otp: '4092',
        workerName: state.currentWorker.name
      });

      showToast('✓ OTP 4092 Verified! Customer Verified.', 'success');

      // Automatically advance to Inspect Customer Problem after brief visual notice
      setTimeout(() => {
        openServiceInspection();
      }, 850);
    } else {
      showToast('Invalid OTP! Ask customer for their 4-digit code (Hint: 4092).', 'warning');
    }
  }

  function autofillWorkerOtp() {
    const o1 = document.getElementById('w-otp-1');
    const o2 = document.getElementById('w-otp-2');
    const o3 = document.getElementById('w-otp-3');
    const o4 = document.getElementById('w-otp-4');
    if (o1) o1.value = '4';
    if (o2) o2.value = '0';
    if (o3) o3.value = '9';
    if (o4) o4.value = '2';
    verifyArrivalOtp();
  }

  // Part 4 Requirement 2: Service Inspection
  function openServiceInspection() {
    state.jobs.currentJobDetails.status = 'INSPECTION';
    updateProgressionStages('INSPECTION');
    showToast('Doorstep inspection opened: "Inspect Customer Problem".', 'normal');
  }

  function calculateEstimateTotal() {
    const mCost = parseFloat(document.getElementById('worker-est-materials-cost')?.value) || 0;
    const lCost = parseFloat(document.getElementById('worker-est-labour-cost')?.value) || 0;
    const total = mCost + lCost;
    state.jobs.currentEstimate.materialsCost = mCost;
    state.jobs.currentEstimate.labourCost = lCost;
    state.jobs.currentEstimate.total = total;
    return total;
  }

  // Part 4 Requirement 3: Create & Send Estimate
  function createEstimate() {
    const problem = document.getElementById('worker-est-problem')?.value.trim() || 'Plumbing Leak Repair';
    const matDesc = document.getElementById('worker-est-materials-desc')?.value.trim() || 'Ceramic cartridge replacement + Teflon seal pack';
    const mCost = parseFloat(document.getElementById('worker-est-materials-cost')?.value) || 280;
    const labDesc = document.getElementById('worker-est-labour-desc')?.value.trim() || 'Precision plumbing disassembly, valve reseat & pressure test';
    const lCost = parseFloat(document.getElementById('worker-est-labour-cost')?.value) || 199;
    const notes = document.getElementById('worker-est-notes')?.value.trim() || 'Includes 90-day cooperative workmanship warranty & high pressure testing.';
    const total = mCost + lCost;

    state.jobs.currentEstimate = {
      problem,
      materials: matDesc,
      materialsCost: mCost,
      labour: labDesc,
      labourCost: lCost,
      total,
      notes,
      status: 'created'
    };

    // Update Estimate Breakdown Display (Materials: ₹___, Labour: ₹___, Total: ₹___)
    const pDisp = document.getElementById('we-disp-problem');
    const mDisp = document.getElementById('we-disp-materials');
    const mDescDisp = document.getElementById('we-disp-materials-desc');
    const lDisp = document.getElementById('we-disp-labour');
    const lDescDisp = document.getElementById('we-disp-labour-desc');
    const tDisp = document.getElementById('we-disp-total');
    const waitTot = document.getElementById('we-waiting-total');

    if (pDisp) pDisp.textContent = problem;
    if (mDisp) mDisp.textContent = `₹${mCost.toFixed(2)}`;
    if (mDescDisp) mDescDisp.textContent = matDesc;
    if (lDisp) lDisp.textContent = `₹${lCost.toFixed(2)}`;
    if (lDescDisp) lDescDisp.textContent = labDesc;
    if (tDisp) tDisp.textContent = `₹${total.toFixed(2)}`;
    if (waitTot) waitTot.textContent = `₹${total.toFixed(2)}`;

    state.jobs.currentJobDetails.price = total;
    const payoutEl = document.getElementById('jd-payout-amount');
    if (payoutEl) payoutEl.textContent = `₹${total.toFixed(2)}`;

    state.jobs.currentJobDetails.status = 'ESTIMATE_CREATED';
    updateProgressionStages('ESTIMATE_CREATED');
    showToast(`Estimate ready: Materials ₹${mCost.toFixed(2)}, Labour ₹${lCost.toFixed(2)}, Total ₹${total.toFixed(2)}.`, 'success');
  }

  function sendEstimate() {
    const est = state.jobs.currentEstimate;
    state.jobs.currentJobDetails.status = 'WAITING_APPROVAL';
    updateProgressionStages('WAITING_APPROVAL');

    broadcastMarketplace('ESTIMATE_SENT', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      problem: est.problem,
      materials: est.materials,
      materialsCost: est.materialsCost,
      labour: est.labour,
      labourCost: est.labourCost,
      total: est.total,
      notes: est.notes
    });

    showToast('Estimate dispatched! Status: "Waiting for Customer Approval".', 'success');
  }

  // ==============================================================
  // PART 5: WORK PROGRESS AND COMPLETION CONTROLLERS
  // ==============================================================

  // Part 5 Requirement 1: Work In Progress (Worker Screen & Customer Screen)
  function startWork() {
    const now = new Date();
    const startTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.jobs.currentJobDetails.startTime = startTimeStr;

    // Populate required 6 fields on Worker Screen:
    // Customer, Service, Problem, Materials, Estimated amount, Start time
    const wpCustomer = document.getElementById('wp-customer-name');
    const wpService = document.getElementById('wp-service-name');
    const wpProblem = document.getElementById('wp-problem-desc');
    const wpMaterials = document.getElementById('wp-materials-desc');
    const wpAmount = document.getElementById('wp-estimated-amount');
    const wpStart = document.getElementById('wp-start-time');

    if (wpCustomer) wpCustomer.textContent = state.jobs.currentJobDetails.customerName || 'P. Vishnu Vardhan';
    if (wpService) wpService.textContent = state.jobs.currentJobDetails.service || 'Plumbing Leakage & Pipe Repair';
    if (wpProblem) wpProblem.textContent = state.jobs.currentEstimate.problem || state.jobs.currentJobDetails.problem;
    if (wpMaterials) wpMaterials.textContent = state.jobs.currentEstimate.materials;
    if (wpAmount) wpAmount.textContent = `₹${state.jobs.currentEstimate.total.toFixed(2)}`;
    if (wpStart) wpStart.textContent = startTimeStr;

    state.jobs.currentJobDetails.status = 'WORK_IN_PROGRESS';
    updateProgressionStages('WORK_IN_PROGRESS');

    // Broadcast to Customer App: "Work in Progress"
    broadcastMarketplace('WORK_STARTED', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      workerName: state.currentWorker.name,
      workerId: state.currentWorker.memberId,
      service: state.jobs.currentJobDetails.service,
      problem: state.jobs.currentEstimate.problem,
      materials: state.jobs.currentEstimate.materials,
      estimatedAmount: state.jobs.currentEstimate.total,
      startTime: startTimeStr,
      workStatus: 'Work in Progress • Active Doorstep Repair'
    });

    showToast('Work Started! Screen: "WORK IN PROGRESS". Customer app notified.', 'success');
  }

  // Part 5 Requirement 2: Complete Work (Worker button: "MARK WORK COMPLETED")
  function markWorkCompleted() {
    // Populate Before completion confirmation fields:
    // Work completed confirmation, Materials used, Final amount
    const ccMat = document.getElementById('cc-materials-used');
    const ccAmount = document.getElementById('cc-final-amount');

    if (ccMat) ccMat.textContent = state.jobs.currentEstimate.materials;
    if (ccAmount) ccAmount.textContent = `₹${state.jobs.currentEstimate.total.toFixed(2)}`;

    state.jobs.currentJobDetails.status = 'COMPLETION_CONFIRM';
    updateProgressionStages('COMPLETION_CONFIRM');
    showToast('Review work completion details and click "COMPLETE JOB".', 'normal');
  }

  function cancelCompletionConfirm() {
    state.jobs.currentJobDetails.status = 'WORK_IN_PROGRESS';
    updateProgressionStages('WORK_IN_PROGRESS');
  }

  // Part 5 Requirement 2 & 4: Button: "COMPLETE JOB" -> "Waiting for Customer Payment"
  function confirmCompleteJob() {
    const finalAmount = state.jobs.currentEstimate.total || 479;

    // Update pending amount on worker payment wait card
    const wpPending = document.getElementById('wp-pending-amount');
    if (wpPending) wpPending.textContent = `₹${finalAmount.toFixed(2)}`;

    // Set worker status to Waiting for Customer Payment (DO NOT close job or credit yet)
    state.jobs.currentJobDetails.status = 'WAITING_CUSTOMER_PAYMENT';
    updateProgressionStages('WAITING_CUSTOMER_PAYMENT');

    // Broadcast to Customer App: "Work Completed"
    broadcastMarketplace('WORK_COMPLETED', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      service: state.jobs.currentJobDetails.service,
      workerName: state.currentWorker.name,
      workerId: state.currentWorker.memberId,
      finalAmount: finalAmount,
      materialsUsed: state.jobs.currentEstimate.materials,
      workStatus: 'Work Completed'
    });

    showToast('Work completed! Status: "Waiting for Customer Payment".', 'success');
  }

  // Part 5 Requirement 4: Final Settlement on Payment Success
  function handleCustomerPaymentSuccess(payload) {
    const amount = payload?.amount || state.jobs.currentEstimate.total || 479.00;

    // Credit earnings to worker today
    state.currentWorker.earningsToday += amount;
    state.currentWorker.completedTodayCount += 1;
    applyWorkerToDashboard();

    const jcCredited = document.getElementById('jc-credited-amount');
    if (jcCredited) jcCredited.textContent = `₹${amount.toFixed(2)}`;

    state.jobs.currentJobDetails.status = 'JOB_CLOSED';
    updateProgressionStages('JOB_CLOSED');

    showToast(`✓ Payment of ₹${amount.toFixed(2)} verified! Job Closed & Settled.`, 'success');
  }

  function simulateCustomerPayment() {
    const amount = state.jobs.currentEstimate.total || 479.00;
    handleCustomerPaymentSuccess({ amount });
    broadcastMarketplace('PAYMENT_COMPLETED', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      amount: amount,
      paymentMethod: 'UPI (GPay / PhonePe / Paytm)'
    });
  }

  function returnToDashboardAfterJobClosed() {
    showScreen('dashboard');
    switchTab('home');
  }

  // Part 4 Requirement 5: Visit Fee Completion (Customer Rejects)
  function completeVisitFeeJob() {
    const visitFee = 149.00;
    state.currentWorker.earningsToday += visitFee;
    state.currentWorker.completedTodayCount += 1;
    applyWorkerToDashboard();

    showToast(`Visit diagnostic fee ₹${visitFee.toFixed(2)} credited to worker earnings.`, 'success');
    showScreen('dashboard');
    switchTab('home');
  }

  // Simulation Helpers for quick testing directly inside Worker App
  function simulateCustomerAccept() {
    handleIncomingCrossAppEvent({
      action: 'CUSTOMER_ESTIMATE_ACCEPTED',
      payload: {
        bookingId: state.jobs.currentJobDetails.bookingId,
        total: state.jobs.currentEstimate.total
      }
    });
    broadcastMarketplace('CUSTOMER_ESTIMATE_ACCEPTED', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      total: state.jobs.currentEstimate.total
    });
  }

  function simulateCustomerReject() {
    handleIncomingCrossAppEvent({
      action: 'CUSTOMER_ESTIMATE_REJECTED',
      payload: {
        bookingId: state.jobs.currentJobDetails.bookingId,
        visitFee: 149
      }
    });
    broadcastMarketplace('CUSTOMER_ESTIMATE_REJECTED', {
      bookingId: state.jobs.currentJobDetails.bookingId,
      visitFee: 149
    });
  }

  function completeActiveJobDetails() {
    const job = state.jobs.currentJobDetails;
    const finalAmount = state.jobs.currentEstimate.total || job.price || 479;
    state.currentWorker.earningsToday += finalAmount;
    state.currentWorker.completedTodayCount += 1;
    applyWorkerToDashboard();

    showToast(`Job #${job.bookingId} marked complete! ₹${finalAmount.toFixed(2)} credited to earnings.`, 'success');
    showScreen('dashboard');
    switchTab('home');
  }

  function openCustomerLocation() {
    const job = state.jobs.currentJobDetails;
    const clWorkerLoc = document.getElementById('cl-worker-loc');
    const clCustLoc = document.getElementById('cl-customer-loc');
    const clDist = document.getElementById('cl-distance');
    const clTime = document.getElementById('cl-est-time');

    if (clWorkerLoc) clWorkerLoc.textContent = job.workerLocation || 'CMH Road Co-op Depot, Indiranagar';
    if (clCustLoc) clCustLoc.textContent = job.customerLocation || 'Indiranagar 100ft Rd, Bengaluru';
    if (clDist) clDist.textContent = job.distance || '1.2 km away';
    if (clTime) clTime.textContent = job.estTravelTime || '12 mins';

    openModal('modal-customer-location');
  }

  function goBackFromJobDetails() {
    showScreen('dashboard');
    switchTab('jobs');
  }

  function sendPasswordResetOtp() {
    closeModal('modal-forgot-pwd');
    showToast('A 4-digit password reset OTP has been sent via SMS.', 'success');
  }

  function logout() {
    state.isAvailable = false;
    updateAvailabilityUI(false);
    showScreen('welcome');
    showToast('Logged out of Worker dispatch terminal.', 'normal');
  }

  // Cross-App Incoming Event Listener from Customer App (Synchronized)
  function handleIncomingCrossAppEvent(data) {
    if (!data || !data.action) return;

    if (data.action === 'NEW_BOOKING_REQUEST') {
      handleIncomingBookingRequest(data);
    } else if (data.action === 'CUSTOMER_ESTIMATE_ACCEPTED') {
      state.jobs.currentJobDetails.status = 'ESTIMATE_ACCEPTED';
      updateProgressionStages('ESTIMATE_ACCEPTED');
      showToast('Estimate Accepted! Customer selected "ACCEPT & START WORK".', 'success');
    } else if (data.action === 'CUSTOMER_ESTIMATE_REJECTED') {
      state.jobs.currentJobDetails.status = 'ESTIMATE_REJECTED';
      updateProgressionStages('ESTIMATE_REJECTED');
      showToast('Customer selected: "REJECT / PAY VISIT FEE". Standard fee ₹149.00.', 'emergency');
    } else if (data.action === 'VISIT_FEE_PAID') {
      const pill = document.getElementById('worker-visit-fee-status-pill');
      if (pill) {
        pill.className = 'fee-status-badge settled';
        pill.innerHTML = '<i data-lucide="check" style="width: 12px; height: 12px;"></i><span>Settled via Customer Digital Payment (Paid)</span>';
        if (window.lucide) window.lucide.createIcons();
      }
      showToast('✓ ₹149.00 Visit Fee received via customer digital payment.', 'success');
    } else if (data.action === 'PAYMENT_COMPLETED') {
      handleCustomerPaymentSuccess(data.payload);
    }
  }

  if (marketplaceChannel) {
    marketplaceChannel.onmessage = (e) => {
      handleIncomingCrossAppEvent(e.data);
    };
  }

  window.addEventListener('storage', (e) => {
    if (e.key === 'coop_marketplace_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleIncomingCrossAppEvent(parsed);
      } catch (err) {}
    }
  });

  // Presentation & Event Wiring
  function setupEventListeners() {
    // Welcome Buttons
    if (el.btnWelcomeRegister) {
      el.btnWelcomeRegister.addEventListener('click', () => {
        showScreen('registration');
      });
    }

    if (el.btnWelcomeLogin) {
      el.btnWelcomeLogin.addEventListener('click', () => {
        showScreen('login');
      });
    }

    // Bottom Navigation
    el.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        if (tab) switchTab(tab);
      });
    });

    // Jobs Tab Filter Pills
    const filterPills = document.querySelectorAll('#jobs-filter-pills .tab-filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filterType = pill.dataset.filter || 'all';
        const jobCards = document.querySelectorAll('#worker-jobs-container .job-request-card, #worker-jobs-container #assigned-jobs-section');
        
        jobCards.forEach(card => {
          const cardType = card.dataset.type || '';
          if (filterType === 'all') {
            card.style.display = '';
          } else if (cardType === filterType) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Customer App Simulator Buttons (1-Tap Test Dispatch)
    const btnSimInstant = document.getElementById('btn-sim-instant');
    const btnSimPrebook = document.getElementById('btn-sim-prebook');
    const btnSimEmergency = document.getElementById('btn-sim-emergency');

    if (btnSimInstant) {
      btnSimInstant.addEventListener('click', () => {
        handleIncomingBookingRequest({
          payload: {
            bookingId: 'CP-' + Math.floor(1000 + Math.random() * 9000),
            requestType: 'INSTANT',
            service: 'Plumbing Leakage & Pipe Repair',
            category: 'Plumbing',
            customerLocation: 'Indiranagar 100ft Rd, Bengaluru',
            distance: '1.2 km away',
            problem: 'Tap & Mixer Leak • High pressure joint failure under main washbasin.',
            requestTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            customerName: 'P. Vishnu Vardhan'
          }
        });
      });
    }

    if (btnSimPrebook) {
      btnSimPrebook.addEventListener('click', () => {
        handleIncomingBookingRequest({
          payload: {
            bookingId: 'CP-' + Math.floor(1000 + Math.random() * 9000),
            requestType: 'PRE-BOOKING',
            service: 'Pipe Leakage & Joint Sealing',
            category: 'Plumbing',
            customerLocation: 'Indiranagar 100ft Rd, Bengaluru',
            scheduledDate: 'Tomorrow (24 Sep)',
            scheduledTime: '11:30 AM – 01:30 PM',
            distance: '1.2 km away',
            problem: 'Concealed pipe joint seepage in bathroom wall requiring sealant injection.',
            customerName: 'P. Vishnu Vardhan'
          }
        });
      });
    }

    if (btnSimEmergency) {
      btnSimEmergency.addEventListener('click', () => {
        handleIncomingBookingRequest({
          payload: {
            bookingId: 'SOS-' + Math.floor(1000 + Math.random() * 9000),
            requestType: 'EMERGENCY',
            service: 'Major Pipe Burst / Ceilings Flood',
            category: 'Plumbing',
            customerLocation: 'Indiranagar 100ft Rd, Bengaluru',
            distance: '1.1 km away',
            estimatedTravelDistance: '1.1 km (8–12 mins drive)',
            problem: 'Main pipe connection fractured, flooding kitchen floor rapidly.',
            customerName: 'Deepa Krishnan'
          }
        });
      });
    }

    // Desktop Toolbar
    if (el.btnToggleFullscreen) {
      el.btnToggleFullscreen.addEventListener('click', () => {
        document.body.classList.toggle('fullscreen-mode');
        showToast(
          document.body.classList.contains('fullscreen-mode')
            ? 'Switched to Full Viewport Mode'
            : 'Switched to Mobile Phone Bezel Frame',
          'normal'
        );
      });
    }

    if (el.btnResetDemo) {
      el.btnResetDemo.addEventListener('click', () => {
        state.isAvailable = true;
        if (el.toggleAvailability) el.toggleAvailability.checked = true;
        updateAvailabilityUI(true);
        loadWorkerProfile(state.preloadedWorkers.ramesh);
        showScreen('welcome');
        showToast('Worker App reset to Welcome Screen.', 'normal');
      });
    }

    if (el.btnWorkerNotifs) {
      el.btnWorkerNotifs.addEventListener('click', () => {
        showToast('Cooperative Notice: Annual Patronage bonus ₹180 accrued to your wallet.', 'success');
      });
    }

    // Modal background click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });
  }

  // Setup OTP inputs navigation in Worker App
  function setupWorkerOtpInputs() {
    const boxes = [
      document.getElementById('w-otp-1'),
      document.getElementById('w-otp-2'),
      document.getElementById('w-otp-3'),
      document.getElementById('w-otp-4')
    ];

    boxes.forEach((box, idx) => {
      if (!box) return;
      box.addEventListener('input', (e) => {
        const val = e.target.value;
        if (val.length >= 1) {
          box.value = val[val.length - 1];
          if (idx < boxes.length - 1 && boxes[idx + 1]) {
            boxes[idx + 1].focus();
          }
        }
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && idx > 0 && boxes[idx - 1]) {
          boxes[idx - 1].focus();
        } else if (e.key === 'Enter') {
          verifyArrivalOtp();
        }
      });
    });
  }

  // Initialization
  function init() {
    cacheDom();
    startClock();
    setupRegistrationFlow();
    setupVerificationFlow();
    setupLoginFlow();
    setupDashboardFlow();
    setupWorkerOtpInputs();
    setupEventListeners();
    applyWorkerToDashboard();

    // Expose global methods for inline HTML onclick handlers
    window.workerApp = {
      showToast,
      showScreen,
      switchTab,
      openModal,
      closeModal,
      callCustomer,
      markArrived,
      completeJobCp8841,
      acceptJob,
      rejectJob,
      acceptAvailableJob,
      declineAvailableJob,
      acceptCurrentModal,
      sendPasswordResetOtp,
      openNavModal: () => openModal('modal-navigation'),
      logout,
      // Part 3 methods
      openJobDetails,
      goBackFromJobDetails,
      openCustomerLocation,
      updateJobStatus,
      verifyArrivalOtp,
      autofillWorkerOtp,
      completeActiveJobDetails,
      // Part 4 Estimate & Flow methods
      openServiceInspection,
      calculateEstimateTotal,
      createEstimate,
      sendEstimate,
      startWork,
      completeVisitFeeJob,
      simulateCustomerAccept,
      simulateCustomerReject,
      // Part 5 Work Progress & Completion methods
      markWorkCompleted,
      cancelCompletionConfirm,
      confirmCompleteJob,
      simulateCustomerPayment,
      returnToDashboardAfterJobClosed
    };

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
