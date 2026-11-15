
function percentToGrade12(pct) {
  if (pct < 5) return 1;
  if (pct < 10) return 2;
  if (pct < 20) return 3;
  if (pct < 30) return 4;
  if (pct < 40) return 5;
  if (pct < 50) return 6;
  if (pct < 60) return 7;
  if (pct < 70) return 8;
  if (pct < 80) return 9;
  if (pct < 90) return 10;
  if (pct < 95) return 11;
  return 12;
}

function getAttemptCoeff(attemptNumber) {
  if (attemptNumber <= 1) return 1.0;
  if (attemptNumber === 2) return 0.8;
  if (attemptNumber === 3) return 0.6;
  if (attemptNumber === 4) return 0.4;
  return 0.2;
}

function getAllGradableItems() {
  const items = [];
  TASKS_DATA.forEach(t => items.push({ id: t.id, section: t.section, title: t.title, maxPoints: t.maxPoints, kind: 'task' }));
  SIMULATIONS_LIST.forEach(s => items.push({ id: s.id, section: s.section, title: s.title, maxPoints: s.maxPoints, kind: 'sim' }));
  FINAL_TEST_DATA.forEach(f => items.push({ id: f.id, section: f.section, title: f.title, maxPoints: f.maxPoints, kind: 'test' }));
  return items;
}

function computeCourseAnalytics(state) {
  const allItems = getAllGradableItems();
  let totalMaxPoints = 0;
  let totalEarnedPoints = 0;
  let completedCount = 0;
  let totalAttempts = 0;
  let correctCount = 0;
  let errorCount = 0;

  const sectionStats = {};
  COURSE_SECTIONS.forEach(sec => {
    sectionStats[sec.id] = {
      id: sec.id,
      title: sec.title,
      totalTasks: 0,
      completedTasks: 0,
      attempts: 0,
      correct: 0,
      errors: 0,
      earnedPoints: 0,
      maxPoints: 0
    };
  });

  const itemRows = allItems.map((item, idx) => {
    totalMaxPoints += item.maxPoints;
    const sec = sectionStats[item.section];
    if (sec) {
      sec.totalTasks += 1;
      sec.maxPoints += item.maxPoints;
    }

    const rec = state.progress[item.id] || { attempts: 0, bestPoints: 0, bestRatio: 0, history: [] };
    const attempts = rec.attempts || 0;
    const earned = Number((rec.bestPoints || 0).toFixed(2));
    totalEarnedPoints += earned;
    totalAttempts += attempts;

    let itemCorrect = 0;
    let itemErrors = 0;
    (rec.history || []).forEach(h => {
      if (h.ratio >= 0.999) itemCorrect++;
      else itemErrors++;
    });
    correctCount += itemCorrect;
    errorCount += itemErrors;

    if (attempts > 0) completedCount++;

    if (sec) {
      if (attempts > 0) sec.completedTasks += 1;
      sec.attempts += attempts;
      sec.correct += itemCorrect;
      sec.errors += itemErrors;
      sec.earnedPoints += earned;
    }

    let statusText = "Не виконано";
    let grade12 = "Не оцінено";
    if (attempts > 0) {
      if (rec.bestRatio >= 0.999) statusText = "Правильно";
      else if (rec.bestRatio > 0) statusText = "Частково правильно";
      else statusText = "Неправильно";
      const pct = (earned / item.maxPoints) * 100;
      grade12 = percentToGrade12(pct);
    }

    return {
      num: idx + 1,
      id: item.id,
      section: item.section,
      kind: item.kind,
      title: item.title,
      maxPoints: item.maxPoints,
      attempts: attempts,
      statusText: statusText,
      earnedPoints: attempts > 0 ? earned : 0,
      grade12: grade12,
      bestRatio: rec.bestRatio || 0,
      history: rec.history || []
    };
  });

  Object.values(sectionStats).forEach(sec => {
    if (sec.maxPoints > 0 && sec.completedTasks > 0) {
      sec.percent = (sec.earnedPoints / sec.maxPoints) * 100;
      sec.grade12 = percentToGrade12(sec.percent);
    } else if (sec.maxPoints > 0) {
      sec.percent = 0;
      sec.grade12 = "Не оцінено";
    } else {
      sec.percent = null;
      sec.grade12 = "—";
    }
  });

  const overallPercentExact = totalMaxPoints > 0 ? (totalEarnedPoints / totalMaxPoints) * 100 : 0;
  const overallGrade12 = completedCount > 0 ? percentToGrade12(overallPercentExact) : "Не оцінено";
  const correctAnswersPercent = (correctCount + errorCount) > 0 ? (correctCount / (correctCount + errorCount)) * 100 : 0;
  const avgAttemptsPerDone = completedCount > 0 ? (totalAttempts / completedCount) : 0;

  return {
    allItemsCount: allItems.length,
    completedCount,
    totalAttempts,
    correctCount,
    errorCount,
    correctAnswersPercent,
    totalEarnedPoints: Number(totalEarnedPoints.toFixed(2)),
    totalMaxPoints,
    overallPercentExact,
    overallGrade12,
    avgAttemptsPerDone,
    sectionStats,
    itemRows
  };
}

