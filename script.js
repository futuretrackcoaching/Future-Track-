// @ts-nocheck
/**
 * FUTURE TRACK COACHING - MAIN SCRIPT
 * Light Theme Engine, Dynamic Fetch Routing, Multi-Question Quiz Builder & Collapsible Admin Sections
 */

window.GOOGLE_SCRIPT_API = "https://script.google.com/macros/s/AKfycbxkBqenfi3gCXIfOlEJow_RZD5VPmLESvxbhaOR8bEOBSQdQxg5kXM0YA4SG42MOqHx/exec";
window.DRIVE_FOLDER_ID = "1DYNtX_PDGNC-QT7eZIhiMWNHxm1ZFA0n";

window.currentAdminPin = null;
window.selectedUserClass = localStorage.getItem('ft_user_class') || null;
window.currentTheme = localStorage.getItem('ft_theme') || 'light';
window.pageCache = {};

// --- GLOBAL DATA STORES ---
window.teachersData = JSON.parse(localStorage.getItem('ft_teachers')) || [
  { id: "t1", name: "Anuj Tyagi Sir", role: "Founder & Head Educator", initials: "AT", bio: "CS (Company Secretary), B.Com, LLB. Specializes in CBSE board accountancy presentation, step-marking formats, and conceptual clarity." }
];

window.studyMaterialsData = JSON.parse(localStorage.getItem('ft_materials')) || [
  { id: "m1", title: "Cash Flow Statement Notes", subject: "Accountancy", classGroup: "12th Commerce", type: "PDF Notes", link: `https://drive.google.com/drive/folders/${window.DRIVE_FOLDER_ID}` },
  { id: "m2", title: "National Income Accounting", subject: "Economics", classGroup: "12th Commerce", type: "Revision Sheet", link: `https://drive.google.com/drive/folders/${window.DRIVE_FOLDER_ID}` },
  { id: "m3", title: "Algebra Foundation Guide", subject: "Mathematics", classGroup: "Class 9th", type: "Worksheet", link: `https://drive.google.com/drive/folders/${window.DRIVE_FOLDER_ID}` }
];

window.publishedResultPdfs = JSON.parse(localStorage.getItem('ft_results')) || [
  { id: "r1", testName: "Accountancy Mock Test", classGroup: "12th Commerce", batch: "12C-A", date: "Oct 25, 2026", remarks: "Average Score: 78/100. Step marks awarded.", pdfUrl: `https://drive.google.com/drive/folders/${window.DRIVE_FOLDER_ID}` }
];

window.upcomingTestsList = JSON.parse(localStorage.getItem('ft_tests')) || [
  { id: "ts1", subject: "Accountancy - Debentures", classGroup: "12th Commerce", date: "2026-11-15", time: "05:00 PM - 06:30 PM", syllabus: "Issue of Debentures for Consideration other than cash & terms of redemption", status: "Upcoming" }
];

window.studentsRosterData = JSON.parse(localStorage.getItem('ft_students')) || [
  { id: "s1", fullName: "Aarav Gupta", classGroup: "12th Commerce", contact: "+91 98111 22334", dateAdded: "2026-10-28" }
];

window.activeQuizzesList = JSON.parse(localStorage.getItem('ft_quizzes')) || [
  {
    id: "QZ_1",
    title: "Shares & Debentures Fundamentals",
    subject: "Accountancy",
    classGroup: "12th Commerce",
    teacherName: "Anuj Tyagi Sir",
    createdAt: "Nov 01, 2026",
    marksPerQuestion: 1,
    questions: [
      { q: "What is the maximum permissible discount on reissue of forfeited shares?", options: { A: "10% of nominal value", B: "Amount forfeited on such shares", C: "5% of issue price", D: "No discount allowed" }, correct: "B" },
      { q: "Balance left in Forfeited Shares Account after reissue is transferred to:", options: { A: "General Reserve", B: "Profit & Loss A/c", C: "Capital Reserve", D: "Securities Premium" }, correct: "C" },
      { q: "Securities Premium cannot be utilized for which of the following purposes?", options: { A: "Issue of fully paid bonus shares", B: "Writing off preliminary expenses", C: "Payment of dividend to shareholders", D: "Buy-back of own shares" }, correct: "C" }
    ],
    submissions: [
      { studentName: "Rohan Verma", marksEarned: 3, totalMarks: 3, percentage: 100, attemptedAt: "Nov 01, 2026 - 06:30 PM" },
      { studentName: "Meera Sen", marksEarned: 2, totalMarks: 3, percentage: 67, attemptedAt: "Nov 01, 2026 - 07:15 PM" }
    ]
  }
];

window.saveAllToStorage = function() {
  localStorage.setItem('ft_teachers', JSON.stringify(window.teachersData));
  localStorage.setItem('ft_materials', JSON.stringify(window.studyMaterialsData));
  localStorage.setItem('ft_results', JSON.stringify(window.publishedResultPdfs));
  localStorage.setItem('ft_tests', JSON.stringify(window.upcomingTestsList));
  localStorage.setItem('ft_students', JSON.stringify(window.studentsRosterData));
  localStorage.setItem('ft_quizzes', JSON.stringify(window.activeQuizzesList));
};

// --- THEME ENGINE ---
window.applyTheme = function(theme) {
  window.currentTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ft_theme', theme);
  const iconEl = document.getElementById('themeToggleIcon');
  if (iconEl) iconEl.textContent = theme === 'light' ? '🌙' : '☀️';
};

window.toggleTheme = function() {
  const newTheme = window.currentTheme === 'dark' ? 'light' : 'dark';
  window.applyTheme(newTheme);
  window.showToast(newTheme === 'light' ? 'Ivory Light Mode Activated' : 'Velvet Espresso Dark Mode Activated');
};

