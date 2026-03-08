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

// --- ポケモンデータ (全9世代・1025種) ---
const POKEDEX = [
  // --- カントー地方 (第1世代) ---
  {id:1,name:'フシギダネ',r:'C'},{id:4,name:'ヒトカゲ',r:'C'},{id:7,name:'ゼニガメ',r:'C'},{id:10,name:'キャタピー',r:'C'},{id:13,name:'ビードル',r:'C'},{id:16,name:'ポッポ',r:'C'},
  {id:19,name:'コラッタ',r:'C'},{id:21,name:'オニスズメ',r:'C'},{id:23,name:'アーボ',r:'C'},{id:27,name:'サンド',r:'C'},{id:29,name:'ニドラン♀',r:'C'},{id:32,name:'ニドラン♂',r:'C'},
  {id:37,name:'ロコン',r:'C'},{id:41,name:'ズバット',r:'C'},{id:43,name:'ナゾノクサ',r:'C'},{id:46,name:'パラス',r:'C'},{id:48,name:'コンパン',r:'C'},{id:50,name:'ディグダ',r:'C'},
  {id:52,name:'ニャース',r:'C'},{id:54,name:'コダック',r:'C'},{id:56,name:'マンキー',r:'C'},{id:58,name:'ガーディ',r:'C'},{id:60,name:'ニョロモ',r:'C'},{id:63,name:'ケーシィ',r:'C'},
  {id:66,name:'ワンリキー',r:'C'},{id:69,name:'マダツボミ',r:'C'},{id:72,name:'メノクラゲ',r:'C'},{id:74,name:'イシツブテ',r:'C'},{id:77,name:'ポニータ',r:'C'},{id:79,name:'ヤドン',r:'C'},
  {id:81,name:'コイル',r:'C'},{id:83,name:'カモネギ',r:'C'},{id:84,name:'ドードー',r:'C'},{id:86,name:'パウワウ',r:'C'},{id:88,name:'ベトベター',r:'C'},{id:90,name:'シェルダー',r:'C'},
  {id:92,name:'ゴース',r:'C'},{id:95,name:'イワーク',r:'C'},{id:96,name:'スリープ',r:'C'},{id:98,name:'クラブ',r:'C'},{id:100,name:'ビリリダマ',r:'C'},{id:102,name:'タマタマ',r:'C'},
  {id:104,name:'カラカラ',r:'C'},{id:109,name:'ドガース',r:'C'},{id:111,name:'サイホーン',r:'C'},{id:114,name:'モンジャラ',r:'C'},{id:116,name:'タッツー',r:'C'},{id:118,name:'トサキント',r:'C'},
  {id:120,name:'ヒトデマン',r:'C'},{id:129,name:'コイキング',r:'C'},{id:132,name:'メタモン',r:'C'},{id:133,name:'イーブイ',r:'C'},{id:137,name:'ポリゴン',r:'C'},{id:138,name:'オムナイト',r:'C'},
  {id:140,name:'カブト',r:'C'},{id:142,name:'プテラ',r:'C'},{id:147,name:'ミニリュウ',r:'C'},
  {id:108,name:'ベロリンガ',r:'R'},{id:115,name:'ガルーラ',r:'R'},{id:123,name:'ストライク',r:'R'},{id:127,name:'カイロス',r:'R'},{id:128,name:'ケンタロス',r:'R'},{id:131,name:'ラプラス',r:'R'},
  {id:144,name:'フリーザー',r:'SR'},{id:145,name:'サンダー',r:'SR'},{id:146,name:'ファイヤー',r:'SR'},{id:150,name:'ミュウツー',r:'SR'},{id:151,name:'ミュウ',r:'SR'},

  // --- ジョウト地方 (第2世代) ---
  {id:152,name:'チコリータ',r:'C'},{id:155,name:'ヒノアラシ',r:'C'},{id:158,name:'ワニノコ',r:'C'},{id:161,name:'オタチ',r:'C'},{id:163,name:'ホーホー',r:'C'},{id:165,name:'レディバ',r:'C'},
  {id:167,name:'イトマル',r:'C'},{id:170,name:'チョンチー',r:'C'},{id:172,name:'ピチュー',r:'C'},{id:173,name:'ピィ',r:'C'},{id:174,name:'ププリン',r:'C'},{id:175,name:'トゲピー',r:'C'},
  {id:177,name:'ネイティ',r:'C'},{id:179,name:'メリープ',r:'C'},{id:187,name:'ハネッコ',r:'C'},{id:190,name:'エイパム',r:'C'},{id:191,name:'ヒマナッツ',r:'C'},{id:193,name:'ヤンヤンマ',r:'C'},
  {id:194,name:'ウパー',r:'C'},{id:198,name:'ヤミカラス',r:'C'},{id:200,name:'ムウマ',r:'C'},{id:201,name:'アンノーン',r:'C'},{id:204,name:'クヌギダマ',r:'C'},{id:207,name:'グライガー',r:'C'},
  {id:209,name:'ブルー',r:'C'},{id:215,name:'ニューラ',r:'C'},{id:216,name:'ヒメグマ',r:'C'},{id:218,name:'マグマッグ',r:'C'},{id:220,name:'ウリムー',r:'C'},{id:223,name:'テッポウオ',r:'C'},
  {id:228,name:'デルビル',r:'C'},{id:231,name:'ゴマゾウ',r:'C'},{id:236,name:'バルキー',r:'C'},{id:238,name:'ムチュール',r:'C'},{id:239,name:'エレキッド',r:'C'},{id:240,name:'ブビィ',r:'C'},
  {id:246,name:'ヨーギラス',r:'C'},
  {id:203,name:'キリンリキ',r:'R'},{id:206,name:'ノコッチ',r:'R'},{id:211,name:'ハリーセン',r:'R'},{id:213,name:'ツボツボ',r:'R'},{id:214,name:'ヘラクロス',r:'R'},{id:222,name:'サニーゴ',r:'R'},
  {id:225,name:'デリバード',r:'R'},{id:227,name:'エアームド',r:'R'},{id:234,name:'オドシシ',r:'R'},{id:235,name:'ドーブル',r:'R'},{id:241,name:'ミルタンク',r:'R'},
  {id:243,name:'ライコウ',r:'SR'},{id:244,name:'エンテイ',r:'SR'},{id:245,name:'スイクン',r:'SR'},{id:249,name:'ルギア',r:'SR'},{id:250,name:'ホウオウ',r:'SR'},{id:251,name:'セレビィ',r:'SR'},

  // --- ホウエン地方 (第3世代) ---
  {id:252,name:'キモリ',r:'C'},{id:255,name:'アチャモ',r:'C'},{id:258,name:'ミズゴロウ',r:'C'},{id:261,name:'ポチエナ',r:'C'},{id:263,name:'ジグザグマ',r:'C'},{id:265,name:'ケムッソ',r:'C'},
  {id:270,name:'ハスボー',r:'C'},{id:273,name:'タネボー',r:'C'},{id:276,name:'スバメ',r:'C'},{id:278,name:'キャモメ',r:'C'},{id:280,name:'ラルトス',r:'C'},{id:283,name:'アメタマ',r:'C'},
  {id:285,name:'キノココ',r:'C'},{id:287,name:'ナマケロ',r:'C'},{id:290,name:'ツチニン',r:'C'},{id:293,name:'ゴニョニョ',r:'C'},{id:296,name:'マクノシタ',r:'C'},{id:298,name:'ルリリ',r:'C'},
  {id:299,name:'ノズパス',r:'C'},{id:300,name:'エネコ',r:'C'},{id:304,name:'ココドラ',r:'C'},{id:307,name:'アサナン',r:'C'},{id:309,name:'ラクライ',r:'C'},{id:316,name:'ゴクリン',r:'C'},
  {id:318,name:'キバニア',r:'C'},{id:320,name:'ホエルコ',r:'C'},{id:322,name:'ドンメル',r:'C'},{id:325,name:'バネブー',r:'C'},{id:328,name:'ナックラー',r:'C'},{id:331,name:'サボネア',r:'C'},
  {id:333,name:'チルット',r:'C'},{id:339,name:'ドジョッチ',r:'C'},{id:341,name:'ヘイガニ',r:'C'},{id:343,name:'ヤジロン',r:'C'},{id:345,name:'リリーラ',r:'C'},{id:347,name:'アノプス',r:'C'},
  {id:349,name:'ヒンバス',r:'C'},{id:353,name:'カゲボウズ',r:'C'},{id:355,name:'ヨマワル',r:'C'},{id:360,name:'ソーナノ',r:'C'},{id:361,name:'ユキワラシ',r:'C'},{id:363,name:'タマザラシ',r:'C'},
  {id:366,name:'パールル',r:'C'},{id:371,name:'タツベイ',r:'C'},{id:374,name:'ダンバル',r:'C'},
  {id:302,name:'ヤミラミ',r:'R'},{id:303,name:'クチート',r:'R'},{id:311,name:'プラスル',r:'R'},{id:312,name:'マイナン',r:'R'},{id:313,name:'バルビート',r:'R'},{id:314,name:'イルミーゼ',r:'R'},
  {id:324,name:'コータス',r:'R'},{id:327,name:'パッチール',r:'R'},{id:335,name:'ザングース',r:'R'},{id:336,name:'ハブネーク',r:'R'},{id:337,name:'ルナトーン',r:'R'},{id:338,name:'ソルロック',r:'R'},
  {id:351,name:'ポワルン',r:'R'},{id:352,name:'カクレオン',r:'R'},{id:357,name:'トロピウス',r:'R'},{id:359,name:'アブソル',r:'R'},{id:369,name:'ジーランス',r:'R'},{id:370,name:'ラブカス',r:'R'},
  {id:377,name:'レジロック',r:'SR'},{id:378,name:'レジアイス',r:'SR'},{id:379,name:'レジスチル',r:'SR'},{id:380,name:'ラティアス',r:'SR'},{id:381,name:'ラティオス',r:'SR'},{id:382,name:'カイオーガ',r:'SR'},
  {id:383,name:'グラードン',r:'SR'},{id:384,name:'レックウザ',r:'SR'},{id:385,name:'ジラーチ',r:'SR'},{id:386,name:'デオキシス',r:'SR'},

  // --- シンオウ地方 (第4世代) ---
  {id:387,name:'ナエトル',r:'C'},{id:390,name:'ヒコザル',r:'C'},{id:393,name:'ポッチャマ',r:'C'},{id:396,name:'ムックル',r:'C'},{id:399,name:'ビッパ',r:'C'},{id:401,name:'コロボーシ',r:'C'},
  {id:403,name:'コリンク',r:'C'},{id:406,name:'スボミー',r:'C'},{id:408,name:'ズガイドス',r:'C'},{id:410,name:'タテトプス',r:'C'},{id:412,name:'ミノムッチ',r:'C'},{id:415,name:'ミツハニー',r:'C'},
  {id:418,name:'ブイゼル',r:'C'},{id:420,name:'チェリンボ',r:'C'},{id:422,name:'カラナクシ',r:'C'},{id:425,name:'フワンテ',r:'C'},{id:427,name:'ミミロル',r:'C'},{id:431,name:'ニャルマー',r:'C'},
  {id:433,name:'リーシャン',r:'C'},{id:434,name:'スカンプー',r:'C'},{id:436,name:'ドーミラー',r:'C'},{id:438,name:'ウソハチ',r:'C'},{id:439,name:'マネネ',r:'C'},{id:440,name:'ピンプク',r:'C'},
  {id:443,name:'フカマル',r:'C'},{id:446,name:'ゴンベ',r:'C'},{id:447,name:'リオル',r:'C'},{id:449,name:'ヒポポタス',r:'C'},{id:451,name:'スコルピ',r:'C'},{id:453,name:'グレッグル',r:'C'},
  {id:456,name:'ケイコウオ',r:'C'},{id:458,name:'タマンタ',r:'C'},{id:459,name:'ユキカブリ',r:'C'},
  {id:417,name:'パチリス',r:'R'},{id:441,name:'ペラップ',r:'R'},{id:442,name:'ミカルゲ',r:'R'},{id:455,name:'マスキッパ',r:'R'},{id:479,name:'ロトム',r:'R'},
  {id:480,name:'ユクシー',r:'SR'},{id:481,name:'エムリット',r:'SR'},{id:482,name:'アグノム',r:'SR'},{id:483,name:'ディアルガ',r:'SR'},{id:484,name:'パルキア',r:'SR'},{id:485,name:'ヒードラン',r:'SR'},
  {id:486,name:'レジギガス',r:'SR'},{id:487,name:'ギラティナ',r:'SR'},{id:488,name:'クレセリア',r:'SR'},{id:489,name:'フィオネ',r:'SR'},{id:490,name:'マナフィ',r:'SR'},{id:491,name:'ダークライ',r:'SR'},
  {id:492,name:'シェイミ',r:'SR'},{id:493,name:'アルセウス',r:'SR'},

  // --- イッシュ地方 (第5世代) ---
  {id:495,name:'ツタージャ',r:'C'},{id:498,name:'ポカブ',r:'C'},{id:501,name:'ミジュマル',r:'C'},{id:504,name:'ミネズミ',r:'C'},{id:506,name:'ヨーテリー',r:'C'},{id:509,name:'チョロネコ',r:'C'},
  {id:511,name:'ヤナップ',r:'C'},{id:513,name:'バオップ',r:'C'},{id:515,name:'ヒヤップ',r:'C'},{id:517,name:'ムンナ',r:'C'},{id:519,name:'マメパト',r:'C'},{id:522,name:'シママ',r:'C'},
  {id:524,name:'ダンゴロ',r:'C'},{id:527,name:'コロモリ',r:'C'},{id:529,name:'モグリュー',r:'C'},{id:531,name:'タブンネ',r:'C'},{id:532,name:'ドッコラー',r:'C'},{id:535,name:'オタマロ',r:'C'},
  {id:540,name:'クルミル',r:'C'},{id:543,name:'フシデ',r:'C'},{id:546,name:'モンメン',r:'C'},{id:548,name:'チュリネ',r:'C'},{id:551,name:'メグロコ',r:'C'},{id:554,name:'ダルマッカ',r:'C'},
  {id:557,name:'イシズマイ',r:'C'},{id:559,name:'ズルッグ',r:'C'},{id:562,name:'デスマス',r:'C'},{id:564,name:'プロトーガ',r:'C'},{id:566,name:'アーケン',r:'C'},{id:568,name:'ヤブクロン',r:'C'},
  {id:570,name:'ゾロア',r:'C'},{id:572,name:'チラーミィ',r:'C'},{id:574,name:'ゴチム',r:'C'},{id:577,name:'ユニラン',r:'C'},{id:580,name:'コアルヒー',r:'C'},{id:582,name:'バニプッチ',r:'C'},
  {id:585,name:'シキジカ',r:'C'},{id:588,name:'カブルモ',r:'C'},{id:590,name:'タマゲタケ',r:'C'},{id:592,name:'プルリル',r:'C'},{id:595,name:'バチュル',r:'C'},{id:597,name:'テッシード',r:'C'},
  {id:599,name:'ギアル',r:'C'},{id:602,name:'シビシラス',r:'C'},{id:605,name:'リグレー',r:'C'},{id:607,name:'ヒトモシ',r:'C'},{id:610,name:'キバゴ',r:'C'},{id:613,name:'クマシュン',r:'C'},
  {id:616,name:'チョボマキ',r:'C'},{id:619,name:'コジョフー',r:'C'},{id:622,name:'ゴビット',r:'C'},{id:624,name:'コマタナ',r:'C'},{id:627,name:'ワシボン',r:'C'},{id:629,name:'バルチャイ',r:'C'},
  {id:633,name:'モノズ',r:'C'},{id:636,name:'メラルバ',r:'C'},
  {id:538,name:'ナゲキ',r:'R'},{id:539,name:'ダゲキ',r:'R'},{id:550,name:'バスラオ',r:'R'},{id:556,name:'マラカッチ',r:'R'},{id:561,name:'シンボラー',r:'R'},{id:587,name:'エモンガ',r:'R'},
  {id:594,name:'ママンボウ',r:'R'},{id:615,name:'フリージオ',r:'R'},{id:618,name:'マッギョ',r:'R'},{id:621,name:'クリムガン',r:'R'},{id:626,name:'バッフロン',r:'R'},{id:631,name:'クイタラン',r:'R'},
  {id:632,name:'アイアント',r:'R'},
  {id:494,name:'ビクティニ',r:'SR'},{id:638,name:'コバルオン',r:'SR'},{id:639,name:'テラキオン',r:'SR'},{id:640,name:'ビリジオン',r:'SR'},{id:641,name:'トルネロス',r:'SR'},{id:642,name:'ボルトロス',r:'SR'},
  {id:643,name:'レシラム',r:'SR'},{id:644,name:'ゼクロム',r:'SR'},{id:645,name:'ランドロス',r:'SR'},{id:646,name:'キュレム',r:'SR'},{id:647,name:'ケルディオ',r:'SR'},{id:648,name:'メロエッタ',r:'SR'},
  {id:649,name:'ゲノセクト',r:'SR'},

  // --- カロス地方 (第6世代) ---
  {id:650,name:'ハリマロン',r:'C'},{id:653,name:'フォッコ',r:'C'},{id:656,name:'ケロマツ',r:'C'},{id:659,name:'ホルビー',r:'C'},{id:661,name:'ヤヤコマ',r:'C'},{id:664,name:'コフキムシ',r:'C'},
  {id:667,name:'シシコ',r:'C'},{id:669,name:'フラベベ',r:'C'},{id:672,name:'メェークル',r:'C'},{id:674,name:'ヤンチャム',r:'C'},{id:677,name:'ニャスパー',r:'C'},{id:679,name:'ヒトツキ',r:'C'},
  {id:682,name:'シュシュプ',r:'C'},{id:684,name:'ペロッパフ',r:'C'},{id:686,name:'マーイーカ',r:'C'},{id:688,name:'カメテテ',r:'C'},{id:690,name:'クズモー',r:'C'},{id:692,name:'ウデッポウ',r:'C'},
  {id:694,name:'エリキテル',r:'C'},{id:696,name:'チゴラス',r:'C'},{id:698,name:'アマルス',r:'C'},{id:702,name:'デデンネ',r:'C'},{id:703,name:'メレシー',r:'C'},{id:704,name:'ヌメラ',r:'C'},
  {id:708,name:'ボクレー',r:'C'},
  {id:676,name:'トリミアン',r:'R'},{id:701,name:'ルチャブル',r:'R'},{id:707,name:'クレッフィ',r:'R'},{id:710,name:'バケッチャ',r:'R'},{id:712,name:'カチコール',r:'R'},{id:714,name:'オンバット',r:'R'},
  {id:716,name:'ゼルネアス',r:'SR'},{id:717,name:'イベルタル',r:'SR'},{id:718,name:'ジガルデ',r:'SR'},{id:719,name:'ディアンシー',r:'SR'},{id:720,name:'フーパ',r:'SR'},{id:721,name:'ボルケニオン',r:'SR'},

  // --- アローラ地方 (第7世代) ---
  {id:722,name:'モクロー',r:'C'},{id:725,name:'ニャビー',r:'C'},{id:728,name:'アシマリ',r:'C'},{id:731,name:'ツツケラ',r:'C'},{id:734,name:'ヤングース',r:'C'},{id:736,name:'アゴジムシ',r:'C'},
  {id:739,name:'マケンカニ',r:'C'},{id:742,name:'アブリー',r:'C'},{id:744,name:'イワンコ',r:'C'},{id:746,name:'ヨワシ',r:'C'},{id:747,name:'ヒドイデ',r:'C'},{id:749,name:'ドロバンコ',r:'C'},
  {id:751,name:'シズクモ',r:'C'},{id:753,name:'カリキリ',r:'C'},{id:755,name:'ネマシュ',r:'C'},{id:757,name:'ヤトウモリ',r:'C'},{id:759,name:'ヌイコグマ',r:'C'},{id:761,name:'アマカジ',r:'C'},
  {id:765,name:'ヤレユータン',r:'C'},{id:766,name:'ナゲツケサル',r:'C'},{id:767,name:'コソクムシ',r:'C'},{id:769,name:'スナバァ',r:'C'},{id:781,name:'ダダリン',r:'C'},{id:782,name:'ジャラコ',r:'C'},
  {id:793,name:'ウツロイド',r:'C'},{id:794,name:'マッシブーン',r:'C'},{id:795,name:'フェローチェ',r:'C'},{id:796,name:'デンジュモク',r:'C'},{id:797,name:'テッカグヤ',r:'C'},{id:798,name:'カミツルギ',r:'C'},
  {id:799,name:'アクジキング',r:'C'},{id:803,name:'ベベノム',r:'C'},{id:805,name:'ツンデツンデ',r:'C'},{id:806,name:'ズガドーン',r:'C'},
  {id:741,name:'オドリドリ',r:'R'},{id:764,name:'キュワワー',r:'R'},{id:771,name:'ナマコブシ',r:'R'},{id:774,name:'メテノ',r:'R'},{id:775,name:'ネッコアラ',r:'R'},{id:776,name:'バクガメス',r:'R'},
  {id:777,name:'トゲデマル',r:'R'},{id:778,name:'ミミッキュ',r:'R'},{id:779,name:'ハギギシリ',r:'R'},{id:780,name:'ジジーロン',r:'R'},
  {id:772,name:'タイプ：ヌル',r:'SR'},{id:773,name:'シルヴァディ',r:'SR'},{id:785,name:'カプ・コケコ',r:'SR'},{id:786,name:'カプ・テテフ',r:'SR'},{id:787,name:'カプ・ブルル',r:'SR'},{id:788,name:'カプ・レヒレ',r:'SR'},
  {id:789,name:'コスモッグ',r:'SR'},{id:790,name:'コスモウム',r:'SR'},{id:791,name:'ソルガレオ',r:'SR'},{id:792,name:'ルナアーラ',r:'SR'},{id:800,name:'ネクロズマ',r:'SR'},{id:801,name:'マギアナ',r:'SR'},
  {id:802,name:'マーシャドー',r:'SR'},{id:807,name:'ゼラオラ',r:'SR'},{id:808,name:'メルタン',r:'SR'},{id:809,name:'メルメタル',r:'SR'},

  // --- ガラル地方 (第8世代) ---
  {id:810,name:'サルノリ',r:'C'},{id:813,name:'ヒバニー',r:'C'},{id:816,name:'メッソン',r:'C'},{id:819,name:'ホシガリス',r:'C'},{id:821,name:'ココガラ',r:'C'},{id:824,name:'サッチムシ',r:'C'},
  {id:827,name:'クスネ',r:'C'},{id:829,name:'ヒメンカ',r:'C'},{id:831,name:'ウールー',r:'C'},{id:833,name:'カムカメ',r:'C'},{id:835,name:'ワンパチ',r:'C'},{id:837,name:'タンドン',r:'C'},
  {id:840,name:'カジッチュ',r:'C'},{id:843,name:'スナヘビ',r:'C'},{id:845,name:'ウッウ',r:'C'},{id:846,name:'サシカマス',r:'C'},{id:848,name:'エレズン',r:'C'},{id:850,name:'ヤクデ',r:'C'},
  {id:852,name:'タタッコ',r:'C'},{id:854,name:'ヤバチャ',r:'C'},{id:856,name:'ミブリム',r:'C'},{id:859,name:'ベロバー',r:'C'},{id:868,name:'マホミル',r:'C'},{id:872,name:'ユキハミ',r:'C'},
  {id:878,name:'ゾウドウ',r:'C'},{id:884,name:'ジュラルドン',r:'C'},{id:885,name:'ドラメシヤ',r:'C'},
  {id:870,name:'タイレーツ',r:'R'},{id:871,name:'バチンウニ',r:'R'},{id:874,name:'イシヘンジン',r:'R'},{id:875,name:'コオリッポ',r:'R'},{id:876,name:'イエッサン',r:'R'},{id:877,name:'モルペコ',r:'R'},
  {id:880,name:'パッチラゴン',r:'R'},{id:881,name:'パッチルドン',r:'R'},{id:882,name:'ウオノラゴン',r:'R'},{id:883,name:'ウオチルドン',r:'R'},
  {id:888,name:'ザシアン',r:'SR'},{id:889,name:'ザマゼンタ',r:'SR'},{id:890,name:'ムゲンダイナ',r:'SR'},{id:891,name:'ダクマ',r:'SR'},{id:892,name:'ウーラオス',r:'SR'},{id:893,name:'ザルード',r:'SR'},
  {id:894,name:'レジエレキ',r:'SR'},{id:895,name:'レジドラゴ',r:'SR'},{id:896,name:'ブリザポス',r:'SR'},{id:897,name:'レイスポス',r:'SR'},{id:898,name:'バドレックス',r:'SR'},{id:905,name:'ラブトロス',r:'SR'},

  // --- パルデア地方 (第9世代) ---
  {id:906,name:'ニャオハ',r:'C'},{id:909,name:'ホゲータ',r:'C'},{id:912,name:'クワッス',r:'C'},{id:915,name:'グルトン',r:'C'},{id:917,name:'タマンチュラ',r:'C'},{id:919,name:'マメバッタ',r:'C'},
  {id:921,name:'パモ',r:'C'},{id:926,name:'パピモッチ',r:'C'},{id:928,name:'ミニーブ',r:'C'},{id:935,name:'カルボウ',r:'C'},{id:940,name:'カイデン',r:'C'},{id:942,name:'オラチフ',r:'C'},
  {id:950,name:'ガケガニ',r:'C'},{id:951,name:'カプサイジ',r:'C'},{id:953,name:'シガロコ',r:'C'},{id:955,name:'ヒラヒナ',r:'C'},{id:957,name:'カヌチャン',r:'C'},{id:960,name:'ウミディグダ',r:'C'},
  {id:962,name:'オトシドリ',r:'C'},{id:963,name:'ナミイルカ',r:'C'},{id:965,name:'ブロロン',r:'C'},{id:967,name:'モトトカゲ',r:'C'},{id:968,name:'ミミズズ',r:'C'},{id:969,name:'キラーメ',r:'C'},
  {id:971,name:'ボチ',r:'C'},{id:973,name:'カラミンゴ',r:'C'},{id:974,name:'アルクジラ',r:'C'},{id:976,name:'ミガルーサ',r:'C'},{id:977,name:'ヘイラッシャ',r:'C'},{id:978,name:'シャリタツ',r:'C'},
  {id:984,name:'イダイナキバ',r:'C'},{id:985,name:'サケブシッポ',r:'C'},{id:986,name:'アラブルタケ',r:'C'},{id:987,name:'ハバタクカミ',r:'C'},{id:988,name:'チヲハウハネ',r:'C'},{id:989,name:'スナノケガワ',r:'C'},
  {id:990,name:'テツノワダチ',r:'C'},{id:991,name:'テツノツツミ',r:'C'},{id:992,name:'テツノカイナ',r:'C'},{id:993,name:'テツノコウベ',r:'C'},{id:994,name:'テツノドクガ',r:'C'},{id:995,name:'テツノイバラ',r:'C'},
  {id:996,name:'セビエ',r:'C'},{id:999,name:'コレクレー',r:'C'},{id:1005,name:'トドロクツキ',r:'C'},{id:1006,name:'テツノブジン',r:'C'},{id:1009,name:'ウネルミナモ',r:'C'},{id:1010,name:'テツノイサハ',r:'C'},
  {id:1012,name:'チャデス',r:'C'},{id:1020,name:'ウガツホムラ',r:'C'},{id:1021,name:'タケルライコ',r:'C'},{id:1022,name:'テツノイワオ',r:'C'},{id:1023,name:'テツノカシラ',r:'C'},
  {id:924,name:'ワッカネズミ',r:'R'},{id:931,name:'イキリンコ',r:'R'},{id:932,name:'コジオ',r:'R'},{id:938,name:'ズピカ',r:'R'},{id:944,name:'シルシュルー',r:'R'},{id:946,name:'アノクサ',r:'R'},
  {id:948,name:'ノノクラゲ',r:'R'},
  {id:1001,name:'チオンジェン',r:'SR'},{id:1002,name:'パオジアン',r:'SR'},{id:1003,name:'ディンルー',r:'SR'},{id:1004,name:'イーユイ',r:'SR'},{id:1007,name:'コライドン',r:'SR'},{id:1008,name:'ミライドン',r:'SR'},
  {id:1014,name:'イイネイヌ',r:'SR'},{id:1015,name:'マシマシラ',r:'SR'},{id:1016,name:'キチキギス',r:'SR'},{id:1017,name:'オーガポン',r:'SR'},{id:1024,name:'テラパゴス',r:'SR'},{id:1025,name:'モモワロウ',r:'SR'},

];