function buildAnalyticalConclusion(analytics) {
  const gradedSections = Object.values(analytics.sectionStats).filter(s => s.maxPoints > 0 && s.completedTasks > 0);
  if (gradedSections.length === 0) {
    return "<p>Ви ще не виконали жодного оцінюваного завдання. Розпочніть виконання завдань у розділах курсу, щоб отримати персональний аналіз навчальних досягнень.</p>";
  }
  const sortedByPct = [...gradedSections].sort((a, b) => b.percent - a.percent);
  const bestSec = sortedByPct[0];
  const weakSec = sortedByPct[sortedByPct.length - 1];

  const firstTryDone = analytics.itemRows.filter(r => r.attempts === 1 && r.bestRatio >= 0.999);
  const mostAttempts = [...analytics.itemRows].filter(r => r.attempts > 1).sort((a, b) => b.attempts - a.attempts).slice(0, 3);
  const withErrors = analytics.itemRows.filter(r => r.attempts > 0 && r.bestRatio < 0.999);

  let html = "<ul>";
  html += `<li><strong>Найкраще засвоєний розділ:</strong> «${bestSec.title}» (${bestSec.percent.toFixed(1)}%, оцінка ${bestSec.grade12} б.).</li>`;
  if (weakSec.percent < 75) {
    html += `<li><strong>Розділ, що потребує додаткового повторення:</strong> «${weakSec.title}» (${weakSec.percent.toFixed(1)}%, оцінка ${weakSec.grade12} б.).</li>`;
  }
  html += `<li><strong>Завдання, виконані безпомилково з першої спроби:</strong> ${firstTryDone.length} із ${analytics.completedCount} виконаних.</li>`;
  if (mostAttempts.length > 0) {
    html += `<li><strong>Завдання, для яких знадобилося найбільше спроб:</strong> ${mostAttempts.map(m => `${m.title} (${m.attempts} спр.)`).join("; ")}.</li>`;
  }
  if (withErrors.length > 0) {
    html += `<li><strong>Завдання, де залишилися помилки або частковий результат:</strong> ${withErrors.slice(0, 5).map(w => w.title).join("; ")}.</li>`;
  }
  html += `<li><strong>Рекомендація:</strong> ${analytics.overallPercentExact >= 80 ? "Високий рівень цифрової грамотності! Рекомендуємо закріпити знання у розділі «Моя цифрова стратегія»." : "Перегляньте теоретичні картки у розділах із нижчим відсотком та повторно виконайте завдання з помилками."}</li>`;
  html += "</ul>";
  return html;
}