// --- FETCH ROUTER ---
window.switchPage = async function(pageKey) {
  document.querySelectorAll('.desktop-nav .tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeTab = document.getElementById(`tab-${pageKey}`);
  if (activeTab) activeTab.classList.add('active');

  const mobileNav = document.getElementById('mobileNavMenu');
  if (mobileNav) {
    mobileNav.classList.add('hidden');
    mobileNav.style.display = 'none';
  }

  const appRoot = document.getElementById('appRoot');
  if (!appRoot) return;

  try {
    if (!window.pageCache[pageKey]) {
      const response = await fetch(`pages/${pageKey}.html`);
      if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
      window.pageCache[pageKey] = await response.text();
    }
    appRoot.innerHTML = window.pageCache[pageKey];
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const headerBrand = document.getElementById('headerBrand');
    if (headerBrand) {
      if (pageKey === 'home' && window.scrollY < 150) {
        headerBrand.classList.remove('header-brand-visible');
      } else {
        headerBrand.classList.add('header-brand-visible');
      }
    }

    setTimeout(() => {
      window.initLoadedPage(pageKey);
    }, 20);
  } catch (err) {
    console.error("Routing error:", err);
    appRoot.innerHTML = `<div class="card text-center text-muted" style="padding: 30px;">
      Failed to load view "pages/${pageKey}.html". Please make sure your local web server is running.
    </div>`;
  }
};

window.initLoadedPage = function(pageKey) {
  if (pageKey === 'home') {
    window.initHeroScrollCollapse();
    window.renderHomeTeachers();
  } else if (pageKey === 'materials') {
    window.renderStudyMaterials();
  } else if (pageKey === 'results') {
    window.renderResultPdfs();
  } else if (pageKey === 'tests') {
    window.renderUpcomingTests();
  } else if (pageKey === 'quizzes') {
    window.renderQuizzesList();
  } else if (pageKey === 'admin') {
    window.populateAdminTeacherDropdown();
    if (window.currentAdminPin) {
      document.getElementById('adminLockScreen')?.classList.add('hidden');
      document.getElementById('adminDashboardView')?.classList.remove('hidden');
      window.switchAdminSection('quizzes');
    }
  }

  if (window.selectedUserClass) {
    window.updatePortalForSelectedClass();
  }
};

// --- CLASS GATEWAY ---
window.openClassPickerModal = function() { 
  const modal = document.getElementById('classPickerModal');
  if (modal) modal.classList.remove('hidden');
};

window.closeClassPickerModal = function() { 
  const modal = document.getElementById('classPickerModal');
  if (modal) modal.classList.add('hidden');
};

window.setUserClass = function(cls) {
  window.selectedUserClass = cls;
  localStorage.setItem('ft_user_class', cls);
  window.closeClassPickerModal();
  window.updatePortalForSelectedClass();
  window.showToast(`Portal customized for ${cls}`);
};

window.updatePortalForSelectedClass = function() {
  const lbl = document.getElementById('currentSelectedClassLabel');
  if (lbl) lbl.textContent = window.selectedUserClass;
  if (document.getElementById('materialsGridContainer')) window.renderStudyMaterials();
  if (document.getElementById('activeTestsContainer')) window.renderUpcomingTests();
  if (document.getElementById('quizSelectorView')) window.renderQuizzesList();
  if (document.getElementById('resultPdfCardsContainer')) window.renderResultPdfs();
};

// --- UI UTILITIES & MOBILE MENU ---
window.showToast = function(msg) {
  const t = document.getElementById('toastBox');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 2800);
};

window.toggleMobileNav = function() { 
  const menu = document.getElementById('mobileNavMenu');
  if (menu) {
    if (menu.classList.contains('hidden')) {
      menu.classList.remove('hidden');
      menu.style.display = 'flex';
    } else {
      menu.classList.add('hidden');
      menu.style.display = 'none';
    }
  }
};

window.initHeroScrollCollapse = function() {
  const heroSplash = document.getElementById('heroSplash');
  const headerBrand = document.getElementById('headerBrand');
  if (!heroSplash || !headerBrand) return;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 150) {
      headerBrand.classList.add('header-brand-visible');
    } else {
      headerBrand.classList.remove('header-brand-visible');
    }

    if (scrollY <= 0) {
      heroSplash.style.opacity = '1';
      heroSplash.style.transform = 'scale(1) translateY(0)';
    } else if (scrollY < 240) {
      const p = scrollY / 240;
      heroSplash.style.opacity = (1 - p).toFixed(2);
      heroSplash.style.transform = `scale(${(1 - p * 0.12).toFixed(3)}) translateY(${-(scrollY * 0.35).toFixed(1)}px)`;
    } else {
      heroSplash.style.opacity = '0';
    }
  }, { passive: true });
};

// --- PUBLIC VIEW RENDERERS ---
window.renderHomeTeachers = function() {
  const container = document.getElementById('homeTeachersContainer');
  if (!container || !window.teachersData) return;
  const additional = window.teachersData.slice(1);
  if (!additional.length) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = additional.map(t => `
    <div class="card flex flex-col gap-3">
      <div class="flex items-center gap-3">
        <div class="avatar-circle serif shrink-0" style="width: 50px; height: 50px; font-size: 18px;">${t.initials}</div>
        <div>
          <span class="badge badge-navy">${t.role}</span>
          <h4 class="serif font-bold text-base" style="margin-top: 4px;">${t.name}</h4>
        </div>
      </div>
      <p class="text-xs text-secondary" style="line-height: 1.6;">${t.bio}</p>
    </div>
  `).join('');
};