const GEN_INFO = {
  1: { name: 'カントー', label: '第1世代 カントー地方', count: 68 },
  2: { name: 'ジョウト', label: '第2世代 ジョウト地方', count: 54 },
  3: { name: 'ホウエン', label: '第3世代 ホウエン地方', count: 73 },
  4: { name: 'シンオウ', label: '第4世代 シンオウ地方', count: 52 },
  5: { name: 'イッシュ', label: '第5世代 イッシュ地方', count: 82 },
  6: { name: 'カロス', label: '第6世代 カロス地方', count: 37 },
  7: { name: 'アローラ', label: '第7世代 アローラ地方', count: 60 },
  8: { name: 'ガラル', label: '第8世代 ガラル地方', count: 49 },
  9: { name: 'パルデア', label: '第9世代 パルデア地方', count: 72 },
};

const EVOLUTION_POKEMON = {
  2:{name:'フシギソウ',r:'UC'},
  3:{name:'フシギバナ',r:'UC'},
  5:{name:'リザード',r:'UC'},
  6:{name:'リザードン',r:'UC'},
  8:{name:'カメール',r:'UC'},
  9:{name:'カメックス',r:'UC'},
  11:{name:'トランセル',r:'UC'},
  12:{name:'バタフリー',r:'UC'},
  14:{name:'コクーン',r:'UC'},
  15:{name:'スピアー',r:'UC'},
  17:{name:'ピジョン',r:'UC'},
  18:{name:'ピジョット',r:'UC'},
  20:{name:'ラッタ',r:'UC'},
  22:{name:'オニドリル',r:'UC'},
  24:{name:'アーボック',r:'UC'},
  25:{name:'ピカチュウ',r:'UC'},
  26:{name:'ライチュウ',r:'UC'},
  28:{name:'サンドパン',r:'UC'},
  30:{name:'ニドリーナ',r:'UC'},
  31:{name:'ニドクイン',r:'UC'},
  33:{name:'ニドリーノ',r:'UC'},
  34:{name:'ニドキング',r:'UC'},
  35:{name:'ピッピ',r:'UC'},
  36:{name:'ピクシー',r:'UC'},
  38:{name:'キュウコン',r:'UC'},
  39:{name:'プリン',r:'UC'},
  40:{name:'プクリン',r:'UC'},
  42:{name:'ゴルバット',r:'UC'},
  44:{name:'クサイハナ',r:'UC'},
  45:{name:'ラフレシア',r:'UC'},
  47:{name:'パラセクト',r:'UC'},
  49:{name:'モルフォン',r:'UC'},
  51:{name:'ダグトリオ',r:'UC'},
  53:{name:'ペルシアン',r:'UC'},
  55:{name:'ゴルダック',r:'UC'},
  57:{name:'オコリザル',r:'UC'},
  59:{name:'ウインディ',r:'UC'},
  61:{name:'ニョロゾ',r:'UC'},
  62:{name:'ニョロボン',r:'UC'},
  64:{name:'ユンゲラー',r:'UC'},
  65:{name:'フーディン',r:'UC'},
  67:{name:'ゴーリキー',r:'UC'},
  68:{name:'カイリキー',r:'UC'},
  70:{name:'ウツドン',r:'UC'},
  71:{name:'ウツボット',r:'UC'},
  73:{name:'ドククラゲ',r:'UC'},
  75:{name:'ゴローン',r:'UC'},
  76:{name:'ゴローニャ',r:'UC'},
  78:{name:'ギャロップ',r:'UC'},
  80:{name:'ヤドラン',r:'UC'},
  82:{name:'レアコイル',r:'UC'},
  85:{name:'ドードリオ',r:'UC'},
  87:{name:'ジュゴン',r:'UC'},
  89:{name:'ベトベトン',r:'UC'},
  91:{name:'パルシェン',r:'UC'},
  93:{name:'ゴースト',r:'UC'},
  94:{name:'ゲンガー',r:'UC'},
  97:{name:'スリーパー',r:'UC'},
  99:{name:'キングラー',r:'UC'},
  101:{name:'マルマイン',r:'UC'},
  103:{name:'ナッシー',r:'UC'},
  105:{name:'ガラガラ',r:'UC'},
  106:{name:'サワムラー',r:'UC'},
  107:{name:'エビワラー',r:'UC'},
  110:{name:'マタドガス',r:'UC'},
  112:{name:'サイドン',r:'UC'},
  113:{name:'ラッキー',r:'UC'},
  117:{name:'シードラ',r:'UC'},
  119:{name:'アズマオウ',r:'UC'},
  121:{name:'スターミー',r:'UC'},
  122:{name:'バリヤード',r:'UC'},
  124:{name:'ルージュラ',r:'UC'},
  125:{name:'エレブー',r:'UC'},
  126:{name:'ブーバー',r:'UC'},
  130:{name:'ギャラドス',r:'UC'},
  134:{name:'シャワーズ',r:'UC'},
  135:{name:'サンダース',r:'UC'},
  136:{name:'ブースター',r:'UC'},
  139:{name:'オムスター',r:'UC'},
  141:{name:'カブトプス',r:'UC'},
  143:{name:'カビゴン',r:'UC'},
  148:{name:'ハクリュー',r:'UC'},
  149:{name:'カイリュー',r:'UC'},
  153:{name:'ベイリーフ',r:'UC'},
  154:{name:'メガニウム',r:'UC'},
  156:{name:'マグマラシ',r:'UC'},
  157:{name:'バクフーン',r:'UC'},
  159:{name:'アリゲイツ',r:'UC'},
  160:{name:'オーダイル',r:'UC'},
  162:{name:'オオタチ',r:'UC'},
  164:{name:'ヨルノズク',r:'UC'},
  166:{name:'レディアン',r:'UC'},
  168:{name:'アリアドス',r:'UC'},
  169:{name:'クロバット',r:'UC'},
  171:{name:'ランターン',r:'UC'},
  176:{name:'トゲチック',r:'UC'},
  178:{name:'ネイティオ',r:'UC'},
  180:{name:'モココ',r:'UC'},
  181:{name:'デンリュウ',r:'UC'},
  182:{name:'キレイハナ',r:'UC'},
  183:{name:'マリル',r:'UC'},
  184:{name:'マリルリ',r:'UC'},
  185:{name:'ウソッキー',r:'UC'},
  186:{name:'ニョロトノ',r:'UC'},
  188:{name:'ポポッコ',r:'UC'},
  189:{name:'ワタッコ',r:'UC'},
  192:{name:'キマワリ',r:'UC'},
  195:{name:'ヌオー',r:'UC'},
  196:{name:'エーフィ',r:'UC'},
  197:{name:'ブラッキー',r:'UC'},
  199:{name:'ヤドキング',r:'UC'},
  202:{name:'ソーナンス',r:'UC'},
  205:{name:'フォレトス',r:'UC'},
  208:{name:'ハガネール',r:'UC'},
  210:{name:'グランブル',r:'UC'},
  212:{name:'ハッサム',r:'UC'},
  217:{name:'リングマ',r:'UC'},
  219:{name:'マグカルゴ',r:'UC'},
  221:{name:'イノムー',r:'UC'},
  224:{name:'オクタン',r:'UC'},
  226:{name:'マンタイン',r:'UC'},
  229:{name:'ヘルガー',r:'UC'},
  230:{name:'キングドラ',r:'UC'},
  232:{name:'ドンファン',r:'UC'},
  233:{name:'ポリゴン２',r:'UC'},
  237:{name:'カポエラー',r:'UC'},
  242:{name:'ハピナス',r:'UC'},
  247:{name:'サナギラス',r:'UC'},
  248:{name:'バンギラス',r:'UC'},
  253:{name:'ジュプトル',r:'UC'},
  254:{name:'ジュカイン',r:'UC'},
  256:{name:'ワカシャモ',r:'UC'},
  257:{name:'バシャーモ',r:'UC'},
  259:{name:'ヌマクロー',r:'UC'},
  260:{name:'ラグラージ',r:'UC'},
  262:{name:'グラエナ',r:'UC'},
  264:{name:'マッスグマ',r:'UC'},
  266:{name:'カラサリス',r:'UC'},
  267:{name:'アゲハント',r:'UC'},
  268:{name:'マユルド',r:'UC'},
  269:{name:'ドクケイル',r:'UC'},
  271:{name:'ハスブレロ',r:'UC'},
  272:{name:'ルンパッパ',r:'UC'},
  274:{name:'コノハナ',r:'UC'},
  275:{name:'ダーテング',r:'UC'},
  277:{name:'オオスバメ',r:'UC'},
  279:{name:'ペリッパー',r:'UC'},
  281:{name:'キルリア',r:'UC'},
  282:{name:'サーナイト',r:'UC'},
  284:{name:'アメモース',r:'UC'},
  286:{name:'キノガッサ',r:'UC'},
  288:{name:'ヤルキモノ',r:'UC'},
  289:{name:'ケッキング',r:'UC'},
  291:{name:'テッカニン',r:'UC'},
  292:{name:'ヌケニン',r:'UC'},
  294:{name:'ドゴーム',r:'UC'},
  295:{name:'バクオング',r:'UC'},
  297:{name:'ハリテヤマ',r:'UC'},
  301:{name:'エネコロロ',r:'UC'},
  305:{name:'コドラ',r:'UC'},
  306:{name:'ボスゴドラ',r:'UC'},
  308:{name:'チャーレム',r:'UC'},
  310:{name:'ライボルト',r:'UC'},
  315:{name:'ロゼリア',r:'UC'},
  317:{name:'マルノーム',r:'UC'},
  319:{name:'サメハダー',r:'UC'},
  321:{name:'ホエルオー',r:'UC'},
  323:{name:'バクーダ',r:'UC'},
  326:{name:'ブーピッグ',r:'UC'},
  329:{name:'ビブラーバ',r:'UC'},
  330:{name:'フライゴン',r:'UC'},
  332:{name:'ノクタス',r:'UC'},
  334:{name:'チルタリス',r:'UC'},
  340:{name:'ナマズン',r:'UC'},
  342:{name:'シザリガー',r:'UC'},
  344:{name:'ネンドール',r:'UC'},
  346:{name:'ユレイドル',r:'UC'},
  348:{name:'アーマルド',r:'UC'},
  350:{name:'ミロカロス',r:'UC'},
  354:{name:'ジュペッタ',r:'UC'},
  356:{name:'サマヨール',r:'UC'},
  358:{name:'チリーン',r:'UC'},
  362:{name:'オニゴーリ',r:'UC'},
  364:{name:'トドグラー',r:'UC'},
  365:{name:'トドゼルガ',r:'UC'},
  367:{name:'ハンテール',r:'UC'},
  368:{name:'サクラビス',r:'UC'},
  372:{name:'コモルー',r:'UC'},
  373:{name:'ボーマンダ',r:'UC'},
  375:{name:'メタング',r:'UC'},
  376:{name:'メタグロス',r:'UC'},
  388:{name:'ハヤシガメ',r:'UC'},
  389:{name:'ドダイトス',r:'UC'},
  391:{name:'モウカザル',r:'UC'},
  392:{name:'ゴウカザル',r:'UC'},
  394:{name:'ポッタイシ',r:'UC'},
  395:{name:'エンペルト',r:'UC'},
  397:{name:'ムクバード',r:'UC'},
  398:{name:'ムクホーク',r:'UC'},
  400:{name:'ビーダル',r:'UC'},
  402:{name:'コロトック',r:'UC'},
  404:{name:'ルクシオ',r:'UC'},
  405:{name:'レントラー',r:'UC'},
  407:{name:'ロズレイド',r:'UC'},
  409:{name:'ラムパルド',r:'UC'},
  411:{name:'トリデプス',r:'UC'},
  413:{name:'ミノマダム',r:'UC'},
  414:{name:'ガーメイル',r:'UC'},
  416:{name:'ビークイン',r:'UC'},
  419:{name:'フローゼル',r:'UC'},
  421:{name:'チェリム',r:'UC'},
  423:{name:'トリトドン',r:'UC'},
  424:{name:'エテボース',r:'UC'},
  426:{name:'フワライド',r:'UC'},
  428:{name:'ミミロップ',r:'UC'},
  429:{name:'ムウマージ',r:'UC'},
  430:{name:'ドンカラス',r:'UC'},
  432:{name:'ブニャット',r:'UC'},
  435:{name:'スカタンク',r:'UC'},
  437:{name:'ドータクン',r:'UC'},
  444:{name:'ガバイト',r:'UC'},
  445:{name:'ガブリアス',r:'UC'},
  448:{name:'ルカリオ',r:'UC'},
  450:{name:'カバルドン',r:'UC'},
  452:{name:'ドラピオン',r:'UC'},
  454:{name:'ドクロッグ',r:'UC'},
  457:{name:'ネオラント',r:'UC'},
  460:{name:'ユキノオー',r:'UC'},
  461:{name:'マニューラ',r:'UC'},
  462:{name:'ジバコイル',r:'UC'},
  463:{name:'ベロベルト',r:'UC'},
  464:{name:'ドサイドン',r:'UC'},
  465:{name:'モジャンボ',r:'UC'},
  466:{name:'エレキブル',r:'UC'},
  467:{name:'ブーバーン',r:'UC'},
  468:{name:'トゲキッス',r:'UC'},
  469:{name:'メガヤンマ',r:'UC'},
  470:{name:'リーフィア',r:'UC'},
  471:{name:'グレイシア',r:'UC'},
  472:{name:'グライオン',r:'UC'},
  473:{name:'マンムー',r:'UC'},
  474:{name:'ポリゴンＺ',r:'UC'},
  475:{name:'エルレイド',r:'UC'},
  476:{name:'ダイノーズ',r:'UC'},
  477:{name:'ヨノワール',r:'UC'},
  478:{name:'ユキメノコ',r:'UC'},
  496:{name:'ジャノビー',r:'UC'},
  497:{name:'ジャローダ',r:'UC'},
  499:{name:'チャオブー',r:'UC'},
  500:{name:'エンブオー',r:'UC'},
  502:{name:'フタチマル',r:'UC'},
  503:{name:'ダイケンキ',r:'UC'},
  505:{name:'ミルホッグ',r:'UC'},
  507:{name:'ハーデリア',r:'UC'},
  508:{name:'ムーランド',r:'UC'},
  510:{name:'レパルダス',r:'UC'},
  512:{name:'ヤナッキー',r:'UC'},
  514:{name:'バオッキー',r:'UC'},
  516:{name:'ヒヤッキー',r:'UC'},
  518:{name:'ムシャーナ',r:'UC'},
  520:{name:'ハトーボー',r:'UC'},
  521:{name:'ケンホロウ',r:'UC'},
  523:{name:'ゼブライカ',r:'UC'},
  525:{name:'ガントル',r:'UC'},
  526:{name:'ギガイアス',r:'UC'},
  528:{name:'ココロモリ',r:'UC'},
  530:{name:'ドリュウズ',r:'UC'},
  533:{name:'ドテッコツ',r:'UC'},
  534:{name:'ローブシン',r:'UC'},
  536:{name:'ガマガル',r:'UC'},
  537:{name:'ガマゲロゲ',r:'UC'},
  541:{name:'クルマユ',r:'UC'},
  542:{name:'ハハコモリ',r:'UC'},
  544:{name:'ホイーガ',r:'UC'},
  545:{name:'ペンドラー',r:'UC'},
  547:{name:'エルフーン',r:'UC'},
  549:{name:'ドレディア',r:'UC'},
  552:{name:'ワルビル',r:'UC'},
  553:{name:'ワルビアル',r:'UC'},
  555:{name:'ヒヒダルマ',r:'UC'},
  558:{name:'イワパレス',r:'UC'},
  560:{name:'ズルズキン',r:'UC'},
  563:{name:'デスカーン',r:'UC'},
  565:{name:'アバゴーラ',r:'UC'},
  567:{name:'アーケオス',r:'UC'},
  569:{name:'ダストダス',r:'UC'},
  571:{name:'ゾロアーク',r:'UC'},
  573:{name:'チラチーノ',r:'UC'},
  575:{name:'ゴチミル',r:'UC'},
  576:{name:'ゴチルゼル',r:'UC'},
  578:{name:'ダブラン',r:'UC'},
  579:{name:'ランクルス',r:'UC'},
  581:{name:'スワンナ',r:'UC'},
  583:{name:'バニリッチ',r:'UC'},
  584:{name:'バイバニラ',r:'UC'},
  586:{name:'メブキジカ',r:'UC'},
  589:{name:'シュバルゴ',r:'UC'},
  591:{name:'モロバレル',r:'UC'},
  593:{name:'ブルンゲル',r:'UC'},
  596:{name:'デンチュラ',r:'UC'},
  598:{name:'ナットレイ',r:'UC'},
  600:{name:'ギギアル',r:'UC'},
  601:{name:'ギギギアル',r:'UC'},
  603:{name:'シビビール',r:'UC'},
  604:{name:'シビルドン',r:'UC'},
  606:{name:'オーベム',r:'UC'},
  608:{name:'ランプラー',r:'UC'},
  609:{name:'シャンデラ',r:'UC'},
  611:{name:'オノンド',r:'UC'},
  612:{name:'オノノクス',r:'UC'},
  614:{name:'ツンベアー',r:'UC'},
  617:{name:'アギルダー',r:'UC'},
  620:{name:'コジョンド',r:'UC'},
  623:{name:'ゴルーグ',r:'UC'},
  625:{name:'キリキザン',r:'UC'},
  628:{name:'ウォーグル',r:'UC'},
  630:{name:'バルジーナ',r:'UC'},
  634:{name:'ジヘッド',r:'UC'},
  635:{name:'サザンドラ',r:'UC'},
  637:{name:'ウルガモス',r:'UC'},
  651:{name:'ハリボーグ',r:'UC'},
  652:{name:'ブリガロン',r:'UC'},
  654:{name:'テールナー',r:'UC'},
  655:{name:'マフォクシー',r:'UC'},
  657:{name:'ゲコガシラ',r:'UC'},
  658:{name:'ゲッコウガ',r:'UC'},
  660:{name:'ホルード',r:'UC'},
  662:{name:'ヒノヤコマ',r:'UC'},
  663:{name:'ファイアロー',r:'UC'},
  665:{name:'コフーライ',r:'UC'},
  666:{name:'ビビヨン',r:'UC'},
  668:{name:'カエンジシ',r:'UC'},
  670:{name:'フラエッテ',r:'UC'},
  671:{name:'フラージェス',r:'UC'},
  673:{name:'ゴーゴート',r:'UC'},
  675:{name:'ゴロンダ',r:'UC'},
  678:{name:'ニャオニクス',r:'UC'},
  680:{name:'ニダンギル',r:'UC'},
  681:{name:'ギルガルド',r:'UC'},
  683:{name:'フレフワン',r:'UC'},
  685:{name:'ペロリーム',r:'UC'},
  687:{name:'カラマネロ',r:'UC'},
  689:{name:'ガメノデス',r:'UC'},
  691:{name:'ドラミドロ',r:'UC'},
  693:{name:'ブロスター',r:'UC'},
  695:{name:'エレザード',r:'UC'},
  697:{name:'ガチゴラス',r:'UC'},
  699:{name:'アマルルガ',r:'UC'},
  700:{name:'ニンフィア',r:'UC'},
  705:{name:'ヌメイル',r:'UC'},
  706:{name:'ヌメルゴン',r:'UC'},
  709:{name:'オーロット',r:'UC'},
  711:{name:'パンプジン',r:'UC'},
  713:{name:'クレベース',r:'UC'},
  715:{name:'オンバーン',r:'UC'},
  723:{name:'フクスロー',r:'UC'},
  724:{name:'ジュナイパー',r:'UC'},
  726:{name:'ニャヒート',r:'UC'},
  727:{name:'ガオガエン',r:'UC'},
  729:{name:'オシャマリ',r:'UC'},
  730:{name:'アシレーヌ',r:'UC'},
  732:{name:'ケララッパ',r:'UC'},
  733:{name:'ドデカバシ',r:'UC'},
  735:{name:'デカグース',r:'UC'},
  737:{name:'デンヂムシ',r:'UC'},
  738:{name:'クワガノン',r:'UC'},
  740:{name:'ケケンカニ',r:'UC'},
  743:{name:'アブリボン',r:'UC'},
  745:{name:'ルガルガン',r:'UC'},
  748:{name:'ドヒドイデ',r:'UC'},
  750:{name:'バンバドロ',r:'UC'},
  752:{name:'オニシズクモ',r:'UC'},
  754:{name:'ラランテス',r:'UC'},
  756:{name:'マシェード',r:'UC'},
  758:{name:'エンニュート',r:'UC'},
  760:{name:'キテルグマ',r:'UC'},
  762:{name:'アママイコ',r:'UC'},
  763:{name:'アマージョ',r:'UC'},
  768:{name:'グソクムシャ',r:'UC'},
  770:{name:'シロデスナ',r:'UC'},
  783:{name:'ジャランゴ',r:'UC'},
  784:{name:'ジャラランガ',r:'UC'},
  804:{name:'アーゴヨン',r:'UC'},
  811:{name:'バチンキー',r:'UC'},
  812:{name:'ゴリランダー',r:'UC'},
  814:{name:'ラビフット',r:'UC'},
  815:{name:'エースバーン',r:'UC'},
  817:{name:'ジメレオン',r:'UC'},
  818:{name:'インテレオン',r:'UC'},
  820:{name:'ヨクバリス',r:'UC'},
  822:{name:'アオガラス',r:'UC'},
  823:{name:'アーマーガア',r:'UC'},
  825:{name:'レドームシ',r:'UC'},
  826:{name:'イオルブ',r:'UC'},
  828:{name:'フォクスライ',r:'UC'},
  830:{name:'ワタシラガ',r:'UC'},
  832:{name:'バイウールー',r:'UC'},
  834:{name:'カジリガメ',r:'UC'},
  836:{name:'パルスワン',r:'UC'},
  838:{name:'トロッゴン',r:'UC'},
  839:{name:'セキタンザン',r:'UC'},
  841:{name:'アップリュー',r:'UC'},
  842:{name:'タルップル',r:'UC'},
  844:{name:'サダイジャ',r:'UC'},
  847:{name:'カマスジョー',r:'UC'},
  849:{name:'ストリンダー',r:'UC'},
  851:{name:'マルヤクデ',r:'UC'},
  853:{name:'オトスパス',r:'UC'},
  855:{name:'ポットデス',r:'UC'},
  857:{name:'テブリム',r:'UC'},
  858:{name:'ブリムオン',r:'UC'},
  860:{name:'ギモー',r:'UC'},
  861:{name:'オーロンゲ',r:'UC'},
  862:{name:'タチフサグマ',r:'UC'},
  863:{name:'ニャイキング',r:'UC'},
  864:{name:'サニゴーン',r:'UC'},
  865:{name:'ネギガナイト',r:'UC'},
  866:{name:'バリコオル',r:'UC'},
  867:{name:'デスバーン',r:'UC'},
  869:{name:'マホイップ',r:'UC'},
  873:{name:'モスノウ',r:'UC'},
  879:{name:'ダイオウドウ',r:'UC'},
  886:{name:'ドロンチ',r:'UC'},
  887:{name:'ドラパルト',r:'UC'},
  899:{name:'アヤシシ',r:'UC'},
  900:{name:'バサギリ',r:'UC'},
  901:{name:'ガチグマ',r:'UC'},
  902:{name:'イダイトウ',r:'UC'},
  903:{name:'オオニューラ',r:'UC'},
  904:{name:'ハリーマン',r:'UC'},
  907:{name:'ニャローテ',r:'UC'},
  908:{name:'マスカーニャ',r:'UC'},
  910:{name:'アチゲータ',r:'UC'},
  911:{name:'ラウドボーン',r:'UC'},
  913:{name:'ウェルカモ',r:'UC'},
  914:{name:'ウェーニバル',r:'UC'},
  916:{name:'パフュートン',r:'UC'},
  918:{name:'ワナイダー',r:'UC'},
  920:{name:'エクスレッグ',r:'UC'},
  922:{name:'パモット',r:'UC'},
  923:{name:'パーモット',r:'UC'},
  925:{name:'イッカネズミ',r:'UC'},
  927:{name:'バウッツェル',r:'UC'},
  929:{name:'オリーニョ',r:'UC'},
  930:{name:'オリーヴァ',r:'UC'},
  933:{name:'ジオヅム',r:'UC'},
  934:{name:'キョジオーン',r:'UC'},
  936:{name:'グレンアルマ',r:'UC'},
  937:{name:'ソウブレイズ',r:'UC'},
  939:{name:'ハラバリー',r:'UC'},
  941:{name:'タイカイデン',r:'UC'},
  943:{name:'マフィティフ',r:'UC'},
  945:{name:'タギングル',r:'UC'},
  947:{name:'アノホラグサ',r:'UC'},
  949:{name:'リククラゲ',r:'UC'},
  952:{name:'スコヴィラン',r:'UC'},
  954:{name:'ベラカス',r:'UC'},
  956:{name:'クエスパトラ',r:'UC'},
  958:{name:'ナカヌチャン',r:'UC'},
  959:{name:'デカヌチャン',r:'UC'},
  961:{name:'ウミトリオ',r:'UC'},
  964:{name:'イルカマン',r:'UC'},
  966:{name:'ブロロローム',r:'UC'},
  970:{name:'キラフロル',r:'UC'},
  972:{name:'ハカドッグ',r:'UC'},
  975:{name:'ハルクジラ',r:'UC'},
  979:{name:'コノヨザル',r:'UC'},
  980:{name:'ドオー',r:'UC'},
  981:{name:'リキキリン',r:'UC'},
  982:{name:'ノココッチ',r:'UC'},
  983:{name:'ドドゲザン',r:'UC'},
  997:{name:'セゴール',r:'UC'},
  998:{name:'セグレイブ',r:'UC'},
  1000:{name:'サーフゴー',r:'UC'},
  1011:{name:'カミッチュ',r:'UC'},
  1013:{name:'ヤバソチャ',r:'UC'},
  1018:{name:'ブリジュラス',r:'UC'},
  1019:{name:'カミツオロチ',r:'UC'},
};

