// =============================================
//  ポケモン図鑑 + なかよし度 + 進化 + マイルストーン報酬
// =============================================

const SPRITE_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
const SPRITE_HD = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

// --- Audio Context ---
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}
document.addEventListener('click', () => { getAudioCtx(); }, { once: true });
document.addEventListener('touchstart', () => { getAudioCtx(); }, { once: true });

// --- ポケモンデータ ---
const POKEDEX = [
  // ふつう (C)
  {id:1,name:'フシギダネ',r:'C'},{id:4,name:'ヒトカゲ',r:'C'},{id:7,name:'ゼニガメ',r:'C'},
  {id:10,name:'キャタピー',r:'C'},{id:16,name:'ポッポ',r:'C'},{id:19,name:'コラッタ',r:'C'},
  {id:21,name:'オニスズメ',r:'C'},{id:23,name:'アーボ',r:'C'},{id:25,name:'ピカチュウ',r:'C'},
  {id:27,name:'サンド',r:'C'},{id:29,name:'ニドラン♀',r:'C'},{id:32,name:'ニドラン♂',r:'C'},
  {id:35,name:'ピッピ',r:'C'},{id:37,name:'ロコン',r:'C'},{id:39,name:'プリン',r:'C'},
  {id:41,name:'ズバット',r:'C'},{id:43,name:'ナゾノクサ',r:'C'},{id:46,name:'パラス',r:'C'},
  {id:48,name:'コンパン',r:'C'},{id:50,name:'ディグダ',r:'C'},{id:52,name:'ニャース',r:'C'},
  {id:54,name:'コダック',r:'C'},{id:56,name:'マンキー',r:'C'},{id:58,name:'ガーディ',r:'C'},
  {id:60,name:'ニョロモ',r:'C'},{id:63,name:'ケーシィ',r:'C'},{id:66,name:'ワンリキー',r:'C'},
  {id:69,name:'マダツボミ',r:'C'},{id:72,name:'メノクラゲ',r:'C'},{id:74,name:'イシツブテ',r:'C'},
  {id:77,name:'ポニータ',r:'C'},{id:79,name:'ヤドン',r:'C'},{id:81,name:'コイル',r:'C'},
  {id:84,name:'ドードー',r:'C'},{id:86,name:'パウワウ',r:'C'},{id:88,name:'ベトベター',r:'C'},
  {id:90,name:'シェルダー',r:'C'},{id:92,name:'ゴース',r:'C'},{id:95,name:'イワーク',r:'C'},
  {id:96,name:'スリープ',r:'C'},{id:98,name:'クラブ',r:'C'},{id:100,name:'ビリリダマ',r:'C'},
  {id:102,name:'タマタマ',r:'C'},{id:104,name:'カラカラ',r:'C'},{id:109,name:'ドガース',r:'C'},
  {id:111,name:'サイホーン',r:'C'},{id:113,name:'ラッキー',r:'C'},{id:116,name:'タッツー',r:'C'},
  {id:118,name:'トサキント',r:'C'},{id:120,name:'ヒトデマン',r:'C'},{id:129,name:'コイキング',r:'C'},
  {id:133,name:'イーブイ',r:'C'},{id:137,name:'ポリゴン',r:'C'},{id:152,name:'チコリータ',r:'C'},
  {id:155,name:'ヒノアラシ',r:'C'},{id:158,name:'ワニノコ',r:'C'},{id:172,name:'ピチュー',r:'C'},
  {id:173,name:'ピィ',r:'C'},{id:174,name:'ププリン',r:'C'},{id:175,name:'トゲピー',r:'C'},
  {id:179,name:'メリープ',r:'C'},{id:183,name:'マリル',r:'C'},{id:187,name:'ハネッコ',r:'C'},
  {id:194,name:'ウパー',r:'C'},{id:209,name:'ブルー',r:'C'},{id:216,name:'ヒメグマ',r:'C'},
  {id:231,name:'ゴマゾウ',r:'C'},{id:252,name:'キモリ',r:'C'},{id:255,name:'アチャモ',r:'C'},
  {id:258,name:'ミズゴロウ',r:'C'},{id:261,name:'ポチエナ',r:'C'},{id:280,name:'ラルトス',r:'C'},
  {id:300,name:'エネコ',r:'C'},{id:311,name:'プラスル',r:'C'},{id:312,name:'マイナン',r:'C'},
  {id:333,name:'チルット',r:'C'},{id:353,name:'カゲボウズ',r:'C'},{id:387,name:'ナエトル',r:'C'},
  {id:390,name:'ヒコザル',r:'C'},{id:393,name:'ポッチャマ',r:'C'},{id:403,name:'コリンク',r:'C'},
  {id:417,name:'パチリス',r:'C'},{id:427,name:'ミミロル',r:'C'},{id:440,name:'ピンプク',r:'C'},
  // レア (R)
  {id:3,name:'フシギバナ',r:'R'},{id:6,name:'リザードン',r:'R'},{id:9,name:'カメックス',r:'R'},
  {id:26,name:'ライチュウ',r:'R'},{id:38,name:'キュウコン',r:'R'},{id:59,name:'ウインディ',r:'R'},
  {id:65,name:'フーディン',r:'R'},{id:68,name:'カイリキー',r:'R'},{id:76,name:'ゴローニャ',r:'R'},
  {id:94,name:'ゲンガー',r:'R'},{id:112,name:'サイドン',r:'R'},{id:121,name:'スターミー',r:'R'},
  {id:123,name:'ストライク',r:'R'},{id:126,name:'ブーバー',r:'R'},{id:130,name:'ギャラドス',r:'R'},
  {id:131,name:'ラプラス',r:'R'},{id:134,name:'シャワーズ',r:'R'},{id:135,name:'サンダース',r:'R'},
  {id:136,name:'ブースター',r:'R'},{id:143,name:'カビゴン',r:'R'},{id:149,name:'カイリュー',r:'R'},
  {id:176,name:'トゲチック',r:'R'},{id:196,name:'エーフィ',r:'R'},{id:197,name:'ブラッキー',r:'R'},
  {id:212,name:'ハッサム',r:'R'},{id:230,name:'キングドラ',r:'R'},{id:248,name:'バンギラス',r:'R'},
  {id:282,name:'サーナイト',r:'R'},{id:306,name:'ボスゴドラ',r:'R'},{id:334,name:'チルタリス',r:'R'},
  {id:445,name:'ガブリアス',r:'R'},{id:448,name:'ルカリオ',r:'R'},{id:468,name:'トゲキッス',r:'R'},
  {id:471,name:'グレイシア',r:'R'},{id:700,name:'ニンフィア',r:'R'},
  // 超レア (SR)
  {id:144,name:'フリーザー',r:'SR'},{id:145,name:'サンダー',r:'SR'},{id:146,name:'ファイヤー',r:'SR'},
  {id:150,name:'ミュウツー',r:'SR'},{id:151,name:'ミュウ',r:'SR'},
  {id:243,name:'ライコウ',r:'SR'},{id:244,name:'エンテイ',r:'SR'},{id:245,name:'スイクン',r:'SR'},
  {id:249,name:'ルギア',r:'SR'},{id:250,name:'ホウオウ',r:'SR'},{id:251,name:'セレビィ',r:'SR'},
  {id:384,name:'レックウザ',r:'SR'},{id:385,name:'ジラーチ',r:'SR'},
  {id:483,name:'ディアルガ',r:'SR'},{id:484,name:'パルキア',r:'SR'},{id:493,name:'アルセウス',r:'SR'},
];