window.renderStudyMaterials = function() {
  const container = document.getElementById('materialsGridContainer');
  if (!container) return;
  const filtered = window.studyMaterialsData.filter(m => 
    !window.selectedUserClass || window.selectedUserClass === 'All Classes' || m.classGroup.toLowerCase() === window.selectedUserClass.toLowerCase()
  );
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="card text-center text-muted" style="grid-column: 1 / -1; padding: 24px;">No materials found for ${window.selectedUserClass || 'selected class'}.</div>`;
    return;
  }
  
  container.innerHTML = filtered.map(item => `
    <div class="card flex flex-col justify-between gap-3">
      <div class="flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="badge badge-navy">${item.classGroup}</span>
          <span class="text-xs text-muted font-bold">${item.subject}</span>
        </div>
        <h4 class="serif font-bold text-base">${item.title}</h4>
      </div>
      <div class="flex justify-between items-center border-t-subtle" style="padding-top: 10px;">
        <span class="text-xs text-muted">${item.type || 'PDF Document'}</span>
        <a href="${item.link}" target="_blank" class="btn btn-outline" style="padding: 8px 16px; font-size: 12px;">Open in Drive</a>
      </div>
    </div>
  `).join('');
};

window.filterMaterialsByClass = function(cls, btn) {
  window.selectedUserClass = cls === 'all' ? 'All Classes' : cls;
  document.querySelectorAll('#materialsFilterGroup .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.renderStudyMaterials();
};

window.renderResultPdfs = function() {
  const container = document.getElementById('resultPdfCardsContainer');
  if (!container) return;
  const filtered = window.publishedResultPdfs.filter(r => 
    !window.selectedUserClass || window.selectedUserClass === 'All Classes' || r.classGroup.toLowerCase() === window.selectedUserClass.toLowerCase()
  );

  if (filtered.length === 0) {
    container.innerHTML = `<div class="card text-center text-muted" style="grid-column: 1 / -1; padding: 24px;">No scorecards published for this class.</div>`;
    return;
  }
  
  container.innerHTML = filtered.map(item => `
    <div class="card flex flex-col justify-between gap-3">
      <div>
        <div class="flex justify-between items-center">
          <span class="badge badge-terracotta">Scorecard</span>
          <span class="text-xs text-muted">${item.date}</span>
        </div>
        <h4 class="serif font-bold text-base" style="margin-top: 6px;">${item.testName}</h4>
        <p class="text-xs text-secondary" style="margin-top: 4px;">${item.remarks}</p>
      </div>
      <div class="flex justify-between items-center border-t-subtle" style="padding-top: 10px;">
        <span class="text-xs text-muted">${item.classGroup} (${item.batch})</span>
        <a href="${item.pdfUrl}" target="_blank" class="btn btn-navy" style="padding: 8px 16px; font-size: 12px;">Download PDF</a>
      </div>
    </div>
  `).join('');
};

window.filterResultPdfs = function(cls, btn) {
  window.selectedUserClass = cls === 'all' ? 'All Classes' : cls;
  document.querySelectorAll('#resultsFilterGroup .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.renderResultPdfs();
};

window.renderUpcomingTests = function() {
  const activeBox = document.getElementById('activeTestsContainer');
  const completedBox = document.getElementById('completedTestsContainer');
  const badgeCount = document.getElementById('activeTestCount');
  if (!activeBox || !completedBox) return;

  const activeTests = window.upcomingTestsList.filter(t => 
    t.status !== "Completed" && (!window.selectedUserClass || window.selectedUserClass === 'All Classes' || t.classGroup.toLowerCase() === window.selectedUserClass.toLowerCase())
  );
  const completedTests = window.upcomingTestsList.filter(t => 
    t.status === "Completed" && (!window.selectedUserClass || window.selectedUserClass === 'All Classes' || t.classGroup.toLowerCase() === window.selectedUserClass.toLowerCase())
  );

  if (badgeCount) badgeCount.textContent = activeTests.length;

  activeBox.innerHTML = activeTests.length === 0 
    ? `<div class="card text-center text-muted text-xs" style="padding: 20px;">No upcoming tests scheduled.</div>` 
    : activeTests.map(t => `
      <div class="card flex flex-col md-flex-row justify-between items-start md-flex items-center gap-3">
        <div>
          <div class="flex items-center gap-2" style="margin-bottom: 4px;">
            <span class="badge badge-navy">${t.classGroup}</span>
            <span class="text-xs text-muted">📅 ${t.date} | ⏰ ${t.time}</span>
          </div>
          <h4 class="serif font-bold text-base">${t.subject}</h4>
          <div class="text-xs text-secondary" style="margin-top: 4px;"><strong>Syllabus:</strong> ${t.syllabus}</div>
        </div>
        <button type="button" onclick="window.showToast('Reminder logged for ${t.subject}')" class="btn btn-navy shrink-0" style="padding: 10px 18px; font-size: 13px;">Set Alert</button>
      </div>
    `).join('');

  completedBox.innerHTML = completedTests.length === 0 
    ? `<div class="text-xs text-muted text-center" style="padding: 12px;">No completed tests archived yet.</div>` 
    : completedTests.map(t => `
      <div class="card-canvas flex justify-between items-center" style="opacity: 0.85;">
        <div>
          <span class="badge badge-navy" style="font-size: 10px;">${t.classGroup}</span>
          <h5 class="serif font-bold text-sm" style="margin-top: 2px;">${t.subject}</h5>
        </div>
        <span class="text-xs text-muted">Evaluated</span>
      </div>
    `).join('');
};

// --- QUIZZES LIST & PLAYER ---
window.currentQuiz = null;
window.currentQuestionIndex = 0;
window.userQuizScore = 0;
window.selectedOption = null;

window.renderQuizzesList = function() {
  const container = document.getElementById('quizSelectorView');
  if (!container) return;
  const filtered = window.activeQuizzesList.filter(q => 
    !window.selectedUserClass || window.selectedUserClass === 'All Classes' || q.classGroup.toLowerCase() === window.selectedUserClass.toLowerCase()
  );
  
  if (filtered.length === 0) {
    container.innerHTML = `<div class="card text-center text-muted" style="padding: 24px;">No quizzes available for this stream.</div>`;
    return;
  }
  
  container.innerHTML = filtered.map(qz => {
    const totalPossibleMarks = (qz.questions || []).length * (qz.marksPerQuestion || 1);
    const submissions = qz.submissions || [];
    const sortedSubmissions = [...submissions].sort((a, b) => b.marksEarned - a.marksEarned);

    return `
      <div class="card flex flex-col gap-4">
        <div class="flex flex-col md-flex-row justify-between items-start md-flex items-center gap-3 border-b-subtle" style="padding-bottom: 14px;">
          <div>
            <div class="flex items-center gap-2 flex-wrap" style="margin-bottom: 4px;">
              <span class="badge badge-navy">${qz.classGroup}</span>
              <span class="badge badge-terracotta">${qz.subject || 'Commerce'}</span>
              <span class="text-xs text-muted">Curated by: <strong>${qz.teacherName || 'Faculty'}</strong></span>
            </div>
            <h3 class="serif font-bold text-xl">${qz.title}</h3>
            <p class="text-xs text-muted" style="margin-top: 2px;">Total Questions: ${qz.questions.length} • Maximum Marks: ${totalPossibleMarks}</p>
          </div>
          <button type="button" onclick="window.startQuizPlayer('${qz.id}')" class="btn btn-navy shrink-0" style="padding: 12px 24px;">
            Attempt Quiz 🚀
          </button>
        </div>

        <div class="card-canvas flex flex-col gap-3">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <span class="badge badge-green" style="font-size: 10px;">Live Leaderboard</span>
              <h4 class="serif font-bold text-sm">Attempted Submissions (${sortedSubmissions.length})</h4>
            </div>
            <span class="text-xs text-muted">Auto-updated after every attempt</span>
          </div>

          ${sortedSubmissions.length === 0 ? `
            <div class="text-center text-muted text-xs" style="padding: 16px 8px;">
              No students have attempted this quiz yet. Be the first to secure top marks!
            </div>
          ` : `
            <div style="overflow-x: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-gold-subtle); color: var(--gold-champagne);">
                    <th style="padding: 8px 10px;">Rank</th>
                    <th style="padding: 8px 10px;">Student Name</th>
                    <th style="padding: 8px 10px;">Marks</th>
                    <th style="padding: 8px 10px;">Score %</th>
                    <th style="padding: 8px 10px;">Submitted On</th>
                  </tr>
                </thead>
                <tbody>
                  ${sortedSubmissions.map((sub, idx) => `
                    <tr style="border-bottom: 1px solid var(--border-glass-light);">
                      <td style="padding: 8px 10px; font-weight: 700; color: ${idx === 0 ? 'var(--gold-champagne)' : 'inherit'};">
                        ${idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                      </td>
                      <td style="padding: 8px 10px; font-weight: 600;">${sub.studentName}</td>
                      <td style="padding: 8px 10px; font-weight: 700; color: var(--gold-champagne);">${sub.marksEarned} / ${sub.totalMarks}</td>
                      <td style="padding: 8px 10px;"><span class="badge ${sub.percentage >= 80 ? 'badge-green' : 'badge-navy'}" style="font-size: 10px; padding: 2px 6px;">${sub.percentage}%</span></td>
                      <td style="padding: 8px 10px; color: var(--text-muted); font-size: 11px;">${sub.attemptedAt}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
};

window.filterQuizzesByClass = function(cls, btn) {
  window.selectedUserClass = cls === 'all' ? 'All Classes' : cls;
  document.querySelectorAll('#quizzesFilterGroup .filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  window.renderQuizzesList();
};

window.startQuizPlayer = function(id) {
  window.currentQuiz = window.activeQuizzesList.find(q => q.id === id);
  if (!window.currentQuiz || !window.currentQuiz.questions || !window.currentQuiz.questions.length) {
    window.showToast("This quiz does not have any questions yet.");
    return;
  }
  window.currentQuestionIndex = 0;
  window.userQuizScore = 0;
  window.selectedOption = null;

  document.getElementById('quizSelectorView')?.classList.add('hidden');
  document.getElementById('quizResultView')?.classList.add('hidden');
  document.getElementById('quizPlayerView')?.classList.remove('hidden');
  
  document.getElementById('quizActiveTitle').textContent = window.currentQuiz.title;
  document.getElementById('quizActiveBadge').textContent = window.currentQuiz.classGroup;
  document.getElementById('quizActiveAuthor').textContent = `Prepared by: ${window.currentQuiz.teacherName || 'Faculty'}`;
  
  const storedName = localStorage.getItem('ft_student_name');
  const nameInput = document.getElementById('quizParticipantName');
  if (nameInput && storedName) nameInput.value = storedName;

  window.displayCurrentQuestion();
};

window.displayCurrentQuestion = function() {
  const qObj = window.currentQuiz.questions[window.currentQuestionIndex];
  window.selectedOption = null;
  document.getElementById('btnNextQuizQuestion').disabled = true;
  document.getElementById('quizQuestionCounter').textContent = `Question ${window.currentQuestionIndex + 1} of ${window.currentQuiz.questions.length}`;
  document.getElementById('quizScoreTracker').textContent = `Worth: ${window.currentQuiz.marksPerQuestion || 1} Mark`;
  document.getElementById('quizQuestionText').textContent = qObj.q;

  document.getElementById('quizOptionsContainer').innerHTML = ['A', 'B', 'C', 'D'].map(opt => `
    <button type="button" onclick="window.selectQuizOption('${opt}', this)" class="btn btn-outline" style="text-align: left; padding: 12px 18px; width: 100%; justify-content: flex-start;">
      <strong style="color: var(--gold-champagne); margin-right: 8px;">${opt}.</strong> <span>${qObj.options[opt]}</span>
    </button>
  `).join('');
};

window.selectQuizOption = function(opt, btn) {
  window.selectedOption = opt;
  document.querySelectorAll('#quizOptionsContainer button').forEach(b => {
    b.style.borderColor = 'var(--border-gold-subtle)';
    b.style.background = 'var(--btn-outline-bg)';
  });
  btn.style.borderColor = 'var(--gold-champagne)';
  btn.style.background = 'rgba(212, 175, 55, 0.22)';
  document.getElementById('btnNextQuizQuestion').disabled = false;
};

window.goToNextQuizQuestion = function() {
  if (window.selectedOption === window.currentQuiz.questions[window.currentQuestionIndex].correct) {
    window.userQuizScore += (window.currentQuiz.marksPerQuestion || 1);
  }
  window.currentQuestionIndex++;
  if (window.currentQuestionIndex < window.currentQuiz.questions.length) {
    window.displayCurrentQuestion();
  } else {
    window.finishQuiz();
  }
};

window.finishQuiz = function() {
  const total = window.currentQuiz.questions.length * (window.currentQuiz.marksPerQuestion || 1);
  const nameInput = document.getElementById('quizParticipantName');
  const studentName = nameInput?.value.trim() || 'Anonymous Student';
  localStorage.setItem('ft_student_name', studentName);

  const percentage = Math.round((window.userQuizScore / total) * 100);
  const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) + ' - ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newSubmission = {
    studentName,
    marksEarned: window.userQuizScore,
    totalMarks: total,
    percentage,
    attemptedAt: timestamp
  };

  if (!window.currentQuiz.submissions) {
    window.currentQuiz.submissions = [];
  }
  window.currentQuiz.submissions.push(newSubmission);

  window.saveAllToStorage();

  if (window.GOOGLE_SCRIPT_API && !window.GOOGLE_SCRIPT_API.includes('EXAMPLE')) {
    fetch(window.GOOGLE_SCRIPT_API, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'submitQuizResult',
        quizId: window.currentQuiz.id,
        quizTitle: window.currentQuiz.title,
        teacherName: window.currentQuiz.teacherName,
        classGroup: window.currentQuiz.classGroup,
        studentName,
        marksEarned: window.userQuizScore,
        totalMarks: total,
        percentage,
        timestamp
      })
    }).catch(err => console.log('Google Script Sync skipped or offline'));
  }

  document.getElementById('quizPlayerView')?.classList.add('hidden');
  document.getElementById('quizResultView')?.classList.remove('hidden');
  document.getElementById('quizFinalScore').textContent = `${window.userQuizScore} / ${total} Marks (${percentage}%)`;
  document.getElementById('quizFeedbackMessage').textContent = `Excellent effort, ${studentName}! Your performance is recorded on this quiz's leaderboard.`;
  window.showToast("Marks recorded & saved to leaderboard!");
};

