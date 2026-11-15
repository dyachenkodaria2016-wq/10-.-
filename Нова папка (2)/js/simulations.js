
const SIMULATIONS_LIST = [
  { id: "SIM1", section: "simulations", title: "Симуляція 1: Конструктор цифрового сліду", maxPoints: 3 },
  { id: "SIM2", section: "simulations", title: "Симуляція 2: Опублікувати чи ні?", maxPoints: 3 },
  { id: "SIM3", section: "simulations", title: "Симуляція 3: Аудит цифрової репутації", maxPoints: 3 },
  { id: "SIM4", section: "simulations", title: "Симуляція 4: Налаштування приватності", maxPoints: 3 },
  { id: "SIM5", section: "simulations", title: "Симуляція 5: Цифровий громадянин: прийми рішення", maxPoints: 3 },
  { id: "SIM6", section: "simulations", title: "Симуляція 6: Медіадетектив", maxPoints: 3 }
];

function renderSimulationsHTML(state) {
  return `
    <h2 class="section-title">7. Практична лабораторія (6 симуляцій)</h2>
    <p class="section-desc">Відпрацюйте навички безпечної та відповідальної поведінки на інтерактивних моделях реальних цифрових ситуацій. Кожна симуляція оцінюється за 12-бальною шкалою з урахуванням кількості спроб.</p>

    <div class="sim-box" id="box-SIM1">
      <div class="task-header">
        <div class="task-title">Симуляція 1: Конструктор цифрового сліду (Drag & Drop або вибір)</div>
        <div class="task-stats" id="stats-SIM1"></div>
      </div>
      <p class="task-question">Розподіліть 6 дій користувача на <strong>Активний</strong> та <strong>Пасивний</strong> цифровий слід (перетягніть картки або натисніть кнопку переміщення):</p>
      <div id="sim1-pool" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_1" data-type="active">Публікація фото в соцмережі <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_1','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_1','passive')">Пасивний</button></div></div>
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_2" data-type="passive">Збір файлів cookie браузером <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_2','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_2','passive')">Пасивний</button></div></div>
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_3" data-type="active">Коментар під відео <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_3','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_3','passive')">Пасивний</button></div></div>
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_4" data-type="passive">Фіксація IP-адреси та геолокації <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_4','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_4','passive')">Пасивний</button></div></div>
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_5" data-type="active">Заповнення анкети реєстрації <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_5','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_5','passive')">Пасивний</button></div></div>
        <div class="dnd-item" draggable="true" ondragstart="dragSim1(event)" id="s1_6" data-type="passive">Рекламний ID пристрою <div><button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_6','active')">Активний</button> <button class="btn btn-sm btn-secondary" onclick="moveSim1('s1_6','passive')">Пасивний</button></div></div>
      </div>
      <div class="dnd-container">
        <div class="dnd-zone" id="zone-active" ondrop="dropSim1(event,'active')" ondragover="allowDrop(event)"><h4>Активний цифровий слід</h4></div>
        <div class="dnd-zone" id="zone-passive" ondrop="dropSim1(event,'passive')" ondragover="allowDrop(event)"><h4>Пасивний цифровий слід</h4></div>
      </div>
      <button class="btn btn-sm" onclick="checkSim1()">Перевірити</button>
      <div class="feedback" id="fb-SIM1"></div>
    </div>

    <div class="sim-box" id="box-SIM2">
      <div class="task-header">
        <div class="task-title">Симуляція 2: «Опублікувати чи ні?»</div>
        <div class="task-stats" id="stats-SIM2"></div>
      </div>
      <p class="task-question">Оберіть правильну дію для кожної з 3 ситуацій у соціальній мережі:</p>
      <div class="social-post">
        <div class="social-author">Ситуація А: Ви сфотографувалися біля школи, на фоні видно номери авто сусідів і табличку з точною адресою будинку.</div>
        <select id="sim2_1" class="form-control">
          <option value="">-- Оберіть рішення --</option>
          <option value="pub">Опублікувати без змін</option>
          <option value="edit">Змінити (розмити номери авто та адресу перед публікацією)</option>
          <option value="consent">Отримати згоду всіх перехожих</option>
        </select>
      </div>
      <div class="social-post">
        <div class="social-author">Ситуація Б: Друг надіслав смішне, але невдале фото однокласника і пропонує викласти його в публічний канал.</div>
        <select id="sim2_2" class="form-control">
          <option value="">-- Оберіть рішення --</option>
          <option value="pub">Опублікувати, бо це смішно</option>
          <option value="no">Не публікувати (це порушує приватність і може стати кібербулінгом)</option>
          <option value="check">Перевірити дату фото</option>
        </select>
      </div>
      <div class="social-post">
        <div class="social-author">Ситуація В: У чаті поширюють повідомлення про нібито скасування занять завтра без посилання на сайт школи.</div>
        <select id="sim2_3" class="form-control">
          <option value="">-- Оберіть рішення --</option>
          <option value="pub">Негайно зробити репост усім</option>
          <option value="verify">Перевірити інформацію в офіційних джерелах школи перед поширенням</option>
          <option value="edit">Змінити час занять і опублікувати</option>
        </select>
      </div>
      <button class="btn btn-sm" onclick="checkSim2()">Перевірити</button>
      <div class="feedback" id="fb-SIM2"></div>
    </div>

    <div class="sim-box" id="box-SIM3">
      <div class="task-header">
        <div class="task-title">Симуляція 3: Аудит цифрової репутації</div>
        <div class="task-stats" id="stats-SIM3"></div>
      </div>
      <p class="task-question">Проаналізуйте вигаданий профіль учня <strong>@alex_k_2010</strong>: у біо вказано домашню адресу та номер телефону; на стіні є агресивні коментарі з образами гравців; в альбомі — фото перемоги в олімпіаді з інформатики. Позначте ВСІ репутаційні та безпекові ризики цього профілю:</p>
      <div class="options-list">
        <label class="option-item"><input type="checkbox" name="sim3" value="addr"> Відкрита домашня адреса та номер телефону в описі профілю</label>
        <label class="option-item"><input type="checkbox" name="sim3" value="olymp"> Фотографія з нагородження олімпіади з інформатики</label>
        <label class="option-item"><input type="checkbox" name="sim3" value="toxic"> Публічні агресивні коментарі з образами інших користувачів</label>
        <label class="option-item"><input type="checkbox" name="sim3" value="nick"> Використання псевдоніма замість повного по батькові</label>
      </div>
      <button class="btn btn-sm" onclick="checkSim3()">Перевірити</button>
      <div class="feedback" id="fb-SIM3"></div>
    </div>

    <div class="sim-box" id="box-SIM4">
      <div class="task-header">
        <div class="task-title">Симуляція 4: Налаштування приватності соціальної мережі</div>
        <div class="task-stats" id="stats-SIM4"></div>
      </div>
      <p class="task-question">Налаштуйте оптимальний безпечний рівень приватності профілю підлітка:</p>
      <div class="match-row"><span>Видимість профілю та фотографій:</span>
        <select id="sim4_1" class="match-select"><option value="all">Усі в Інтернеті</option><option value="friends">Тільки друзі / схвалені підписники</option></select>
      </div>
      <div class="match-row"><span>Передача геолокації у публікаціях:</span>
        <select id="sim4_2" class="match-select"><option value="on">Увімкнено завжди</option><option value="off">Вимкнено</option></select>
      </div>
      <div class="match-row"><span>Двофакторна автентифікація (2FA):</span>
        <select id="sim4_3" class="match-select"><option value="off">Вимкнено</option><option value="on">Увімкнено (застосунок-автентифікатор)</option></select>
      </div>
      <div class="match-row"><span>Доступ сторонніх ігор та вікторин до профілю:</span>
        <select id="sim4_4" class="match-select"><option value="all">Дозволити всім</option><option value="none">Заборонити / очистити зайві</option></select>
      </div>
      <button class="btn btn-sm" onclick="checkSim4()">Перевірити</button>
      <div class="feedback" id="fb-SIM4"></div>
    </div>

    <div class="sim-box" id="box-SIM5">
      <div class="task-header">
        <div class="task-title">Симуляція 5: Цифровий громадянин: прийми рішення</div>
        <div class="task-stats" id="stats-SIM5"></div>
      </div>
      <p class="task-question">Сценарій: У класному чаті невідомий акаунт розмістив образливий колаж на нового учня та закликає всіх пересилати його. Оберіть правильну послідовність кроків (розгалуження рішень):</p>
      <div class="options-list">
        <label class="option-item"><input type="radio" name="sim5" value="1"> Переслати колаж друзям, щоб обговорити, а потім видалити чат</label>
        <label class="option-item"><input type="radio" name="sim5" value="2"> Не поширювати контент, зробити скріншот як доказ, поскаржитися модератору чату / заблокувати порушника та повідомити класного керівника або батьків</label>
        <label class="option-item"><input type="radio" name="sim5" value="3"> Написати у відповідь образи на адресу автора колажу</label>
      </div>
      <button class="btn btn-sm" onclick="checkSim5()">Перевірити</button>
      <div class="feedback" id="fb-SIM5"></div>
    </div>

    <div class="sim-box" id="box-SIM6">
      <div class="task-header">
        <div class="task-title">Симуляція 6: Медіадетектив</div>
        <div class="task-stats" id="stats-SIM6"></div>
      </div>
      <p class="task-question">Перевірте 3 повідомлення зі стрічки новин за критеріями джерела, емоційності заголовка та фактів:</p>
      <div class="match-row"><span>1. «ШОК! Завтра всі смартфони вимкнуться назавжди, терміново перешли 10 друзям!»</span>
        <select id="sim6_1" class="match-select"><option value="">-- Вердикт --</option><option value="true">Достовірна новина</option><option value="fake">Фейк / маніпуляція</option></select>
      </div>
      <div class="match-row"><span>2. «Міністерство освіти оприлюднило офіційний графік проведення олімпіад на сайті відомства»</span>
        <select id="sim6_2" class="match-select"><option value="">-- Вердикт --</option><option value="true">Достовірна новина</option><option value="fake">Фейк / маніпуляція</option></select>
      </div>
      <div class="match-row"><span>3. «Виграй новий планшет за 1 хвилину! Просто введи пароль від пошти тут»</span>
        <select id="sim6_3" class="match-select"><option value="">-- Вердикт --</option><option value="true">Достовірна пропозиція</option><option value="fake">Шахрайство / фішинг</option></select>
      </div>
      <button class="btn btn-sm" onclick="checkSim6()">Перевірити</button>
      <div class="feedback" id="fb-SIM6"></div>
    </div>
  `;
}