// 進化で手に入るポケモン（ともだちさがしに入っていない中間・最終進化）
const EVOLUTION_POKEMON = {
  2:{name:'フシギソウ',r:'UC'}, 5:{name:'リザード',r:'UC'}, 8:{name:'カメール',r:'UC'},
  11:{name:'トランセル',r:'UC'}, 12:{name:'バタフリー',r:'UC'},
  17:{name:'ピジョン',r:'UC'}, 18:{name:'ピジョット',r:'UC'},
  24:{name:'アーボック',r:'UC'}, 28:{name:'サンドパン',r:'UC'},
  30:{name:'ニドリーナ',r:'UC'}, 33:{name:'ニドリーノ',r:'UC'},
  36:{name:'ピクシー',r:'UC'}, 40:{name:'プクリン',r:'UC'},
  42:{name:'ゴルバット',r:'UC'}, 44:{name:'クサイハナ',r:'UC'},
  53:{name:'ペルシアン',r:'UC'}, 55:{name:'ゴルダック',r:'UC'},
  61:{name:'ニョロゾ',r:'UC'}, 64:{name:'ユンゲラー',r:'UC'},
  67:{name:'ゴーリキー',r:'UC'}, 75:{name:'ゴローン',r:'UC'},
  78:{name:'ギャロップ',r:'UC'}, 80:{name:'ヤドラン',r:'UC'},
  82:{name:'レアコイル',r:'UC'}, 93:{name:'ゴースト',r:'UC'},
  110:{name:'マタドガス',r:'UC'},
  117:{name:'シードラ',r:'UC'}, 153:{name:'ベイリーフ',r:'UC'}, 154:{name:'メガニウム',r:'UC'},
  156:{name:'マグマラシ',r:'UC'}, 157:{name:'バクフーン',r:'UC'},
  159:{name:'アリゲイツ',r:'UC'}, 160:{name:'オーダイル',r:'UC'},
  180:{name:'モココ',r:'UC'}, 181:{name:'デンリュウ',r:'UC'},
  281:{name:'キルリア',r:'UC'}, 388:{name:'ハヤシガメ',r:'UC'}, 389:{name:'ドダイトス',r:'UC'},
  391:{name:'モウカザル',r:'UC'}, 392:{name:'ゴウカザル',r:'UC'},
  394:{name:'ポッタイシ',r:'UC'}, 395:{name:'エンペルト',r:'UC'},
  404:{name:'ルクシオ',r:'UC'}, 405:{name:'レントラー',r:'UC'},
  447:{name:'リオル',r:'UC'},
};

// 進化チェーン: id → { to, level }
const EVOLUTION_CHAINS = {
  1:{to:2,level:3}, 2:{to:3,level:6},
  4:{to:5,level:3}, 5:{to:6,level:6},
  7:{to:8,level:3}, 8:{to:9,level:6},
  10:{to:11,level:2}, 11:{to:12,level:4},
  16:{to:17,level:2}, 17:{to:18,level:5},
  23:{to:24,level:3}, 25:{to:26,level:4},
  27:{to:28,level:3}, 29:{to:30,level:3}, 32:{to:33,level:3},
  35:{to:36,level:4}, 37:{to:38,level:4}, 39:{to:40,level:3},
  41:{to:42,level:3}, 43:{to:44,level:3},
  52:{to:53,level:3}, 54:{to:55,level:3},
  58:{to:59,level:4}, 60:{to:61,level:3},
  63:{to:64,level:3}, 64:{to:65,level:6},
  66:{to:67,level:3}, 67:{to:68,level:6},
  74:{to:75,level:3}, 75:{to:76,level:6},
  77:{to:78,level:3}, 79:{to:80,level:3},
  81:{to:82,level:4}, 88:{to:89,level:3},
  92:{to:93,level:3}, 93:{to:94,level:6},
  109:{to:110,level:3}, 111:{to:112,level:5},
  116:{to:117,level:3}, 117:{to:230,level:6},
  129:{to:130,level:5},
  133:{to:134,level:4,random:[134,135,136,196,197,471,700]},
  152:{to:153,level:3}, 153:{to:154,level:6},
  155:{to:156,level:3}, 156:{to:157,level:6},
  158:{to:159,level:3}, 159:{to:160,level:6},
  175:{to:176,level:4}, 176:{to:468,level:7},
  179:{to:180,level:3}, 180:{to:181,level:5},
  280:{to:281,level:3}, 281:{to:282,level:6},
  333:{to:334,level:4},
  387:{to:388,level:3}, 388:{to:389,level:6},
  390:{to:391,level:3}, 391:{to:392,level:6},
  393:{to:394,level:3}, 394:{to:395,level:6},
  403:{to:404,level:3}, 404:{to:405,level:6},
};

// 名前検索（全ポケモン + 進化限定をまとめて引ける）
function findPokeName(id) {
  const p = POKEDEX.find(p => p.id === id);
  if (p) return p.name;
  if (EVOLUTION_POKEMON[id]) return EVOLUTION_POKEMON[id].name;
  return `No.${id}`;
}

const RARITY_INFO = {
  C:  { label:'ふつう', cls:'rarity-common' },
  UC: { label:'進化', cls:'rarity-common' },
  R:  { label:'レア', cls:'rarity-rare' },
  SR: { label:'超レア', cls:'rarity-sr' },
};

const CHEER_MESSAGES = [
  'すごい！さすが！','やったね！かっこいい！','ナイス！じゅんびかんぺき！',
  'バッチリだね！','はやい！てんさいだ！','きみならできると思ってた！',
  'いっしょにがんばろ！','えらい！まかせたよ！','じゅんびOK！いってらっしゃい！',
  'さいこう！その調子！','よっしゃー！いくぞー！','グッジョブ！！',
];

// なかよし度レベルテーブル
const FRIENDSHIP_LEVELS = [0, 20, 50, 100, 200, 500, 800, 1200];
const MAX_FRIENDSHIP_LEVEL = FRIENDSHIP_LEVELS.length - 1;