window.exitQuizPlayer = function() {
  document.getElementById('quizPlayerView')?.classList.add('hidden');
  document.getElementById('quizResultView')?.classList.add('hidden');
  document.getElementById('quizSelectorView')?.classList.remove('hidden');
  window.renderQuizzesList();
};

// --- ADMIN VERIFICATION & SUB-SECTIONS ---
window.verifyAdminPin = async function() {
  const pinInput = document.getElementById('adminPinInput');
  const enteredPin = pinInput?.value.trim();
  if (!enteredPin) {
    window.showToast("Enter PIN to proceed.");
    return;
  }

  window.showToast("Verifying master access...");
  try {
    const response = await fetch(window.GOOGLE_SCRIPT_API + "?action=getAdminPin");
    const data = await response.json();
    const serverPin = data.adminPin || "2026";
    if (enteredPin === serverPin) {
      window.unlockAdminDashboard(enteredPin);
    } else {
      window.showToast("Invalid credentials.");
    }
  } catch (error) {
    if (enteredPin === "2026") {
      window.unlockAdminDashboard(enteredPin);
    } else {
      window.showToast("Invalid credentials.");
    }
  }
};

window.unlockAdminDashboard = function(pin) {
  window.currentAdminPin = pin;
  document.getElementById('adminLockScreen')?.classList.add('hidden');
  document.getElementById('adminDashboardView')?.classList.remove('hidden');
  window.showToast("Faculty Console unlocked.");
  window.switchAdminSection('quizzes');
};

