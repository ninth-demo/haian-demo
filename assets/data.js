/*!
 * 海岸小旅 網站提案示範
 * © 2026 Ninth 九號. All rights reserved. 本程式碼與設計為 Ninth 九號之著作，僅供提案展示，未經書面授權不得重製、改作或使用。
 */
/* 示範版把資料存在瀏覽器（localStorage）。正式版把 Store 換成資料庫即可，頁面程式不用改。 */
(function (global) {
  "use strict";

  var KEY = "haian-demo-v1";

  var SEED = {
    info: {
      notice: "入住前一天會用 LINE 傳入住提醒給你。",
      checkin: "13:00",
      checkout: "11:00",
      license: "1909",
      totalRooms: 5
    },
    rooms: [
      { id: "r1", name: "晨光雙人房", guests: 2, bed: "一張雙人床", size: "", weekday: 4300, weekend: 4800,
        desc: "早上拉開窗簾，光會先照到床尾。適合想睡飽、慢慢起床的兩個人。",
        amenities: ["陽台", "冷氣", "獨立衛浴", "平面電視", "冰箱", "電熱水壺"], photo: "" },
      { id: "r2", name: "海風雙人房", guests: 2, bed: "兩張單人床", size: "", weekday: 4300, weekend: 4800,
        desc: "兩張單人床，朋友一起來花蓮、各睡各的也很自在。",
        amenities: ["陽台", "冷氣", "獨立衛浴", "平面電視", "冰箱", "電熱水壺"], photo: "" },
      { id: "r3", name: "小旅四人房", guests: 4, bed: "兩張雙人床", size: "", weekday: 6300, weekend: 6800,
        desc: "一家人或四個好朋友剛好。空間寬一點，行李攤開也不擠。",
        amenities: ["陽台", "冷氣", "獨立衛浴", "平面電視", "冰箱", "電熱水壺"], photo: "" }
    ],
    news: [
      { id: "n1", date: "2026-09-20", title: "入住時，可以問問隱藏版烤布蕾",
        body: "我們有自己做的烤布蕾，沒有寫在菜單上。入住時問問看，當天有做的話就請你吃。\n\n（示範內容：實際公告由民宿在後台更新。）" },
      { id: "n2", date: "2026-09-01", title: "24 小時自助洗衣，玩到晚上也能洗",
        body: "一樓有自助洗衣，24 小時都可以用。在花蓮玩了一整天，衣服洗好再睡，隔天行李輕鬆很多。\n\n（示範內容）" }
    ],
    closed: {},
    bookings: []
  };

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  var Store = {
    load: function () {
      try { var raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) {}
      return clone(SEED);
    },
    save: function (data) {
      try { localStorage.setItem(KEY, JSON.stringify(data)); return true; } catch (e) { return false; }
    },
    reset: function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      return clone(SEED);
    }
  };

  var WEEK = ["日", "一", "二", "三", "四", "五", "六"];

  // 一律用台北時間
  function taipeiNow() {
    var parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false
    }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var date = o.year + "-" + o.month + "-" + o.day;
    var hour = o.hour === "24" ? 0 : +o.hour;
    return { date: date, hour: hour, minute: +o.minute, time: (hour < 10 ? "0" : "") + hour + ":" + o.minute };
  }

  function addDays(dateStr, n) {
    var d = new Date(dateStr + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function dayOf(dateStr) { return new Date(dateStr + "T00:00:00Z").getUTCDay(); }
  // 週五、週六晚上算假日價
  function isWeekendNight(dateStr) { var d = dayOf(dateStr); return d === 5 || d === 6; }

  function nightsBetween(a, b) {
    var out = [];
    for (var d = a; d < b; d = addDays(d, 1)) out.push(d);
    return out;
  }
  function isClosed(data, roomId, dateStr) {
    var c = data.closed[dateStr];
    return !!c && (c.indexOf("all") > -1 || c.indexOf(roomId) > -1);
  }
  function quote(data, room, checkin, checkout) {
    var nights = nightsBetween(checkin, checkout), total = 0, blocked = [];
    nights.forEach(function (d) {
      total += isWeekendNight(d) ? room.weekend : room.weekday;
      if (isClosed(data, room.id, d)) blocked.push(d);
    });
    return { nights: nights, total: total, deposit: Math.round(total * 0.3), blocked: blocked };
  }

  function money(n) { return "NT$" + Number(n).toLocaleString("zh-TW"); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function paras(s) {
    return esc(s).split(/\n{2,}/).map(function (p) { return "<p>" + p.replace(/\n/g, "<br>") + "</p>"; }).join("");
  }
  function sortedNews(data) { return data.news.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }); }
  function fmt(dateStr) { var p = dateStr.split("-"); return +p[1] + "/" + +p[2] + "（" + WEEK[dayOf(dateStr)] + "）"; }

  global.HA = { KEY: KEY, WEEK: WEEK, Store: Store, taipeiNow: taipeiNow, addDays: addDays, dayOf: dayOf,
                isWeekendNight: isWeekendNight, nightsBetween: nightsBetween, isClosed: isClosed, quote: quote,
                money: money, esc: esc, paras: paras, sortedNews: sortedNews, fmt: fmt };
})(window);
