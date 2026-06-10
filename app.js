const routes = [
  {
    id: "tainan-station-ncku",
    from: "臺南車站",
    to: "成大校區",
    time: "08:10",
    riders: 3,
    urgency: "通勤",
    distance: 4.8,
    note: "希望固定週一到週四共乘，願意分攤停車費。",
  },
  {
    id: "chiayi-rural-campus",
    from: "嘉義轉運站",
    to: "民雄大學城",
    time: "18:30",
    riders: 2,
    urgency: "返家",
    distance: 9.6,
    note: "晚間班次少，需要女生優先安全確認。",
  },
  {
    id: "hualien-hospital-school",
    from: "花蓮慈濟醫院",
    to: "東華大學",
    time: "21:00",
    riders: 1,
    urgency: "夜間",
    distance: 15.2,
    note: "夜間實習結束，希望有上車回報與到達確認。",
  },
];

const drivers = [
  { name: "林同學", route: "臺南車站 → 成大校區", seats: 2, detour: 4, trust: 96, cost: 38, verified: "學生證、手機、車籍" },
  { name: "許同學", route: "嘉義轉運站 → 民雄", seats: 3, detour: 8, trust: 91, cost: 52, verified: "學生證、手機" },
  { name: "陳同學", route: "花蓮市區 → 東華", seats: 1, detour: 3, trust: 94, cost: 70, verified: "學生證、手機、緊急聯絡人" },
  { name: "王同學", route: "臺南市區 → 成大", seats: 4, detour: 11, trust: 86, cost: 30, verified: "手機、車籍" },
];

const activities = [
  { time: "08:02", title: "臺南線成行", body: "林同學已確認 2 位乘客，系統已送出上車確認碼。" },
  { time: "17:50", title: "嘉義線候補", body: "許同學尚餘 1 個座位，等待最後一位乘客確認。" },
  { time: "20:30", title: "夜間安全提醒", body: "花蓮線已開啟到達回報與緊急聯絡人通知。" },
];

let selectedId = routes[0].id;
let mode = "fit";
let confirmations = 0;

function selectedRoute() {
  return routes.find((route) => route.id === selectedId) || routes[0];
}

function rankedDrivers() {
  return [...drivers].sort((a, b) => {
    if (mode === "time") return a.detour - b.detour;
    if (mode === "trust") return b.trust - a.trust;
    return (b.trust - a.trust) + (a.detour - b.detour) + (b.seats - a.seats);
  });
}

function renderRoutes() {
  document.querySelector("#route-list").innerHTML = routes.map((route) => `
    <button class="route-card ${route.id === selectedId ? "active" : ""}" type="button" data-id="${route.id}">
      <strong>${route.from} → ${route.to}</strong>
      <span>${route.time} / ${route.riders} 位乘客 / ${route.distance} km</span>
      <span>${route.note}</span>
      <small>${route.urgency}</small>
    </button>
  `).join("");

  document.querySelectorAll(".route-card").forEach((button) => {
    button.addEventListener("click", () => {
      selectedId = button.dataset.id;
      render();
    });
  });
}

function renderSelectedRoute() {
  const route = selectedRoute();
  const fit = Math.max(72, Math.round(100 - route.distance * 1.6 + route.riders * 4));
  document.querySelector("#selected-route").innerHTML = `
    <div>
      <h2>${route.from} 到 ${route.to}</h2>
      <p>${route.time} 出發，${route.riders} 位乘客。${route.note}</p>
    </div>
    <div class="route-score">${fit}% 契合</div>
  `;
}

function renderDrivers() {
  document.querySelector("#driver-grid").innerHTML = rankedDrivers().slice(0, 3).map((driver) => `
    <article class="driver-card">
      <div class="driver-token">${driver.name.slice(0, 1)}</div>
      <h3>${driver.name}</h3>
      <p>${driver.route}</p>
      <p>${driver.seats} 個座位 / 繞路 ${driver.detour} 分鐘 / 每人 $${driver.cost}</p>
      <div class="score-line"><span>信任分數</span><strong>${driver.trust}</strong></div>
      <div class="mini-track"><div class="mini-fill" style="--value: ${driver.trust}%"></div></div>
    </article>
  `).join("");
}