window.lockAdminPortal = function() {
  window.currentAdminPin = null;
  document.getElementById('adminDashboardView')?.classList.add('hidden');
  document.getElementById('adminLockScreen')?.classList.remove('hidden');
  const pinInput = document.getElementById('adminPinInput');
  if (pinInput) pinInput.value = '';
  window.showToast("Session locked.");
};

window.populateAdminTeacherDropdown = function() {
  const sel = document.getElementById('quizAuthorTeacher');
  if (!sel) return;
  sel.innerHTML = window.teachersData.map(t => `<option value="${t.name}">${t.name} (${t.role})</option>`).join('');
};

window.switchAdminSection = function(section) {
  ['materials', 'tests', 'quizzes', 'teachers', 'students'].forEach(s => {
    const secEl = document.getElementById(`admSection-${s}`);
    const btnEl = document.getElementById(`adm-btn-${s}`);
    if (secEl) secEl.classList.add('hidden');
    if (btnEl) btnEl.classList.remove('active');
  });

  const activeSec = document.getElementById(`admSection-${section}`);
  const activeBtn = document.getElementById(`adm-btn-${section}`);
  if (activeSec) activeSec.classList.remove('hidden');
  if (activeBtn) activeBtn.classList.add('active');

  if (section === 'quizzes') {
    window.populateAdminTeacherDropdown();
    window.renderAdminQuizBank();
  }
  if (section === 'materials') window.renderAdminMaterials();
  if (section === 'tests') window.renderAdminTests();
  if (section === 'teachers') window.renderAdminTeachers();
  if (section === 'students') window.renderAdminStudents();
};

// --- COLLAPSIBLE ADMIN TOGGLE HELPER ---
window.toggleAdminCollapse = function(collapseId, btnEl) {
  const el = document.getElementById(collapseId);
  if (!el) return;
  const isHidden = el.classList.contains('hidden');
  if (isHidden) {
    el.classList.remove('hidden');
    if (btnEl) btnEl.textContent = 'Hide [ − ]';
  } else {
    el.classList.add('hidden');
    if (btnEl) btnEl.textContent = 'Expand [ + ]';
  }
};

// --- MULTI-QUESTION STEP-BY-STEP QUIZ BUILDER WIZARD ---
window.adminQuizDraft = {
  teacherName: '',
  classGroup: '12th Commerce',
  subject: '',
  title: '',
  marksPerQuestion: 1,
  totalTarget: 5,
  currentStep: 1,
  questions: []
};

window.initiateQuizWizard = function(e) {
  e.preventDefault();
  const teacher = document.getElementById('quizAuthorTeacher').value;
  const cls = document.getElementById('quizClassSelect').value;
  const subject = document.getElementById('quizSubjectField').value.trim();
  const title = document.getElementById('quizSubjectTitle').value.trim();
  const count = parseInt(document.getElementById('quizTotalCountInput').value, 10) || 1;
  const marks = parseInt(document.getElementById('quizMarksPerQ').value, 10) || 1;

  if (count < 1) {
    window.showToast("Please enter at least 1 question.");
    return;
  }

  window.adminQuizDraft = {
    teacherName: teacher,
    classGroup: cls,
    subject: subject,
    title: title,
    marksPerQuestion: marks,
    totalTarget: count,
    currentStep: 1,
    questions: []
  };

  document.getElementById('quizSetupMetaForm').classList.add('hidden');
  document.getElementById('quizWizardEditor').classList.remove('hidden');
  window.renderWizardQuestionForm();
};

window.renderWizardQuestionForm = function() {
  const draft = window.adminQuizDraft;
  const step = draft.currentStep;
  const total = draft.totalTarget;

  document.getElementById('wizardStepIndicator').textContent = `Question ${step} of ${total}`;
  document.getElementById('wizardSubjectHeading').textContent = `${draft.title} (${draft.subject})`;

  const existingQ = draft.questions[step - 1];
  document.getElementById('wizardQPrompt').value = existingQ ? existingQ.q : '';
  document.getElementById('wizardOptA').value = existingQ ? existingQ.options.A : '';
  document.getElementById('wizardOptB').value = existingQ ? existingQ.options.B : '';
  document.getElementById('wizardOptC').value = existingQ ? existingQ.options.C : '';
  document.getElementById('wizardOptD').value = existingQ ? existingQ.options.D : '';
  document.getElementById('wizardCorrectOpt').value = existingQ ? existingQ.correct : 'A';

  const prevBtn = document.getElementById('wizardPrevBtn');
  const nextBtn = document.getElementById('wizardNextBtn');

  if (step === 1) {
    prevBtn.classList.add('hidden');
  } else {
    prevBtn.classList.remove('hidden');
  }

  if (step === total) {
    nextBtn.textContent = 'Finish & Publish Quiz 🚀';
  } else {
    nextBtn.textContent = 'Save & Next Question →';
  }
};