function renderResultsScreen(state) {
  const a = computeCourseAnalytics(state);
  const nowStr = new Date().toLocaleString('uk-UA');
  const elapsedSec = Math.floor((Date.now() - state.startTimeMs) / 1000);
  const mins = Math.floor(elapsedSec / 60);
  const secs = elapsedSec % 60;
  const durationStr = `${mins} хв ${secs} с`;

  const simRows = a.itemRows.filter(r => r.kind === 'sim');

  let sectionBarsHtml = "";
  Object.values(a.sectionStats).filter(s => s.maxPoints > 0).forEach(s => {
    const pctDisp = s.completedTasks > 0 ? s.percent.toFixed(1) : "0.0";
    sectionBarsHtml += `
      <div class="chart-bar-wrap">
        <div class="chart-bar-label">
          <span>${s.title} (${s.completedTasks}/${s.totalTasks} завд., спроб: ${s.attempts})</span>
          <span><strong>${s.earnedPoints.toFixed(2)} / ${s.maxPoints} б. (${pctDisp}%) — Оцінка: ${s.grade12}</strong></span>
        </div>
        <div class="chart-bar-bg"><div class="chart-bar-fill" style="width:${pctDisp}%"></div></div>
      </div>
    `;
  });

  let allTasksTableRows = "";
  a.itemRows.forEach(r => {
    const ptsDisp = r.attempts > 0 ? r.earnedPoints.toFixed(2).replace('.', ',') : "—";
    allTasksTableRows += `
      <tr>
        <td>${r.num}</td>
        <td>${r.title}</td>
        <td><strong>${r.attempts}</strong></td>
        <td>${r.statusText}</td>
        <td>${ptsDisp} / ${r.maxPoints}</td>
        <td><strong>${r.grade12}</strong></td>
      </tr>
    `;
  });

  let simTableRows = "";
  simRows.forEach(s => {
    const ptsDisp = s.attempts > 0 ? s.earnedPoints.toFixed(2).replace('.', ',') : "—";
    simTableRows += `
      <tr>
        <td>${s.title}</td>
        <td>${s.attempts > 0 ? "Виконано" : "Не виконано"}</td>
        <td>${s.attempts}</td>
        <td>${s.statusText}</td>
        <td>${ptsDisp} / ${s.maxPoints}</td>
        <td><strong>${s.grade12}</strong></td>
      </tr>
    `;
  });

  return `
    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:1rem;">
      <div>
        <h2 class="section-title" style="margin-bottom:4px;">10. Мій результат та підсумковий звіт</h2>
        <p style="color:var(--text-muted);font-size:0.9rem;">Учень: <strong>${state.user.lastName} ${state.user.firstName}</strong> | Клас: <strong>${state.user.grade}</strong> | Початок: ${state.startDateStr} | Час роботи: ${durationStr}</p>
      </div>
      <button class="btn no-print" onclick="window.print()">Завантажити / Друк PDF-звіту (A4)</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><h4>Підсумкова оцінка (12-бальна)</h4><div class="value">${a.overallGrade12}</div></div>
      <div class="stat-card"><h4>Набрані бали</h4><div class="value">${a.totalEarnedPoints} / ${a.totalMaxPoints}</div></div>
      <div class="stat-card"><h4>Відсоток виконання (бали)</h4><div class="value">${a.overallPercentExact.toFixed(1)}%</div></div>
      <div class="stat-card"><h4>Виконано завдань</h4><div class="value">${a.completedCount} / ${a.allItemsCount}</div></div>
      <div class="stat-card"><h4>Загальна кількість спроб</h4><div class="value">${a.totalAttempts}</div></div>
      <div class="stat-card"><h4>Правильних / Помилок</h4><div class="value" style="font-size:1.4rem;">${a.correctCount} / ${a.errorCount} (${a.correctAnswersPercent.toFixed(1)}%)</div></div>
    </div>

    <div class="card">
      <h3>Результати за тематичними блоками</h3>
      ${sectionBarsHtml}
    </div>

    <div class="card">
      <h3>Результати практичних симуляцій</h3>
      <div class="table-container">
        <table>
          <thead><tr><th>Назва симуляції</th><th>Статус</th><th>Спроб</th><th>Результат</th><th>Бали</th><th>Оцінка</th></tr></thead>
          <tbody>${simTableRows}</tbody>
        </table>
      </div>
    </div>

    <div class="card">
      <h3>Аналітичний висновок за фактичними результатами</h3>
      ${buildAnalyticalConclusion(a)}
    </div>

    <div class="card">
      <h3>Детальна відомість оцінок та спроб за кожне завдання курсу</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:0.8rem;">Середня кількість спроб на одне виконане завдання: <strong>${a.avgAttemptsPerDone.toFixed(2)}</strong> | Сформовано: ${nowStr}</p>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Назва завдання</th>
              <th>Кількість спроб</th>
              <th>Результат</th>
              <th>Набрані бали</th>
              <th>Оцінка (12-б.)</th>
            </tr>
          </thead>
          <tbody>${allTasksTableRows}</tbody>
        </table>
      </div>
    </div>
  `;
}
