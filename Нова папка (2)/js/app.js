
const STORAGE_KEY = 'digital_citizenship_10_state_v1';

let appState = {
  user: null,
  startDateStr: '',
  startTimeMs: 0,
  activeSection: 'intro',
  progress: {},
  strategy: { rules: '', rep: '', priv: 'friends', chat: '', code: '' },
  finalTestOrder: []
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      appState = { ...appState, ...parsed };
    }
  } catch (e) { console.error(e); }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) { console.error(e); }
}

function initApp() {
  loadState();
  if (!appState.user) {
    renderAuthScreen();
  } else {
    renderMainApp();
  }
  setInterval(updateTimerUI, 1000);
}

function updateTimerUI() {
  const el = document.getElementById('header-timer');
  if (!el || !appState.startTimeMs) return;
  const sec = Math.floor((Date.now() - appState.startTimeMs) / 1000);
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  el.textContent = `${m}:${s}`;
}

function renderAuthScreen() {
  document.getElementById('app-root').innerHTML = `
    <div class="auth-wrapper">
      <h2>Цифрова репутація та громадянство</h2>
      <p>Інтерактивний курс з інформатики для 10 класу. Заповніть дані для початку навчання та обліку результатів.</p>
      <div class="form-group">
        <label>Прізвище *</label>
        <input type="text" id="reg-last" class="form-control" placeholder="Наприклад: Коваленко">
      </div>
      <div class="form-group">
        <label>Ім'я *</label>
        <input type="text" id="reg-first" class="form-control" placeholder="Наприклад: Олена">
      </div>
      <div class="form-group">
        <label>Клас *</label>
        <input type="text" id="reg-grade" class="form-control" placeholder="Наприклад: 10-А">
      </div>
      <button class="btn btn-full" onclick="handleRegister()">Розпочати навчання</button>
    </div>
  `;
}

function handleRegister() {
  const lastName = document.getElementById('reg-last').value.trim();
  const firstName = document.getElementById('reg-first').value.trim();
  const grade = document.getElementById('reg-grade').value.trim();
  if (!lastName || !firstName || !grade) {
    alert('Будь ласка, заповніть Прізвище, Ім’я та Клас.');
    return;
  }
  const now = new Date();
  appState.user = { lastName, firstName, grade };
  appState.startDateStr = now.toLocaleString('uk-UA');
  appState.startTimeMs = Date.now();
  appState.finalTestOrder = FINAL_TEST_DATA.map(q => q.id).sort(() => Math.random() - 0.5);
  saveState();
  renderMainApp();
}

function renderMainApp() {
  document.getElementById('app-root').innerHTML = `
    <header>
      <div class="logo-area">
        <img src="images/digital-citizenship.svg" class="logo-icon" alt="Лого">
        <div class="logo-title">
          <h1>Цифрове громадянство • 10 клас</h1>
          <p>Цифровий слід, репутація та інформаційна культура</p>
        </div>
      </div>
      <div class="user-badge">
        <div>Учень: <span>${appState.user.lastName} ${appState.user.firstName}</span> (${appState.user.grade})</div>
        <div>Час: <span id="header-timer">00:00</span></div>
        <button class="btn btn-sm btn-secondary no-print" onclick="navigateTo('results')">Мій результат</button>
      </div>
    </header>
    <div class="main-container">
      <sidebar id="sidebar-nav"></sidebar>
      <content-area id="content-area"></content-area>
    </div>
  `;
  renderSidebar();
  navigateTo(appState.activeSection || 'intro');
}

function renderSidebar() {
  const analytics = computeCourseAnalytics(appState);
  const nav = document.getElementById('sidebar-nav');
  if (!nav) return;
  nav.innerHTML = COURSE_SECTIONS.map(sec => {
    const st = analytics.sectionStats[sec.id];
    const isActive = appState.activeSection === sec.id ? 'active' : '';
    let meta = '';
    let pct = 0;
    if (st && st.maxPoints > 0) {
      pct = st.completedTasks > 0 ? Math.round(st.percent) : 0;
      meta = `<span>Завдань: ${st.completedTasks}/${st.totalTasks} | Спроб: ${st.attempts}</span><span>Оцінка: ${st.grade12}</span>`;
    } else if (sec.id === 'strategy') {
      const filled = appState.strategy.rules && appState.strategy.code;
      pct = filled ? 100 : 0;
      meta = `<span>Практикум</span><span>${filled ? 'Збережено' : 'Очікує'}</span>`;
    } else {
      pct = analytics.completedCount > 0 ? Math.round((analytics.completedCount / analytics.allItemsCount) * 100) : 0;
      meta = `<span>Підсумкова оцінка: ${analytics.overallGrade12}</span><span>${analytics.overallPercentExact.toFixed(0)}%</span>`;
    }
    return `
      <div class="nav-item ${isActive}" onclick="navigateTo('${sec.id}')">
        <div class="nav-item-title">${sec.title}</div>
        <div class="nav-item-desc">${sec.desc}</div>
        <div class="nav-item-meta">${meta}</div>
        <div class="progress-bar-mini"><div class="progress-fill-mini" style="width:${pct}%"></div></div>
      </div>
    `;
  }).join('');
}