const EVOLUTION_CHAINS = {
  1:{to:2,level:3},
  2:{to:3,level:6},
  4:{to:5,level:3},
  5:{to:6,level:6},
  7:{to:8,level:3},
  8:{to:9,level:6},
  10:{to:11,level:3},
  11:{to:12,level:6},
  13:{to:14,level:3},
  14:{to:15,level:6},
  16:{to:17,level:3},
  17:{to:18,level:6},
  19:{to:20,level:3},
  21:{to:22,level:3},
  23:{to:24,level:3},
  25:{to:26,level:6},
  27:{to:28,level:3},
  29:{to:30,level:3},
  30:{to:31,level:6},
  32:{to:33,level:3},
  33:{to:34,level:6},
  35:{to:36,level:6},
  37:{to:38,level:3},
  39:{to:40,level:6},
  41:{to:42,level:3},
  42:{to:169,level:6},
  43:{to:44,level:3},
  44:{to:45,level:6,random:[45, 182]},
  46:{to:47,level:3},
  48:{to:49,level:3},
  50:{to:51,level:3},
  52:{to:53,level:4,random:[53, 863]},
  54:{to:55,level:3},
  56:{to:57,level:3},
  57:{to:979,level:6},
  58:{to:59,level:3},
  60:{to:61,level:3},
  61:{to:62,level:6,random:[62, 186]},
  63:{to:64,level:3},
  64:{to:65,level:6},
  66:{to:67,level:3},
  67:{to:68,level:6},
  69:{to:70,level:3},
  70:{to:71,level:6},
  72:{to:73,level:3},
  74:{to:75,level:3},
  75:{to:76,level:6},
  77:{to:78,level:3},
  79:{to:80,level:4,random:[80, 199]},
  81:{to:82,level:3},
  82:{to:462,level:6},
  83:{to:865,level:3},
  84:{to:85,level:3},
  86:{to:87,level:3},
  88:{to:89,level:3},
  90:{to:91,level:3},
  92:{to:93,level:3},
  93:{to:94,level:6},
  95:{to:208,level:3},
  96:{to:97,level:3},
  98:{to:99,level:3},
  100:{to:101,level:3},
  102:{to:103,level:3},
  104:{to:105,level:3},
  108:{to:463,level:3},
  109:{to:110,level:3},
  111:{to:112,level:3},
  112:{to:464,level:6},
  113:{to:242,level:6},
  114:{to:465,level:3},
  116:{to:117,level:3},
  117:{to:230,level:6},
  118:{to:119,level:3},
  120:{to:121,level:3},
  122:{to:866,level:6},
  123:{to:212,level:4,random:[212, 900]},
  125:{to:466,level:6},
  126:{to:467,level:6},
  129:{to:130,level:3},
  133:{to:134,level:4,random:[134, 135, 136, 196, 197, 470, 471, 700]},
  137:{to:233,level:3},
  138:{to:139,level:3},
  140:{to:141,level:3},
  147:{to:148,level:3},
  148:{to:149,level:6},
  152:{to:153,level:3},
  153:{to:154,level:6},
  155:{to:156,level:3},
  156:{to:157,level:6},
  158:{to:159,level:3},
  159:{to:160,level:6},
  161:{to:162,level:3},
  163:{to:164,level:3},
  165:{to:166,level:3},
  167:{to:168,level:3},
  170:{to:171,level:3},
  172:{to:25,level:3},
  173:{to:35,level:3},
  174:{to:39,level:3},
  175:{to:176,level:3},
  176:{to:468,level:6},
  177:{to:178,level:3},
  179:{to:180,level:3},
  180:{to:181,level:6},
  183:{to:184,level:6},
  187:{to:188,level:3},
  188:{to:189,level:6},
  190:{to:424,level:3},
  191:{to:192,level:3},
  193:{to:469,level:3},
  194:{to:195,level:4,random:[195, 980]},
  198:{to:430,level:3},
  200:{to:429,level:3},
  203:{to:981,level:3},
  204:{to:205,level:3},
  206:{to:982,level:3},
  207:{to:472,level:3},
  209:{to:210,level:3},
  211:{to:904,level:3},
  215:{to:461,level:4,random:[461, 903]},
  216:{to:217,level:3},
  217:{to:901,level:6},
  218:{to:219,level:3},
  220:{to:221,level:3},
  221:{to:473,level:6},
  222:{to:864,level:3},
  223:{to:224,level:3},
  228:{to:229,level:3},
  231:{to:232,level:3},
  233:{to:474,level:6},
  234:{to:899,level:3},
  236:{to:106,level:4,random:[106, 107, 237]},
  238:{to:124,level:3},
  239:{to:125,level:3},
  240:{to:126,level:3},
  246:{to:247,level:3},
  247:{to:248,level:6},
  252:{to:253,level:3},
  253:{to:254,level:6},
  255:{to:256,level:3},
  256:{to:257,level:6},
  258:{to:259,level:3},
  259:{to:260,level:6},
  261:{to:262,level:3},
  263:{to:264,level:3},
  264:{to:862,level:6},
  265:{to:266,level:4,random:[266, 268]},
  266:{to:267,level:6},
  268:{to:269,level:6},
  270:{to:271,level:3},
  271:{to:272,level:6},
  273:{to:274,level:3},
  274:{to:275,level:6},
  276:{to:277,level:3},
  278:{to:279,level:3},
  280:{to:281,level:3},
  281:{to:282,level:6,random:[282, 475]},
  283:{to:284,level:3},
  285:{to:286,level:3},
  287:{to:288,level:3},
  288:{to:289,level:6},
  290:{to:291,level:4,random:[291, 292]},
  293:{to:294,level:3},
  294:{to:295,level:6},
  296:{to:297,level:3},
  298:{to:183,level:3},
  299:{to:476,level:3},
  300:{to:301,level:3},
  304:{to:305,level:3},
  305:{to:306,level:6},
  307:{to:308,level:3},
  309:{to:310,level:3},
  315:{to:407,level:6},
  316:{to:317,level:3},
  318:{to:319,level:3},
  320:{to:321,level:3},
  322:{to:323,level:3},
  325:{to:326,level:3},
  328:{to:329,level:3},
  329:{to:330,level:6},
  331:{to:332,level:3},
  333:{to:334,level:3},
  339:{to:340,level:3},
  341:{to:342,level:3},
  343:{to:344,level:3},
  345:{to:346,level:3},
  347:{to:348,level:3},
  349:{to:350,level:3},
  353:{to:354,level:3},
  355:{to:356,level:3},
  356:{to:477,level:6},
  360:{to:202,level:3},
  361:{to:362,level:4,random:[362, 478]},
  363:{to:364,level:3},
  364:{to:365,level:6},
  366:{to:367,level:4,random:[367, 368]},
  371:{to:372,level:3},
  372:{to:373,level:6},
  374:{to:375,level:3},
  375:{to:376,level:6},
  387:{to:388,level:3},
  388:{to:389,level:6},
  390:{to:391,level:3},
  391:{to:392,level:6},
  393:{to:394,level:3},
  394:{to:395,level:6},
  396:{to:397,level:3},
  397:{to:398,level:6},
  399:{to:400,level:3},
  401:{to:402,level:3},
  403:{to:404,level:3},
  404:{to:405,level:6},
  406:{to:315,level:3},
  408:{to:409,level:3},
  410:{to:411,level:3},
  412:{to:413,level:4,random:[413, 414]},
  415:{to:416,level:3},
  418:{to:419,level:3},
  420:{to:421,level:3},
  422:{to:423,level:3},
  425:{to:426,level:3},
  427:{to:428,level:3},
  431:{to:432,level:3},
  433:{to:358,level:3},
  434:{to:435,level:3},
  436:{to:437,level:3},
  438:{to:185,level:3},
  439:{to:122,level:3},
  440:{to:113,level:3},
  443:{to:444,level:3},
  444:{to:445,level:6},
  446:{to:143,level:3},
  447:{to:448,level:3},
  449:{to:450,level:3},
  451:{to:452,level:3},
  453:{to:454,level:3},
  456:{to:457,level:3},
  458:{to:226,level:3},
  459:{to:460,level:3},
  489:{to:490,level:3},
  495:{to:496,level:3},
  496:{to:497,level:6},
  498:{to:499,level:3},
  499:{to:500,level:6},
  501:{to:502,level:3},
  502:{to:503,level:6},
  504:{to:505,level:3},
  506:{to:507,level:3},
  507:{to:508,level:6},
  509:{to:510,level:3},
  511:{to:512,level:3},
  513:{to:514,level:3},
  515:{to:516,level:3},
  517:{to:518,level:3},
  519:{to:520,level:3},
  520:{to:521,level:6},
  522:{to:523,level:3},
  524:{to:525,level:3},
  525:{to:526,level:6},
  527:{to:528,level:3},
  529:{to:530,level:3},
  532:{to:533,level:3},
  533:{to:534,level:6},
  535:{to:536,level:3},
  536:{to:537,level:6},
  540:{to:541,level:3},
  541:{to:542,level:6},
  543:{to:544,level:3},
  544:{to:545,level:6},
  546:{to:547,level:3},
  548:{to:549,level:3},
  550:{to:902,level:3},
  551:{to:552,level:3},
  552:{to:553,level:6},
  554:{to:555,level:3},
  557:{to:558,level:3},
  559:{to:560,level:3},
  562:{to:563,level:4,random:[563, 867]},
  564:{to:565,level:3},
  566:{to:567,level:3},
  568:{to:569,level:3},
  570:{to:571,level:3},
  572:{to:573,level:3},
  574:{to:575,level:3},
  575:{to:576,level:6},
  577:{to:578,level:3},
  578:{to:579,level:6},
  580:{to:581,level:3},
  582:{to:583,level:3},
  583:{to:584,level:6},
  585:{to:586,level:3},
  588:{to:589,level:3},
  590:{to:591,level:3},
  592:{to:593,level:3},
  595:{to:596,level:3},
  597:{to:598,level:3},
  599:{to:600,level:3},
  600:{to:601,level:6},
  602:{to:603,level:3},
  603:{to:604,level:6},
  605:{to:606,level:3},
  607:{to:608,level:3},
  608:{to:609,level:6},
  610:{to:611,level:3},
  611:{to:612,level:6},
  613:{to:614,level:3},
  616:{to:617,level:3},
  619:{to:620,level:3},
  622:{to:623,level:3},
  624:{to:625,level:3},
  625:{to:983,level:6},
  627:{to:628,level:3},
  629:{to:630,level:3},
  633:{to:634,level:3},
  634:{to:635,level:6},
  636:{to:637,level:3},
  650:{to:651,level:3},
  651:{to:652,level:6},
  653:{to:654,level:3},
  654:{to:655,level:6},
  656:{to:657,level:3},
  657:{to:658,level:6},
  659:{to:660,level:3},
  661:{to:662,level:3},
  662:{to:663,level:6},
  664:{to:665,level:3},
  665:{to:666,level:6},
  667:{to:668,level:3},
  669:{to:670,level:3},
  670:{to:671,level:6},
  672:{to:673,level:3},
  674:{to:675,level:3},
  677:{to:678,level:3},
  679:{to:680,level:3},
  680:{to:681,level:6},
  682:{to:683,level:3},
  684:{to:685,level:3},
  686:{to:687,level:3},
  688:{to:689,level:3},
  690:{to:691,level:3},
  692:{to:693,level:3},
  694:{to:695,level:3},
  696:{to:697,level:3},
  698:{to:699,level:3},
  704:{to:705,level:3},
  705:{to:706,level:6},
  708:{to:709,level:3},
  710:{to:711,level:3},
  712:{to:713,level:3},
  714:{to:715,level:3},
  722:{to:723,level:3},
  723:{to:724,level:6},
  725:{to:726,level:3},
  726:{to:727,level:6},
  728:{to:729,level:3},
  729:{to:730,level:6},
  731:{to:732,level:3},
  732:{to:733,level:6},
  734:{to:735,level:3},
  736:{to:737,level:3},
  737:{to:738,level:6},
  739:{to:740,level:3},
  742:{to:743,level:3},
  744:{to:745,level:3},
  747:{to:748,level:3},
  749:{to:750,level:3},
  751:{to:752,level:3},
  753:{to:754,level:3},
  755:{to:756,level:3},
  757:{to:758,level:3},
  759:{to:760,level:3},
  761:{to:762,level:3},
  762:{to:763,level:6},
  767:{to:768,level:3},
  769:{to:770,level:3},
  772:{to:773,level:3},
  782:{to:783,level:3},
  783:{to:784,level:6},
  789:{to:790,level:3},
  790:{to:791,level:6,random:[791, 792]},
  803:{to:804,level:3},
  810:{to:811,level:3},
  811:{to:812,level:6},
  813:{to:814,level:3},
  814:{to:815,level:6},
  816:{to:817,level:3},
  817:{to:818,level:6},
  819:{to:820,level:3},
  821:{to:822,level:3},
  822:{to:823,level:6},
  824:{to:825,level:3},
  825:{to:826,level:6},
  827:{to:828,level:3},
  829:{to:830,level:3},
  831:{to:832,level:3},
  833:{to:834,level:3},
  835:{to:836,level:3},
  837:{to:838,level:3},
  838:{to:839,level:6},
  840:{to:841,level:4,random:[841, 842, 1011]},
  843:{to:844,level:3},
  846:{to:847,level:3},
  848:{to:849,level:3},
  850:{to:851,level:3},
  852:{to:853,level:3},
  854:{to:855,level:3},
  856:{to:857,level:3},
  857:{to:858,level:6},
  859:{to:860,level:3},
  860:{to:861,level:6},
  868:{to:869,level:3},
  872:{to:873,level:3},
  878:{to:879,level:3},
  884:{to:1018,level:3},
  885:{to:886,level:3},
  886:{to:887,level:6},
  891:{to:892,level:3},
  906:{to:907,level:3},
  907:{to:908,level:6},
  909:{to:910,level:3},
  910:{to:911,level:6},
  912:{to:913,level:3},
  913:{to:914,level:6},
  915:{to:916,level:3},
  917:{to:918,level:3},
  919:{to:920,level:3},
  921:{to:922,level:3},
  922:{to:923,level:6},
  924:{to:925,level:3},
  926:{to:927,level:3},
  928:{to:929,level:3},
  929:{to:930,level:6},
  932:{to:933,level:3},
  933:{to:934,level:6},
  935:{to:936,level:4,random:[936, 937]},
  938:{to:939,level:3},
  940:{to:941,level:3},
  942:{to:943,level:3},
  944:{to:945,level:3},
  946:{to:947,level:3},
  948:{to:949,level:3},
  951:{to:952,level:3},
  953:{to:954,level:3},
  955:{to:956,level:3},
  957:{to:958,level:3},
  958:{to:959,level:6},
  960:{to:961,level:3},
  963:{to:964,level:3},
  965:{to:966,level:3},
  969:{to:970,level:3},
  971:{to:972,level:3},
  974:{to:975,level:3},
  996:{to:997,level:3},
  997:{to:998,level:6},
  999:{to:1000,level:3},
  1011:{to:1019,level:6},
  1012:{to:1013,level:3},
};

