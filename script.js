document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function escapeHtml(str){return String(str).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}

  // === SECTION: global helpers ===
  var toastEl = $('#toast'), toastTimer;
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
  }
  function smoothScrollTo(target) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return;
    var navH = $('.site-nav').offsetHeight;
    var y = el.getBoundingClientRect().top + window.pageYOffset - navH - 14;
    window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  // === SECTION: externe Links bestaetigen (Verlassen der Seite) ===
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (!/^https?:\/\//i.test(href)) return;
    var url;
    try { url = new URL(href); } catch (err) { return; }
    if (url.host === location.host) return;
    var host = url.host.replace(/^www\./, '');
    if (!window.confirm('Du verl\u00e4sst jetzt \u201eStop. Before You Shop.\u201c und wirst zu ' + host + ' weitergeleitet.\n\nM\u00f6chtest du fortfahren?')) {
      e.preventDefault();
    }
  });

  // === SECTION: navigation ===
  var menuPanel = $('#menuPanel'), menuOverlay = $('#menuOverlay'), hamburger = $('#hamburgerBtn');
  function openMenu() {
    menuPanel.classList.add('open');
    menuOverlay.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menuPanel.classList.remove('open');
    menuOverlay.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  hamburger.addEventListener('click', openMenu);
  $('#menuClose').addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  // Smooth-scroll for every in-page anchor + closes menu
  $$('[data-nav]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (href && href.charAt(0) === '#') {
        e.preventDefault();
        closeMenu();
        smoothScrollTo(href);
      }
    });
  });
  // Action cards + any [data-scroll]
  $$('[data-scroll]').forEach(function (el) {
    el.addEventListener('click', function () { smoothScrollTo(el.getAttribute('data-scroll')); });
  });
  var searchBtn = $('#searchBtn');
  if (searchBtn) searchBtn.addEventListener('click', function () { showToast('Suche kommt bald'); });

  // === SECTION: stories (erfahrungen) + hero teaser ===
  if ($('#storiesTrack')) {
  var STORIES_KEY = 'sbys_stories';
  var baseStories = [
    { text: "Ich habe diesen Monat fast 300€ für Klamotten ausgegeben, weil ich dachte, dass meine Sachen vom letzten Jahr mir nicht mehr gefallen. Letztendlich habe ich fast nichts davon getragen. Von dem Geld hätte ich einen ganzen Monat einkaufen gehen können.", author: "Marie, 24" },
    { text: "Ich habe mir Sneaker für 120€ gekauft, weil sie auf TikTok viral gegangen sind. Nach zwei Wochen hat sie keiner mehr getragen – auch ich nicht. Die stehen seitdem unberührt im Regal.", author: "Lena, 19" },
    { text: "Ich wollte eine Handyhülle kaufen. Drei Tage später hatte ich sie komplett vergessen. Das Geld habe ich dann lieber für ein Konzert ausgegeben – viel besser.", author: "Jonas, 22" },
    { text: "Ich habe dieses Jahr bestimmt 200€ für Dinge ausgegeben, die ich auf Instagram gesehen habe. Die meisten benutze ich kaum. Das Geld hätte ich besser gespart.", author: "Sophie, 17" },
    { text: "Ich habe gewartet, bevor ich mir eine teure Jacke gekauft habe. Nach drei Tagen wollte ich sie immer noch – und heute ist sie mein liebstes Kleidungsstück.", author: "Tim, 20" }
  ];
  var extraStories = [];
  try { extraStories = JSON.parse(sessionStorage.getItem(STORIES_KEY) || '[]'); } catch (e) { extraStories = []; }
  var stories = baseStories.concat(extraStories);
  var curStory = 0, storyTimer;

  var storiesTrack = $('#storiesTrack'), storiesDots = $('#storiesDots'), teaserQuote = $('#teaserQuote');

  function renderStories() {
    storiesTrack.innerHTML = stories.map(function (s) {
      return '<div class="story-card"><p class="sc-quote">\u201C' + escapeHtml(s.text) + '\u201D<span class="sc-author">\u2014 ' + escapeHtml(s.author) + '</span></p></div>';
    }).join('');
    storiesDots.innerHTML = stories.map(function (_, i) {
      return '<button class="s-dot' + (i === curStory ? ' active' : '') + '" data-story="' + i + '" aria-label="Geschichte ' + (i + 1) + '"></button>';
    }).join('');
    $$('.s-dot', storiesDots).forEach(function (d) {
      d.addEventListener('click', function () { stopAuto(); goStory(parseInt(d.getAttribute('data-story'), 10)); });
    });
    updateStoryPos();
  }
  function updateStoryPos() {
    storiesTrack.style.transform = 'translateX(-' + (curStory * 100) + '%)';
    $$('.s-dot', storiesDots).forEach(function (d, i) { d.classList.toggle('active', i === curStory); });
  }
  var teaserIdx = 0, teaserTimer;
  function showTeaser() {
    var s = stories[teaserIdx];
    teaserQuote.style.opacity = '0';
    setTimeout(function () {
      var t = s.text.length > 116 ? s.text.substring(0, 116).trim() + '…' : s.text;
      teaserQuote.innerHTML = '<span class="tq-text">\u201C' + escapeHtml(t) + '\u201D</span><span class="tq-author">\u2014 ' + escapeHtml(s.author) + '</span>';
      teaserQuote.style.opacity = '1';
    }, 200);
  }
  function startTeaserRotation() {
    showTeaser();
    clearInterval(teaserTimer);
    teaserTimer = setInterval(function () {
      teaserIdx = (teaserIdx + 1) % stories.length;
      showTeaser();
    }, 5000);
  }
  function goStory(i) {
    curStory = (i + stories.length) % stories.length;
    updateStoryPos();
  }
  function startAuto() {
    clearInterval(storyTimer);
    storyTimer = setInterval(function () { goStory(curStory + 1); }, 5000);
  }
  function stopAuto() {
    clearInterval(storyTimer);
    storyTimer = null;
  }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  $('#storyPrev').addEventListener('click', function () { stopAuto(); goStory(curStory - 1); });
  $('#storyNext').addEventListener('click', function () { stopAuto(); goStory(curStory + 1); });
  renderStories();
  startTeaserRotation(); // Hero-Vorschau rotiert eigenstaendig; Karussell unten nur per Klick

  // Submit story
  var expText = $('#expText'), expName = $('#expName'), charCount = $('#charCount');

  // Lightweight client-side moderation (first line of defence; real launch needs server review)
  function moderateSubmission(text, name) {
    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); };
    var raw = text.trim();
    if (raw.length < 15) return { ok: false, msg: 'Erzähl uns ruhig etwas mehr (mind. 15 Zeichen).' };
    if (/https?:\/\/|www\.|\.(com|de|net|org|info|shop)\b/i.test(text)) return { ok: false, msg: 'Bitte keine Links einfügen.' };
    if (/(.)\1{6,}/.test(text)) return { ok: false, msg: 'Bitte schreib einen echten Satz – keine Zeichenketten.' };
    var letters = text.replace(/[^A-Za-zÄÖÜäöüß]/g, '');
    if (letters.length > 24 && letters === letters.toUpperCase()) return { ok: false, msg: 'Bitte nicht nur in Großbuchstaben schreiben.' };
    var hay = ' ' + norm(text + ' ' + (name || '')) + ' ';
    var bad = ['arschloch','arschloecher','scheisse','scheiss','scheis','fick','ficken','fuck','fuckin','shit','wichser','hurensohn','hure','schlampe','fotze','missgeburt','spasti','spast','vollidiot','vollpfosten','trottel','nazi','hitler','heil hitler','bitch','nutte','kanake','schwuchtel','schwul ','mongo','spacko','verpiss','fresse','wixer','wixxer','penner','assi','hure'];
    for (var i = 0; i < bad.length; i++) { if (hay.indexOf(bad[i]) !== -1) return { ok: false, msg: 'Bitte bleib respektvoll – ohne Beleidigungen.' }; }
    var t = norm(text);
    var topics = ['kauf','gekauft','geld','euro','spar','gespart','konsum','trend','impuls','shop','klamott','kleid','schuh','sneaker','online','bestell','rabatt','sale','wunsch','warte','gewartet','bereu','ausgeg','ausgeb','leist','budget','brauch','teuer','billig','marke','werbung','social','insta','tiktok','widerstand','versuch','tasche','handy','schrank','regal','paket','retoure','geh\u00f6rt'];
    var hasTopic = topics.some(function (w) { return t.indexOf(w) !== -1; });
    if (!hasTopic) return { ok: false, msg: 'Erzähl uns von deiner Konsum- oder Kauf-Erfahrung.' };
    return { ok: true };
  }
  expText.addEventListener('input', function () {
    var n = expText.value.length;
    charCount.textContent = n + ' / 300 Zeichen';
    charCount.classList.toggle('warn', n >= 280);
  });
  $('#submitStory').addEventListener('click', function () {
    var text = expText.value.trim();
    var name = expName.value.trim() || 'Anonym';
    if (!text) { showToast('Bitte schreibe deine Erfahrung!'); expText.focus(); return; }
    var mod = moderateSubmission(text, expName.value.trim());
    if (!mod.ok) { showToast(mod.msg); expText.focus(); return; }
    var story = { text: text, author: name };
    extraStories.push(story);
    try { sessionStorage.setItem(STORIES_KEY, JSON.stringify(extraStories)); } catch (e) {}
    stories.push(story);
    expText.value = ''; expName.value = '';
    charCount.textContent = '0 / 300 Zeichen';
    charCount.classList.remove('warn');
    renderStories();
    goStory(stories.length - 1);
    showToast('Danke! Deine Erfahrung wird vor der Veröffentlichung geprüft.');
  });

  }

  // === SECTION: video slider ===
  if ($('#vtrack')) {
  var vtrack = $('#vtrack'), vidPrev = $('#vidPrev'), vidNext = $('#vidNext');
  var vTotal = vtrack.children.length, vIdx = 0;
  function visibleVids() { return window.innerWidth <= 760 ? 1 : 2; }
  function maxVidIdx() { return Math.max(0, vTotal - visibleVids()); }
  function updateVideo() {
    if (vIdx > maxVidIdx()) vIdx = maxVidIdx();
    var slide = vtrack.children[0];
    var gap = 22;
    var step = slide.getBoundingClientRect().width + gap;
    vtrack.style.transform = 'translateX(-' + (vIdx * step) + 'px)';
    vidPrev.disabled = vIdx <= 0;
    vidNext.disabled = vIdx >= maxVidIdx();
  }
  vidPrev.addEventListener('click', function () { vIdx = Math.max(0, vIdx - 1); updateVideo(); });
  vidNext.addEventListener('click', function () { vIdx = Math.min(maxVidIdx(), vIdx + 1); updateVideo(); });
  $$('.v-play').forEach(function (p) {
    p.addEventListener('click', function () {
      var src = p.getAttribute('data-src');
      if (src) { openVideo(src); }
      else { showToast('▶ „' + p.getAttribute('data-video') + '“ – Video startet bald!'); }
    });
  });
  updateVideo();

  }

  // === SECTION: video lightbox ===
  (function () {
    var modal = $('#videoModal');
    if (!modal) return;
    var player = $('#videoPlayer');
    var source = player.querySelector('source');
    window.openVideo = function (src) {
      source.setAttribute('src', src);
      player.load();
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      var pr = player.play();
      if (pr && pr.catch) { pr.catch(function () {}); }
    };
    function closeVideo() {
      player.pause();
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    $('#videoClose').addEventListener('click', closeVideo);
    modal.querySelector('[data-vclose]').addEventListener('click', closeVideo);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) { closeVideo(); }
    });
  })();

  // === SECTION: reminder helpers (used by Wunsch-Parkplatz) ===
  function pad(n) { return String(n).padStart(2, '0'); }
  function notificationsSupported() { return 'Notification' in window; }
  function fireNotification(item) {
    if (!notificationsSupported() || Notification.permission !== 'granted') return;
    try {
      new Notification('Stop. Before You Shop. – Zeit ist um! ⏳', {
        body: '„' + item + '\u201C: Deine 3 Tage Bedenkzeit sind vorbei. Willst du es immer noch?',
        icon: 'assets/mascot-head-trim.png',
        tag: 'sbys-' + item
      });
    } catch (e) {}
  }
  function icsEscape(s) { return String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'); }
  function icsDate(d) {
    return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z';
  }
  function downloadWishIcs(item, end) {
    var start = new Date(end), endDate = new Date(end + 15 * 60000);
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stop Before You Shop//Challenge//DE', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:sbys-' + end + '@stopbeforeyoushop',
      'DTSTAMP:' + icsDate(new Date()),
      'DTSTART:' + icsDate(start),
      'DTEND:' + icsDate(endDate),
      'SUMMARY:' + icsEscape('Willst du „' + item + '“ immer noch?'),
      'DESCRIPTION:' + icsEscape('Deine 3-Tage-Bedenkzeit ist um. Ist der Wunsch noch da, ist es eine bewusste Entscheidung – kein Impulskauf. #DreiTageWartenChallenge'),
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:Stop. Before You Shop – Bedenkzeit vorbei', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'erinnerung-' + item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.ics';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // Confetti burst in brand colors — used when a parked wish reaches its 3 days.
  function celebrate() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var cs = getComputedStyle(document.documentElement);
    var pick = function (v, fb) { var c = (cs.getPropertyValue(v) || '').trim(); return (c && c.charAt(0) === '#') ? c : fb; };
    var colors = [pick('--cyan', '#00C8C8'), '#C8F0F0', pick('--red', '#E8173A'), '#1A1A1A', '#ffffff'];
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:400';
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d'); ctx.scale(dpr, dpr);
    var N = 140, parts = [];
    for (var i = 0; i < N; i++) {
      parts.push({
        x: innerWidth * (0.2 + Math.random() * 0.6), y: innerHeight * 0.35 + Math.random() * 60,
        w: 7 + Math.random() * 7, h: 9 + Math.random() * 9,
        vx: (Math.random() - 0.5) * 9, vy: -7 - Math.random() * 9,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4,
        color: colors[(Math.random() * colors.length) | 0]
      });
    }
    var start = performance.now(), DUR = 2600;
    (function frame(t) {
      var el = t - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      parts.forEach(function (p) {
        p.vy += 0.28; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - el / DUR);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (el < DUR) requestAnimationFrame(frame); else canvas.remove();
    })(start);
  }

  // === SECTION: tipps accordion ===
  function initAccordion(accordion, items, numbered) {
    accordion.innerHTML = items.map(function (t, i) {
      return '<div class="acc-item" data-acc="' + i + '">' +
        '<button class="acc-head" aria-expanded="false" aria-controls="' + accordion.id + 'Body' + i + '">' +
        (numbered ? '<span class="acc-num">' + pad(i + 1) + '</span>' : '') +
        '<span class="acc-title">' + t.title + '</span>' +
        '<span class="acc-icon">+</span></button>' +
        '<div class="acc-body" id="' + accordion.id + 'Body' + i + '"><div class="acc-body-inner">' + t.body + '</div></div></div>';
    }).join('');
    $$('.acc-head', accordion).forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.parentElement;
        var isOpen = item.classList.contains('open');
        $$('.acc-item.open', accordion).forEach(function (op) {
          op.classList.remove('open');
          op.querySelector('.acc-head').setAttribute('aria-expanded', 'false');
          op.querySelector('.acc-body').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          head.setAttribute('aria-expanded', 'true');
          var body = item.querySelector('.acc-body');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  if ($('#accordion')) {
  var tips = [
    { title: "Abwarten", body: "Die meisten Kaufimpulse verlieren nach ein paar Tagen von selbst ihren Reiz – das, was sich im Moment wie ein dringendes Bedürfnis anfühlt, ist oft nur eine kurze Laune. Lege dir deshalb feste Sperrfristen fest: alles über 30 € → mindestens 3 Tage warten, alles über 100 € → 30 Tage. Schreib dir den Wunsch auf einen Zettel oder eine Merkliste und schau später noch einmal drauf. Wenn du es dann immer noch wirklich willst und es in dein Budget passt, ist es eine bewusste Entscheidung – und kein Impulskauf." },
    { title: "Keine Spontankäufe", body: "Geh nie ohne Plan einkaufen. Schreib dir vorher eine konkrete Liste mit dem, was du tatsächlich brauchst, und halte dich strikt daran – im Supermarkt genauso wie online. „Nur mal schauen\" endet erfahrungsgemäß selten ohne vollen Warenkorb. Setze außerdem auf Qualität statt Quantität: ein gutes Teil, das jahrelang hält, ist am Ende günstiger und nachhaltiger als fünf billige, die schnell kaputtgehen oder dir nicht mehr gefallen." },
    { title: "Werbung bewusst analysieren", body: "Frag dich bei jeder Anzeige: Welches Gefühl oder Bedürfnis soll hier eigentlich angesprochen werden – und bringt mir das Produkt diesen Nutzen wirklich? Werbung verkauft selten den Gegenstand selbst, sondern ein Lebensgefühl: Zugehörigkeit, Status, Glück. Das, was du auf Social Media siehst, ist eine sorgfältig inszenierte Kombination aus schönen Bildern, geschickter Sprache und Musik. Wenn du dieses Spiel durchschaust, verlieren viele „Must-haves\" schlagartig ihre Macht über dich." },
    { title: "Nicht jeden Trend mitmachen", body: "Trends sind per Definition vergänglich – was heute überall viral geht, ist in ein paar Monaten oft schon wieder vergessen. Dein Geld dagegen ist real und einmal ausgegeben weg. Frag dich ehrlich: Will ich das wirklich für mich, oder nur, weil es gerade alle haben? Wer jedem Hype hinterherkauft, gibt viel aus für Dinge, die kaum getragen oder benutzt werden. Deinen eigenen Stil zu finden macht unabhängiger – und am Ende auch zufriedener." },
    { title: "Ersatzbefriedigung finden", body: "Oft steckt hinter dem Kaufimpuls einfach die Lust auf etwas Neues – und die lässt sich auch ohne Geld stillen. Style alte Kleidung neu, kombiniere Sachen anders, streiche eine Kommode, stell deine Wohnung um oder probier eine neue Frisur aus. Tauschen, leihen oder Second-Hand-Stöbern bringt denselben Frische-Kick, ohne dass dein Konto leidet. Häufig willst du gar nicht den konkreten Gegenstand, sondern nur das Gefühl von Veränderung." },
    { title: "Leihen statt kaufen", body: "Bevor du etwas kaufst, frag dich: Wie oft werde ich das wirklich benutzen? Bei Dingen, die du nur selten brauchst – Skiausrüstung im Winter, einen Camper im Sommer, Werkzeug für ein einmaliges Projekt, ein Kleid für einen besonderen Anlass – ist Leihen fast immer die schlauere Wahl. Du sparst Geld, Platz und Pflege, und es ist nebenbei deutlich ressourcenschonender. Viele Städte haben mittlerweile Leihläden, Bibliotheken der Dinge oder Nachbarschafts-Plattformen, über die das ganz unkompliziert geht." },
    { title: "Was steckt wirklich dahinter?", body: "Sehr oft versuchen wir, eine tiefere Unzufriedenheit – Langeweile, Stress, Frust oder Einsamkeit – mit etwas Neuem zu überdecken. Der Kick beim Kaufen hält allerdings nur kurz an, danach ist das Gefühl wieder da. Halte beim nächsten Impuls einen Moment inne und frag dich: Wie geht es mir gerade eigentlich, und was brauche ich wirklich? Manchmal ist die ehrlichere Antwort ein Spaziergang, ein Gespräch oder einfach Ruhe – und kein neues Produkt." },
    { title: "Offline kaufen, wenn sinnvoll", body: "Bei Dingen wie Schuhen, Kleidung oder Technik lohnt es sich oft, sie vor Ort anzuschauen und anzuprobieren, statt blind online zu bestellen. So vermeidest du Fehlkäufe, sparst dir Versand- und Rücksendekosten und umgehst das klassische „Ich schick's eh nicht mehr zurück\"-Problem, bei dem ungenutzte Sachen im Schrank landen. Der bewusste Gang ins Geschäft bremst außerdem den schnellen Klick-Impuls – ein zusätzlicher Moment zum Nachdenken, ob du es wirklich brauchst." },
    { title: "Brauchst du es wirklich?", body: "Stell dir vor dem Kauf ein paar ehrliche Fragen: Habe ich nicht schon etwas Ähnliches? Wo werde ich es aufbewahren, und wie oft werde ich es tatsächlich nutzen? Welche Folgekosten entstehen – Lagerung, Pflege, Strom, Platz? Und welche Ressourcen stecken überhaupt in der Herstellung? Ein Gegenstand kostet dich nämlich nicht nur beim Kauf, sondern auch danach – an Zeit, Raum und Aufmerksamkeit. Was du nicht kaufst, musst du auch nie verstauen, pflegen oder entsorgen." }
  ];
  var accordion = $('#accordion');
  initAccordion(accordion, tips, true);

  }

  // === SECTION: tipp des tages (startseite) ===
  if ($('#tipOfDay')) {
    var dayTips = [
      { title: "Abwarten", body: "Die meisten Kaufimpulse verlieren nach ein paar Tagen von selbst ihren Reiz. Leg dir Sperrfristen fest: über 30 € → 3 Tage warten, über 100 € → 30 Tage." },
      { title: "Keine Spontankäufe", body: "Geh nie ohne Plan einkaufen. Schreib dir vorher eine konkrete Liste und halte dich strikt daran – im Supermarkt wie online." },
      { title: "Werbung bewusst analysieren", body: "Werbung verkauft selten den Gegenstand, sondern ein Lebensgefühl. Frag dich: Bringt mir das Produkt wirklich diesen Nutzen?" },
      { title: "Nicht jeden Trend mitmachen", body: "Trends sind vergänglich, dein Geld ist real. Will ich das wirklich für mich – oder nur, weil es gerade alle haben?" },
      { title: "Ersatzbefriedigung finden", body: "Oft willst du gar nicht den Gegenstand, sondern das Gefühl von Veränderung. Style altes neu, leih dir was, stöber Second-Hand." },
      { title: "Leihen statt kaufen", body: "Wie oft brauche ich das wirklich? Bei selten Genutztem – Skiausrüstung, Werkzeug, Kleid für einen Anlass – ist Leihen meist schlauer." },
      { title: "Was steckt wirklich dahinter?", body: "Oft überdecken wir mit Käufen Langeweile, Stress oder Frust. Halt kurz inne: Wie geht's mir gerade – und was brauche ich wirklich?" },
      { title: "Offline kaufen, wenn sinnvoll", body: "Schuhe, Kleidung, Technik lieber vor Ort anschauen. Das vermeidet Fehlkäufe und bremst den schnellen Klick-Impuls." },
      { title: "Brauchst du es wirklich?", body: "Habe ich schon was Ähnliches? Wo lagere ich es, wie oft nutze ich es? Was du nicht kaufst, musst du nie verstauen oder pflegen." }
    ];
    // deterministic per calendar day → same tip all day, rotates daily
    var dayIndex = Math.floor(Date.now() / 86400000) % dayTips.length;
    var tod = dayTips[dayIndex];
    $('#tipDayTitle').textContent = tod.title;
    $('#tipDayText').textContent = tod.body;
  }

  // === SECTION: faq accordion (Hilfsangebote) ===
  if ($('#faq')) {
    initAccordion($('#faq'), [
      { title: "Was ist ein Impulskauf?", body: "Ein Impulskauf ist eine spontane, ungeplante Kaufentscheidung – ausgelöst durch einen kurzen Reiz statt durch ein echtes Bedürfnis. Typisch sind ein schönes Schaufenster, ein „nur noch heute\"-Angebot oder ein virales Produkt auf Social Media. Das Gefühl danach hält oft nur kurz an, und nicht selten folgt Reue. Der einfachste Gegentrick: kurz innehalten und ein paar Tage warten." },
      { title: "Woran erkenne ich Werbedruck?", body: "Werbung erzeugt Druck über künstliche Knappheit („nur noch 2 verfügbar\"), Countdown-Timer, ständige Rabatte und das Gefühl, etwas zu verpassen (FOMO). Auch Influencer:innen, die ein Produkt beiläufig zeigen, sind bezahlte Werbung. Faustregel: Wenn du plötzlich sofort kaufen „musst\", ist das fast immer der Druck – nicht dein echtes Bedürfnis." },
      { title: "Wie funktioniert die 3-Tage-Regel?", body: "Bevor du etwas kaufst, parkst du den Wunsch und wartest mindestens 3 Tage. Ist der Wunsch danach weg, hast du Geld gespart. Ist er noch da und passt ins Budget, ist es eine bewusste Entscheidung. Bei teuren Dingen ruhig 30 Tage. Genau dafür gibt es bei uns den Wunsch-Parkplatz mit Countdown und Erinnerung." },
      { title: "Wann sollte ich mir Hilfe holen?", body: "Wenn Käufe sich wie ein Zwang anfühlen, du Ausgaben verheimlichst, regelmäßig mehr ausgibst als du hast oder Schulden machst, ist das ein ernstes Signal. Das ist keine Schwäche – es gibt kostenlose, vertrauliche Beratung. Die Anlaufstellen oben helfen anonym und unverbindlich weiter." },
      { title: "Sind alle Angebote hier kostenlos?", body: "Ja. Die verlinkten Anlaufstellen – Schuldnerberatung, Verbraucherzentrale, Caritas und die Bundeszentrale für politische Bildung – bieten kostenlose und vertrauliche Beratung an. Du musst dich für ein erstes Gespräch nirgends festlegen." }
    ], false);
  }

  // === SECTION: quiz ===
  if ($('#quizCard')) {
  var questions = [
    "Ich kaufe Dinge, die ich auf Social Media gesehen habe.",
    "Ich bereue Käufe kurz danach.",
    "Ich kaufe, weil Freunde es auch haben.",
    "Ich kaufe impulsiv, ohne vorher nachzudenken.",
    "Ich kaufe Dinge, die ich danach nie benutze.",
    "Werbung beeinflusst meine Kaufentscheidungen stark.",
    "Ich gebe mehr aus, als ich eigentlich wollte.",
    "Ich kaufe etwas, obwohl ich es eigentlich nicht brauche."
  ];
  var results = [
    { max: 4, label: "Sehr bewusst", text: "Du triffst Kaufentscheidungen extrem überlegt. Trends ziehen an dir vorbei, ohne Spuren auf deinem Konto zu hinterlassen.", emoji: "assets/mascot-standing-trim.png" },
    { max: 9, label: "Bewusst unterwegs", text: "Du hast ein gesundes Verhältnis zu Konsum. Ein paar kleine Reflexe helfen dir, ganz souverän zu bleiben.", emoji: "assets/mascot-head-trim.png" },
    { max: 15, label: "Im Mittelfeld", text: "Mal überlegt, mal spontan. Unsere Tipps zeigen dir, wie du häufiger bewusst entscheidest.", emoji: "assets/mascot-wave-trim.png" },
    { max: 20, label: "Eher trendanfällig", text: "Impulskäufe spielen eine spürbare Rolle bei dir. Mit ein paar Strategien lässt sich das aber gut in den Griff bekommen.", emoji: "assets/mascot-selfie-trim.png" },
    { max: 24, label: "Stark trendanfällig", text: "Trends bestimmen deinen Konsum stark. Keine Sorge – die Warte-3-Tage-Challenge und unsere Tipps sind genau für dich gemacht.", emoji: "assets/mascot-run-trim.png" }
  ];
  var qIdx = 0, answers = [];
  var quizCard = $('#quizCard'), quizResult = $('#quizResult');
  var quizProgress = $('#quizProgress'), quizProgressLabel = $('#quizProgressLabel');
  var quizBack = $('#quizBack'), quizNext = $('#quizNext');
  var answerBtns = $$('.quiz-btn');
  function renderQuestion() {
    quizCard.style.display = 'block';
    quizResult.classList.remove('active');
    $('#qNum').textContent = 'Frage ' + (qIdx + 1) + ' von ' + questions.length;
    $('#qText').textContent = questions[qIdx];
    quizProgress.style.width = (qIdx / questions.length * 100) + '%';
    quizProgressLabel.textContent = qIdx + ' / ' + questions.length;
    answerBtns.forEach(function (b) {
      b.classList.toggle('selected', answers[qIdx] !== undefined && parseFloat(b.getAttribute('data-pts')) === answers[qIdx]);
    });
    if (quizBack) quizBack.disabled = qIdx === 0;
    if (quizNext) {
      quizNext.disabled = answers[qIdx] === undefined;
      quizNext.innerHTML = (qIdx === questions.length - 1 ? 'Ergebnis' : 'Weiter') + ' <span class="arr">\u2192</span>';
    }
  }
  answerBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      answers[qIdx] = parseFloat(btn.getAttribute('data-pts'));
      answerBtns.forEach(function (b) { b.classList.toggle('selected', b === btn); });
      if (quizNext) quizNext.disabled = false;
    });
  });
  if (quizBack) quizBack.addEventListener('click', function () { if (qIdx > 0) { qIdx--; renderQuestion(); } });
  if (quizNext) quizNext.addEventListener('click', function () {
    if (answers[qIdx] === undefined) return;
    if (qIdx < questions.length - 1) { qIdx++; renderQuestion(); }
    else showResult();
  });
  function showResult() {
    var score = answers.reduce(function (a, b) { return a + (b || 0); }, 0);
    quizCard.style.display = 'none';
    quizProgress.style.width = '100%';
    quizProgressLabel.textContent = questions.length + ' / ' + questions.length;
    var r = results.find(function (x) { return score <= x.max; }) || results[results.length - 1];
    $('#resultScore').innerHTML = (Math.round(score * 10) / 10) + '<small> / 24 P</small>';
    $('#resultLabel').textContent = r.label;
    $('#resultText').textContent = r.text;
    $('#resultEmoji').src = r.emoji;
    quizResult.classList.add('active');
  }
  $('#restartQuiz').addEventListener('click', function () {
    qIdx = 0; answers = []; renderQuestion();
  });
  $('#shareResult').addEventListener('click', function () {
    var label = $('#resultLabel').textContent;
    var text = 'Mein Ergebnis im Trendanfälligkeits-Check: „' + label + '“ – teste dich selbst auf Stop. Before You Shop. #DreiTageWartenChallenge';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { showToast('Ergebnis kopiert!'); })
        .catch(function () { showToast('Kopieren nicht möglich.'); });
    } else { showToast('Kopieren nicht möglich.'); }
  });
  renderQuestion();

  }

  // === SECTION: rechner ===
  if ($('#preis')) {
  var preis = $('#preis'), lohn = $('#lohn');
  var rechnerResult = $('#rechnerResult'), rechnerEmpty = $('#rechnerEmpty');
  function calcRechner() {
    var p = parseFloat(preis.value), l = parseFloat(lohn.value);
    if (!p || !l || p <= 0 || l <= 0) {
      rechnerResult.classList.remove('active');
      rechnerEmpty.style.display = 'block';
      return;
    }
    rechnerEmpty.style.display = 'none';
    var hours = p / l;
    var h = Math.floor(hours), m = Math.round((hours - h) * 60);
    if (m === 60) { h++; m = 0; }
    var str;
    if (h === 0) str = m + ' Minuten';
    else if (m === 0) str = h + (h === 1 ? ' Stunde' : ' Stunden');
    else str = h + (h === 1 ? ' Stunde' : ' Stunden') + ' und ' + m + ' Minuten';
    $('#rHours').textContent = 'Du arbeitest ' + str + ' dafür.';
    var workdays = hours / 8, context;
    if (workdays < 0.25) context = 'Das sind nur ein paar Minuten Arbeit.';
    else if (workdays < 0.5) context = 'Das ist fast ein Viertel eines Arbeitstages.';
    else if (workdays < 1) context = 'Das ist fast ein halber Arbeitstag.';
    else if (workdays < 2) context = 'Das ist etwa ' + (Math.round(workdays * 10) / 10) + ' Arbeitstage.';
    else context = 'Das sind mehr als ' + Math.floor(workdays) + ' volle Arbeitstage.';
    // tangible comparison: pick the unit that gives a nice, graspable count
    var refs = [
      { n: 1.20, sing: 'Coffee to go', plur: 'Coffees to go' },
      { n: 9, sing: 'Kinobesuch', plur: 'Kinobesuche' },
      { n: 49, sing: 'Monat Musik-Streaming', plur: 'Monate Musik-Streaming' },
      { n: 250, sing: 'Wochenend-Trip', plur: 'Wochenend-Trips' }
    ];
    var best = refs[0];
    for (var i = 0; i < refs.length; i++) { if (p / refs[i].n >= 1.5) best = refs[i]; }
    var cnt = Math.round(p / best.n);
    if (cnt >= 1) {
      var label = cnt === 1 ? best.sing : best.plur;
      $('#rContext').innerHTML = context + ' <span class="r-compare">≈ ' + cnt + ' ' + label + '</span>';
    } else {
      $('#rContext').textContent = context;
    }
    rechnerResult.classList.add('active');
  }
  preis.addEventListener('input', calcRechner);
  lohn.addEventListener('input', calcRechner);
  $('#useMindestlohn').addEventListener('click', function () { lohn.value = '13.90'; calcRechner(); lohn.focus(); });

  }

  // === SECTION: spar-counter ===
  (function () {
    var el = $('#sparCounter');
    if (!el) return;
    var BASE = 14320, current = BASE, started = false;
    function fmt(n) { return Math.round(n).toLocaleString('de-DE'); }
    function run() {
      if (started) return; started = true;
      var start = performance.now(), dur = 1800;
      function step(t) {
        var p = Math.min(1, (t - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt(current * eased);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      // Safety: snap to value if rAF is throttled (e.g. background tab)
      setTimeout(function () {
        var shown = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
        if (shown < current * 0.5) el.textContent = fmt(current);
      }, dur + 200);
      // Keep it feeling live
      setInterval(function () { current += Math.floor(Math.random() * 14) + 3; el.textContent = fmt(current); }, 4000);
    }
    function check() {
      var r = el.getBoundingClientRect();
      if (r.top < (window.innerHeight || 800) * 0.85 && r.bottom > 0) run();
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    // When a user parks-and-skips a wish, add it to the community total live
    document.addEventListener('sbys:saved', function (e) {
      var amt = (e.detail && e.detail.amount) || 0;
      current += amt;
      el.textContent = fmt(current);
    });
  })();

  // === SECTION: wunsch-parkplatz ===
  (function () {
    var list = $('#parkList'), empty = $('#parkEmpty');
    if (!list) return;
    var PARK_KEY = 'sbys_parkplatz';
    var WAIT_MS = 72 * 3600000; // 3 days
    var wishes = [];
    var savedSum = 0;
    // Persisted in localStorage so parked wishes + countdowns survive closing the tab.
    try { var stored = JSON.parse(localStorage.getItem(PARK_KEY) || 'null'); if (stored) { wishes = stored.wishes || []; savedSum = stored.savedSum || 0; } } catch (e) {}

    function persist() { try { localStorage.setItem(PARK_KEY, JSON.stringify({ wishes: wishes, savedSum: savedSum })); } catch (e) {} }
    function fmt(n) { return Math.round(n).toLocaleString('de-DE'); }
    function findWish(id) { return wishes.filter(function (x) { return x.id === id; })[0]; }

    // Affirming confirmation when a wish is consciously bought (anti-impulse, not anti-buying)
    function showAffirm(w) {
      var waited = Date.now() - (w.end - WAIT_MS);
      var dys = Math.floor(waited / 86400000), hrs = Math.floor(waited / 3600000);
      var waitText = dys >= 1 ? (dys === 1 ? 'einen Tag' : dys + ' Tage')
        : (hrs >= 1 ? (hrs === 1 ? 'eine Stunde' : hrs + ' Stunden') : 'einen Moment');
      var ov = document.createElement('div');
      ov.className = 'affirm-overlay';
      ov.innerHTML =
        '<div class="affirm-card" role="dialog" aria-modal="true">' +
          '<img class="affirm-mascot" src="assets/mascot-wave-trim.png" alt="">' +
          '<div class="affirm-check">✓</div>' +
          '<div class="affirm-title">Bewusste Entscheidung!</div>' +
          '<p class="affirm-text">Du hast ' + waitText + ' drüber geschlafen und willst „' + escapeHtml(w.name) + '“ immer noch. Das ist kein Impulskauf – viel Freude damit!</p>' +
          '<button class="btn btn-cyan affirm-close" type="button">Alles klar</button>' +
        '</div>';
      document.body.appendChild(ov);
      requestAnimationFrame(function () { ov.classList.add('show'); });
      var closed = false;
      function close() { if (closed) return; closed = true; ov.classList.remove('show'); setTimeout(function () { ov.remove(); }, 320); }
      ov.querySelector('.affirm-close').addEventListener('click', close);
      ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
      document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); } });
      setTimeout(close, 6000);
    }

    // --- browser notification scheduling (tab must stay open to fire) ---
    var notifyTimers = {};
    function scheduleAll() {
      Object.keys(notifyTimers).forEach(function (k) { clearTimeout(notifyTimers[k]); });
      notifyTimers = {};
      wishes.forEach(function (w) {
        if (!w.notify || w.notified) return;
        var rem = w.end - Date.now();
        if (rem > 0 && rem < 2147483647) {
          notifyTimers[w.id] = setTimeout(function () {
            fireNotification(w.name);
            w.notified = true; persist();
          }, rem);
        }
      });
    }

    var prevSum = savedSum;
    function renderPile(animate) {
      var pileAmount = $('#pileAmount'), pileCoins = $('#pileCoins'), pileCap = $('#pileCap'), pileShare = $('#pileShare');
      pileAmount.textContent = fmt(savedSum);
      pileCap.textContent = savedSum > 0 ? 'bewusst gespart' : 'Hier wächst dein gespartes Geld';
      if (pileShare) pileShare.hidden = savedSum <= 0;
      var coins = savedSum <= 0 ? 0 : Math.min(16, 1 + Math.floor(savedSum / 12));
      var stageH = 96, coinH = 20;
      var offset = coins > 1 ? Math.min(13, (stageH - coinH) / (coins - 1)) : 0;
      var html = '';
      for (var i = 0; i < coins; i++) {
        var top = (i === coins - 1);
        var isNew = animate && top && savedSum > prevSum;
        html += '<div class="coin' + (i % 2 ? ' alt' : '') + (isNew ? ' pop' : '') + '" style="bottom:' + (i * offset) + 'px;z-index:' + i + '">' +
          (top ? '<span class="ce">€</span>' : '') + '</div>';
      }
      pileCoins.innerHTML = html;
      prevSum = savedSum;
    }

    function render() {
      empty.style.display = wishes.length ? 'none' : '';
      list.innerHTML = wishes.map(function (w) {
        var rem = w.end - Date.now();
        var ready = rem <= 0;
        var body;
        if (ready) {
          body = '<div class="wish-status ready">Zeit um! Willst du es immer noch?</div>';
        } else {
          var d = Math.floor(rem / 86400000), h = Math.floor((rem % 86400000) / 3600000),
              m = Math.floor((rem % 3600000) / 60000), s = Math.floor((rem % 60000) / 1000);
          var notifyOn = w.notify && notificationsSupported() && Notification.permission === 'granted';
          body = '<div class="wish-count" data-end="' + w.end + '">' +
            '<div class="wish-unit"><div class="wu-num">' + pad(d) + '</div><div class="wu-lab">Tage</div></div>' +
            '<div class="wish-unit"><div class="wu-num">' + pad(h) + '</div><div class="wu-lab">Std</div></div>' +
            '<div class="wish-unit"><div class="wu-num">' + pad(m) + '</div><div class="wu-lab">Min</div></div>' +
            '<div class="wish-unit"><div class="wu-num">' + pad(s) + '</div><div class="wu-lab">Sek</div></div></div>' +
            '<div class="wish-reminders">' +
            '<button class="wish-rem-btn" data-act="cal" type="button">Kalender</button>' +
            (notificationsSupported() ? '<button class="wish-rem-btn' + (notifyOn ? ' is-on' : '') + '" data-act="notify" type="button">' + (notifyOn ? 'Erinnerung an' : 'Erinnern') + '</button>' : '') +
            '</div>';
        }
        return '<div class="wish-card' + (ready ? ' expired' : '') + '" data-id="' + w.id + '">' +
          '<div class="wish-top"><div class="wish-name">' + escapeHtml(w.name) + '</div>' +
          '<div style="display:flex;gap:10px;align-items:flex-start;"><div class="wish-price">' + fmt(w.price) + ' €</div>' +
          '<button class="wish-remove" data-act="remove" aria-label="Entfernen">✕</button></div></div>' +
          body +
          '<div class="wish-actions">' +
          '<button class="wish-btn skip" data-act="skip">Doch nicht – gespart!</button>' +
          '<button class="wish-btn buy" data-act="buy">Bewusst kaufen</button>' +
          '</div></div>';
      }).join('');
      renderPile(true);
    }

    // detect wishes that just reached 0 → celebrate once each
    function checkExpiries() {
      var newly = false;
      wishes.forEach(function (w) {
        if (w.end - Date.now() <= 0 && !w.celebrated) { w.celebrated = true; newly = true; }
      });
      if (newly) { persist(); celebrate(); }
      return newly;
    }

    // live ticking of countdowns (rebuild numbers in place each second)
    setInterval(function () {
      var hitZero = false;
      $$('.wish-count', list).forEach(function (c) {
        var end = parseInt(c.getAttribute('data-end'), 10);
        var rem = end - Date.now();
        if (rem <= 0) { hitZero = true; return; }
        var d = Math.floor(rem / 86400000), h = Math.floor((rem % 86400000) / 3600000),
            m = Math.floor((rem % 3600000) / 60000), s = Math.floor((rem % 60000) / 1000);
        var nums = c.querySelectorAll('.wu-num');
        nums[0].textContent = pad(d); nums[1].textContent = pad(h);
        nums[2].textContent = pad(m); nums[3].textContent = pad(s);
      });
      var celebrated = checkExpiries();
      if (hitZero || celebrated) render();
    }, 1000);

    function addWish() {
      var name = $('#wishName').value.trim();
      var price = parseFloat($('#wishPrice').value);
      if (!name) { showToast('Was möchtest du kaufen?'); $('#wishName').focus(); return; }
      if (!price || price <= 0) { showToast('Bitte einen Preis eingeben.'); $('#wishPrice').focus(); return; }
      wishes.unshift({ id: 'w' + Date.now(), name: name, price: price, end: Date.now() + WAIT_MS, notify: false, notified: false });
      persist(); render(); scheduleAll();
      $('#wishName').value = ''; $('#wishPrice').value = '';
      showToast('Geparkt! Schlaf erst mal 3 Tage drüber.');
    }
    $('#wishPark').addEventListener('click', addWish);
    $('#wishPrice').addEventListener('keydown', function (e) { if (e.key === 'Enter') addWish(); });
    $('#wishName').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('#wishPrice').focus(); });

    var pileShareBtn = $('#pileShare');
    if (pileShareBtn) pileShareBtn.addEventListener('click', function () {
      var text = 'Ich habe schon ' + fmt(savedSum) + ' € bewusst NICHT ausgegeben. Mach mit bei der #DreiTageWartenChallenge – Stop. Before You Shop.';
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { showToast('Ergebnis kopiert – jetzt teilen!'); })
          .catch(function () { showToast('Kopieren nicht möglich.'); });
      } else { showToast('Kopieren nicht möglich.'); }
    });

    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-act]');
      if (!btn) return;
      var card = btn.closest('.wish-card');
      var id = card.getAttribute('data-id');
      var w = findWish(id);
      if (!w) return;
      var act = btn.getAttribute('data-act');

      if (act === 'cal') {
        downloadWishIcs(w.name, w.end);
        showToast('Kalender-Erinnerung heruntergeladen.');
        return;
      }
      if (act === 'notify') {
        if (!notificationsSupported()) { showToast('Dein Browser unterstützt das leider nicht.'); return; }
        if (Notification.permission === 'granted') {
          w.notify = !w.notify; if (w.notify) w.notified = false;
          persist(); scheduleAll(); render();
          showToast(w.notify ? 'Erinnerung aktiviert – lass den Tab offen.' : 'Erinnerung deaktiviert.');
        } else if (Notification.permission === 'denied') {
          showToast('Benachrichtigungen sind im Browser blockiert.');
        } else {
          Notification.requestPermission().then(function (perm) {
            if (perm === 'granted') { w.notify = true; w.notified = false; persist(); scheduleAll(); render(); showToast('Erinnerung aktiviert – lass den Tab offen.'); }
            else { showToast('Ohne Erlaubnis keine Benachrichtigung möglich.'); }
          });
        }
        return;
      }
      if (act === 'skip') {
        savedSum += w.price;
        document.dispatchEvent(new CustomEvent('sbys:saved', { detail: { amount: w.price } }));
        showToast('Stark! ' + fmt(w.price) + ' € bewusst nicht ausgegeben.');
      } else if (act === 'buy') {
        showAffirm(w);
      }
      if (notifyTimers[id]) { clearTimeout(notifyTimers[id]); delete notifyTimers[id]; }
      wishes = wishes.filter(function (x) { return x.id !== id; });
      persist(); render();
    });

    // On load: greet returning visitor if a parked wish elapsed while away
    (function onReturn() {
      var elapsed = wishes.filter(function (w) { return w.end - Date.now() <= 0; });
      if (elapsed.length) {
        var w0 = elapsed[0];
        var fresh = elapsed.some(function (w) { return !w.celebrated; });
        setTimeout(function () {
          showToast('Deine 3 Tage sind um – willst du „' + w0.name + '“ immer noch?');
          if (fresh) celebrate();
        }, 900);
        elapsed.forEach(function (w) {
          if (w.notify && !w.notified) { fireNotification(w.name); w.notified = true; }
          w.celebrated = true;
        });
        persist();
      }
    })();

    render();
    scheduleAll();
  })();

  // === SECTION: mascot buddy ===
  (function () {
    var buddy = $('#buddy'), bubble = $('#buddyText'), closeBtn = $('#buddyClose');
    if (!buddy) return;
    if (sessionStorage.getItem('sbys_buddy_off') === '1') return;
    var lines = {
      hero: "Psst… erst denken, dann klicken.",
      actions: "Wo fangen wir an? Such dir was aus!",
      sparcounter: "So viel Geld – einfach durch kurzes Warten.",
      challenge: "3 Tage warten. Schaffst du das?",
      tipps: "Mein Lieblingstrick: einfach kurz abwarten.",
      quiz: "Mal ehrlich – wie trendanfällig bist du?",
      parkplatz: "Park deinen Wunsch – und schlaf 3 Tage drüber.",
      rechner: "Rechne mal, wie lang du dafür arbeitest…",
      erfahrungen: "Echte Geschichten. Vielleicht bald deine?",
      hilfsangebote: "Wird's mal eng? Hier gibt's Hilfe."
    };
    var current = null, hideTimer;
    function say(id) {
      if (!lines[id] || id === current) return;
      current = id;
      bubble.textContent = lines[id];
      buddy.classList.add('show');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () { buddy.classList.remove('show'); }, 6000);
    }
    closeBtn.addEventListener('click', function () {
      buddy.classList.remove('show');
      sessionStorage.setItem('sbys_buddy_off', '1');
      clearTimeout(hideTimer);
      off = true;
    });
    var buddyIds = ['hero','actions','sparcounter','challenge','tipps','quiz','parkplatz','rechner','erfahrungen','hilfsangebote'];
    var off = false;
    function check() {
      if (off) return;
      var mid = (window.innerHeight || 800) / 2, found = null;
      for (var i = 0; i < buddyIds.length; i++) {
        var s = document.getElementById(buddyIds[i]);
        if (!s) continue;
        var r = s.getBoundingClientRect();
        if (r.top <= mid && r.bottom >= mid) { found = buddyIds[i]; break; }
      }
      if (found) say(found);
    }
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  })();

  // === SECTION: scroll-to-top + reveal on scroll ===
  var scrollTop = $('#scroll-top');
  window.addEventListener('scroll', function () {
    scrollTop.classList.toggle('show', window.pageYOffset > 300);
  }, { passive: true });
  scrollTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // === SECTION: scroll-spy (active nav link) ===
  (function () {
    var navLinks = $$('.nav-links a[href^="#"]');
    if (!navLinks.length) return;
    var map = navLinks.map(function (a) {
      var sec = document.getElementById(a.getAttribute('href').slice(1));
      return { link: a, sec: sec };
    }).filter(function (x) { return x.sec; });
    var navH = $('.site-nav').offsetHeight;
    function spy() {
      var pos = window.pageYOffset + navH + 40;
      var current = null;
      map.forEach(function (x) { if (x.sec.offsetTop <= pos) current = x; });
      navLinks.forEach(function (a) { a.classList.remove('active'); });
      if (current) current.link.classList.add('active');
    }
    window.addEventListener('scroll', spy, { passive: true });
    window.addEventListener('resize', spy);
    spy();
  })();

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.remove('pre'); revealObserver.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  var vh = window.innerHeight || 800;
  $$('.reveal').forEach(function (el) {
    // Only hide (and animate) elements that start below the fold.
    if (el.getBoundingClientRect().top > vh * 0.92) {
      el.classList.add('pre');
      revealObserver.observe(el);
    }
  });

  // Keep sliders correct on resize
  var rT;
  window.addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () { updateVideo(); updateStoryPos(); }, 150);
  });
});