function navigateTo(secId) {
  appState.activeSection = secId;
  saveState();
  renderSidebar();
  const area = document.getElementById('content-area');
  if (THEORY_HTML[secId]) {
    const tasks = TASKS_DATA.filter(t => t.section === secId);
    area.innerHTML = THEORY_HTML[secId] + `<h3 style="color:var(--accent-cyan);margin:2rem 0 1rem;">Інтерактивні завдання до розділу</h3>` + tasks.map(renderTaskCard).join('');
    tasks.forEach(t => updateTaskStatsUI(t.id, t.maxPoints));
  } else if (secId === 'simulations') {
    area.innerHTML = renderSimulationsHTML(appState);
    SIMULATIONS_LIST.forEach(s => updateTaskStatsUI(s.id, s.maxPoints));
  } else if (secId === 'strategy') {
    area.innerHTML = renderStrategyHTML();
  } else if (secId === 'final_test') {
    const order = appState.finalTestOrder.length ? appState.finalTestOrder : FINAL_TEST_DATA.map(q => q.id);
    const orderedQ = order.map(id => FINAL_TEST_DATA.find(q => q.id === id)).filter(Boolean);
    area.innerHTML = `
      <h2 class="section-title">9. Підсумкове оцінювання (20 завдань)</h2>
      <p class="section-desc">Контрольна перевірка знань за всіма темами курсу. Кожне завдання має власний облік спроб та 12-бальну оцінку.</p>
      ${orderedQ.map(renderTaskCard).join('')}
    `;
    orderedQ.forEach(q => updateTaskStatsUI(q.id, q.maxPoints));
  } else if (secId === 'results') {
    area.innerHTML = renderResultsScreen(appState);
  }
  area.scrollTop = 0;
}

function renderTaskCard(task) {
  let body = '';
  if (task.type === 'single') {
    body = `<div class="options-list">` + task.options.map((opt, idx) => `
      <label class="option-item"><input type="radio" name="inp_${task.id}" value="${idx}"> ${opt}</label>
    `).join('') + `</div>`;
  } else if (task.type === 'multi') {
    body = `<div class="options-list">` + task.options.map((opt, idx) => `
      <label class="option-item"><input type="checkbox" name="inp_${task.id}" value="${idx}"> ${opt}</label>
    `).join('') + `</div>`;
  } else if (task.type === 'match') {
    const rights = task.pairs.map(p => p.right).sort();
    body = task.pairs.map((p, idx) => `
      <div class="match-row">
        <span>${p.left}</span>
        <select id="match_${task.id}_${idx}" class="match-select">
          <option value="">-- Оберіть відповідність --</option>
          ${rights.map(r => `<option value="${r}">${r}</option>`).join('')}
        </select>
      </div>
    `).join('');
  }
  return `
    <div class="task-box" id="box-${task.id}">
      <div class="task-header">
        <div class="task-title">${task.title}</div>
        <div class="task-stats" id="stats-${task.id}"></div>
      </div>
      <div class="task-question">${task.question}</div>
      ${body}
      <button class="btn btn-sm" onclick="checkStandardTask('${task.id}')">Перевірити</button>
      <div class="feedback" id="fb-${task.id}"></div>
    </div>
  `;
}

function updateTaskStatsUI(taskId, maxPoints) {
  const box = document.getElementById('stats-' + taskId);
  if (!box) return;
  const rec = appState.progress[taskId] || { attempts: 0, bestPoints: 0 };
  const grade = rec.attempts > 0 ? percentToGrade12((rec.bestPoints / maxPoints) * 100) : 'Не оцінено';
  box.innerHTML = `
    <span class="badge">Спроб: ${rec.attempts}</span>
    <span class="badge badge-cyan">Бали: ${rec.bestPoints.toFixed(2)} / ${maxPoints}</span>
    <span class="badge badge-purple">Оцінка: ${grade}</span>
  `;
}

function checkStandardTask(taskId) {
  const task = [...TASKS_DATA, ...FINAL_TEST_DATA].find(t => t.id === taskId);
  if (!task) return;
  let sig = '';
  let ratio = 0;

  if (task.type === 'single') {
    const sel = document.querySelector(`input[name="inp_${taskId}"]:checked`);
    if (!sel) { alert('Оберіть варіант відповіді!'); return; }
    sig = sel.value;
    ratio = Number(sel.value) === task.correct ? 1 : 0;
  } else if (task.type === 'multi') {
    const vals = Array.from(document.querySelectorAll(`input[name="inp_${taskId}"]:checked`)).map(el => Number(el.value)).sort();
    if (!vals.length) { alert('Оберіть хоча б один варіант!'); return; }
    sig = vals.join(',');
    const corr = [...task.correct].sort().join(',');
    if (sig === corr) ratio = 1;
    else {
      const rightSelected = vals.filter(v => task.correct.includes(v)).length;
      const wrongSelected = vals.filter(v => !task.correct.includes(v)).length;
      ratio = Math.max(0, (rightSelected - wrongSelected) / task.correct.length);
    }
  } else if (task.type === 'match') {
    const chosen = task.pairs.map((_, idx) => document.getElementById(`match_${taskId}_${idx}`).value);
    if (chosen.includes('')) { alert('Заповніть усі відповідності!'); return; }
    sig = chosen.join('|');
    let ok = 0;
    task.pairs.forEach((p, idx) => { if (chosen[idx] === p.right) ok++; });
    ratio = ok / task.pairs.length;
  }

  submitAttempt(taskId, task.maxPoints, ratio, sig, task.explanation);
}