function renderSafety() {
  const best = rankedDrivers()[0];
  const route = selectedRoute();
  const safetyScore = Math.min(99, Math.round(best.trust - best.detour * 0.4 + best.seats * 1.2));
  document.querySelector("#trust-card").innerHTML = `
    <span>建議媒合：${best.name}</span>
    <strong>${safetyScore}</strong>
    <p>${best.verified} 已完成驗證。${route.urgency === "夜間" ? "此路線建議開啟到達回報與緊急聯絡。" : "可使用一般上車確認流程。"}</p>
  `;

  const items = [
    { title: "上車確認", body: "乘客上車後輸入四位確認碼，平台才會把狀態改為已成行。" },
    { title: "費用透明", body: `本次預估每人 $${best.cost}，含油資與停車費分攤，可由乘客平均分攤。` },
    { title: "安全回報", body: route.urgency === "夜間" ? "夜間路線自動要求抵達確認，逾時會提醒緊急聯絡人。" : "一般路線保留出發、上車、抵達三段紀錄。" },
  ];
  document.querySelector("#safety-list").innerHTML = items.map((item) => `
    <article class="safety-item">
      <strong>${item.title}</strong>
      <p>${item.body}</p>
    </article>
  `).join("");
}

function renderSplit() {
  const driver = rankedDrivers()[0];
  const route = selectedRoute();
  const total = driver.cost * Math.max(1, route.riders);
  const carbon = Math.round(route.distance * route.riders * 0.19);
  document.querySelector("#split-board").innerHTML = `
    <article class="split-card">
      <span>每人分攤</span>
      <strong>$${driver.cost}</strong>
      <p>依距離、停車費與座位數估算。</p>
    </article>
    <article class="split-card">
      <span>總分攤</span>
      <strong>$${total}</strong>
      <p>${route.riders} 位乘客共同分攤。</p>
    </article>
    <article class="split-card">
      <span>本趟減碳</span>
      <strong>${carbon}kg</strong>
      <p>以少開 ${route.riders} 台車估算。</p>
    </article>
  `;
}

function renderActivities() {
  document.querySelector("#activity-feed").innerHTML = activities.map((activity) => `
    <article class="activity-item">
      <div class="stamp">${activity.time}</div>
      <div>
        <strong>${activity.title}</strong>
        <p>${activity.body}</p>
      </div>
    </article>
  `).join("");
}

function renderMetrics() {
  const seats = drivers.reduce((sum, driver) => sum + driver.seats, 0);
  document.querySelector("#metric-requests").textContent = routes.length + 23;
  document.querySelector("#metric-confirmed").textContent = 14 + confirmations;
  document.querySelector("#metric-seats").textContent = seats + 21;
  document.querySelector("#metric-carbon").textContent = `${186 + confirmations * 7}kg`;
}

function render() {
  renderRoutes();
  renderSelectedRoute();
  renderDrivers();
  renderSafety();
  renderSplit();
  renderActivities();
  renderMetrics();
}

document.querySelectorAll(".segment").forEach((button) => {
  button.addEventListener("click", () => {
    mode = button.dataset.mode;
    document.querySelectorAll(".segment").forEach((segment) => segment.classList.remove("active"));
    button.classList.add("active");
    render();
  });
});

document.querySelector("#new-request").addEventListener("click", () => {
  routes.unshift({
    id: `route-${Date.now()}`,
    from: "高雄車站",
    to: "高科大第一校區",
    time: "07:45",
    riders: 2,
    urgency: "通勤",
    distance: 11.4,
    note: "希望每週二、四固定共乘，偏好同校學生。",
  });
  selectedId = routes[0].id;
  render();
});

document.querySelector("#confirm-button").addEventListener("click", () => {
  const route = selectedRoute();
  const driver = rankedDrivers()[0];
  confirmations += 1;
  activities.unshift({
    time: "現在",
    title: `${route.from} → ${route.to} 已確認`,
    body: `${driver.name} 已接受媒合，系統送出上車確認碼與費用分攤明細。`,
  });
  render();
});

document.querySelector("#feedback-button").addEventListener("click", () => {
  activities.unshift({
    time: "現在",
    title: "新增完成後回饋",
    body: "乘客已完成安全抵達確認，信任分數與減碳紀錄已更新。",
  });
  confirmations += 1;
  render();
});

render();