// ====================================================
//  マイルストーン定義
// ====================================================
const MILESTONES = [
  { days: 3,   pool: ['C'],      label: '3日がんばった！' },
  { days: 7,   pool: ['C'],      label: '7日がんばった！' },
  { days: 15,  pool: ['C','R'],  label: '15日がんばった！' },
  { days: 30,  pool: ['R'],      label: '30日がんばった！' },
  { days: 50,  pool: ['R'],      label: '50日がんばった！' },
  { days: 100, pool: ['R','SR'], label: '100日がんばった！' },
];
// 100日以降は50日ごとに繰り返し
const MILESTONE_REPEAT_INTERVAL = 50;
const MILESTONE_REPEAT_POOL = ['C','R','SR'];

// --- データ管理 ---
let gachaData = { points: 0, collection: [], partner: null, partnerDate: '', friendship: {}, milestones: [] };

function loadGachaData() {
  const raw = localStorage.getItem('junbi_timer_gacha');
  if (raw) { try { gachaData = JSON.parse(raw); } catch(e) {} }
  if (!gachaData.friendship) gachaData.friendship = {};
  if (!gachaData.history) gachaData.history = {};
  if (!gachaData.milestones) gachaData.milestones = [];
  // 移行: historyがない既存コレクションにサンプル履歴を補完
  if (gachaData.collection.length > 0) {
    const needsMigration = gachaData.collection.some(id => !gachaData.history[id]);
    if (needsMigration) {
      const taskNames = [];
      try {
        const sRaw = localStorage.getItem('junbi_timer_schedule');
        if (sRaw) {
          const sData = JSON.parse(sRaw);
          for (const day of Object.values(sData)) {
            if (Array.isArray(day)) day.forEach(ev => {
              if (ev.name && !taskNames.includes(ev.name)) taskNames.push(ev.name);
            });
          }
        }
      } catch(e) {}
      if (taskNames.length === 0) taskNames.push('水泳', 'ピアノ');
      const now = new Date();
      gachaData.collection.forEach((id, i) => {
        if (!gachaData.history[id]) {
          const d = new Date(now);
          d.setDate(d.getDate() - (gachaData.collection.length - i));
          const rarity = getPokeRarity(id);
          const method = (rarity === 'UC') ? 'しんか' : taskNames[i % taskNames.length];
          gachaData.history[id] = {
            date: localDateStr(d),
            method: method
          };
        }
      });
      saveGachaData();
    }
  }
  // パートナーがコレクションから外れていたら先頭に戻す
  if (gachaData.partner && !gachaData.collection.includes(gachaData.partner)) {
    gachaData.partner = gachaData.collection.length > 0 ? gachaData.collection[0] : null;
    saveGachaData();
  }
}
function saveGachaData() { localStorage.setItem('junbi_timer_gacha', JSON.stringify(gachaData)); }

function recordHistory(pokeId, method) {
  if (!gachaData.history) gachaData.history = {};
  if (!gachaData.history[pokeId]) {
    gachaData.history[pokeId] = {
      date: localDateStr(),
      method: method
    };
    saveGachaData();
  }
}

function addPoints(amount) {
  gachaData.points += amount;
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  renderPartnerSection();
}

// --- なかよし度 ---
function getFriendship(pokeId) {
  if (!gachaData.friendship[pokeId]) {
    gachaData.friendship[pokeId] = { exp: 0 };
  }
  return gachaData.friendship[pokeId];
}

function getFriendshipLevel(pokeId) {
  const f = getFriendship(pokeId);
  let level = 0;
  for (let i = FRIENDSHIP_LEVELS.length - 1; i >= 0; i--) {
    if (f.exp >= FRIENDSHIP_LEVELS[i]) { level = i; break; }
  }
  return level;
}

// レベルアップ時の特別セリフ
const LEVELUP_MESSAGES = {
  1: { msg: 'なまえ おぼえたよ！', sub: 'ともだちに なれたかな？' },
  2: { msg: 'いっしょに いると あんしん！', sub: 'もっと なかよく なりたいな' },
  3: { msg: 'きみの こと だいすき！', sub: 'おやつ おいしいね！' },
  4: { msg: 'いっしょに いると たのしい！', sub: 'まいにち ワクワク！' },
  5: { msg: 'きみは ぼくの しんゆうだ！', sub: 'ずっと いっしょだよ！' },
  6: { msg: 'きみが いるから がんばれる！', sub: 'さいこうの パートナー！' },
  7: { msg: 'ぼくたち さいきょうの コンビ！', sub: 'なにが あっても いっしょ！' },
};

function addFriendshipExp(pokeId, amount) {
  const f = getFriendship(pokeId);
  const oldLevel = getFriendshipLevel(pokeId);
  f.exp += amount;
  saveGachaData();
  const newLevel = getFriendshipLevel(pokeId);

  // レベルアップチェック
  if (newLevel > oldLevel) {
    const hasEvolution = !!EVOLUTION_CHAINS[pokeId];
    const evoLevel = hasEvolution ? EVOLUTION_CHAINS[pokeId].level : null;
    const willEvolve = hasEvolution && newLevel >= evoLevel;

    // 進化するなら進化演出を優先、しないならレベルアップ演出
    if (willEvolve) {
      checkEvolution(pokeId, newLevel);
    } else {
      showLevelUpAnimation(pokeId, newLevel);
    }
  }
}

function getHeartsDisplay(pokeId) {
  const level = getFriendshipLevel(pokeId);
  const max = MAX_FRIENDSHIP_LEVEL;
  let hearts = '';
  for (let i = 0; i < max; i++) {
    hearts += i < level ? '♥' : '♡';
  }
  return hearts;
}

function getFriendshipProgress(pokeId) {
  const level = getFriendshipLevel(pokeId);
  const f = getFriendship(pokeId);
  if (level >= MAX_FRIENDSHIP_LEVEL) return 100;
  const current = f.exp - FRIENDSHIP_LEVELS[level];
  const needed = FRIENDSHIP_LEVELS[level + 1] - FRIENDSHIP_LEVELS[level];
  return Math.min((current / needed) * 100, 100);
}

// --- おやつ ---
function feedPartner() {
  if (gachaData.points < 3) return;
  if (!gachaData.partner) return;
  gachaData.points -= 3;
  addFriendshipExp(gachaData.partner, 5);
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  renderPartnerSection();
  showFeedAnimation();
}