function submitAttempt(taskId, maxPoints, ratio, signature, explanation) {
  if (!appState.progress[taskId]) {
    appState.progress[taskId] = { attempts: 0, bestPoints: 0, bestRatio: 0, lastSig: null, history: [] };
  }
  const rec = appState.progress[taskId];
  const fb = document.getElementById('fb-' + taskId);

  if (rec.lastSig === signature && rec.attempts > 0) {
    fb.className = 'feedback ' + (ratio >= 0.999 ? 'success' : 'error');
    fb.innerHTML = `<strong>Відповідь не змінено (спроба не зарахована повторно).</strong> ${explanation}`;
    return;
  }

  rec.attempts += 1;
  rec.lastSig = signature;
  const coeff = getAttemptCoeff(rec.attempts);
  const earned = ratio > 0 ? Number((maxPoints * ratio * coeff).toFixed(2)) : 0;

  if (earned > rec.bestPoints) rec.bestPoints = earned;
  if (ratio > rec.bestRatio) rec.bestRatio = ratio;

  rec.history.push({
    attempt: rec.attempts,
    ratio: ratio,
    points: earned,
    ts: new Date().toLocaleTimeString('uk-UA')
  });

  saveState();
  updateTaskStatsUI(taskId, maxPoints);
  renderSidebar();

  if (ratio >= 0.999) {
    fb.className = 'feedback success';
    fb.innerHTML = `<strong>Правильно! (Спроба №${rec.attempts}, коефіцієнт ${Math.round(coeff*100)}%, нараховано ${earned} б.)</strong><br>${explanation}`;
  } else if (ratio > 0) {
    fb.className = 'feedback error';
    fb.innerHTML = `<strong>Частково правильно! (Спроба №${rec.attempts}, нараховано ${earned} б.)</strong><br>Пояснення: ${explanation} Спробуйте виправити помилки!`;
  } else {
    fb.className = 'feedback error';
    fb.innerHTML = `<strong>Помилка! (Спроба №${rec.attempts}, 0 б.)</strong><br>Підказка: ${explanation} Спробуйте ще раз!`;
  }
}

function renderStrategyHTML() {
  const s = appState.strategy;
  return `
    <h2 class="section-title">8. Моя цифрова стратегія</h2>
    <p class="section-desc">Сформуйте власний план безпечної та відповідальної поведінки у цифровому просторі (не вводьте реальні паролі чи конфіденційні дані).</p>
    <div class="card">
      <div class="form-group">
        <label>1. Мої 5 правил цифрової безпеки:</label>
        <textarea id="st-rules" class="form-control" rows="3" placeholder="1. Використовувати 2FA...">${s.rules}</textarea>
      </div>
      <div class="form-group">
        <label>2. Мої 3 дії для формування позитивної цифрової репутації:</label>
        <textarea id="st-rep" class="form-control" rows="2" placeholder="1. Публікувати навчальні проєкти...">${s.rep}</textarea>
      </div>
      <div class="form-group">
        <label>3. Обраний режим приватності профілів:</label>
        <select id="st-priv" class="form-control">
          <option value="friends" ${s.priv==='friends'?'selected':''}>Закритий профіль (лише для схвалених друзів), без геолокації</option>
          <option value="public" ${s.priv==='public'?'selected':''}>Публічний профіль для портфоліо без особистих контактів</option>
        </select>
      </div>
      <div class="form-group">
        <label>4. Правила поведінки в групових чатах та алгоритм перевірки новин:</label>
        <textarea id="st-chat" class="form-control" rows="2" placeholder="Поважати співрозмовників, перевіряти першоджерело...">${s.chat}</textarea>
      </div>
      <div class="form-group">
        <label>5. Мій короткий цифровий кодекс громадянина:</label>
        <textarea id="st-code" class="form-control" rows="2" placeholder="Я зобов'язуюсь поважати права інших у мережі...">${s.code}</textarea>
      </div>
      <button class="btn" onclick="saveStrategy()">Зберегти власну цифрову стратегію</button>
    </div>
  `;
}

function saveStrategy() {
  appState.strategy = {
    rules: document.getElementById('st-rules').value.trim(),
    rep: document.getElementById('st-rep').value.trim(),
    priv: document.getElementById('st-priv').value,
    chat: document.getElementById('st-chat').value.trim(),
    code: document.getElementById('st-code').value.trim()
  };
  saveState();
  renderSidebar();
  alert('Вашу цифрову стратегію успішно збережено!');
}

window.addEventListener('DOMContentLoaded', initApp);