function allowDrop(ev) { ev.preventDefault(); }
function dragSim1(ev) { ev.dataTransfer.setData("text", ev.target.id); }
function dropSim1(ev, zoneType) {
  ev.preventDefault();
  const id = ev.dataTransfer.getData("text");
  moveSim1(id, zoneType);
}
function moveSim1(id, zoneType) {
  const el = document.getElementById(id);
  const zone = document.getElementById("zone-" + zoneType);
  if (el && zone) {
    el.dataset.placed = zoneType;
    zone.appendChild(el);
  }
}

function checkSim1() {
  const items = ["s1_1","s1_2","s1_3","s1_4","s1_5","s1_6"];
  const sig = items.map(id => document.getElementById(id).dataset.placed || "none").join(",");
  let correctCount = 0;
  items.forEach(id => {
    const el = document.getElementById(id);
    if (el.dataset.placed === el.dataset.type) correctCount++;
  });
  const ratio = correctCount / items.length;
  submitAttempt("SIM1", 3, ratio, sig,
    ratio === 1 ? "Бездоганно! Усі дії правильно розподілено між активним і пасивним цифровим слідом." :
    `Правильно класифіковано ${correctCount} із 6 дій. Нагадуємо: свідомі публікації та анкети — активний слід; автоматичні технічні дані (cookie, IP, геолокація, рекламний ID) — пасивний.`);
}