const FEED_MESSAGES_BASE = [
  'おいしい！ありがとう！',
  'もぐもぐ…しあわせ〜！',
  'わーい！だいすき！',
  'おなか いっぱい！',
  'もっと ちょうだい〜！',
  'うまうま〜♪',
  'きみの おやつ さいこう！',
];
const FEED_MESSAGES_LV3 = [
  'きみが くれると とくべつ おいしい！',
  'いっしょに たべると たのしいね！',
  'ぼくのこと わかってるね〜♪',
  'きみの おかげで げんき もりもり！',
];
const FEED_MESSAGES_LV5 = [
  'しんゆうの おやつは せかいいち！',
  'きみと すごす じかんが いちばん すき！',
  'ぼくたちって さいこうの コンビだね！',
  'これからも ずっと いっしょだよ！',
];

function pickFeedMessage(level) {
  const arr = [...FEED_MESSAGES_BASE];
  if (level >= 3) arr.push(...FEED_MESSAGES_LV3);
  if (level >= 5) arr.push(...FEED_MESSAGES_LV5);
  return arr[Math.floor(Math.random() * arr.length)];
}

function showFeedAnimation() {
  const partner = getPartnerPoke();
  if (!partner) return;
  const friendLv = getFriendshipLevel(partner.id);
  const feedMsg = pickFeedMessage(friendLv);
  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="cheer-card-big feed-card" style="background:linear-gradient(135deg,#dcfce7,#fff);position:relative;overflow:hidden;">
      <div class="feed-particles" id="feedParticles"></div>
      <img src="${SPRITE_HD}${partner.id}.png" class="cheer-sprite-big" alt="${partner.name}"
        onerror="this.src='${SPRITE_URL}${partner.id}.png'">
      <div class="cheer-name-big">${partner.name}</div>
      <div class="cheer-bubble-big">「${feedMsg}」</div>
      <div class="cheer-pts-big">${getHeartsDisplay(partner.id)}</div>
      <div style="font-size:0.8rem;color:#6b7280;font-weight:700;margin-top:4px;">
        なかよし Lv.${getFriendshipLevel(partner.id)}
      </div>
      <button onclick="hideOverlay()" class="btn-close" style="background:#22c55e;">おっけー！</button>
    </div>
  `;
  overlay.style.display = 'flex';

  // ハート＋キラキラパーティクル
  const container = document.getElementById('feedParticles');
  const symbols = ['♥','♥','♥','✦','✧','♥'];
  const colors = ['#ec4899','#f43f5e','#fb923c','#fbbf24','#f9a8d4','#a78bfa'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'feed-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const x = -60 + Math.random() * 120;
    const y = -80 - Math.random() * 100;
    el.style.cssText = `
      --tx: ${x}px; --ty: ${y}px;
      --color: ${colors[Math.floor(Math.random() * colors.length)]};
      --delay: ${Math.random() * 0.4}s;
      --size: ${0.8 + Math.random() * 1.0}rem;
    `;
    container.appendChild(el);
  }

  playGachaSound('normal');
}

// --- レベルアップ演出 ---
function showLevelUpAnimation(pokeId, newLevel) {
  const name = findPokeName(pokeId);
  const hearts = getHeartsDisplay(pokeId);
  const progress = getFriendshipProgress(pokeId);
  const lvMsg = LEVELUP_MESSAGES[newLevel] || { msg: 'もっと なかよく なったよ！', sub: '' };

  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="cheer-card-big levelup-card" style="background:linear-gradient(135deg,#fef3c7,#fdf4ff);position:relative;overflow:hidden;">
      <div class="feed-particles" id="lvupParticles"></div>
      <img src="${SPRITE_HD}${pokeId}.png" class="cheer-sprite-big" alt="${name}"
        onerror="this.src='${SPRITE_URL}${pokeId}.png'"
        style="animation: levelUpBounce 0.8s ease;">
      <div style="font-weight:900;font-size:1.0rem;color:#f59e0b;margin-top:4px;">⬆ レベルアップ！</div>
      <div class="cheer-name-big" style="color:var(--orange);">${name} Lv.${newLevel}</div>
      <div class="cheer-bubble-big" style="background:#fefce8;border-color:#fde68a;">
        「${lvMsg.msg}」
      </div>
      ${lvMsg.sub ? `<div style="font-size:0.85rem;color:#92400e;font-weight:700;margin-top:4px;">${lvMsg.sub}</div>` : ''}
      <div style="margin-top:8px;font-size:1.1rem;color:var(--orange);letter-spacing:3px;">${hearts}</div>
      <div style="width:80%;height:8px;background:#f3f4f6;border-radius:4px;overflow:hidden;margin-top:4px;">
        <div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#fb923c,#f97316);border-radius:4px;transition:width 0.5s;"></div>
      </div>
      <button onclick="hideOverlay(); renderPartnerSection();" class="btn-close" style="background:#f59e0b;margin-top:12px;">やったー！</button>
    </div>
  `;
  overlay.style.display = 'flex';

  // キラキラ＋ハートパーティクル
  const container = document.getElementById('lvupParticles');
  const symbols = ['✦','♥','✧','⭐','♥','✦'];
  const colors = ['#f59e0b','#fbbf24','#ec4899','#f9a8d4','#a78bfa','#fcd34d'];
  for (let i = 0; i < 16; i++) {
    const el = document.createElement('div');
    el.className = 'feed-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const x = -80 + Math.random() * 160;
    const y = -100 - Math.random() * 80;
    el.style.cssText = `
      --tx: ${x}px; --ty: ${y}px;
      --color: ${colors[Math.floor(Math.random() * colors.length)]};
      --delay: ${Math.random() * 0.5}s;
      --size: ${0.9 + Math.random() * 1.2}rem;
    `;
    container.appendChild(el);
  }

  playLevelUpSound();
}

function playLevelUpSound() {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  // ピロリン♪ という上昇音
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f; o.type = 'sine';
    g.gain.setValueAtTime(0.12, t + i * 0.1);
    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.3);
    o.start(t + i * 0.1); o.stop(t + i * 0.1 + 0.35);
  });
  // キラキラ重ね
  setTimeout(() => {
    const t2 = ctx.currentTime;
    [1568, 1760, 2093].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'sine';
      g.gain.setValueAtTime(0.06, t2 + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.01, t2 + i * 0.08 + 0.2);
      o.start(t2 + i * 0.08); o.stop(t2 + i * 0.08 + 0.25);
    });
  }, 400);
}

// --- 進化 ---
function checkEvolution(pokeId, newLevel) {
  const chain = EVOLUTION_CHAINS[pokeId];
  if (!chain) return;
  if (newLevel < chain.level) return;

  let evolvedId = chain.to;
  if (chain.random) {
    const available = chain.random.filter(id => !gachaData.collection.includes(id));
    if (available.length > 0) {
      evolvedId = available[Math.floor(Math.random() * available.length)];
    } else {
      evolvedId = chain.random[Math.floor(Math.random() * chain.random.length)];
    }
  }

  if (!gachaData.collection.includes(evolvedId)) {
    gachaData.collection.push(evolvedId);
  }
  recordHistory(evolvedId, 'しんか');
  const oldF = getFriendship(pokeId);
  gachaData.friendship[evolvedId] = { exp: Math.floor(oldF.exp * 0.5) };
  if (gachaData.partner === pokeId) {
    gachaData.partner = evolvedId;
  }
  saveGachaData();

  setTimeout(() => showEvolutionAnimation(pokeId, evolvedId), 800);
}