window.saveCurrentWizardQuestion = function() {
  const draft = window.adminQuizDraft;
  const qText = document.getElementById('wizardQPrompt').value.trim();
  const optA = document.getElementById('wizardOptA').value.trim();
  const optB = document.getElementById('wizardOptB').value.trim();
  const optC = document.getElementById('wizardOptC').value.trim();
  const optD = document.getElementById('wizardOptD').value.trim();
  const correct = document.getElementById('wizardCorrectOpt').value;

  if (!qText || !optA || !optB || !optC || !optD) {
    window.showToast("Please fill in question prompt and all 4 options.");
    return false;
  }

  draft.questions[draft.currentStep - 1] = {
    q: qText,
    options: { A: optA, B: optB, C: optC, D: optD },
    correct: correct
  };
  return true;
};

window.wizardNextStep = function() {
  if (!window.saveCurrentWizardQuestion()) return;
  const draft = window.adminQuizDraft;

  if (draft.currentStep < draft.totalTarget) {
    draft.currentStep++;
    window.renderWizardQuestionForm();
  } else {
    // Completed all questions! Publish quiz
    const newQuiz = {
      id: "QZ_" + Date.now(),
      title: draft.title,
      subject: draft.subject,
      classGroup: draft.classGroup,
      teacherName: draft.teacherName,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      marksPerQuestion: draft.marksPerQuestion,
      questions: draft.questions,
      submissions: []
    };

    window.activeQuizzesList.unshift(newQuiz);
    window.saveAllToStorage();
    window.showToast(`Drill "${draft.title}" with ${draft.questions.length} questions published!`);

    // Reset wizard
    window.cancelQuizWizard();
    window.renderAdminQuizBank();
  }
};

window.wizardPrevStep = function() {
  window.saveCurrentWizardQuestion();
  const draft = window.adminQuizDraft;
  if (draft.currentStep > 1) {
    draft.currentStep--;
    window.renderWizardQuestionForm();
  }
};

window.cancelQuizWizard = function() {
  document.getElementById('quizWizardEditor').classList.add('hidden');
  document.getElementById('quizSetupMetaForm').classList.remove('hidden');
  document.getElementById('quizSetupMetaForm').reset();
  window.populateAdminTeacherDropdown();
};

