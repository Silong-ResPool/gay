/* ==========================================================================
   巳泷文游 · 创世工坊自主推演引擎（v8.3.0）
   生态链 / 国度 / 气候 / 灾害 / 战争 / 贫困亡国 / 性格决策 / 离线推演
   每个创世世界独立运行，参数可自定义。
   ========================================================================== */
(function () {
  'use strict';
  var C = window.SLOC || null;
  var SIM = { timer: 0, active: '' };
  var SEASONS = ['春', '夏', '秋', '冬'];

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function esc(s) { return C ? C.esc(s) : String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function toast(t) { if (C && C.toast) C.toast(t); }
  function uid(p) { return C ? C.uid(p) : ((p || 'x') + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)); }
  function hash(s) {
    s = String(s || 'world'); var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(arr, r) { return arr[Math.floor(r() * arr.length) % arr.length]; }
  function ticksPerYear(s) { return clamp(Math.round((s.physics.yearLength || 365) / 30), 4, 60); }

  function roleOf(sp) {
    var t = String((sp && sp.type) || ''), n = String((sp && sp.name) || '');
    if (/植物|草|花|树|菌|藤/.test(t + n)) return 'plant';
    if (/狼|虎|狮|豹|熊|蛇|鹰|鲨|鳄|蛛|蝎|龙|枭|隼/.test(n)) return 'predator';
    if (/神兽|异种|灵体/.test(t)) return 'predator';
    if (/飞禽|水族|虫豸/.test(t)) return 'omnivore';
    if (/走兽/.test(t)) return /兔|羊|鹿|牛|马|鼠|猪|象/.test(n) ? 'herbivore' : 'herbivore';
    return 'herbivore';
  }
  function seedSpecies(sp, s) {
    var role = roleOf(sp), h = hash((sp.id || '') + (sp.name || '') + (s.seed || ''));
    var pop = role === 'plant' ? 520 + (h % 420) : role === 'predator' ? 16 + (h % 22) : role === 'omnivore' ? 50 + (h % 70) : 90 + (h % 110);
    return {
      role: role, population: pop,
      birth: role === 'predator' ? 0.05 : role === 'plant' ? 0.12 : 0.2,
      death: role === 'predator' ? 0.045 : 0.04,
      prey: '', strength: role === 'predator' ? 7 : role === 'plant' ? 2 : 5,
      enabled: true, trend: 0
    };
  }
  function fillSpecies(sp, s) {
    var d = seedSpecies(sp, s), x = sp.sim;
    ['role', 'population', 'birth', 'death', 'prey', 'strength', 'enabled'].forEach(function (k) {
      if (x[k] === undefined || x[k] === null) x[k] = d[k];
    });
    x.population = Math.max(0, Number(x.population) || 0);
    x.birth = clamp(Number(x.birth) || d.birth, 0, 1);
    x.death = clamp(Number(x.death) || d.death, 0, 1);
    x.strength = clamp(Number(x.strength) || d.strength, 1, 10);
  }
  function seedNation(f, s) {
    var text = [f.goal, f.creed, f.desc, f.type, f.name].join(' ');
    var h = hash((f.id || '') + (f.name || '') + (s.seed || ''));
    var kind = 50, aggr = 40, wis = 50, greed = 40;
    if (/善|仁|护|救|扶|和平|守|义/.test(text)) kind += 26;
    if (/恶|暴|杀|征|吞|掠|奴|血|邪/.test(text)) { kind -= 30; aggr += 26; }
    if (/商|财|金|贸|富|税/.test(text)) greed += 25;
    if (/智|学|贤|谋|书|术/.test(text)) wis += 22;
    var pop = 900 + (h % 4200);
    return {
      population: pop, wealth: 42 + (h % 32), food: 48 + (h % 30), military: 16 + (h % 30),
      stability: 52 + (h % 28), tech: 16 + (h % 30),
      traits: { kindness: clamp(kind, 5, 95), aggression: clamp(aggr, 5, 95), wisdom: clamp(wis, 5, 95), greed: clamp(greed, 5, 95) },
      alive: true, poorTicks: 0, mood: '平稳', enabled: true
    };
  }
  function fillNation(f, s) {
    var d = seedNation(f, s), x = f.sim;
    ['population', 'wealth', 'food', 'military', 'stability', 'tech', 'alive', 'enabled'].forEach(function (k) {
      if (x[k] === undefined || x[k] === null) x[k] = d[k];
    });
    x.traits = Object.assign({}, d.traits, x.traits || {});
    ['kindness', 'aggression', 'wisdom', 'greed'].forEach(function (k) { x.traits[k] = clamp(Number(x.traits[k]) || 50, 0, 100); });
    x.population = Math.max(0, Number(x.population) || 0);
    ['wealth', 'food', 'military', 'stability', 'tech'].forEach(function (k) { x[k] = clamp(Number(x[k]) || 0, 0, 100); });
  }

  function ensure(w) {
    if (!w) return null;
    var s = w.sim;
    if (!s || typeof s !== 'object') s = {};
    if (s.auto === undefined) s.auto = true;
    if (s.enabled === undefined) s.enabled = true;
    if (!s.interval || s.interval < 5000) s.interval = 60000;
    if (!s.speed) s.speed = 1;
    if (!s.lastTick) s.lastTick = Date.now();
    if (!s.tick) s.tick = 0;
    if (!s.seed) s.seed = hash(w.id || w.name || 'world');
    s.physics = Object.assign({ gravity: 1, magic: 0.25, fertility: 1, yearLength: 365, dayLength: 24 }, s.physics || {});
    s.rules = Object.assign({ plantGrowth: 0.18, plantCapacity: 2600, herbivoreEfficiency: 1, predatorEfficiency: 0.6, disasterRate: 0.01, warRate: 0.06, trade: 0.5, kindThreshold: 60 }, s.rules || {});
    s.climate = Object.assign({ biasTemp: 0, biasRain: 0, temp: 16, rain: 60, season: 0, disaster: 0 }, s.climate || {});
    s.ecology = Object.assign({ plants: 1300, soil: 1, warned: false }, s.ecology || {});
    s.people = Object.assign({ total: 0, happiness: 60, hunger: 0, faith: 50 }, s.people || {});
    s.log = Array.isArray(s.log) ? s.log : [];
    s.lastEvents = Array.isArray(s.lastEvents) ? s.lastEvents : [];
    s.disasterCount = s.disasterCount || 0; s.warCount = s.warCount || 0;
    s.collapseCount = s.collapseCount || 0; s.yearCount = s.yearCount || 0;
    (w.species || []).forEach(function (sp) {
      if (!sp.sim || typeof sp.sim !== 'object') sp.sim = seedSpecies(sp, s); else fillSpecies(sp, s);
    });
    (w.factions || []).forEach(function (f) {
      if (!f.sim || typeof f.sim !== 'object') f.sim = seedNation(f, s); else fillNation(f, s);
    });
    w.sim = s;
    return s;
  }

  function mkEvent(w, type, icon, title, text, major) {
    var s = w.sim, year = Math.floor(s.tick / ticksPerYear(s)) + 1;
    return { id: uid('ev'), t: Date.now(), tick: s.tick, year: year, type: type, icon: icon, title: title, text: text, major: !!major };
  }
  function pushEvent(w, ev) {
    var s = w.sim;
    s.log.unshift(ev);
    if (s.log.length > 260) s.log.length = 260;
    s.lastEvents.push(ev);
    if (s.lastEvents.length > 24) s.lastEvents.shift();
    if (ev.major) {
      w.events = w.events || [];
      w.events.push({ id: uid('e'), era: '推演', time: '第' + ev.year + '年', title: ev.title, desc: ev.text, cat: '推演' });
      if (w.events.length > 420) w.events.shift();
      if (w.run) {
        w.run.log = w.run.log || [];
        w.run.log.unshift({ t: Date.now(), type: ev.type === 'war' ? 'war' : ev.type === 'disaster' ? 'curse' : 'boon', title: ev.title, desc: ev.text });
        if (w.run.log.length > 180) w.run.log.length = 180;
      }
    }
  }
  function avg(arr, key) {
    if (!arr.length) return 0;
    var n = 0; arr.forEach(function (x) { n += key ? x[key] : x; });
    return n / arr.length;
  }
  function totalVeg(w, s) {
    var v = (s.ecology && s.ecology.plants) || 0;
    (w.species || []).forEach(function (sp) {
      if (sp.sim && sp.sim.role === 'plant') v += Math.max(0, sp.sim.population) * 0.8;
    });
    return v;
  }

  /* ---------------- 单回合推演 ---------------- */
  function tickOnce(w) {
    var s = ensure(w), r = rng(s.seed + s.tick * 2654435761 + 17);
    s.tick++;
    var tpy = ticksPerYear(s);
    var year = Math.floor(s.tick / tpy) + 1;
    var season = Math.floor((s.tick % tpy) / Math.max(1, tpy / 4)) % 4;
    var temp = (s.climate.biasTemp || 0) + [13, 23, 15, 3][season] + (r() * 6 - 3);
    var rain = clamp((s.climate.biasRain || 0) + [65, 86, 55, 30][season] + (r() * 20 - 10), 0, 150);
    s.climate.temp = Math.round(temp); s.climate.rain = Math.round(rain); s.climate.season = season;
    var disaster = 0;
    if (r() < s.rules.disasterRate * (1 + (s.physics.magic || 0) * 0.15)) {
      disaster = 0.45 + r() * 0.75;
      var dn = pick(['旱灾', '洪水', '瘟疫', '地震', '寒潮', '蝗灾', '风暴'], r);
      s.climate.disaster = disaster; s.disasterCount++;
      pushEvent(w, mkEvent(w, 'disaster', '🌦', '天灾 · ' + dn,
        '一场' + dn + '席卷世界，植被、人口与粮仓都受到冲击。', true));
    } else s.climate.disaster = 0;
    var magic = 1 + (s.physics.magic || 0) * 0.25;
    var fert = s.physics.fertility || 1;

    /* 1. 植被生长 */
    var growth = s.rules.plantGrowth * magic * Math.max(0, 1 - s.ecology.plants / Math.max(100, s.rules.plantCapacity)) * (rain / 70) * (1 - disaster * 0.5) * fert;
    s.ecology.plants = clamp(s.ecology.plants * (1 + growth), 0, s.rules.plantCapacity * 1.35);
    /* 种子库：植被被啃食到极低时仍会缓慢萌芽，避免生态一次性死绝 */
    if (s.ecology.plants < 160) s.ecology.plants += 40;
    if (s.ecology.plants < 60 && !s.ecology.warned) {
      s.ecology.warned = true;
      pushEvent(w, mkEvent(w, 'ecology', '🌱', '植被衰退', '草木被啃食殆尽，土地开始失去庇护。', true));
    } else if (s.ecology.plants > 260) s.ecology.warned = false;

    var species = (w.species || []).filter(function (x) { return x.sim && x.sim.enabled !== false; });
    var plantsSpecies = species.filter(function (x) { return x.sim.role === 'plant'; });
    var herbivores = species.filter(function (x) { return x.sim.role === 'herbivore' || x.sim.role === 'omnivore'; });
    var predators = species.filter(function (x) { return x.sim.role === 'predator'; });

    /* 2. 植物物种自身生长 */
    plantsSpecies.forEach(function (sp) {
      var p = sp.sim.population;
      if (p <= 0) return;
      var g = s.rules.plantGrowth * 0.55 * magic * (rain / 70) * (1 - disaster * 0.4) * fert;
      var cap = 200 + s.rules.plantCapacity * 0.35;
      sp.sim.population = Math.max(0, Math.min(cap, p * (1 + g)));
    });

    /* 3. 草食 / 杂食吃植被（保留 40 点根系种子库，避免一次性啃绝） */
    var plantSpeciesTotal = 0;
    plantsSpecies.forEach(function (sp) { plantSpeciesTotal += Math.max(0, sp.sim.population); });
    var totalNeed = 0;
    herbivores.forEach(function (sp) { totalNeed += Math.max(0, sp.sim.population) * 0.35 * (s.rules.herbivoreEfficiency || 1); });
    var availablePlants = Math.max(0, s.ecology.plants - 40);
    var eaten = Math.min(availablePlants * 0.72, totalNeed);
    s.ecology.plants = Math.max(0, s.ecology.plants - eaten);
    herbivores.forEach(function (sp) {
      var need = Math.max(0, sp.sim.population) * 0.35 * (s.rules.herbivoreEfficiency || 1);
      sp.sim.foodRatio = totalNeed > 0 ? clamp((eaten * (need / totalNeed)) / Math.max(1, need), 0, 1) : 0;
      var fr = sp.sim.foodRatio;
      var birth = sp.sim.birth * (0.3 + fr * 0.95) * (rain / 70);
      var death = sp.sim.death + (1 - fr) * 0.18 + disaster * 0.08;
      var p = sp.sim.population;
      p = p * (1 + birth - death);
      var cap = 120 + sp.sim.strength * 36 + s.ecology.plants * 0.32;
      p = Math.min(cap, Math.max(0, p));
      if (p > 0 && p < 8 && s.ecology.plants > 200) p += 1;
      sp.sim.trend = p - sp.sim.population;
      sp.sim.population = Math.max(0, p);
    });

    /* 4. 捕食者吃草食 / 杂食 */
    predators.forEach(function (sp) {
      var names = String(sp.sim.prey || '').split(/[,，、\s]+/).filter(Boolean);
      var prey = herbivores.filter(function (x) { return !names.length || names.indexOf(x.name) >= 0; });
      if (!prey.length) prey = herbivores;
      var totalPrey = 0; prey.forEach(function (x) { totalPrey += Math.max(0, x.sim.population); });
      var demand = Math.max(0, sp.sim.population) * 0.35 * (s.rules.predatorEfficiency || 0.6) * magic;
      var kill = Math.min(demand, totalPrey * (0.15 + 0.35 * totalPrey / (totalPrey + 120)));
      if (totalPrey < 30) kill *= 0.55;
      var ratio = totalPrey > 0 ? kill / totalPrey : 0;
      prey.forEach(function (x) {
        var before = x.sim.population;
        x.sim.population = Math.max(0, x.sim.population * (1 - ratio));
        if (before > 0 && x.sim.population <= 0) pushEvent(w, mkEvent(w, 'species', '💀', '物种灭绝 · ' + x.name, '被猎食殆尽，' + x.name + '从这片土地上消失了。', true));
      });
      sp.sim.foodRatio = demand > 0 ? clamp(kill / demand, 0, 1) : 0;
      var fr = sp.sim.foodRatio;
      var birth = sp.sim.birth * (0.2 + fr * 0.95);
      var death = sp.sim.death + (1 - fr) * 0.22 + disaster * 0.1;
      var beforeP = sp.sim.population;
      var p = beforeP * (1 + birth - death);
      var cap = 20 + totalPrey * 0.15 + sp.sim.strength * 2;
      p = Math.min(cap, Math.max(0, p));
      if (p > 0 && p < 5 && totalPrey > 80) p += 0.6;
      if (p > 0 && p < 2 && totalPrey > 30) p += 0.2;
      sp.sim.trend = p - beforeP;
      sp.sim.population = Math.max(0, p);
      if (beforeP > 0 && sp.sim.population <= 0) pushEvent(w, mkEvent(w, 'species', '💀', '物种灭绝 · ' + sp.name, '食物链断裂，' + sp.name + '在本回合灭绝。', true));
    });

    /* 5. 国度 */
    var factions = (w.factions || []).filter(function (f) { return f.sim && f.sim.enabled !== false; });
    var nations = factions.filter(function (f) { return f.sim.alive !== false; });
    var kindThreshold = clamp(Number(s.rules.kindThreshold) || 60, 0, 100);
    nations.forEach(function (f) {
      var n = f.sim;
      var rainF = rain / 70;
      var foodProd = n.population * 0.04 * (1 + n.tech / 160) * (0.55 + rainF * 0.45) * (1 - disaster * 0.25) * (0.3 + n.wealth / 100 * 0.7);
      var foodNeed = n.population * 0.02;
      n.food = clamp(n.food + foodProd - foodNeed, 0, 100);
      var hunger = n.food < 20 ? (20 - n.food) / 20 : 0;
      n.wealth = clamp(n.wealth + (n.population * 0.0022 * (1 + (s.rules.trade || 0.5)) * (1 + n.tech / 200) * (0.25 + n.food / 100 * 0.75)) - n.military * 0.09 - hunger * 2.5, 0, 100);
      n.stability = clamp(n.stability + (n.traits.kindness - 50) * 0.03 + (n.food > 50 ? 1.2 : -2.2) - hunger * 4 - (n.traits.aggression > 75 ? 0.6 : 0) + (n.traits.wisdom - 50) * 0.012, 0, 100);
      n.military = clamp(n.military + n.wealth * 0.008 + (n.traits.aggression - 50) * 0.015, 0, 100);
      n.tech = clamp(n.tech + (n.traits.wisdom - 40) * 0.006 + n.wealth * 0.002, 0, 100);
      n.population = Math.max(0, n.population * (1 + (n.food > 40 ? 0.012 : -0.026) + (n.stability > 55 ? 0.006 : -0.012) - disaster * 0.02));
      n.mood = n.stability > 70 ? '兴旺' : n.stability > 45 ? '平稳' : n.stability > 25 ? '动荡' : '濒危';
      if (n.wealth < 10 && n.food < 30 && n.stability < 30) n.poorTicks = (n.poorTicks || 0) + 1; else n.poorTicks = 0;
      if (n.poorTicks >= 2 || n.population <= 0) {
        n.alive = false; s.collapseCount++;
        var neighbor = nations.filter(function (x) { return x.id !== f.id && x.sim.alive !== false; })[0];
        var text = '贫困、缺粮与动荡叠加，' + f.name + '的政权崩溃了。';
        if (neighbor) {
          if (neighbor.sim.traits.kindness >= kindThreshold) {
            neighbor.sim.wealth = clamp(neighbor.sim.wealth + 10, 0, 100);
            text += neighbor.name + '伸出援手，帮助流民重建家园。';
          } else {
            neighbor.sim.population += Math.round(n.population * 0.2);
            neighbor.sim.wealth = clamp(neighbor.sim.wealth + n.wealth * 0.5 + 8, 0, 100);
            (w.places || []).forEach(function (p) { if (String(p.factionId) === String(f.id)) p.factionId = neighbor.id; });
            text += neighbor.name + '趁机吞并了它的土地与残余财富。';
          }
        }
        pushEvent(w, mkEvent(w, 'collapse', '🏚', '亡国 · ' + f.name, text, true));
      }
    });

    /* 6. 战争与性格决策 */
    nations = factions.filter(function (f) { return f.sim.alive !== false; });
    if (nations.length > 1 && r() < s.rules.warRate) {
      var a = pick(nations, r), b = pick(nations.filter(function (x) { return x.id !== a.id; }), r);
      if (a && b) {
        var pa = a.sim.military * (0.7 + r() * 0.6) * (1 + a.sim.traits.aggression / 220) * (1 + a.sim.stability / 320);
        var pb = b.sim.military * (0.7 + r() * 0.6) * (1 + b.sim.traits.wisdom / 320) * (1 + b.sim.stability / 320);
        var winner = pa >= pb ? a : b, loser = winner === a ? b : a;
        s.warCount++;
        var casual = Math.round(loser.sim.population * (0.06 + r() * 0.1));
        loser.sim.population = Math.max(0, loser.sim.population - casual);
        winner.sim.population = Math.max(0, winner.sim.population - Math.round(casual * 0.25));
        var text = winner.name + '击败了' + loser.name + '，双方共伤亡约 ' + casual + ' 人。';
        if (winner.sim.traits.kindness >= kindThreshold) {
          loser.sim.wealth = clamp(loser.sim.wealth + 20, 0, 100);
          loser.sim.stability = clamp(loser.sim.stability + 10, 0, 100);
          loser.sim.food = clamp(loser.sim.food + 16, 0, 100);
          winner.sim.wealth = clamp(winner.sim.wealth - 4, 0, 100);
          pushEvent(w, mkEvent(w, 'war', '🕊', '战后援建 · ' + winner.name, text + '但它选择援建战败者，帮助对方恢复秩序。', true));
        } else if (winner.sim.traits.kindness <= 30) {
          loser.sim.alive = false;
          var moved = Math.round(loser.sim.population * 0.3);
          loser.sim.population = Math.round(loser.sim.population * 0.12);
          winner.sim.population += moved;
          winner.sim.wealth = clamp(winner.sim.wealth + loser.sim.wealth * 0.6 + 10, 0, 100);
          (w.places || []).forEach(function (p) { if (String(p.factionId) === String(loser.id)) p.factionId = winner.id; });
          pushEvent(w, mkEvent(w, 'war', '⚔', '国土被占领 · ' + loser.name, text + winner.name + '吞并了它的国土与财富，将其占为己有。', true));
        } else {
          loser.sim.wealth = clamp(loser.sim.wealth - 15, 0, 100);
          loser.sim.stability = clamp(loser.sim.stability - 8, 0, 100);
          winner.sim.wealth = clamp(winner.sim.wealth + 12, 0, 100);
          pushEvent(w, mkEvent(w, 'war', '🏳', '战败纳贡 · ' + loser.name, text + loser.name + '被迫向' + winner.name + '纳贡。', true));
        }
      }
    }

    /* 7. 年度与人物事件 */
    if (s.tick % tpy === 0) {
      s.yearCount++;
      var alive = factions.filter(function (f) { return f.sim.alive !== false; });
      var pop = 0; alive.forEach(function (f) { pop += f.sim.population; });
      pushEvent(w, mkEvent(w, 'year', '📅', '第' + year + '年', '四季轮转，世界人口约 ' + pop + '，植被总量 ' + Math.round(totalVeg(w, s)) + '。', true));
    }
    if ((w.chars || []).length && r() < 0.035) {
      var ch = pick(w.chars, r);
      var place = (w.places || []).length ? pick(w.places, r) : null;
      var acts = ['在' + (place ? place.name : '远方') + '留下了传说', '成为一方势力的焦点', '在动荡中失去了音讯', '被推举为调解人'];
      pushEvent(w, mkEvent(w, 'people', '👤', ch.name + ' · 人世', ch.name + acts[Math.floor(r() * acts.length)] + '。', false));
    }

    /* 8. 汇总 */
    var aliveNow = factions.filter(function (f) { return f.sim.alive !== false; });
    var totalPop = 0, stab = 0;
    aliveNow.forEach(function (f) { totalPop += f.sim.population; stab += f.sim.stability; });
    s.people.total = Math.round(totalPop);
    s.people.happiness = aliveNow.length ? Math.round(stab / aliveNow.length) : 0;
    s.people.hunger = aliveNow.length ? Math.round(100 - (aliveNow.reduce(function (x, f) { return x + f.sim.food; }, 0) / aliveNow.length)) : 0;
    s.people.faith = clamp(Math.round(42 + (w.faith || []).length * 4 + (w.lore || []).filter(function (x) { return /信仰|宗教|神/.test((x.cat || '') + (x.title || '')); }).length * 3 - s.disasterCount * 0.6), 0, 100);
    if (w.run) {
      w.run.pop = Math.round(totalPop);
      w.run.morale = s.people.happiness;
      w.run.food = aliveNow.length ? Math.round(aliveNow.reduce(function (x, f) { return x + f.sim.food; }, 0) / aliveNow.length) : 0;
      w.run.gold = aliveNow.length ? Math.round(aliveNow.reduce(function (x, f) { return x + f.sim.wealth; }, 0) / aliveNow.length) : 0;
      w.run.wood = Math.round(clamp(totalVeg(w, s) / 24, 0, 100));
      w.run.iron = aliveNow.length ? Math.round(aliveNow.reduce(function (x, f) { return x + f.sim.tech; }, 0) / aliveNow.length) : 0;
    }
    w.updated = Date.now();
    return s.lastEvents.slice();
  }

  function step(w, n, opts) {
    var s = ensure(w);
    n = Math.max(1, Math.min(2000, parseInt(n, 10) || 1));
    var evs = [];
    for (var i = 0; i < n; i++) {
      evs = tickOnce(w);
      if (opts && opts.fast && i % 20 === 0) { /* 保持事件精简 */ }
    }
    if (!opts || !opts.noTouch) {
      if (C && C.cur && String(C.cur.id) === String(w.id) && C.touch) C.touch();
      else { try { var arr = JSON.parse(localStorage.getItem('sl_oc_worlds_v1') || '[]'); for (var k = 0; k < arr.length; k++) if (String(arr[k].id) === String(w.id)) arr[k] = w; localStorage.setItem('sl_oc_worlds_v1', JSON.stringify(arr)); } catch (e) {} }
    }
    return evs;
  }

  function catchUp(w, opts) {
    var s = ensure(w);
    if (!s.auto || s.enabled === false) return 0;
    var now = Date.now();
    var elapsed = now - s.lastTick;
    if (elapsed < s.interval) return 0;
    var ticks = Math.min(2000, Math.floor(elapsed / s.interval));
    if (ticks <= 0) return 0;
    var fromTick = s.tick;
    var fromAge = s.tick;
    step(w, ticks, { fast: true, noTouch: true });
    s.lastTick = now - (elapsed % s.interval);
    var events = s.log.filter(function (e) { return e.tick > fromAge && e.major; }).slice(0, 16);
    s.pendingReport = {
      ticks: ticks, fromTick: fromTick, toTick: s.tick,
      fromYear: Math.floor(fromTick / ticksPerYear(s)) + 1,
      toYear: Math.floor(s.tick / ticksPerYear(s)) + 1,
      events: events, at: now
    };
    if (!opts || !opts.silent) {
      if (C && C.cur && String(C.cur.id) === String(w.id) && C.touch) C.touch();
    }
    return ticks;
  }

  function catchUpAll() {
    var arr = [];
    try { arr = JSON.parse(localStorage.getItem('sl_oc_worlds_v1') || '[]') || []; } catch (e) { arr = []; }
    if (!Array.isArray(arr)) return { changed: 0, ticks: 0, worlds: [] };
    var changed = 0, ticks = 0, worlds = [];
    arr.forEach(function (w) {
      if (!w || !w.sim || w.sim.auto === false) return;
      var before = w.sim.tick || 0;
      var t = catchUp(w, { silent: true });
      if (t > 0) {
        changed++; ticks += t;
        worlds.push({ id: w.id, name: w.name, ticks: t, fromYear: w.sim.pendingReport ? w.sim.pendingReport.fromYear : 1, toYear: w.sim.pendingReport ? w.sim.pendingReport.toYear : 1 });
      }
    });
    if (changed) { try { localStorage.setItem('sl_oc_worlds_v1', JSON.stringify(arr)); } catch (e) {} }
    return { changed: changed, ticks: ticks, worlds: worlds };
  }

  function seedWorld(w) {
    var made = 0;
    if (!(w.species || []).length) {
      w.species = w.species || [];
      w.species.push({ id: uid('s'), name: '野草', type: '植物', habitat: '原野', desc: '覆盖大地的低矮植被，是草食动物的基础食物。', sim: { role: 'plant', population: 640, birth: 0.1, death: 0.02, prey: '', strength: 2, enabled: true } });
      w.species.push({ id: uid('s'), name: '野兔', type: '走兽', habitat: '草原', desc: '繁殖迅速的小型草食动物。', sim: { role: 'herbivore', population: 150, birth: 0.2, death: 0.04, prey: '', strength: 3, enabled: true } });
      w.species.push({ id: uid('s'), name: '灰狼', type: '走兽', habitat: '草原与森林交界', desc: '成群捕猎的掠食者，控制草食动物数量。', sim: { role: 'predator', population: 30, birth: 0.05, death: 0.045, prey: '野兔', strength: 8, enabled: true } });
      made += 3;
    }
    if (!(w.factions || []).length) {
      w.factions = w.factions || [];
      w.factions.push({ id: uid('f'), name: '初民聚落', type: '部落', goal: '在严酷的世界里活下去', creed: '守望相助', desc: '由流民组成的第一个聚落，善良而坚韧。', sim: { population: 1600, wealth: 38, food: 55, military: 16, stability: 62, tech: 14, traits: { kindness: 72, aggression: 28, wisdom: 48, greed: 35 }, alive: true, enabled: true } });
      made++;
    }
    ensure(w);
    return made;
  }

  /* ---------------- 界面 ---------------- */
  function statCard(label, value, sub) {
    return '<div class="sim-stat"><b>' + esc(value) + '</b><span>' + esc(label) + '</span>' + (sub ? '<em>' + esc(sub) + '</em>' : '') + '</div>';
  }
  function bar(label, val, cls, max) {
    var pct = clamp((val || 0) / (max || 100) * 100, 0, 100);
    return '<div class="sim-bar"><span>' + esc(label) + '</span><div class="sim-track"><i class="' + (cls || '') + '" style="width:' + pct + '%"></i></div><b>' + Math.round(val || 0) + '</b></div>';
  }
  function roleName(r) { return { plant: '植物', herbivore: '草食', predator: '掠食', omnivore: '杂食' }[r] || r; }
  function roleIcon(r) { return { plant: '🌱', herbivore: '🐑', predator: '🐺', omnivore: '🐻' }[r] || '🐾'; }
  function trendHtml(v) {
    if (!v) return '<em class="sim-trend">持平</em>';
    return v > 0 ? '<em class="sim-trend up">↑ +' + v + '</em>' : '<em class="sim-trend down">↓ ' + v + '</em>';
  }

  function view(w) {
    ensure(w);
    var s = w.sim;
    var caught = catchUp(w);
    if (caught) setTimeout(function () { showReport(w); }, 120);
    stopTimer();
    if (s.auto && s.enabled !== false && (!C || C.S.tab === 'sim')) {
      var ms = Math.max(4000, s.interval / (s.speed || 1));
      SIM.timer = setInterval(function () {
        if (!C || !C.cur || String(C.cur.id) !== String(w.id)) return;
        step(w, 1);
        w.sim.lastTick = Date.now();
        if (C.S.tab === 'sim') C.renderEditor();
      }, ms);
    }
    var tpy = ticksPerYear(s), year = Math.floor(s.tick / tpy) + 1;
    var aliveNations = (w.factions || []).filter(function (f) { return f.sim && f.sim.alive !== false; });
    var totalPop = 0, stab = 0;
    aliveNations.forEach(function (f) { totalPop += f.sim.population || 0; stab += f.sim.stability || 0; });
    var happiness = aliveNations.length ? Math.round(stab / aliveNations.length) : 0;
    var ecosystem = totalVeg(w, s);
    var species = (w.species || []).filter(function (x) { return x.sim; });
    var h = '<div class="bar"><h2>世界推演</h2><span class="cnt">第 ' + year + ' 年 · 第 ' + s.tick + ' 回合 · ' + SEASONS[s.climate.season || 0] + '</span><div class="sp"></div>' +
      '<button class="btn ' + (s.auto ? 'pri' : 'gho') + '" data-a="simAuto">' + (s.auto ? '⏸ 自动推演中' : '▶ 开启自动推演') + '</button>' +
      '<button class="btn gho" data-a="simCfg">⚖️ 世界法则</button></div>';
    if (s.pendingReport) h += '<div class="sim-report-tip" data-a="simReport">📜 离线期间世界发生了变化，点此查看推演报告</div>';
    h += '<div class="sim-stats">' +
      statCard('世界年龄', '第 ' + year + ' 年', '共 ' + s.tick + ' 回合') +
      statCard('总人口', Math.round(totalPop), aliveNations.length + ' 个国度存活') +
      statCard('植被总量', Math.round(ecosystem), '上限 ' + Math.round(s.rules.plantCapacity)) +
      statCard('平均幸福', happiness, s.people.hunger + '% 饥饿感') +
      '</div>';
    h += '<div class="sim-actions">' +
      '<button class="btn pri" data-a="simStep" data-n="1">推进一步</button>' +
      '<button class="btn gho" data-a="simStep" data-n="10">推进 10 步</button>' +
      '<button class="btn gho" data-a="simStep" data-n="' + tpy + '">推进 1 年</button>' +
      '<span class="sim-speed">速度：' + [1, 2, 4].map(function (v) { return '<button class="' + (s.speed === v ? 'on' : '') + '" data-a="simSpeed" data-v="' + v + '">' + v + '×</button>'; }).join('') + '</span>' +
      '<button class="btn gho" data-a="simSeed">🌱 生成初始生态</button>' +
      '</div>';
    h += '<div class="sim-grid">';
    /* 法则 */
    h += '<div class="sim-card"><h3>气候与法则</h3>' +
      '<div class="sim-law">' + [
        ['温度', s.climate.temp + '°C'], ['降雨', s.climate.rain], ['灾害', s.climate.disaster ? '正在发生' : '无'],
        ['重力', s.physics.gravity], ['魔力', s.physics.magic], ['生育力', s.physics.fertility],
        ['植物生长', (s.rules.plantGrowth * 100).toFixed(1) + '%'], ['战争概率', Math.round(s.rules.warRate * 100) + '%'],
        ['善良阈值', s.rules.kindThreshold]
      ].map(function (x) { return '<span>' + esc(x[0]) + ' <b>' + esc(x[1]) + '</b></span>'; }).join('') + '</div>' +
      '<p class="sim-note">离线推演：开启自动后，关闭软件也会按每 ' + Math.round(s.interval / 1000) + ' 秒 1 回合继续；下次打开会生成变化报告。</p>' +
      '<button class="btn gho mini" data-a="simCfg">调整物理常数与规则</button></div>';
    /* 生态 */
    h += '<div class="sim-card"><h3>生态链</h3>' +
      bar('植被', ecosystem, 'plants', s.rules.plantCapacity) +
      (species.length ? species.map(function (sp) {
        var x = sp.sim;
        return '<div class="sim-row" data-a="simSpecies" data-id="' + esc(sp.id) + '">' +
          '<span class="sim-ic">' + roleIcon(x.role) + '</span>' +
          '<div class="sim-row-b"><b>' + esc(sp.name) + '</b><em>' + roleName(x.role) + ' · 食物 ' + Math.round((x.foodRatio || 0) * 100) + '%</em>' +
          '<div class="sim-track"><i style="width:' + clamp(x.population / Math.max(1, x.population + 80) * 100, 0, 100) + '%"></i></div></div>' +
          '<div class="sim-row-v"><b>' + Math.round(x.population) + '</b>' + trendHtml(Math.round(x.trend || 0)) + '</div></div>';
      }).join('') : '<div class="empty">还没有参与推演的物种。<br>去「自然与物种」添加，或点上面的「生成初始生态」。</div>') +
      '</div>';
    /* 国度 */
    h += '<div class="sim-card"><h3>国度与文明</h3>' +
      ((w.factions || []).length ? w.factions.map(function (f) {
        if (!f.sim) return '';
        var n = f.sim;
        var dead = n.alive === false;
        return '<div class="sim-nation' + (dead ? ' dead' : '') + '" data-a="simNation" data-id="' + esc(f.id) + '">' +
          '<div class="sim-nation-h"><b>' + esc(f.name) + '</b><span>' + (dead ? '已亡国' : n.mood) + '</span><em>人口 ' + Math.round(n.population) + '</em></div>' +
          bar('财富', n.wealth, 'gold') + bar('粮食', n.food, 'food') + bar('稳定', n.stability, 'stable') + bar('军力', n.military, 'war') +
          '<div class="sim-traits"><i>善 ' + n.traits.kindness + '</i><i>战 ' + n.traits.aggression + '</i><i>智 ' + n.traits.wisdom + '</i><i>贪 ' + n.traits.greed + '</i></div>' +
          (dead ? '<button class="btn gho mini" data-a="simRevive" data-id="' + esc(f.id) + '">复国</button>' : '') +
          '</div>';
      }).join('') : '<div class="empty">还没有国度。<br>去「组织势力」添加，或点上面的「生成初始生态」。</div>') +
      '</div>';
    /* 纪事 */
    h += '<div class="sim-card sim-log-card"><h3>推演纪事</h3>' +
      (s.log.length ? s.log.slice(0, 40).map(function (e) {
        return '<div class="sim-log"><span>' + (e.icon || '•') + '</span><div><b>' + esc(e.title) + '</b><p>' + esc(e.text) + '</p></div><em>第' + e.year + '年</em></div>';
      }).join('') : '<div class="empty">世界还很安静。推进一步，看看会发生什么。</div>') +
      '<button class="btn gho mini" data-a="simClearLog">清空纪事</button></div>';
    h += '</div>';
    return h;
  }

  function showReport(w) {
    var s = w.sim, r = s && s.pendingReport;
    if (!r || !C) return;
    s.pendingReport = null;
    if (C.touch) C.touch();
    var tip = document.querySelector('.sim-report-tip');
    if (tip) tip.remove();
    var h = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>你不在时，世界变了</h3>' +
      '<p class="sdesc">离线期间共推演 <b>' + r.ticks + '</b> 回合，从第 ' + r.fromYear + ' 年走到第 ' + r.toYear + ' 年。</p>';
    if (r.events && r.events.length) {
      h += '<div class="sim-report-list">' + r.events.map(function (e) {
        return '<div class="sim-report-item"><span>' + (e.icon || '•') + '</span><div><b>' + esc(e.title) + '</b><p>' + esc(e.text) + '</p></div></div>';
      }).join('') + '</div>';
    } else h += '<p class="sdesc">这段时间没有发生足以载入史册的大事，但人口、植被与国度的数字已经改变。</p>';
    h += '<div class="acts"><button class="btn pri" data-a="simReportClose">去看看</button></div></div></div>';
    C.modal.innerHTML = h;
  }

  /* ---------------- 表单 ---------------- */
  function cfgForm(w) {
    var s = ensure(w), p = s.physics, r = s.rules;
    function f(k, label, val, step, min, max) {
      return '<div class="field"><label>' + label + '</label><input data-k="' + k + '" type="number" step="' + (step || 1) + '" min="' + (min == null ? 0 : min) + '" max="' + (max == null ? 99999 : max) + '" value="' + val + '"></div>';
    }
    C.modal.innerHTML = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>世界法则与物理常数</h3>' +
      '<div class="row2">' + f('gravity', '重力', p.gravity, 0.1, 0.1, 5) + f('magic', '魔力浓度', p.magic, 0.05, 0, 1) + '</div>' +
      '<div class="row2">' + f('fertility', '世界生育力', p.fertility, 0.1, 0.1, 5) + f('yearLength', '一年天数', p.yearLength, 1, 30, 3650) + '</div>' +
      '<div class="row2">' + f('dayLength', '一天小时数', p.dayLength, 1, 1, 100) + f('plantGrowth', '植物生长率', r.plantGrowth, 0.01, 0, 0.6) + '</div>' +
      '<div class="row2">' + f('plantCapacity', '植被上限', r.plantCapacity, 100, 100, 30000) + f('herbivoreEfficiency', '草食效率', r.herbivoreEfficiency, 0.05, 0.1, 3) + '</div>' +
      '<div class="row2">' + f('predatorEfficiency', '捕食效率', r.predatorEfficiency, 0.05, 0.1, 3) + f('disasterRate', '灾害概率', r.disasterRate, 0.005, 0, 0.3) + '</div>' +
      '<div class="row2">' + f('warRate', '战争概率', r.warRate, 0.01, 0, 0.4) + f('trade', '贸易效率', r.trade, 0.05, 0, 2) + '</div>' +
      '<div class="row2">' + f('kindThreshold', '善良援建阈值', r.kindThreshold, 1, 0, 100) + f('biasTemp', '温度偏移', s.climate.biasTemp, 1, -30, 30) + '</div>' +
      '<div class="row2">' + f('biasRain', '降雨偏移', s.climate.biasRain, 1, -60, 60) + f('interval', '自动回合间隔（秒）', Math.round(s.interval / 1000), 5, 10, 3600) + '</div>' +
      '<div class="hint">重力越高，生态承载越低；魔力与生育力会影响植物与捕食效率；善良阈值决定战胜国是援建还是占领。</div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="simSaveCfg">保存法则</button></div>' +
      '</div></div>';
  }
  function saveCfg() {
    var w = C.cur(); if (!w) return;
    var s = ensure(w), d = {};
    C.modal.querySelectorAll('[data-k]').forEach(function (el) { d[el.getAttribute('data-k')] = parseFloat(el.value) || 0; });
    s.physics.gravity = clamp(d.gravity || 1, 0.1, 5);
    s.physics.magic = clamp(d.magic || 0, 0, 1);
    s.physics.fertility = clamp(d.fertility || 1, 0.1, 5);
    s.physics.yearLength = clamp(d.yearLength || 365, 30, 3650);
    s.physics.dayLength = clamp(d.dayLength || 24, 1, 100);
    s.rules.plantGrowth = clamp(d.plantGrowth || 0.09, 0, 0.6);
    s.rules.plantCapacity = clamp(d.plantCapacity || 2200, 100, 30000);
    s.rules.herbivoreEfficiency = clamp(d.herbivoreEfficiency || 1, 0.1, 3);
    s.rules.predatorEfficiency = clamp(d.predatorEfficiency || 0.8, 0.1, 3);
    s.rules.disasterRate = clamp(d.disasterRate || 0.02, 0, 0.3);
    s.rules.warRate = clamp(d.warRate || 0.06, 0, 0.4);
    s.rules.trade = clamp(d.trade || 0.5, 0, 2);
    s.rules.kindThreshold = clamp(d.kindThreshold || 60, 0, 100);
    s.climate.biasTemp = clamp(d.biasTemp || 0, -30, 30);
    s.climate.biasRain = clamp(d.biasRain || 0, -60, 60);
    s.interval = clamp((d.interval || 60) * 1000, 10000, 3600000);
    s.lastTick = Date.now();
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('世界法则已保存');
  }
  function speciesForm(w, id) {
    var sp = null;
    (w.species || []).forEach(function (x) { if (String(x.id) === String(id)) sp = x; });
    if (!sp) return;
    ensure(w);
    var x = sp.sim;
    C.modal.innerHTML = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>' + esc(sp.name) + ' · 推演参数</h3>' +
      '<div class="field"><label>生态角色</label><select data-k="role">' +
      [['plant', '植物 / 生产者'], ['herbivore', '草食动物'], ['predator', '掠食者'], ['omnivore', '杂食动物']].map(function (o) {
        return '<option value="' + o[0] + '"' + (x.role === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
      }).join('') + '</select></div>' +
      '<div class="row2"><div class="field"><label>当前数量</label><input data-k="population" type="number" value="' + x.population + '"></div>' +
      '<div class="field"><label>强度（1-10）</label><input data-k="strength" type="number" min="1" max="10" value="' + x.strength + '"></div></div>' +
      '<div class="row2"><div class="field"><label>出生率</label><input data-k="birth" type="number" step="0.01" value="' + x.birth + '"></div>' +
      '<div class="field"><label>死亡率</label><input data-k="death" type="number" step="0.01" value="' + x.death + '"></div></div>' +
      '<div class="field"><label>捕食对象（逗号分隔物种名，留空=所有草食/杂食）</label><input data-k="prey" value="' + esc(x.prey || '') + '"></div>' +
      '<div class="field"><label>参与推演</label><select data-k="enabled"><option value="1"' + (x.enabled !== false ? ' selected' : '') + '>开启</option><option value="0"' + (x.enabled === false ? ' selected' : '') + '>暂停</option></select></div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="simSaveSpecies" data-id="' + esc(id) + '">保存</button></div></div></div>';
  }
  function saveSpecies(id) {
    var w = C.cur(); if (!w) return;
    var sp = null; (w.species || []).forEach(function (x) { if (String(x.id) === String(id)) sp = x; });
    if (!sp) return;
    ensure(w);
    var q = {}; C.modal.querySelectorAll('[data-k]').forEach(function (el) { q[el.getAttribute('data-k')] = el.value; });
    var x = sp.sim;
    x.role = q.role || x.role;
    x.population = Math.max(0, Math.round(parseFloat(q.population) || 0));
    x.strength = clamp(parseFloat(q.strength) || 5, 1, 10);
    x.birth = clamp(parseFloat(q.birth) || 0, 0, 1);
    x.death = clamp(parseFloat(q.death) || 0, 0, 1);
    x.prey = String(q.prey || '').trim();
    x.enabled = q.enabled !== '0';
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('推演参数已保存');
  }
  function nationForm(w, id) {
    var f = null; (w.factions || []).forEach(function (x) { if (String(x.id) === String(id)) f = x; });
    if (!f) return;
    ensure(w);
    var n = f.sim;
    function num(k, label, val, max) {
      return '<div class="field"><label>' + label + '</label><input data-k="' + k + '" type="number" min="0" max="' + (max || 100) + '" value="' + val + '"></div>';
    }
    C.modal.innerHTML = '<div class="mask" data-a="closeMask"><div class="sheet">' +
      '<h3>' + esc(f.name) + ' · 国度参数</h3>' +
      '<div class="row2">' + num('population', '人口', Math.round(n.population), 99999999) + num('wealth', '财富', Math.round(n.wealth)) + '</div>' +
      '<div class="row2">' + num('food', '粮食', Math.round(n.food)) + num('stability', '稳定', Math.round(n.stability)) + '</div>' +
      '<div class="row2">' + num('military', '军力', Math.round(n.military)) + num('tech', '科技', Math.round(n.tech)) + '</div>' +
      '<div class="row2">' + num('kindness', '善良', n.traits.kindness) + num('aggression', '好战', n.traits.aggression) + '</div>' +
      '<div class="row2">' + num('wisdom', '智慧', n.traits.wisdom) + num('greed', '贪婪', n.traits.greed) + '</div>' +
      '<div class="field"><label>参与推演</label><select data-k="enabled"><option value="1"' + (n.enabled !== false ? ' selected' : '') + '>开启</option><option value="0"' + (n.enabled === false ? ' selected' : '') + '>暂停</option></select></div>' +
      '<div class="hint">善良高的国家在战争后会援建对手；善良低的国家会占领对方国土；中间派通常选择纳贡。</div>' +
      '<div class="acts"><button class="btn gho" data-a="closeMask">取消</button><button class="btn pri" data-a="simSaveNation" data-id="' + esc(id) + '">保存</button></div></div></div>';
  }
  function saveNation(id) {
    var w = C.cur(); if (!w) return;
    var f = null; (w.factions || []).forEach(function (x) { if (String(x.id) === String(id)) f = x; });
    if (!f) return;
    ensure(w);
    var q = {}; C.modal.querySelectorAll('[data-k]').forEach(function (el) { q[el.getAttribute('data-k')] = el.value; });
    var n = f.sim;
    n.population = Math.max(0, Math.round(parseFloat(q.population) || 0));
    ['wealth', 'food', 'stability', 'military', 'tech'].forEach(function (k) { n[k] = clamp(parseFloat(q[k]) || 0, 0, 100); });
    ['kindness', 'aggression', 'wisdom', 'greed'].forEach(function (k) { n.traits[k] = clamp(parseFloat(q[k]) || 0, 0, 100); });
    n.enabled = q.enabled !== '0';
    C.touch(); C.modal.innerHTML = ''; C.renderEditor(); toast('国度参数已保存');
  }
  function revive(w, id) {
    var f = null; (w.factions || []).forEach(function (x) { if (String(x.id) === String(id)) f = x; });
    if (!f) return;
    ensure(w);
    var n = f.sim;
    n.alive = true; n.population = Math.max(120, Math.round(n.population || 0)); n.wealth = Math.max(18, n.wealth);
    n.food = Math.max(30, n.food); n.stability = Math.max(35, n.stability); n.poorTicks = 0; n.mood = '重建中';
    pushEvent(w, mkEvent(w, 'nation', '🏛', '复国 · ' + f.name, f.name + '的遗民重新举起了旗帜。', true));
    C.touch(); C.renderEditor(); toast('国度已复国');
  }

  function stopTimer() {
    if (SIM.timer) { clearInterval(SIM.timer); SIM.timer = 0; }
    SIM.active = '';
  }

  /* ---------------- 事件 ---------------- */
  if (C) {
    document.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('[data-a]') : null;
      if (!t) return;
      var a = t.getAttribute('data-a'), id = t.getAttribute('data-id');
      var w = C.cur && C.cur();
      if (a === 'simStep') { if (!w) return; var n = parseInt(t.getAttribute('data-n'), 10) || 1; step(w, n); ensure(w).lastTick = Date.now(); C.touch(); C.renderEditor(); toast('已推演 ' + n + ' 回合'); return; }
      if (a === 'simAuto') { if (!w) return; var s = ensure(w); s.auto = !s.auto; s.lastTick = Date.now(); C.touch(); C.renderEditor(); toast(s.auto ? '自动推演已开启' : '自动推演已暂停'); return; }
      if (a === 'simSpeed') { if (!w) return; var s2 = ensure(w); s2.speed = parseInt(t.getAttribute('data-v'), 10) || 1; C.touch(); C.renderEditor(); return; }
      if (a === 'simCfg') { if (w) cfgForm(w); return; }
      if (a === 'simSaveCfg') { saveCfg(); return; }
      if (a === 'simSpecies') { if (w) speciesForm(w, id); return; }
      if (a === 'simSaveSpecies') { saveSpecies(id); return; }
      if (a === 'simNation') { if (w) nationForm(w, id); return; }
      if (a === 'simSaveNation') { saveNation(id); return; }
      if (a === 'simRevive') { if (w) revive(w, id); return; }
      if (a === 'simSeed') { if (!w) return; var made = seedWorld(w); C.touch(); C.renderEditor(); toast(made ? '已生成初始生态与国度' : '已经有生态与国度了'); return; }
      if (a === 'simClearLog') { if (!w) return; if (confirm('清空推演纪事？世界状态不会重置。')) { ensure(w).log = []; C.touch(); C.renderEditor(); } return; }
      if (a === 'simReport') { if (w) showReport(w); return; }
      if (a === 'simReportClose') { C.modal.innerHTML = ''; C.renderEditor(); return; }
    });
  }

  window.SL_SIM = {
    ensure: ensure, step: step, catchUp: catchUp, catchUpAll: catchUpAll,
    seedWorld: seedWorld, view: view, stopTimer: stopTimer, showReport: showReport,
    status: function (w) {
      var s = ensure(w);
      return { year: Math.floor(s.tick / ticksPerYear(s)) + 1, tick: s.tick, auto: s.auto, species: (w.species || []).length, nations: (w.factions || []).length };
    }
  };
})();