function showEvolutionAnimation(fromId, toId) {
  const fromName = findPokeName(fromId);
  const toName = findPokeName(toId);
  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="evo-overlay">
      <div class="evo-title">しんかだ！！</div>
      <div class="evo-sprites">
        <img src="${SPRITE_HD}${fromId}.png" class="evo-sprite" alt="${fromName}"
          onerror="this.src='${SPRITE_URL}${fromId}.png'">
        <div class="evo-arrow">▶</div>
        <img src="${SPRITE_HD}${toId}.png" class="evo-sprite" alt="${toName}"
          onerror="this.src='${SPRITE_URL}${toId}.png'"
          style="animation: spriteAppear 0.6s cubic-bezier(0.22, 1, 0.36, 1);">
      </div>
      <div class="evo-new-name">${toName}</div>
      <button onclick="hideOverlay(); renderPartnerSection();" class="btn-close">すごい！</button>
    </div>
  `;
  overlay.style.display = 'flex';
  playGachaSound('rare');
}

// ====================================================
//  マイルストーン報酬システム
// ====================================================
function getMilestoneForDays(totalDays) {
  // 固定マイルストーンをチェック
  for (const m of MILESTONES) {
    if (totalDays >= m.days && !gachaData.milestones.includes(m.days)) {
      return m;
    }
  }
  // 100日以降の繰り返しマイルストーン
  if (totalDays > 100) {
    const lastFixed = 100;
    const beyond = totalDays - lastFixed;
    const repeatCount = Math.floor(beyond / MILESTONE_REPEAT_INTERVAL);
    for (let i = 1; i <= repeatCount; i++) {
      const day = lastFixed + i * MILESTONE_REPEAT_INTERVAL;
      if (!gachaData.milestones.includes(day)) {
        return { days: day, pool: MILESTONE_REPEAT_POOL, label: `${day}日がんばった！` };
      }
    }
  }
  return null;
}

function checkMilestone() {
  if (typeof calcTotalDays !== 'function') return;
  const totalDays = calcTotalDays();
  const milestone = getMilestoneForDays(totalDays);
  if (milestone) {
    setTimeout(() => awardMilestonePoke(milestone), 600);
  }
}

function awardMilestonePoke(milestone) {
  // プールからランダムに1匹選ぶ（未所持を優先）
  const poolPoke = POKEDEX.filter(p => milestone.pool.includes(p.r));
  const unowned = poolPoke.filter(p => !gachaData.collection.includes(p.id));
  const candidates = unowned.length > 0 ? unowned : poolPoke;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];

  // コレクションに追加
  if (!gachaData.collection.includes(pick.id)) {
    gachaData.collection.push(pick.id);
  }
  if (!gachaData.friendship[pick.id]) {
    gachaData.friendship[pick.id] = { exp: 0 };
  }
  recordHistory(pick.id, `${milestone.days}日マイルストーン`);

  // マイルストーン達成を記録
  gachaData.milestones.push(milestone.days);
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  renderPartnerSection();

  // 演出
  showMilestoneAnimation(pick, milestone);
}

function showMilestoneAnimation(poke, milestone) {
  const ri = RARITY_INFO[poke.r];
  const overlay = document.getElementById('gachaOverlay');

  overlay.innerHTML = `
    <div class="milestone-stage">
      <div class="milestone-particles" id="milestoneParticles"></div>
      <div class="milestone-card">
        <div class="milestone-badge">🎉</div>
        <div class="milestone-title">すごい！！</div>
        <div class="milestone-days">${milestone.label}</div>
        <img src="${SPRITE_HD}${poke.id}.png" class="milestone-sprite" alt="${poke.name}"
          onerror="this.src='${SPRITE_URL}${poke.id}.png'">
        <div class="milestone-poke-name">${poke.name}が<br>あそびにきた！</div>
        <span class="${ri.cls}">${ri.label}</span>
        <button onclick="hideOverlay(); renderPartnerSection();" class="btn-close milestone-btn">なかまにする！</button>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';

  // パーティクル
  const particles = document.getElementById('milestoneParticles');
  const colors = ['#fbbf24','#f59e0b','#22c55e','#3b82f6','#ec4899','#8b5cf6'];
  for (let i = 0; i < 40; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 150;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      --end-pos: translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px);
      --size: ${4 + Math.random() * 10}px;
      --color: ${colors[Math.floor(Math.random() * colors.length)]};
      --delay: ${Math.random() * 0.5}s;
    `;
    particles.appendChild(p);
  }

  playGachaSound(poke.r === 'SR' ? 'legendary' : 'rare');
}

// ====================================================
//  スターター選択（初回の3匹）
// ====================================================
const STARTERS = [
  { id: 1, name: 'フシギダネ', emoji: '🌱' },
  { id: 4, name: 'ヒトカゲ', emoji: '🔥' },
  { id: 7, name: 'ゼニガメ', emoji: '💧' },
];

function showStarterSelect() {
  const cards = STARTERS.map(s => `
    <div class="starter-option" onclick="selectStarter(${s.id})">
      <img src="${SPRITE_HD}${s.id}.png" class="starter-sprite" alt="${s.name}"
        onerror="this.src='${SPRITE_URL}${s.id}.png'">
      <div class="starter-emoji">${s.emoji}</div>
      <div class="starter-name">${s.name}</div>
    </div>
  `).join('');

  showOverlay(`
    <div class="starter-card">
      <div class="starter-title">さいしょの ともだちを<br>えらぼう！</div>
      <div class="starter-options">${cards}</div>
    </div>
  `);
}

function selectStarter(pokeId) {
  const poke = POKEDEX.find(p => p.id === pokeId);
  if (!poke) return;

  gachaData.collection.push(pokeId);
  gachaData.partner = pokeId;
  gachaData.partnerDate = localDateStr();
  gachaData.friendship[pokeId] = { exp: 0 };
  recordHistory(pokeId, 'さいしょのともだち');
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  renderPartnerSection();

  // 選択演出
  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="cheer-card-big">
      <img src="${SPRITE_HD}${poke.id}.png" class="cheer-sprite-big" alt="${poke.name}"
        onerror="this.src='${SPRITE_URL}${poke.id}.png'">
      <div class="cheer-name-big">${poke.name}</div>
      <div class="cheer-bubble-big">「よろしくね！いっしょにがんばろう！」</div>
      <button onclick="hideOverlay(); renderPartnerSection();" class="btn-close">やったー！</button>
    </div>
  `;
  playGachaSound('rare');
}