function checkSim2() {
  const v1 = document.getElementById("sim2_1").value;
  const v2 = document.getElementById("sim2_2").value;
  const v3 = document.getElementById("sim2_3").value;
  const sig = `${v1}|${v2}|${v3}`;
  let c = 0;
  if (v1 === "edit") c++;
  if (v2 === "no") c++;
  if (v3 === "verify") c++;
  submitAttempt("SIM2", 3, c / 3, sig,
    c === 3 ? "Чудово! Ви обрали безпечні й етичні рішення для кожної публікації." :
    `Правильних рішень: ${c} із 3. Перед публікацією завжди приховуйте конфіденційні деталі, поважайте приватність інших та перевіряйте чутки.`);
}

function checkSim3() {
  const checked = Array.from(document.querySelectorAll('input[name="sim3"]:checked')).map(el => el.value).sort();
  const sig = checked.join(",");
  const isOk = sig === "addr,toxic";
  let ratio = 0;
  if (isOk) ratio = 1;
  else if (checked.includes("addr") || checked.includes("toxic")) {
    if (!checked.includes("olymp") && !checked.includes("nick")) ratio = 0.5;
  }
  submitAttempt("SIM3", 3, ratio, sig,
    isOk ? "Правильно! Відкрита адреса/телефон загрожують безпеці, а агресивні коментарі псують репутацію. Фото з олімпіади — позитивний елемент." :
    "Перевірте уважніше: ризиками є відкриті контактні дані (адреса, телефон) та токсичні коментарі. Досягнення в олімпіаді навпаки покращують репутацію.");
}