window.renderAdminQuizBank = function() {
  const container = document.getElementById('adminQuizBankList');
  const countBadge = document.getElementById('admQuizSummaryCount');
  if (!container) return;
  
  if (countBadge) countBadge.textContent = `${window.activeQuizzesList.length} Quizzes Active`;

  if (!window.activeQuizzesList.length) {
    container.innerHTML = `<p class="text-xs text-muted">No quizzes available. Create one using the form above.</p>`;
    return;
  }

  container.innerHTML = window.activeQuizzesList.map(qz => {
    const submissions = qz.submissions || [];
    return `
      <div class="card-canvas flex flex-col gap-3" style="padding: 16px;">
        <div class="flex flex-col md-flex-row justify-between items-start md-flex items-center gap-2 border-b-subtle" style="padding-bottom: 10px;">
          <div>
            <div class="flex items-center gap-2">
              <span class="badge badge-navy" style="font-size: 10px; padding: 2px 8px;">${qz.classGroup}</span>
              <span class="badge badge-terracotta" style="font-size: 10px; padding: 2px 8px;">${qz.subject || 'Commerce'}</span>
              <span class="text-xs text-muted">By: <strong>${qz.teacherName}</strong></span>
            </div>
            <h4 class="text-base font-bold" style="margin-top: 4px;">${qz.title}</h4>
            <p class="text-xs text-muted">${qz.questions.length} Question(s) • Total Submissions: <strong>${submissions.length}</strong></p>
          </div>
          <div class="flex gap-2">
            <button type="button" onclick="window.clearQuizSubmissions('${qz.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;">Reset Submissions</button>
            <button type="button" onclick="window.deleteQuiz('${qz.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: var(--copper-terracotta);">Delete Quiz</button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <span class="text-xs font-bold text-muted uppercase">Student Attempts Log:</span>
          ${submissions.length === 0 ? `
            <p class="text-xs text-muted">No student attempts recorded for this drill yet.</p>
          ` : `
            <div style="max-height: 160px; overflow-y: auto;">
              <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
                <thead>
                  <tr style="border-bottom: 1px solid var(--border-gold-subtle); color: var(--gold-champagne);">
                    <th style="padding: 4px 8px;">Student</th>
                    <th style="padding: 4px 8px;">Marks</th>
                    <th style="padding: 4px 8px;">%</th>
                    <th style="padding: 4px 8px;">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  ${submissions.map(sub => `
                    <tr style="border-bottom: 1px solid var(--border-glass-light);">
                      <td style="padding: 4px 8px; font-weight: 600;">${sub.studentName}</td>
                      <td style="padding: 4px 8px; color: var(--gold-champagne);">${sub.marksEarned} / ${sub.totalMarks}</td>
                      <td style="padding: 4px 8px;">${sub.percentage}%</td>
                      <td style="padding: 4px 8px; color: var(--text-muted);">${sub.attemptedAt}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>
    `;
  }).join('');
};

window.clearQuizSubmissions = function(id) {
  const qz = window.activeQuizzesList.find(q => q.id === id);
  if (!qz) return;
  if (confirm(`Reset all student attempts for "${qz.title}"?`)) {
    qz.submissions = [];
    window.saveAllToStorage();
    window.showToast("Submissions cleared.");
    window.renderAdminQuizBank();
  }
};

window.deleteQuiz = function(id) {
  if (confirm("Delete this entire quiz along with its score records?")) {
    window.activeQuizzesList = window.activeQuizzesList.filter(q => q.id !== id);
    window.saveAllToStorage();
    window.showToast("Quiz removed.");
    window.renderAdminQuizBank();
  }
};

// --- ADMIN CRUD: MATERIALS ---
window.renderAdminMaterials = function() {
  const container = document.getElementById('adminMaterialsList');
  if (!container) return;
  if (!window.studyMaterialsData.length) {
    container.innerHTML = `<p class="text-xs text-muted">No materials listed.</p>`;
    return;
  }
  container.innerHTML = window.studyMaterialsData.map(m => `
    <div class="card-canvas flex justify-between items-center" style="padding: 12px;">
      <div>
        <span class="badge badge-navy" style="font-size: 10px; padding: 2px 8px;">${m.classGroup} • ${m.subject}</span>
        <h4 class="text-sm font-bold" style="margin-top: 4px;">${m.title}</h4>
      </div>
      <div class="flex gap-2">
        <button type="button" onclick="window.editMaterial('${m.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;">Edit</button>
        <button type="button" onclick="window.deleteMaterial('${m.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: var(--copper-terracotta);">Delete</button>
      </div>
    </div>
  `).join('');
};

window.handleSaveMaterial = function(e) {
  e.preventDefault();
  const editId = document.getElementById('matEditId').value;
  const title = document.getElementById('matTitle').value.trim();
  const classGroup = document.getElementById('matClass').value;
  const subject = document.getElementById('matSubject').value.trim();
  const link = document.getElementById('matUrl').value.trim();

  if (editId) {
    const idx = window.studyMaterialsData.findIndex(m => m.id === editId);
    if (idx !== -1) {
      window.studyMaterialsData[idx] = { ...window.studyMaterialsData[idx], title, classGroup, subject, link };
      window.showToast("Material updated!");
    }
  } else {
    window.studyMaterialsData.push({ id: "m" + Date.now(), title, classGroup, subject, link, type: "PDF Notes" });
    window.showToast("Material added!");
  }
  window.saveAllToStorage();
  window.cancelMaterialEdit();
  window.renderAdminMaterials();
};

window.editMaterial = function(id) {
  const m = window.studyMaterialsData.find(item => item.id === id);
  if (!m) return;
  const formBox = document.getElementById('collapse-materials-form');
  if (formBox && formBox.classList.contains('hidden')) {
    formBox.classList.remove('hidden');
  }
  document.getElementById('matEditId').value = m.id;
  document.getElementById('matTitle').value = m.title;
  document.getElementById('matClass').value = m.classGroup;
  document.getElementById('matSubject').value = m.subject;
  document.getElementById('matUrl').value = m.link;
  document.getElementById('matSubmitBtn').textContent = "Update Material";
  document.getElementById('matCancelBtn').classList.remove('hidden');
};

window.cancelMaterialEdit = function() {
  document.getElementById('matEditId').value = "";
  document.getElementById('matTitle').value = "";
  document.getElementById('matSubject').value = "";
  document.getElementById('matUrl').value = "";
  document.getElementById('matSubmitBtn').textContent = "Save Material";
  document.getElementById('matCancelBtn').classList.add('hidden');
};

window.deleteMaterial = function(id) {
  if (confirm("Delete this study material?")) {
    window.studyMaterialsData = window.studyMaterialsData.filter(m => m.id !== id);
    window.saveAllToStorage();
    window.showToast("Material deleted.");
    window.renderAdminMaterials();
  }
};

// --- ADMIN CRUD: TESTS ---
window.renderAdminTests = function() {
  const container = document.getElementById('adminTestsList');
  if (!container) return;
  if (!window.upcomingTestsList.length) {
    container.innerHTML = `<p class="text-xs text-muted">No test schedules currently created.</p>`;
    return;
  }
  container.innerHTML = window.upcomingTestsList.map(t => `
    <div class="card-canvas flex justify-between items-center" style="padding: 12px;">
      <div>
        <span class="badge badge-terracotta" style="font-size: 10px; padding: 2px 8px;">${t.classGroup}</span>
        <h4 class="text-sm font-bold" style="margin-top: 4px;">${t.subject}</h4>
        <p class="text-xs text-muted">📅 ${t.date} | ⏰ ${t.time}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" onclick="window.editTest('${t.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;">Edit</button>
        <button type="button" onclick="window.deleteTest('${t.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: var(--copper-terracotta);">Delete</button>
      </div>
    </div>
  `).join('');
};

window.handleSaveTest = function(e) {
  e.preventDefault();
  const editId = document.getElementById('testEditId').value;
  const classGroup = document.getElementById('testClass').value;
  const subject = document.getElementById('testSubject').value.trim();
  const date = document.getElementById('testDate').value;
  const time = document.getElementById('testTime').value.trim();
  const syllabus = document.getElementById('testSyllabus').value.trim();

  if (editId) {
    const idx = window.upcomingTestsList.findIndex(t => t.id === editId);
    if (idx !== -1) {
      window.upcomingTestsList[idx] = { ...window.upcomingTestsList[idx], classGroup, subject, date, time, syllabus };
      window.showToast("Test schedule updated!");
    }
  } else {
    window.upcomingTestsList.push({ id: "ts" + Date.now(), classGroup, subject, date, time, syllabus, status: "Upcoming" });
    window.showToast("Test scheduled!");
  }
  window.saveAllToStorage();
  window.cancelTestEdit();
  window.renderAdminTests();
};

window.editTest = function(id) {
  const t = window.upcomingTestsList.find(item => item.id === id);
  if (!t) return;
  const formBox = document.getElementById('collapse-tests-form');
  if (formBox && formBox.classList.contains('hidden')) {
    formBox.classList.remove('hidden');
  }
  document.getElementById('testEditId').value = t.id;
  document.getElementById('testClass').value = t.classGroup;
  document.getElementById('testSubject').value = t.subject;
  document.getElementById('testDate').value = t.date;
  document.getElementById('testTime').value = t.time;
  document.getElementById('testSyllabus').value = t.syllabus;
  document.getElementById('testSubmitBtn').textContent = "Update Test";
  document.getElementById('testCancelBtn').classList.remove('hidden');
};

window.cancelTestEdit = function() {
  document.getElementById('testEditId').value = "";
  document.getElementById('testSubject').value = "";
  document.getElementById('testDate').value = "";
  document.getElementById('testTime').value = "";
  document.getElementById('testSyllabus').value = "";
  document.getElementById('testSubmitBtn').textContent = "Save Test";
  document.getElementById('testCancelBtn').classList.add('hidden');
};

window.deleteTest = function(id) {
  if (confirm("Delete this test schedule?")) {
    window.upcomingTestsList = window.upcomingTestsList.filter(t => t.id !== id);
    window.saveAllToStorage();
    window.showToast("Test removed.");
    window.renderAdminTests();
  }
};

// --- ADMIN CRUD: TEACHERS ---
window.renderAdminTeachers = function() {
  const container = document.getElementById('adminTeachersList');
  if (!container) return;
  container.innerHTML = window.teachersData.map((t, idx) => `
    <div class="card-canvas flex justify-between items-center" style="padding: 12px;">
      <div>
        <span class="badge badge-navy" style="font-size: 10px; padding: 2px 8px;">${t.role}</span>
        <h4 class="text-sm font-bold" style="margin-top: 4px;">${t.name} (${t.initials})</h4>
        <p class="text-xs text-muted">${t.bio}</p>
      </div>
      ${idx === 0 ? '<span class="text-xs text-muted" style="padding: 4px 8px;">Founder</span>' : `
        <div class="flex gap-2">
          <button type="button" onclick="window.editTeacher('${t.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;">Edit</button>
          <button type="button" onclick="window.deleteTeacher('${t.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: var(--copper-terracotta);">Delete</button>
        </div>
      `}
    </div>
  `).join('');
};

window.handleSaveTeacher = function(e) {
  e.preventDefault();
  const editId = document.getElementById('teacherEditId').value;
  const name = document.getElementById('teacherName').value.trim();
  const role = document.getElementById('teacherRole').value.trim();
  const initials = document.getElementById('teacherInitials').value.trim().toUpperCase();
  const bio = document.getElementById('teacherBio').value.trim();

  if (editId) {
    const idx = window.teachersData.findIndex(t => t.id === editId);
    if (idx !== -1) {
      window.teachersData[idx] = { id: editId, name, role, initials, bio };
      window.showToast("Teacher record updated!");
    }
  } else {
    window.teachersData.push({ id: "t" + Date.now(), name, role, initials, bio });
    window.showToast(`Teacher ${name} registered!`);
  }
  window.saveAllToStorage();
  window.cancelTeacherEdit();
  window.renderAdminTeachers();
};

window.editTeacher = function(id) {
  const t = window.teachersData.find(item => item.id === id);
  if (!t) return;
  const formBox = document.getElementById('collapse-teachers-form');
  if (formBox && formBox.classList.contains('hidden')) {
    formBox.classList.remove('hidden');
  }
  document.getElementById('teacherEditId').value = t.id;
  document.getElementById('teacherName').value = t.name;
  document.getElementById('teacherRole').value = t.role;
  document.getElementById('teacherInitials').value = t.initials;
  document.getElementById('teacherBio').value = t.bio;
  document.getElementById('teacherSubmitBtn').textContent = "Update Faculty";
  document.getElementById('teacherCancelBtn').classList.remove('hidden');
};

window.cancelTeacherEdit = function() {
  document.getElementById('teacherEditId').value = "";
  document.getElementById('teacherName').value = "";
  document.getElementById('teacherRole').value = "";
  document.getElementById('teacherInitials').value = "";
  document.getElementById('teacherBio').value = "";
  document.getElementById('teacherSubmitBtn').textContent = "Save Faculty";
  document.getElementById('teacherCancelBtn').classList.add('hidden');
};

window.deleteTeacher = function(id) {
  if (confirm("Remove this faculty profile?")) {
    window.teachersData = window.teachersData.filter(t => t.id !== id);
    window.saveAllToStorage();
    window.showToast("Faculty profile deleted.");
    window.renderAdminTeachers();
  }
};

// --- ADMIN CRUD: STUDENTS ---
window.renderAdminStudents = function() {
  const container = document.getElementById('adminStudentsList');
  if (!container) return;
  if (!window.studentsRosterData.length) {
    container.innerHTML = `<p class="text-xs text-muted">No students registered yet.</p>`;
    return;
  }
  container.innerHTML = window.studentsRosterData.map(s => `
    <div class="card-canvas flex justify-between items-center" style="padding: 12px;">
      <div>
        <span class="badge badge-terracotta" style="font-size: 10px; padding: 2px 8px;">${s.classGroup}</span>
        <h4 class="text-sm font-bold" style="margin-top: 4px;">${s.fullName}</h4>
        <p class="text-xs text-muted">📞 ${s.contact} | Added: ${s.dateAdded}</p>
      </div>
      <div class="flex gap-2">
        <button type="button" onclick="window.editStudent('${s.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px;">Edit</button>
        <button type="button" onclick="window.deleteStudent('${s.id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 11px; color: var(--copper-terracotta);">Delete</button>
      </div>
    </div>
  `).join('');
};

window.handleSaveStudent = function(e) {
  e.preventDefault();
  const editId = document.getElementById('studentEditId').value;
  const fullName = document.getElementById('studentFullName').value.trim();
  const classGroup = document.getElementById('studentClass').value;
  const contact = document.getElementById('studentContact').value.trim() || "N/A";

  if (editId) {
    const idx = window.studentsRosterData.findIndex(s => s.id === editId);
    if (idx !== -1) {
      window.studentsRosterData[idx] = { ...window.studentsRosterData[idx], fullName, classGroup, contact };
      window.showToast("Student updated!");
    }
  } else {
    window.studentsRosterData.push({
      id: "s" + Date.now(),
      fullName,
      classGroup,
      contact,
      dateAdded: new Date().toLocaleDateString()
    });
    window.showToast(`Student ${fullName} registered!`);
  }
  window.saveAllToStorage();
  window.cancelStudentEdit();
  window.renderAdminStudents();
};

window.editStudent = function(id) {
  const s = window.studentsRosterData.find(item => item.id === id);
  if (!s) return;
  const formBox = document.getElementById('collapse-students-form');
  if (formBox && formBox.classList.contains('hidden')) {
    formBox.classList.remove('hidden');
  }
  document.getElementById('studentEditId').value = s.id;
  document.getElementById('studentFullName').value = s.fullName;
  document.getElementById('studentClass').value = s.classGroup;
  document.getElementById('studentContact').value = s.contact;
  document.getElementById('studentSubmitBtn').textContent = "Update Student";
  document.getElementById('studentCancelBtn').classList.remove('hidden');
};

window.cancelStudentEdit = function() {
  document.getElementById('studentEditId').value = "";
  document.getElementById('studentFullName').value = "";
  document.getElementById('studentContact').value = "";
  document.getElementById('studentSubmitBtn').textContent = "Register Student";
  document.getElementById('studentCancelBtn').classList.add('hidden');
};

window.deleteStudent = function(id) {
  if (confirm("Delete this student record?")) {
    window.studentsRosterData = window.studentsRosterData.filter(s => s.id !== id);
    window.saveAllToStorage();
    window.showToast("Student record removed.");
    window.renderAdminStudents();
  }
};

// --- INITIALIZATION ---
window.addEventListener('DOMContentLoaded', () => {
  window.applyTheme(window.currentTheme);
  
  if (window.location.hash === '#ftadmin' || window.location.search.includes('ftadmin')) {
    window.switchPage('admin');
  } else {
    window.switchPage('home');
  }

  if (!window.selectedUserClass) {
    setTimeout(window.openClassPickerModal, 350);
  } else {
    window.updatePortalForSelectedClass();
  }
});