// 名前検索（全ポケモン + 進化限定をまとめて引ける）
function findPokeName(id) {
  const p = POKEDEX.find(p => p.id === id);
  if (p) return p.name;
  if (EVOLUTION_POKEMON[id]) return EVOLUTION_POKEMON[id].name;
  return `No.${id}`;
}

// 世代判定（ID範囲ベース）
const GEN_RANGES = [
  [1,151],[152,251],[252,386],[387,493],[494,649],
  [650,721],[722,809],[810,905],[906,1025]
];
function findPokeGen(id) {
  for (let i = 0; i < GEN_RANGES.length; i++) {
    if (id >= GEN_RANGES[i][0] && id <= GEN_RANGES[i][1]) return i + 1;
  }
  return 1;
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
let gachaData = { points: 0, collection: [], partner: null, partnerDate: '', friendship: {}, milestones: [], favorites: [] };

function loadGachaData() {
  const raw = localStorage.getItem('junbi_timer_gacha');
  if (raw) { try { gachaData = JSON.parse(raw); } catch(e) {} }
  if (!gachaData.friendship) gachaData.friendship = {};
  if (!gachaData.history) gachaData.history = {};
  if (!gachaData.milestones) gachaData.milestones = [];
  if (!gachaData.favorites) gachaData.favorites = [];
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

// --- しゅっぱつ時: おきにいりの中からランダム1匹に+3exp ---
function onDepartBonus() {
  const pool = gachaData.favorites.filter(id => gachaData.collection.includes(id));
  if (pool.length === 0 && gachaData.partner) pool.push(gachaData.partner);
  if (pool.length === 0) return;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  addFriendshipExp(pick, 3);
}

// --- ただいま時: パートナーに+3exp ---
function onTadaimaBonus() {
  if (!gachaData.partner) return;
  addFriendshipExp(gachaData.partner, 3);
}

// --- ともだちさがしチケット: 50ptで確定遭遇 ---
function useSearchTicket(evName) {
  if (gachaData.points < 50) return false;
  gachaData.points -= 50;
  saveGachaData();
  if (typeof updateStats === 'function') updateStats();
  // 遭遇ロジック（確定版）
  const roll = Math.random();
  let rarity = roll < ENCOUNTER_RARITY.C ? 'C' : roll < ENCOUNTER_RARITY.R ? 'R' : 'SR';
  const rarities = ['C', 'R', 'SR'];
  const hasUnowned = r => POKEDEX.some(p => p.r === r && !gachaData.collection.includes(p.id));
  if (!hasUnowned(rarity)) {
    const fallback = rarities.find(r => hasUnowned(r));
    if (fallback) rarity = fallback;
  }
  const pool = POKEDEX.filter(p => p.r === rarity);
  const unowned = pool.filter(p => !gachaData.collection.includes(p.id));
  const candidates = unowned.length > 0 ? unowned : pool;
  const poke = candidates[Math.floor(Math.random() * candidates.length)];
  const isNew = !gachaData.collection.includes(poke.id);
  if (isNew) gachaData.collection.push(poke.id);
  if (!gachaData.friendship[poke.id]) gachaData.friendship[poke.id] = { exp: 0 };
  recordHistory(poke.id, 'ともだちさがしチケット');
  saveGachaData();
  showEncounterAnimation(poke, isNew, 'ともだちさがしチケット');
  return true;
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

    // MAX到達チェック
    if (newLevel >= MAX_FRIENDSHIP_LEVEL) {
      showMaxFriendshipAnimation(pokeId);
      return;
    }

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

// --- なかよし度MAX演出（きんのカード）---
function showMaxFriendshipAnimation(pokeId) {
  const name = findPokeName(pokeId);
  const genId = findPokeGen(pokeId);
  const genLabel = GEN_INFO[genId]?.label || '';

  const overlay = document.getElementById('gachaOverlay');
  overlay.innerHTML = `
    <div class="cheer-card-big levelup-card" style="background:linear-gradient(135deg,#fef9c3,#fde68a,#fbbf24);position:relative;overflow:hidden;border:3px solid #f59e0b;box-shadow:0 0 30px rgba(245,158,11,0.5);">
      <div class="feed-particles" id="maxParticles"></div>
      <div style="font-weight:900;font-size:0.8rem;color:#92400e;background:#fef3c7;padding:4px 12px;border-radius:20px;margin-bottom:8px;">
        ${genLabel}
      </div>
      <img src="${SPRITE_HD}${pokeId}.png" class="cheer-sprite-big" alt="${name}"
        onerror="this.src='${SPRITE_URL}${pokeId}.png'"
        style="animation: levelUpBounce 0.8s ease;filter:drop-shadow(0 0 12px rgba(245,158,11,0.6));">
      <div style="font-weight:900;font-size:1.2rem;color:#92400e;margin-top:4px;">
        ✨ きんのカード ✨
      </div>
      <div class="cheer-name-big" style="color:#92400e;">${name}</div>
      <div class="cheer-bubble-big" style="background:#fffbeb;border-color:#fde68a;">
        「きみは ぼくの いちばんの ともだちだよ！」
      </div>
      <div style="font-size:0.85rem;color:#b45309;font-weight:700;margin-top:4px;">なかよし度 MAX！</div>
      <div style="margin-top:8px;font-size:1.3rem;color:#f59e0b;letter-spacing:3px;">♥♥♥♥♥♥♥</div>
      <button onclick="hideOverlay(); renderPartnerSection();" class="btn-close" style="background:#f59e0b;margin-top:12px;">すごい！</button>
    </div>
  `;
  overlay.style.display = 'flex';

  const container = document.getElementById('maxParticles');
  const symbols = ['✦','⭐','👑','💛','✧','🌟','♥','✦'];
  const colors = ['#f59e0b','#fbbf24','#f97316','#fcd34d','#eab308','#d97706'];
  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.className = 'feed-particle';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const x = -100 + Math.random() * 200;
    const y = -120 - Math.random() * 100;
    el.style.cssText = `
      --tx: ${x}px; --ty: ${y}px;
      --color: ${colors[Math.floor(Math.random() * colors.length)]};
      --delay: ${Math.random() * 0.6}s;
      --size: ${1.0 + Math.random() * 1.5}rem;
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
      <button onclick="hideOverlay();" class="btn-close" style="background:#9ca3af;margin-top:12px;font-size:0.85rem;">あとでえらぶ</button>
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

  // 世代ごとにグループ化
  let sections = '';
  for (let g = 1; g <= 9; g++) {
    const genInfo = GEN_INFO[g];
    if (!genInfo) continue;
    const genIds = allIds.filter(id => findPokeGen(id) === g);
    const genGot = genIds.filter(id => gachaData.collection.includes(id)).length;

    const cards = genIds.map(id => {
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

    sections += `
      <div style="margin-bottom:12px;">
        <div style="font-weight:900;font-size:0.9rem;padding:6px 0;color:var(--orange);border-bottom:2px solid var(--g200);margin-bottom:6px;">
          ${genInfo.label}　<span style="font-size:0.75rem;color:var(--g400);">${genGot}／${genIds.length}</span>
        </div>
        <div class="zukan-grid">${cards}</div>
      </div>`;
  }

  showOverlay(`
    <div class="zukan-panel">
      <div class="zukan-header">
        <div class="zukan-title">ずかん ${got}／${total}</div>
        <button onclick="hideOverlay()" class="btn-close-sm">とじる</button>
      </div>
      ${sections}
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

  const canSearch = gachaData.points >= 50;
  const favCount = gachaData.favorites.length;

  showOverlay(`
    <div class="interact-card">
      ${partnerHtml}
      <div style="font-size:0.85rem;color:var(--g400);font-weight:700;margin:8px 0;">💰 ${gachaData.points}pt</div>
      <div class="reward-actions">
        <button onclick="hideOverlay();feedPartner();" class="reward-btn reward-btn-feed" ${canFeed?'':'disabled'}>🍬 おやつ (3pt)</button>
        <button onclick="hideOverlay();useSearchTicket('ともだちさがし');" class="reward-btn" style="background:#10b981;color:#fff;" ${canSearch?'':'disabled'}>🔍 ともだちさがし (50pt)</button>
        <button onclick="hideOverlay();showFavoritesSelect();" class="reward-btn" style="background:#8b5cf6;color:#fff;">⭐ おきにいり (${favCount}/3)</button>
        <button onclick="hideOverlay();showZukan();" class="reward-btn" style="background:#6366f1;color:#fff;">📖 ずかん</button>
        <button onclick="hideOverlay();" class="reward-btn reward-btn-close">もどる</button>
      </div>
    </div>
  `);
}

// ====================================================
//  おきにいり選択画面
// ====================================================
function showFavoritesSelect() {
  const owned = gachaData.collection.slice(); // パートナー含む全員
  const favSet = new Set(gachaData.favorites);

  const cards = owned.map(id => {
    const name = findPokeName(id);
    const isFav = favSet.has(id);
    const level = getFriendshipLevel(id);
    return `<div class="zukan-cell owned" style="cursor:pointer;${isFav ? 'background:#fef3c7;border:2px solid #f59e0b;' : ''}"
      onclick="toggleFavorite(${id})">
      <img src="${SPRITE_URL}${id}.png" class="zukan-sprite" alt="${name}">
      <div class="zukan-name">${isFav ? '⭐' : ''} ${name}</div>
      <div style="font-size:0.6rem;color:var(--g400);">Lv.${level}</div>
    </div>`;
  }).join('');

  showOverlay(`
    <div class="zukan-panel">
      <div class="zukan-header">
        <div class="zukan-title">⭐ おきにいり (${gachaData.favorites.length}/3)</div>
        <button onclick="hideOverlay()" class="btn-close-sm">とじる</button>
      </div>
      <div style="font-size:0.8rem;color:var(--g400);padding:0 8px 8px;font-weight:700;">
        しゅっぱつのとき、おきにいりの子のなかよし度がアップ！（3匹まで）
      </div>
      <div class="zukan-grid">${cards}</div>
    </div>
  `);
}

function toggleFavorite(pokeId) {
  const idx = gachaData.favorites.indexOf(pokeId);
  if (idx >= 0) {
    gachaData.favorites.splice(idx, 1);
  } else {
    if (gachaData.favorites.length >= 3) {
      gachaData.favorites.shift(); // 古い方を外す
    }
    gachaData.favorites.push(pokeId);
  }
  saveGachaData();
  showFavoritesSelect(); // 再描画
}

// ====================================================
//  ただいま時のポケモン遭遇
// ====================================================
const ENCOUNTER_RATE = 0.15; // 15%（2日に1匹ペース）
const ENCOUNTER_RARITY = { C: 0.80, R: 0.98, SR: 1.0 }; // 累積: C80%, R18%, SR2%

function tryEncounter(ev) {
  if (Math.random() > ENCOUNTER_RATE) return false;
  if (gachaData.collection.length === 0) return false; // スターター未選択

  // レア度抽選（埋まった枠は他の枠に振り替え）
  const roll = Math.random();
  let rarity = roll < ENCOUNTER_RARITY.C ? 'C' : roll < ENCOUNTER_RARITY.R ? 'R' : 'SR';

  // 振り替えロジック: 該当枠が全て埋まっていたら未所持がある枠へ
  const rarities = ['C', 'R', 'SR'];
  const hasUnowned = r => POKEDEX.some(p => p.r === r && !gachaData.collection.includes(p.id));
  if (!hasUnowned(rarity)) {
    const fallback = rarities.find(r => hasUnowned(r));
    if (!fallback) { /* 全コンプ済み → ダブり許容 */ }
    else { rarity = fallback; }
  }

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
        <div style="font-size:0.75rem;color:#888;margin-top:2px;">${GEN_INFO[findPokeGen(poke.id)]?.label || ''}</div>
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