function checkSim4() {
  const v1 = document.getElementById("sim4_1").value;
  const v2 = document.getElementById("sim4_2").value;
  const v3 = document.getElementById("sim4_3").value;
  const v4 = document.getElementById("sim4_4").value;
  const sig = `${v1}|${v2}|${v3}|${v4}`;
  let c = 0;
  if (v1 === "friends") c++;
  if (v2 === "off") c++;
  if (v3 === "on") c++;
  if (v4 === "none") c++;
  submitAttempt("SIM4", 3, c / 4, sig,
    c === 4 ? "Ідеальні налаштування приватності! Профіль надійно захищено." :
    `Оптимально налаштовано ${c} із 4 параметрів. Рекомендуємо: закритий профіль для друзів, вимкнена геолокація, увімкнена 2FA та заборона доступу стороннім застосункам.`);
}

function checkSim5() {
  const sel = document.querySelector('input[name="sim5"]:checked');
  const val = sel ? sel.value : "none";
  const ratio = val === "2" ? 1 : 0;
  submitAttempt("SIM5", 3, ratio, val,
    ratio === 1 ? "Вірне рішення! Збереження доказів, припинення поширення та звернення до дорослих — правильний алгоритм протидії кібербулінгу." :
    "Неправильно. Поширення образливого контенту або відповідь агресією лише погіршують ситуацію. Потрібно зберегти докази й звернутися по допомогу.");
}

function checkSim6() {
  const v1 = document.getElementById("sim6_1").value;
  const v2 = document.getElementById("sim6_2").value;
  const v3 = document.getElementById("sim6_3").value;
  const sig = `${v1}|${v2}|${v3}`;
  let c = 0;
  if (v1 === "fake") c++;
  if (v2 === "true") c++;
  if (v3 === "fake") c++;
  submitAttempt("SIM6", 3, c / 3, sig,
    c === 3 ? "Чудова робота медіадетектива! Усі повідомлення розпізнано точно." :
    `Правильно визначено ${c} із 3 повідомлень. Кричущі заголовки з вимогою переслати та обіцянки миттєвих призів за пароль — ознаки фейку й фішингу.`);
}
