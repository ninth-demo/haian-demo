/*!
 * 海岸小旅 網站提案示範：民宿後台
 * © 2026 Ninth 九號. All rights reserved. 本程式碼為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var data = HA.Store.load();
  var TITLES = { overview: "總覽", bookings: "訂房單", calendar: "房況日曆", rooms: "房型與房價", news: "最新消息", info: "民宿資訊" };
  var today = HA.taipeiNow().date;

  function flash(msg) {
    var s = $("#saved"); s.textContent = msg; s.classList.add("show");
    clearTimeout(flash.t); flash.t = setTimeout(function () { s.classList.remove("show"); }, 2400);
  }
  function commit(msg) {
    if (!HA.Store.save(data)) { flash("儲存空間不夠，請刪掉幾張照片再試一次"); data = HA.Store.load(); renderAll(); return false; }
    renderAll(); if (msg) flash(msg); return true;
  }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function armed(btn, label) {
    if (btn.dataset.armed) return true;
    btn.dataset.armed = "1"; var old = btn.textContent; btn.textContent = label || "確定刪除？";
    setTimeout(function () { delete btn.dataset.armed; btn.textContent = old; }, 3000);
    return false;
  }
  function photoOf(r) {
    if (r.photo) return '<img src="' + r.photo + '" alt="" style="width:100%;height:100%;object-fit:cover">';
    return '<div style="display:grid;place-items:center;height:100%;color:var(--stone);font-size:14px;background:var(--mist)">還沒有照片</div>';
  }

  // ---------- 登入 ----------
  function authed() { try { return sessionStorage.getItem("ha-admin") === "1"; } catch (e) { return false; } }
  function showApp() { $("#login").style.display = "none"; $("#app").classList.add("on"); route(); }
  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if ($("#u").value.trim() === "demo" && $("#pw").value === "1234") {
      try { sessionStorage.setItem("ha-admin", "1"); } catch (err) {}
      showApp();
    } else { $("#login-err").textContent = "帳號或密碼不對。示範帳號是 demo，密碼是 1234。"; }
  });
  $("#logout").addEventListener("click", function (e) {
    e.preventDefault();
    try { sessionStorage.removeItem("ha-admin"); } catch (err) {}
    location.hash = ""; location.reload();
  });
  function route() {
    var p = (location.hash || "#overview").slice(1);
    if (!TITLES[p]) p = "overview";
    document.querySelectorAll(".pane").forEach(function (el) { el.classList.toggle("on", el.id === "p-" + p); });
    document.querySelectorAll(".side a[data-p]").forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-p") === p); });
    $("#title").textContent = TITLES[p];
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // ---------- 房況：加上或移除客滿 ----------
  function setClosed(roomId, dates, on) {
    dates.forEach(function (d) {
      var list = data.closed[d] || [];
      var i = list.indexOf(roomId);
      if (on && i < 0) list.push(roomId);
      if (!on && i > -1) list.splice(i, 1);
      if (list.length) data.closed[d] = list; else delete data.closed[d];
    });
  }

  // ---------- 總覽 ----------
  function renderOverview() {
    var pending = data.bookings.filter(function (b) { return b.status === "待確認"; }).length;
    $("#ov-pending").textContent = pending;
    $("#badge").textContent = pending || ""; $("#badge").style.display = pending ? "" : "none";
    var tIn = data.bookings.filter(function (b) { return b.checkin === today && b.status === "已確認"; });
    $("#ov-today").textContent = tIn.length ? tIn.map(function (b) { return b.name + "（" + b.roomName + "）"; }).join("、") : "今天沒有入住";
    var end = HA.addDays(today, 30);
    $("#ov-month").textContent = data.bookings.filter(function (b) { return b.status === "已確認" && b.checkin >= today && b.checkin <= end; }).length;
  }

  // ---------- 訂房單 ----------
  var STATUS = ["待確認", "已確認", "已入住", "已取消"];
  function renderBookings() {
    var list = data.bookings.slice().sort(function (a, b) { return a.checkin < b.checkin ? -1 : 1; });
    $("#book-table").innerHTML = "<thead><tr><th>入住</th><th>房間</th><th>訂房人</th><th>金額</th><th>備註</th><th>狀態</th><th></th></tr></thead><tbody>" +
      (list.length ? list.map(function (b) {
        return "<tr><td style='white-space:nowrap'>" + HA.fmt(b.checkin) + '<div class="sub">' + b.nights + " 晚，退房 " + HA.fmt(b.checkout) + "</div></td>" +
          "<td>" + HA.esc(b.roomName) + '<div class="sub">' + b.guests + " 人</div></td>" +
          "<td>" + HA.esc(b.name) + '<div class="sub"><a href="tel:' + b.phone + '">' + b.phone + "</a>" + (b.email ? "<br>" + HA.esc(b.email) : "") + "</div></td>" +
          "<td style='white-space:nowrap'>" + HA.money(b.total) + '<div class="sub">定金 ' + HA.money(b.deposit) + "</div></td>" +
          "<td>" + '<div class="sub">抵達 ' + HA.esc(b.arrive) + "</div>" + (b.memo ? HA.esc(b.memo) : "") + "</td>" +
          '<td><select data-st="' + b.id + '">' + STATUS.map(function (s) { return "<option" + (s === b.status ? " selected" : "") + ">" + s + "</option>"; }).join("") + "</select></td>" +
          '<td><button class="link-btn" type="button" data-del="' + b.id + '">刪除</button></td></tr>';
      }).join("") : '<tr><td colspan="7" class="muted">還沒有訂房。可以到網站的「線上訂房」頁送一筆測試訂房，再回來這裡看。</td></tr>') + "</tbody>";
  }
  $("#book-table").addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-st"); if (!id) return;
    var b = byId(data.bookings, id), was = b.status, next = e.target.value, nights = HA.nightsBetween(b.checkin, b.checkout);
    if (next === "已確認" && was !== "已確認" && was !== "已入住") {
      var clash = nights.filter(function (d) { return HA.isClosed(data, b.room, d); });
      if (clash.length) { flash(HA.fmt(clash[0]) + " 這間已經客滿，請先確認房況"); e.target.value = was; return; }
      setClosed(b.room, nights, true);
    }
    if (next === "已取消" && (was === "已確認" || was === "已入住")) setClosed(b.room, nights, false);
    b.status = next;
    commit(next === "已確認" ? "已確認，那幾晚已自動設為客滿" : next === "已取消" && (was === "已確認" || was === "已入住") ? "已取消，那幾晚已重新開放訂房" : "狀態改為「" + next + "」");
  });
  $("#book-table").addEventListener("click", function (e) {
    var id = e.target.getAttribute("data-del");
    if (id && armed(e.target)) { data.bookings = data.bookings.filter(function (b) { return b.id !== id; }); commit("訂房單已刪除"); }
  });

  // ---------- 房況日曆 ----------
  var calMonth = today.slice(0, 7);
  function shiftMonth(m, n) { var y = +m.slice(0, 4), mo = +m.slice(5, 7) - 1 + n; y += Math.floor(mo / 12); mo = ((mo % 12) + 12) % 12; return y + "-" + (mo < 9 ? "0" : "") + (mo + 1); }
  function renderCalendar() {
    var sel = $("#cal-room"), cur = sel.value;
    sel.innerHTML = data.rooms.map(function (r) { return '<option value="' + r.id + '">' + HA.esc(r.name) + "</option>"; }).join("");
    if (cur && byId(data.rooms, cur)) sel.value = cur;
    var rid = sel.value, first = calMonth + "-01", html = HA.WEEK.map(function (w) { return '<span class="dow">' + w + "</span>"; }).join("");
    $("#cal-month").textContent = +calMonth.slice(0, 4) + " 年 " + +calMonth.slice(5, 7) + " 月";
    $("#prev").disabled = calMonth <= today.slice(0, 7);
    for (var i = 0; i < HA.dayOf(first); i++) html += "<span></span>";
    var fullDays = [];
    for (var d = first; d.slice(0, 7) === calMonth; d = HA.addDays(d, 1)) {
      var full = HA.isClosed(data, rid, d), past = d < today;
      if (full) fullDays.push(d);
      html += '<button type="button" class="d' + (full ? " full" : "") + '" data-d="' + d + '"' + (past ? " disabled" : "") + ">" + +d.slice(8) + "<small>" + (past ? "" : full ? "客滿" : "有空房") + "</small></button>";
    }
    $("#cal").innerHTML = html;
    $("#closed-table").innerHTML = "<thead><tr><th>日期</th><th>原因</th></tr></thead><tbody>" + (fullDays.length ? fullDays.map(function (d) {
      var b = data.bookings.filter(function (x) { return x.room === rid && (x.status === "已確認" || x.status === "已入住") && d >= x.checkin && d < x.checkout; })[0];
      return "<tr><td>" + HA.fmt(d) + "</td><td>" + (b ? "訂房：" + HA.esc(b.name) : "手動設定") + "</td></tr>";
    }).join("") : '<tr><td colspan="2" class="muted">這個月這間房都有空房。</td></tr>') + "</tbody>";
  }
  $("#cal-room").addEventListener("change", renderCalendar);
  $("#prev").addEventListener("click", function () { calMonth = shiftMonth(calMonth, -1); renderCalendar(); });
  $("#next").addEventListener("click", function () { calMonth = shiftMonth(calMonth, 1); renderCalendar(); });
  $("#cal").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
    var rid = $("#cal-room").value, d = b.dataset.d, on = !HA.isClosed(data, rid, d);
    setClosed(rid, [d], on);
    commit(HA.fmt(d) + (on ? " 設為客滿" : " 重新開放訂房"));
  });

  // ---------- 房型與房價 ----------
  function renderRooms() {
    $("#room-editor").innerHTML = data.rooms.map(function (r) {
      return '<div class="room-edit" data-id="' + r.id + '">' +
        '<div><div class="photo">' + photoOf(r) + "</div>" +
          '<label class="upload">上傳照片<input type="file" accept="image/*" data-up="' + r.id + '"></label>' +
          (r.photo ? ' <button class="link-btn" type="button" data-rmphoto="' + r.id + '">移除照片</button>' : "") + "</div>" +
        '<div class="form" style="gap:12px">' +
          '<div class="row2"><div class="field"><label>房型名稱</label><input data-f="name" value="' + HA.esc(r.name) + '"></div><div class="field"><label>床型</label><input data-f="bed" value="' + HA.esc(r.bed) + '"></div></div>' +
          '<div class="grid3"><div class="field"><label>人數</label><input data-f="guests" inputmode="numeric" value="' + r.guests + '"></div><div class="field"><label>平日房價</label><input data-f="weekday" inputmode="numeric" value="' + r.weekday + '"></div><div class="field"><label>假日房價</label><input data-f="weekend" inputmode="numeric" value="' + r.weekend + '"></div></div>' +
          '<div class="field"><label>房間介紹</label><textarea data-f="desc" rows="3">' + HA.esc(r.desc) + "</textarea></div>" +
          '<div class="field"><label>房內設備（用逗號分開）</label><input data-f="amenities" value="' + HA.esc(r.amenities.join("，")) + '"></div>' +
          '<div class="row-acts" style="margin-top:0"><button class="btn btn-sea btn-small" type="button" data-save="' + r.id + '">儲存</button><button class="link-btn" type="button" data-del="' + r.id + '">刪除這個房型</button></div>' +
        "</div></div>";
    }).join("") || '<p class="muted" style="margin-bottom:16px">還沒有房型。</p>';
  }
  function num(v) { return Number(String(v).replace(/[^\d]/g, "")) || 0; }
  $("#room-editor").addEventListener("click", function (e) {
    var save = e.target.getAttribute("data-save"), del = e.target.getAttribute("data-del"), rm = e.target.getAttribute("data-rmphoto");
    if (save) {
      var box = e.target.closest(".room-edit"), r = byId(data.rooms, save);
      function v(k) { return box.querySelector('[data-f="' + k + '"]').value.trim(); }
      if (!v("name") || !num(v("weekday")) || !num(v("weekend")) || !num(v("guests"))) { flash("房型名稱、人數、平日和假日房價都要填"); return; }
      r.name = v("name"); r.bed = v("bed"); r.guests = num(v("guests")); r.weekday = num(v("weekday")); r.weekend = num(v("weekend"));
      r.desc = v("desc"); r.amenities = v("amenities").split(/[,，、]/).map(function (s) { return s.trim(); }).filter(Boolean);
      commit("「" + r.name + "」已儲存，網站已更新");
    }
    if (rm) { byId(data.rooms, rm).photo = ""; commit("照片已移除"); }
    if (del && armed(e.target, "再按一次確定刪除")) { data.rooms = data.rooms.filter(function (r) { return r.id !== del; }); commit("房型已刪除"); }
  });
  // 照片：先在瀏覽器壓縮成最長 1200px 的 JPEG，再存起來
  $("#room-editor").addEventListener("change", function (e) {
    var id = e.target.getAttribute("data-up"), file = e.target.files && e.target.files[0];
    if (!id || !file) return;
    if (!/^image\//.test(file.type)) { flash("請選擇圖片檔"); return; }
    var img = new Image(), url = URL.createObjectURL(file);
    img.onload = function () {
      var max = 1200, s = Math.min(1, max / Math.max(img.width, img.height));
      var c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      byId(data.rooms, id).photo = c.toDataURL("image/jpeg", 0.78);
      commit("照片已上傳，網站已更新");
    };
    img.onerror = function () { flash("這張圖片讀不出來，換一張試試"); };
    img.src = url;
  });
  $("#add-room").addEventListener("click", function () {
    data.rooms.push({ id: "r" + Date.now(), name: "新房型", guests: 2, bed: "一張雙人床", size: "", weekday: 4300, weekend: 4800, desc: "", amenities: ["陽台", "冷氣", "獨立衛浴"], photo: "" });
    commit("已新增房型，記得改名稱和房價");
  });

  // ---------- 最新消息 ----------
  function resetNews() {
    $("#news-form").reset(); $("#nf-id").value = ""; $("#nf-d").value = today;
    $("#nf-title").textContent = "發布消息"; $("#nf-submit").textContent = "發布"; $("#nf-cancel").style.display = "none"; $("#nf-err").textContent = "";
  }
  function renderNews() {
    var list = HA.sortedNews(data);
    $("#news-table").innerHTML = "<thead><tr><th>日期</th><th>標題</th><th></th></tr></thead><tbody>" + (list.length ? list.map(function (n) {
      return "<tr><td style='white-space:nowrap'>" + n.date.replace(/-/g, ".") + "</td><td>" + HA.esc(n.title) + '</td><td style="white-space:nowrap"><a class="link-btn edit" href="../news-post.html?id=' + n.id + '" target="_blank" rel="noopener">查看</a><button class="link-btn edit" type="button" data-edit="' + n.id + '">編輯</button><button class="link-btn" type="button" data-del="' + n.id + '">刪除</button></td></tr>';
    }).join("") : '<tr><td colspan="3" class="muted">還沒有消息。</td></tr>') + "</tbody>";
  }
  $("#news-table").addEventListener("click", function (e) {
    var ed = e.target.getAttribute("data-edit"), del = e.target.getAttribute("data-del");
    if (ed) { var n = byId(data.news, ed); $("#nf-id").value = n.id; $("#nf-t").value = n.title; $("#nf-d").value = n.date; $("#nf-b").value = n.body; $("#nf-title").textContent = "編輯消息"; $("#nf-submit").textContent = "儲存修改"; $("#nf-cancel").style.display = ""; $("#nf-t").focus(); }
    if (del && armed(e.target)) { data.news = data.news.filter(function (x) { return x.id !== del; }); resetNews(); commit("消息已刪除"); }
  });
  $("#nf-cancel").addEventListener("click", resetNews);
  $("#news-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var item = { title: $("#nf-t").value.trim(), date: $("#nf-d").value, body: $("#nf-b").value.trim() };
    if (!item.title || !item.date || !item.body) { $("#nf-err").textContent = "標題、日期、內容都要填。"; return; }
    var id = $("#nf-id").value;
    if (id) { Object.assign(byId(data.news, id), item); resetNews(); commit("消息已更新"); }
    else { item.id = "n" + Date.now(); data.news.push(item); resetNews(); commit("消息已發布"); }
  });

  // ---------- 民宿資訊 ----------
  function renderInfo() {
    $("#i-notice").value = data.info.notice || ""; $("#i-ci").value = data.info.checkin; $("#i-co").value = data.info.checkout; $("#i-lic").value = data.info.license;
  }
  $("#info-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!$("#i-lic").value.trim()) { $("#i-err").textContent = "民宿登記證編號不能留空，網路住宿廣告依法要寫出編號。"; return; }
    $("#i-err").textContent = "";
    data.info.notice = $("#i-notice").value.trim(); data.info.checkin = $("#i-ci").value; data.info.checkout = $("#i-co").value; data.info.license = $("#i-lic").value.trim();
    commit("民宿資訊已儲存");
  });

  $("#reset").addEventListener("click", function (e) {
    if (!armed(e.target, "再按一次確定還原")) return;
    data = HA.Store.reset(); resetNews(); renderAll(); flash("已還原成示範資料");
  });
  window.addEventListener("storage", function (e) { if (e.key === HA.KEY) { data = HA.Store.load(); renderAll(); } });

  function renderAll() { renderOverview(); renderBookings(); renderCalendar(); renderRooms(); renderNews(); renderInfo(); }
  resetNews();
  renderAll();
  if (authed()) showApp();
})();
