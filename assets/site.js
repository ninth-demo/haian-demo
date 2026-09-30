/*!
 * 海岸小旅 網站提案示範
 * © 2026 Ninth 九號. All rights reserved. 本程式碼與設計為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
/* 前台共用：頁首、公告、頁尾、手機底部按鈕、風景插畫、房間插畫 */
(function () {
  "use strict";

  var SHOP = {
    tel: "0966-580-579",
    telHref: "tel:0966580579",
    lineId: "@020taamk",
    line: "https://line.me/R/ti/p/@020taamk",
    address: "花蓮縣吉安鄉仁和村海岸路 242 號",
    map: "https://www.google.com/maps/search/?api=1&query=%E8%8A%B1%E8%93%AE%E7%B8%A3%E5%90%89%E5%AE%89%E9%84%89%E6%B5%B7%E5%B2%B8%E8%B7%AF242%E8%99%9F"
  };
  window.SHOP = SHOP;

  var NAV = [
    ["index.html", "首頁"],
    ["rooms.html", "房型"],
    ["around.html", "周邊與交通"],
    ["news.html", "最新消息"],
    ["policy.html", "訂房須知"]
  ];
  var LINE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3C6.5 3 2 6.6 2 11c0 3.9 3.5 7.2 8.3 7.9.3.1.8.2.9.5.1.3.1.7 0 1l-.1.9c0 .3-.2 1 .9.5s5.9-3.5 8.1-6C21.4 14.2 22 12.7 22 11c0-4.4-4.5-8-10-8z"/></svg>';
  window.LINE_ICON = LINE_ICON;

  // ---------- 此刻的花蓮：依台北時間決定天色 ----------
  var PHASES = {
    dawn:  { name: "清晨", sky: ["#2E4A6B", "#C98A8E", "#F6CFAE"], sea: ["#5A7D97", "#2F5570"], far: "#3F556B", near: "#2E4257", land: "#1E2E3C", house: "#DCE3E6", win: "#FFD9A0", orb: { x: 1250, y: 612, r: 44, c: "#FFD7A6" }, stars: false },
    day:   { name: "白天", sky: ["#5E97BD", "#8DBCD6", "#CFE3EC"], sea: ["#3F87A6", "#1F5F80"], far: "#7E97A9", near: "#5E7B8F", land: "#3C5A4A", house: "#F4F6F5", win: "#A9C1CE", orb: { x: 1240, y: 170, r: 40, c: "#FFF6DC" }, stars: false },
    dusk:  { name: "傍晚", sky: ["#2A3A60", "#B06F86", "#F2B08A"], sea: ["#4F6680", "#253F57"], far: "#34405A", near: "#262F45", land: "#1A2233", house: "#C9CFD6", win: "#FFC77A", orb: { x: 330, y: 312, r: 44, c: "#FFB37A" }, stars: false },
    night: { name: "夜晚", sky: ["#0B1626", "#15283F", "#223B58"], sea: ["#1A3048", "#0C1A2A"], far: "#16263A", near: "#0F1C2C", land: "#0A131E", house: "#8F9CA8", win: "#FFD28A", orb: { x: 1250, y: 190, r: 30, c: "#F4F1E4" }, stars: true }
  };
  function phaseFor(hour) {
    if (hour >= 5 && hour < 7) return "dawn";
    if (hour >= 7 && hour < 16) return "day";
    if (hour >= 16 && hour < 18) return "dusk";
    return "night";
  }
  function scene(key, opts) {
    var P = PHASES[key], o = opts || {}, id = "s" + Math.random().toString(36).slice(2, 7), s = "";
    s += '<svg class="scene" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">';
    s += '<defs><linearGradient id="' + id + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.sky[0] + '"/><stop offset=".62" stop-color="' + P.sky[1] + '"/><stop offset="1" stop-color="' + P.sky[2] + '"/></linearGradient>' +
         '<linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + P.sea[0] + '"/><stop offset="1" stop-color="' + P.sea[1] + '"/></linearGradient>' +
         '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + P.orb.c + '" stop-opacity=".55"/><stop offset="1" stop-color="' + P.orb.c + '" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="1440" height="900" fill="url(#' + id + 'k)"/>';
    if (P.stars) {
      var seed = 11;
      for (var i = 0; i < 90; i++) {
        seed = (seed * 16807) % 2147483647; var x = seed % 1440;
        seed = (seed * 16807) % 2147483647; var y = seed % 520;
        seed = (seed * 16807) % 2147483647; var r = 0.6 + (seed % 100) / 70;
        s += '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(2) + '" fill="#fff" opacity="' + (0.35 + (seed % 60) / 100).toFixed(2) + '"/>';
      }
    }
    // 太陽或月亮（在海和山的後面）
    s += '<g class="sun"><circle cx="' + P.orb.x + '" cy="' + P.orb.y + '" r="' + P.orb.r * 3.2 + '" fill="url(#' + id + 'g)"/><circle cx="' + P.orb.x + '" cy="' + P.orb.y + '" r="' + P.orb.r + '" fill="' + P.orb.c + '"/></g>';
    // 太平洋
    s += '<rect x="0" y="620" width="1440" height="280" fill="url(#' + id + 'w)"/>';
    if (key !== "dusk") {
      var rx = P.orb.x;
      s += '<g class="shine" fill="' + P.orb.c + '">';
      for (var k = 0; k < 9; k++) {
        var w = 120 - k * 10;
        s += '<rect x="' + (rx - w / 2 + (k % 2 ? 14 : -10)) + '" y="' + (632 + k * 13) + '" width="' + w + '" height="3" rx="1.5" opacity="' + (0.7 - k * 0.06).toFixed(2) + '"/>';
      }
      s += "</g>";
    }
    // 中央山脈：遠的一層比較淡，一路延伸到海邊
    s += '<path d="M0 400 L70 372 L120 388 L180 330 L240 362 L310 296 L372 342 L430 300 L492 344 L556 322 L620 368 L690 356 L760 410 L840 470 L910 540 L980 620 L0 620 Z" fill="' + P.far + '" opacity=".55"/>';
    s += '<path d="M0 480 C70 452 120 430 190 446 C250 408 300 392 360 420 C420 398 480 414 540 446 C610 470 690 520 770 580 L840 640 L0 640 Z" fill="' + P.far + '"/>';
    s += '<path d="M0 560 C120 520 220 540 330 560 C430 520 540 560 640 600 C720 620 800 640 860 660 L0 660 Z" fill="' + P.near + '"/>';
    // 海岸與小旅店
    s += '<path d="M0 790 C260 740 560 750 860 770 C1100 786 1280 780 1440 760 L1440 900 L0 900 Z" fill="' + P.land + '"/>';
    if (!o.noHouse) {
      var hx = 880, hy = 690;
      s += '<g><rect x="' + hx + '" y="' + hy + '" width="170" height="86" fill="' + P.house + '"/><rect x="' + (hx - 6) + '" y="' + (hy - 8) + '" width="182" height="10" fill="' + P.house + '"/>';
      // 五個窗，五間房
      [[20, 14], [72, 14], [124, 14], [34, 50], [110, 50]].forEach(function (w) {
        s += '<rect x="' + (hx + w[0]) + '" y="' + (hy + w[1]) + '" width="26" height="22" rx="2" fill="' + P.win + '"/>';
      });
      s += '<rect x="' + (hx + 72) + '" y="' + (hy + 50) + '" width="26" height="36" fill="' + P.near + '" opacity=".7"/></g>';
      // 兩棵檳榔樹
      [[1086, 640], [1116, 660]].forEach(function (t) {
        s += '<path d="M' + t[0] + ' ' + (t[1] + 140) + ' C' + (t[0] + 4) + ' ' + (t[1] + 90) + ' ' + (t[0] - 2) + ' ' + (t[1] + 40) + ' ' + t[0] + ' ' + t[1] + '" stroke="' + P.land + '" stroke-width="5" fill="none"/>' +
             '<path d="M' + t[0] + ' ' + t[1] + ' q-34 -6 -48 18 M' + t[0] + ' ' + t[1] + ' q34 -8 50 14 M' + t[0] + ' ' + t[1] + ' q-18 -26 -40 -24 M' + t[0] + ' ' + t[1] + ' q20 -26 42 -22" stroke="' + P.land + '" stroke-width="5" fill="none" stroke-linecap="round"/>';
      });
    }
    s += "</svg>";
    return s;
  }
  var now = HA.taipeiNow();
  var PHASE = phaseFor(now.hour);
  // 展示用：網址加 ?phase=dawn / day / dusk / night 可以直接看不同時段
  var forced = new URLSearchParams(location.search).get("phase");
  if (forced && PHASES[forced]) PHASE = forced;
  var PREVIEW = PHASE !== phaseFor(now.hour);
  window.HASITE = { scene: scene, phase: PHASE, phaseName: PHASES[PHASE].name, now: now, preview: PREVIEW };

  // ---------- 房間照片：還沒上傳時用插畫代替 ----------
  window.roomPhoto = function (room, note) {
    if (room.photo) return '<img src="' + room.photo + '" alt="' + HA.esc(room.name) + '" draggable="false">';
    var twin = /兩張單人/.test(room.bed), four = room.guests >= 4;
    var s = '<svg class="ph" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<rect width="400" height="300" fill="#E6ECEE"/>' +
      '<rect x="236" y="40" width="120" height="150" fill="#CFE0E8"/><rect x="236" y="120" width="120" height="70" fill="#9DBFD0"/>' +
      '<path d="M236 40h120v150H236z M296 40v150" stroke="#8C949B" stroke-width="3" fill="none"/>' +
      '<path d="M0 230h400v70H0z" fill="#D5DDE0"/>';
    function bed(x, w) {
      return '<rect x="' + x + '" y="176" width="' + w + '" height="44" rx="4" fill="#FFFFFF" stroke="#8C949B" stroke-width="3"/>' +
             '<rect x="' + (x + 8) + '" y="160" width="' + (w / 2 - 12) + '" height="22" rx="8" fill="#F4F5F2" stroke="#8C949B" stroke-width="3"/>' +
             (w > 90 ? '<rect x="' + (x + w / 2 + 4) + '" y="160" width="' + (w / 2 - 12) + '" height="22" rx="8" fill="#F4F5F2" stroke="#8C949B" stroke-width="3"/>' : "") +
             '<rect x="' + x + '" y="196" width="' + w + '" height="24" rx="4" fill="#F0A98C" opacity=".55"/>';
    }
    if (four) s += bed(28, 110) + bed(150, 110);
    else if (twin) s += bed(40, 76) + bed(132, 76);
    else s += bed(50, 150);
    s += "</svg>";
    return s + (note === false ? "" : '<span class="ph-note">民宿上傳照片後會顯示在這裡</span>');
  };

  var page = document.body.getAttribute("data-page");
  var data = HA.Store.load();

  var head = document.getElementById("site-head");
  if (head) {
    head.className = "site-head";
    head.innerHTML =
      '<div class="wrap">' +
        '<a class="brand" href="index.html"><b>海岸小旅</b><i>Hualien coast stay</i></a>' +
        '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="main-nav">選單</button>' +
        '<nav class="nav" id="main-nav" aria-label="主選單">' +
          NAV.map(function (n) { return '<a href="' + n[0] + '"' + (n[0] === page ? ' aria-current="page"' : "") + ">" + n[1] + "</a>"; }).join("") +
          '<a class="nav-cta" href="booking.html"' + (page === "booking.html" ? ' aria-current="page"' : "") + ">線上訂房</a>" +
        "</nav>" +
      "</div>";
    var btn = head.querySelector(".menu-btn"), nav = head.querySelector(".nav");
    btn.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "關閉" : "選單";
    });
    var notice = document.createElement("p");
    notice.className = "notice";
    notice.textContent = data.info.notice || "";
    head.parentNode.insertBefore(notice, head);
  }

  var bar = document.createElement("div");
  bar.className = "demo-bar";
  bar.setAttribute("role", "note");
  bar.innerHTML = '這是 <strong>Ninth 九號</strong> 為海岸小旅製作的網站提案示範，並非民宿官方網站，不接受真實訂房。　<a href="admin/index.html">試用民宿後台</a>';
  document.body.insertBefore(bar, document.body.firstChild);

  var foot = document.getElementById("site-foot");
  if (foot) {
    foot.className = "site-foot";
    foot.innerHTML =
      '<div class="wrap"><div class="foot-grid">' +
        "<div><h2>海岸小旅</h2><p style=\"margin-top:10px\">花蓮吉安，五間房的小旅店。</p>" +
          '<span class="license">合法民宿　登記證編號 ' + HA.esc(data.info.license) + "</span></div>" +
        "<div><h3>聯絡我們</h3><ul>" +
          '<li><a href="' + SHOP.telHref + '">' + SHOP.tel + "</a></li>" +
          '<li><a href="' + SHOP.line + '" target="_blank" rel="noopener">LINE ' + SHOP.lineId + "</a></li>" +
          "<li>" + SHOP.address + "</li>" +
          "<li>入住 " + HA.esc(data.info.checkin) + "　退房 " + HA.esc(data.info.checkout) + "</li></ul></div>" +
        "<div><h3>網站導覽</h3><ul>" + NAV.concat([["booking.html", "線上訂房"], ["legal.html", "網站聲明"]]).map(function (n) { return '<li><a href="' + n[0] + '">' + n[1] + "</a></li>"; }).join("") + "</ul></div>" +
      "</div>" +
      '<div class="foot-legal"><span>房價、房型名稱與部分文字為示範內容，實際以民宿公告為準。</span>' +
      '<span>網站提案示範，© 2026 <a href="https://ninthlab.com.tw/" target="_blank" rel="noopener">Ninth 九號</a> 設計製作，未經授權請勿轉載使用。<a href="legal.html">網站聲明</a></span></div></div>';
  }

  var dock = document.createElement("div");
  dock.className = "dock";
  dock.innerHTML = '<a class="btn btn-line" href="' + SHOP.line + '" target="_blank" rel="noopener">' + LINE_ICON + 'LINE 詢問</a><a class="btn btn-sea" href="booking.html">線上訂房</a>';
  document.body.appendChild(dock);

  // 子頁的頁首也用同一片天色
  var ph = document.querySelector(".page-head");
  if (ph) ph.insertAdjacentHTML("afterbegin", scene(PHASE, { noHouse: true }));
})();