// --- サウンド ---
function playGachaSound(type) {
  const ctx = getAudioCtx();
  const t = ctx.currentTime;
  if (type === 'normal') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 523; o.type = 'sine'; g.gain.value = 0.3;
    o.start(t); g.gain.exponentialRampToValueAtTime(0.01, t + 0.3); o.stop(t + 0.35);
  } else if (type === 'rare') {
    [523, 659, 784, 1047].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'square'; g.gain.value = 0.15;
      o.start(t + i * 0.12); g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.3);
      o.stop(t + i * 0.12 + 0.35);
    });
  } else if (type === 'legendary') {
    [392, 494, 587, 784, 988, 784, 988, 1175].forEach((f, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = f; o.type = 'square'; g.gain.value = 0.12;
      o.start(t + i * 0.15); g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.15 + 0.4);
      o.stop(t + i * 0.15 + 0.45);
    });
    for (let i = 0; i < 6; i++) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value = 2000 + Math.random() * 2000; o.type = 'sine'; g.gain.value = 0.05;
      o.start(t + 0.3 + i * 0.1); g.gain.exponentialRampToValueAtTime(0.01, t + 0.3 + i * 0.1 + 0.2);
      o.stop(t + 0.5 + i * 0.1);
    }
  }
}

// ====================================================
//  応援演出（ガチャなし版）
// ====================================================
function showCheer(earnedPts) {
  if (gachaData.collection.length === 0) {
    showOverlay(`
      <div class="cheer-card-big" style="padding:2rem;">
        <div style="font-size:4rem;">🎉</div>
        <div class="cheer-name-big" style="color:var(--brown);">+${earnedPts}pt ゲット！</div>
        <button onclick="hideOverlay()" class="btn-close">OK</button>
      </div>
    `);
    return;
  }
  const cheerPoke = pickRandomFromCollection();
  const msg = CHEER_MESSAGES[Math.floor(Math.random() * CHEER_MESSAGES.length)];
  showOverlay(`
    <div class="cheer-card-big">
      <img src="${SPRITE_HD}${cheerPoke.id}.png" class="cheer-sprite-big" alt="${cheerPoke.name}"
        onerror="this.src='${SPRITE_URL}${cheerPoke.id}.png'">
      <div class="cheer-name-big">${cheerPoke.name}</div>
      <div class="cheer-bubble-big">「${msg}」</div>
      <div class="cheer-pts-big">+${earnedPts}pt ゲット！</div>
      <button onclick="hideOverlay()" class="btn-close">ありがとう！</button>
    </div>
  `);
  playGachaSound('normal');
}

function pickRandomFromCollection() {
  const id = gachaData.collection[Math.floor(Math.random() * gachaData.collection.length)];
  const p = POKEDEX.find(p => p.id === id);
  if (p) return p;
  if (EVOLUTION_POKEMON[id]) return { id, name: EVOLUTION_POKEMON[id].name, r: EVOLUTION_POKEMON[id].r };
  return POKEDEX[0];
}

// ====================================================
//  図鑑
// ====================================================
function showZukan() {
  const allIds = [...new Set([
    ...POKEDEX.map(p => p.id),
    ...Object.keys(EVOLUTION_POKEMON).map(Number)
  ])].sort((a, b) => a - b);

  const total = allIds.length;
  const got = allIds.filter(id => gachaData.collection.includes(id)).length;

  const cards = allIds.map(id => {
    const owned = gachaData.collection.includes(id);
    const name = findPokeName(id);
    if (owned) {
      return `<div class="zukan-cell owned" onclick="showPokeDetail(${id})">
        <img src="${SPRITE_URL}${id}.png" class="zukan-sprite" alt="${name}">
        <div class="zukan-name">${name}</div>
      </div>`;
    } else {
      return `<div class="zukan-cell unknown">
        <div class="zukan-unknown">？</div>
        <div class="zukan-name">？？？</div>
      </div>`;
    }
  }).join('');

  showOverlay(`
    <div class="zukan-panel">
      <div class="zukan-header">
        <div class="zukan-title">ずかん ${got}／${total}</div>
        <button onclick="hideOverlay()" class="btn-close-sm">とじる</button>
      </div>
      <div class="zukan-grid">${cards}</div>
    </div>
  `);
}

// ====================================================
//  でっかいカード（図鑑詳細）
// ====================================================
function getPokeRarity(id) {
  const p = POKEDEX.find(p => p.id === id);
  if (p) return p.r;
  if (EVOLUTION_POKEMON[id]) return EVOLUTION_POKEMON[id].r;
  return 'C';
}

function getEvolutionChain(id) {
  let root = id;
  let safety = 10;
  while (safety-- > 0) {
    let found = false;
    for (const [fromId, chain] of Object.entries(EVOLUTION_CHAINS)) {
      const fid = Number(fromId);
      if (chain.to === root || (chain.random && chain.random.includes(root))) {
        root = fid;
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  const result = [root];
  let current = root;
  safety = 10;
  while (safety-- > 0) {
    const chain = EVOLUTION_CHAINS[current];
    if (!chain) break;
    if (chain.random) {
      const next = chain.random.find(rid => rid === id) ||
                   chain.random.find(rid => gachaData.collection.includes(rid)) ||
                   chain.to;
      result.push(next);
      current = next;
    } else {
      result.push(chain.to);
      current = chain.to;
    }
  }
  return result.length > 1 ? result : null;
}

function showPokeDetail(id) {
  const name = findPokeName(id);
  const rarity = getPokeRarity(id);
  const ri = RARITY_INFO[rarity] || RARITY_INFO.C;
  const level = getFriendshipLevel(id);
  const progress = getFriendshipProgress(id);
  const hearts = getHeartsDisplay(id);

  // 入手履歴
  const hist = gachaData.history && gachaData.history[id];
  const histDate = hist ? hist.date : '???';
  const histMethod = hist ? hist.method : '???';
  const methodText = histMethod === 'しんか' ? 'しんかでなかまになった'
                   : histMethod === 'さいしょのともだち' ? 'さいしょのともだちになった'
                   : histMethod === 'ともだちさがし' ? 'ともだちさがしで出会った'
                   : histMethod.includes('マイルストーン') ? `${histMethod}でやってきた`
                   : histMethod === '???' ? '???'
                   : `「${histMethod}」のあとに出会った`;
  const histHtml = `<div class="poke-detail-info">📅 ${histDate}　${methodText}</div>`;

  // 進化チェーン
  const chain = getEvolutionChain(id);
  let evoHtml = '';
  if (chain) {
    const evoItems = chain.map(eid => {
      const eName = findPokeName(eid);
      const owned = gachaData.collection.includes(eid);
      const isCurrent = eid === id;
      return `<div class="poke-detail-evo-item ${isCurrent ? 'evo-current' : ''} ${owned ? '' : 'evo-unknown'}">
        ${owned
          ? `<img src="${SPRITE_URL}${eid}.png" class="poke-detail-evo-sprite" alt="${eName}">`
          : '<div class="poke-detail-evo-unknown">？</div>'}
        <div class="poke-detail-evo-name">${owned ? eName : '???'}</div>
      </div>`;
    }).join('<div class="poke-detail-evo-arrow">▶</div>');
    evoHtml = `<div class="poke-detail-evo">${evoItems}</div>`;
  }

  const canFeed = gachaData.points >= 3;
  const isPartner = gachaData.partner === id;

  showOverlay(`
    <div class="poke-detail-card">
      <img src="${SPRITE_HD}${id}.png" class="poke-detail-sprite" alt="${name}"
        onerror="this.src='${SPRITE_URL}${id}.png'">
      <div class="poke-detail-number">No.${String(id).padStart(3, '0')}</div>
      <div class="poke-detail-name">${name}</div>
      <span class="${ri.cls}">${ri.label}</span>
      ${isPartner ? '<div class="poke-detail-partner-badge">⭐ パートナー</div>' : ''}
      <div class="poke-detail-hearts">${hearts} Lv.${level}</div>
      <div class="poke-detail-bar-wrap">
        <div class="poke-detail-bar-track">
          <div class="poke-detail-bar-fill" style="width:${progress}%"></div>
        </div>
      </div>
      ${histHtml}
      ${evoHtml}
      <div class="poke-detail-actions">
        <button onclick="hideOverlay();feedPokeFromDetail(${id});" class="reward-btn reward-btn-feed" ${canFeed ? '' : 'disabled'}>🍬 おやつ (3pt)</button>
        ${isPartner ? '' : `<button onclick="setPartner(${id});" class="reward-btn reward-btn-partner">⭐ パートナーにする</button>`}
        <button onclick="hideOverlay();showZukan();" class="btn-close" style="background:var(--g300);color:var(--g500);">もどる</button>
      </div>
    </div>
  `);
}

function feedPokeFromDetail(pokeId) {
  if (gachaData.points < 3) return;
  gachaData.points -= 3;
  addFriendshipExp(pokeId, 5);
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  renderPartnerSection();
  showFeedAnimationFor(pokeId);
}

function showFeedAnimationFor(pokeId) {
  const name = findPokeName(pokeId);
  const friendLv = getFriendshipLevel(pokeId);
  const feedMsg = pickFeedMessage(friendLv);
  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="cheer-card-big feed-card" style="background:linear-gradient(135deg,#dcfce7,#fff);position:relative;overflow:hidden;">
      <div class="feed-particles" id="feedParticles"></div>
      <img src="${SPRITE_HD}${pokeId}.png" class="cheer-sprite-big" alt="${name}"
        onerror="this.src='${SPRITE_URL}${pokeId}.png'">
      <div class="cheer-name-big">${name}</div>
      <div class="cheer-bubble-big">「${feedMsg}」</div>
      <div class="cheer-pts-big">${getHeartsDisplay(pokeId)}</div>
      <div style="font-size:0.8rem;color:#6b7280;font-weight:700;margin-top:4px;">
        なかよし Lv.${getFriendshipLevel(pokeId)}
      </div>
      <button onclick="hideOverlay();showPokeDetail(${pokeId});" class="btn-close" style="background:#22c55e;">おっけー！</button>
    </div>
  `;
  overlay.style.display = 'flex';

  const container = document.getElementById('feedParticles');
  const symbols = ['♥','♥','♥','✦','✧','♥'];
  const colors = ['#ec4899','#f43f5e','#fb923c','#fbbf24','#f9a8d4','#a78bfa'];
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'feed-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const x = -60 + Math.random() * 120;
    const y = -80 - Math.random() * 100;
    el.style.cssText = `
      --tx: ${x}px; --ty: ${y}px;
      --color: ${colors[Math.floor(Math.random() * colors.length)]};
      --delay: ${Math.random() * 0.4}s;
      --size: ${0.8 + Math.random() * 1.0}rem;
    `;
    container.appendChild(el);
  }
  playGachaSound('normal');
}

function setPartner(pokeId) {
  gachaData.partner = pokeId;
  saveGachaData();
  renderPartnerSection();
  // 詳細カードを再表示（パートナーバッジ更新）
  showPokeDetail(pokeId);
}

// ====================================================
//  パートナー & UI
// ====================================================

// 時間帯別メッセージ
function getPartnerMessage() {
  const h = new Date().getHours();
  const msgs = h < 7  ? ['おはよ〜！きょうもいい日にしよ！','ふぁ〜あ…おはよう！']
             : h < 12 ? ['いっしょにがんばろう！','きょうもよろしくね！']
             : h < 15 ? ['おひるだよ〜！','ごはんたべた？']
             : h < 18 ? ['じゅんびバッチリ？','おうえんしてるよ！']
             : h < 21 ? ['おつかれさま！','きょうもがんばったね！']
             :          ['もうねるじかんだよ〜','おやすみ！あしたもがんばろ！'];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

function getPartnerPoke() {
  if (!gachaData.partner) return null;
  const p = POKEDEX.find(p => p.id === gachaData.partner);
  if (p) return p;
  if (EVOLUTION_POKEMON[gachaData.partner]) {
    return { id: gachaData.partner, name: EVOLUTION_POKEMON[gachaData.partner].name, r: 'UC' };
  }
  return null;
}

// パートナー表示（v4: 右カラム大きいパートナーに委譲）
function renderPartnerSection() {
  if (typeof updatePartnerDisplay === 'function') {
    updatePartnerDisplay('calm');
  }
}

// パートナータップ → インタラクション画面
function onPartnerTap() {
  // パートナーがいない → スターター選択
  if (!gachaData.partner || gachaData.collection.length === 0) {
    showStarterSelect();
    return;
  }

  const partner = getPartnerPoke();
  const canFeed = gachaData.points >= 3 && partner;

  const partnerHtml = partner
    ? `<img src="${SPRITE_HD}${partner.id}.png" style="width:120px;height:120px;object-fit:contain;" alt="${partner.name}"
        onerror="this.src='${SPRITE_URL}${partner.id}.png'">
       <div style="font-weight:900;font-size:1.1rem;color:var(--brown);">${partner.name}</div>
       <div style="font-weight:700;color:var(--orange);">${getHeartsDisplay(partner.id)} Lv.${getFriendshipLevel(partner.id)}</div>`
    : '';

  showOverlay(`
    <div class="interact-card">
      ${partnerHtml}
      <div style="font-size:0.85rem;color:var(--g400);font-weight:700;margin:8px 0;">💰 ${gachaData.points}pt</div>
      <div class="reward-actions">
        <button onclick="hideOverlay();feedPartner();" class="reward-btn reward-btn-feed" ${canFeed?'':'disabled'}>🍬 おやつ (3pt)</button>
        <button onclick="hideOverlay();showZukan();" class="reward-btn" style="background:#6366f1;color:#fff;">📖 ずかん</button>
        <button onclick="hideOverlay();" class="reward-btn reward-btn-close">もどる</button>
      </div>
    </div>
  `);
}

// ====================================================
//  ただいま時のポケモン遭遇
// ====================================================
const ENCOUNTER_RATE = 0.30; // 30%
const ENCOUNTER_RARITY = { C: 0.80, R: 0.98, SR: 1.0 }; // 累積: C80%, R18%, SR2%

function tryEncounter(ev) {
  if (Math.random() > ENCOUNTER_RATE) return false;
  if (gachaData.collection.length === 0) return false; // スターター未選択

  // レア度抽選
  const roll = Math.random();
  const rarity = roll < ENCOUNTER_RARITY.C ? 'C' : roll < ENCOUNTER_RARITY.R ? 'R' : 'SR';

  // 該当レア度のプールから選出（未所持優先）
  const pool = POKEDEX.filter(p => p.r === rarity);
  const unowned = pool.filter(p => !gachaData.collection.includes(p.id));
  const candidates = unowned.length > 0 ? unowned : pool;
  const poke = candidates[Math.floor(Math.random() * candidates.length)];

  const isNew = !gachaData.collection.includes(poke.id);
  if (isNew) gachaData.collection.push(poke.id);
  if (!gachaData.friendship[poke.id]) gachaData.friendship[poke.id] = { exp: 0 };
  recordHistory(poke.id, ev.name);
  saveGachaData();

  showEncounterAnimation(poke, isNew, ev.name);
  return true;
}

function showEncounterAnimation(poke, isNew, taskName) {
  const ri = RARITY_INFO[poke.r];
  const bgClass = poke.r === 'SR' ? 'gacha-bg-sr' : poke.r === 'R' ? 'gacha-bg-rare' : 'gacha-bg-normal';
  const glowClass = poke.r === 'SR' ? 'glow-rainbow' : poke.r === 'R' ? 'glow-blue' : '';

  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="gacha-stage ${bgClass}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;position:relative;">
      <div class="gacha-ball-area">
        <div class="gacha-ball gacha-ball-drop" id="encBall">
          <div class="ball-top"></div>
          <div class="ball-line"><div class="ball-button"></div></div>
          <div class="ball-bottom"></div>
        </div>
      </div>
      <div class="gacha-particles" id="encParticles"></div>
      <div class="gacha-reveal" id="encReveal" style="display:none;">
        ${glowClass ? `<div class="reveal-glow ${glowClass}"></div>` : ''}
        <img src="${SPRITE_HD}${poke.id}.png" class="reveal-sprite" alt="${poke.name}"
          onerror="this.src='${SPRITE_URL}${poke.id}.png'">
        <div class="reveal-name">${poke.name}</div>
        <span class="${ri.cls}">${ri.label}</span>
        ${isNew
          ? '<div class="reveal-new">★ NEW ★</div>'
          : '<div class="reveal-dupe">もう なかまだよ！</div>'}
        <div class="reveal-task">「${taskName}」のあとに 出会った！</div>
        <button onclick="finishEncounter()" class="btn-close" style="margin-top:12px;">やったー！</button>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';

  // ボール演出シーケンス
  const ball = document.getElementById('encBall');
  const shakeCount = 1 + Math.floor(Math.random() * 2); // 1〜2回揺れ

  let step = 0;
  function nextStep() {
    step++;
    if (step <= shakeCount) {
      ball.className = 'gacha-ball gacha-ball-shake';
      playBallShakeSound();
      setTimeout(() => {
        ball.className = 'gacha-ball';
        setTimeout(nextStep, 300);
      }, 400);
    } else {
      // オープン！
      ball.className = 'gacha-ball gacha-ball-open';
      playBallOpenSound(poke.r);
      setTimeout(() => {
        ball.style.display = 'none';
        document.getElementById('encReveal').style.display = 'flex';
        // パーティクル
        const particles = document.getElementById('encParticles');
        const colors = poke.r === 'SR' ? ['#fbbf24','#ec4899','#8b5cf6','#3b82f6','#22c55e']
                      : poke.r === 'R' ? ['#3b82f6','#60a5fa','#93c5fd','#fff']
                      : ['#22c55e','#4ade80','#86efac','#fff'];
        for (let i = 0; i < 24; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * 120;
          const p = document.createElement('div');
          p.className = 'particle';
          p.style.cssText = `
            --end-pos: translate(${(Math.cos(angle)*dist).toFixed(1)}px, ${(Math.sin(angle)*dist).toFixed(1)}px);
            --size: ${4 + Math.random() * 8}px;
            --color: ${colors[Math.floor(Math.random() * colors.length)]};
            --delay: ${Math.random() * 0.3}s;
          `;
          particles.appendChild(p);
        }
      }, 500);
    }
  }

  // 落下後に揺れ開始
  setTimeout(nextStep, 700);
}

function playBallShakeSound() {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(ctx.destination);
  o.frequency.value = 440; o.type = 'sine';
  g.gain.setValueAtTime(0.15, t);
  g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
  o.start(t); o.stop(t + 0.25);
}

function playBallOpenSound(rarity) {
  const ctx = getAudioCtx(); const t = ctx.currentTime;
  const notes = rarity === 'SR' ? [392, 494, 587, 784, 988, 1175]
              : rarity === 'R' ? [523, 659, 784, 1047]
              : [523, 659, 784];
  notes.forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = f; o.type = rarity === 'SR' ? 'square' : 'sine';
    g.gain.setValueAtTime(0.15, t + i * 0.12);
    g.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.35);
    o.start(t + i * 0.12); o.stop(t + i * 0.12 + 0.4);
  });
}

function finishEncounter() {
  hideOverlay();
  renderPartnerSection();
  if (typeof updateStats === 'function') updateStats();
  // おかえり演出 + マイルストーンチェック
  playWelcomeSound();
  if (typeof checkMilestone === 'function') checkMilestone();
}

// ====================================================
//  オーバーレイ共通
// ====================================================
function showOverlay(html) {
  const el = document.getElementById('gachaOverlay');
  el.innerHTML = html;
  el.style.display = 'flex';
}
function hideOverlay() {
  document.getElementById('gachaOverlay').style.display = 'none';
}
