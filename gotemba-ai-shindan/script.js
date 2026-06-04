/* ========================================
   御殿場AIムダ仕事発見器 - ロジック
   ========================================
   主な設定箇所：
   - CONTACT_URL：問い合わせ先URLをここで変更
   - questions：質問・選択肢の内容
   - diagnosisTypes：診断タイプの説明文など
   - scoringRules：スコア計算ルール
   ======================================== */

// ▼▼▼ 問い合わせ先URLはここを変更してください ▼▼▼
const CONTACT_URL = "https://example.com/contact";
// ▲▲▲ ここまで ▲▲▲

// localStorage に保存するときのキー名
const STORAGE_KEY = "gotemba_ai_shindan_results";


/* ----------------------------------------
   質問データ
   type: "radio" = 単一選択 / "checkbox" = 複数選択
---------------------------------------- */
const questions = [
  {
    id: "q1",
    number: "Q1",
    text: "あなたの業種を教えてください",
    hint: null,
    type: "radio",
    options: [
      "飲食店",
      "小売店",
      "宿泊施設",
      "美容室・サロン・整体院",
      "建設・工務店",
      "教育・学習塾",
      "士業",
      "その他サービス業",
      "その他",
    ],
  },
  {
    id: "q2",
    number: "Q2",
    text: "一番面倒だと感じている作業は何ですか？",
    hint: null,
    type: "radio",
    options: [
      "問い合わせ返信",
      "SNS投稿",
      "Google口コミ返信",
      "書類作成",
      "見積書・提案文の作成",
      "マニュアル作成",
      "スタッフ教育",
      "Excel・表作業",
      "外国人対応",
      "その他",
    ],
  },
  {
    id: "q3",
    number: "Q3",
    text: "その作業はどれくらいの頻度で発生しますか？",
    hint: null,
    type: "radio",
    options: ["毎日", "週に数回", "月に数回", "たまに", "わからない"],
  },
  {
    id: "q4",
    number: "Q4",
    text: "その作業に月どれくらい時間を使っていますか？",
    hint: null,
    type: "radio",
    options: [
      "1〜3時間",
      "4〜10時間",
      "11〜20時間",
      "21時間以上",
      "わからない",
    ],
  },
  {
    id: "q5",
    number: "Q5",
    text: "現在よく使っているツールは何ですか？",
    hint: "複数選択できます",
    type: "checkbox",
    options: [
      "LINE",
      "Gmail",
      "Excel",
      "Googleフォーム",
      "Instagram",
      "Googleビジネスプロフィール",
      "紙のメモ",
      "Word",
      "特になし",
      "その他",
    ],
  },
  {
    id: "q6",
    number: "Q6",
    text: "AIを使ったことはありますか？",
    hint: null,
    type: "radio",
    options: [
      "よく使っている",
      "少し使ったことがある",
      "聞いたことはある",
      "ほとんど知らない",
    ],
  },
  {
    id: "q7",
    number: "Q7",
    text: "改善できたら一番うれしいことは何ですか？",
    hint: null,
    type: "radio",
    options: [
      "作業時間を減らしたい",
      "売上・集客を増やしたい",
      "ミスを減らしたい",
      "スタッフ教育を楽にしたい",
      "文章作成を楽にしたい",
      "外国人対応を強化したい",
      "何から始めればよいか知りたい",
    ],
  },
];


/* ----------------------------------------
   診断タイプデータ
   6つのタイプそれぞれの説明・AIでできること・最初の一手など
---------------------------------------- */
const diagnosisTypes = {
  type1: {
    name: "返信に追われる\n番頭タイプ",
    description:
      "日々の問い合わせや連絡対応に時間を取られている可能性があります。同じような質問への返信を毎回考えている場合、AIで返信文のたたき台やFAQを作ることで負担を減らせます。",
    aiThings: [
      "よくある質問への返信テンプレ作成",
      "LINE返信文のたたき台作成",
      "メール返信文の作成",
      "FAQページの作成",
    ],
    firstStep:
      "よくある問い合わせを10個書き出し、それぞれに対する返信テンプレを作る。",
    time: "月3〜8時間",
    difficulty: "低",
  },
  type2: {
    name: "SNSネタ切れ\n店長タイプ",
    description:
      "SNS投稿や集客のための文章作成に負担を感じている可能性があります。AIを使うことで、季節・商品・イベントに合わせた投稿案をまとめて作ることができます。",
    aiThings: [
      "Instagram投稿文の作成",
      "1か月分の投稿カレンダー作成",
      "Googleビジネスプロフィール投稿文の作成",
      "キャンペーン告知文の作成",
    ],
    firstStep:
      "今月おすすめしたい商品・サービスを3つ書き出し、投稿文のたたき台を作る。",
    time: "月4〜8時間",
    difficulty: "低",
  },
  type3: {
    name: "口コミ放置\nタイプ",
    description:
      "Google口コミやレビューへの返信が後回しになっている可能性があります。AIを使うことで、丁寧で自然な返信文を短時間で作成できます。",
    aiThings: [
      "良い口コミへの返信文作成",
      "悪い口コミへの丁寧な返信文作成",
      "店舗の雰囲気に合った返信テンプレ作成",
      "口コミ返信ルールの作成",
    ],
    firstStep: "過去の口コミを5件選び、返信文テンプレを作る。",
    time: "月2〜6時間",
    difficulty: "低",
  },
  type4: {
    name: "Excel職人依存\nタイプ",
    description:
      "Excelや表作業が一部の人に依存している可能性があります。AIを使うことで、作業手順の説明、関数の補助、チェックリスト作成などができます。",
    aiThings: [
      "Excel作業手順書の作成",
      "入力チェックリストの作成",
      "関数の説明文作成",
      "月次作業の手順整理",
    ],
    firstStep:
      "毎月行っているExcel作業を1つ選び、手順を文章化する。",
    time: "月5〜12時間",
    difficulty: "中",
  },
  type5: {
    name: "頭の中だけ経営\nタイプ",
    description:
      "業務のやり方が社長やベテランスタッフの頭の中にあり、共有しづらくなっている可能性があります。AIを使うことで、口頭説明やメモからマニュアル・チェックリストを作れます。",
    aiThings: [
      "業務マニュアル作成",
      "新人教育用チェックリスト作成",
      "作業手順書の作成",
      "接客ルールの整理",
    ],
    firstStep:
      "新人に教えるのが大変な作業を1つ選び、手順を箇条書きで書き出す。",
    time: "月4〜10時間",
    difficulty: "中",
  },
  type6: {
    name: "外国人観光客ちょっと\n困るタイプ",
    description:
      "外国人観光客への案内や説明に不安がある可能性があります。AIを使うことで、英語案内文、メニュー説明、よくある質問への回答を作成できます。",
    aiThings: [
      "英語メニュー説明の作成",
      "店舗案内文の多言語化",
      "外国人向けFAQ作成",
      "接客フレーズ集作成",
    ],
    firstStep:
      "外国人のお客様からよく聞かれる質問を5つ書き出し、英語の回答例を作る。",
    time: "月3〜8時間",
    difficulty: "中",
  },
};


/* ----------------------------------------
   スコアリングルール
   各タイプに対して、回答内容に応じた加算ポイントを定義
   question: 質問ID / value: 回答値 / score: 加算点
---------------------------------------- */
const scoringRules = {
  type1: [
    { question: "q2", value: "問い合わせ返信", score: 3 },
    { question: "q5", value: "LINE", score: 1 },
    { question: "q5", value: "Gmail", score: 1 },
    { question: "q3", value: "毎日", score: 1 },
    { question: "q7", value: "作業時間を減らしたい", score: 1 },
  ],
  type2: [
    { question: "q2", value: "SNS投稿", score: 3 },
    { question: "q5", value: "Instagram", score: 2 },
    { question: "q7", value: "売上・集客を増やしたい", score: 1 },
    { question: "q7", value: "文章作成を楽にしたい", score: 1 },
  ],
  type3: [
    { question: "q2", value: "Google口コミ返信", score: 3 },
    { question: "q5", value: "Googleビジネスプロフィール", score: 2 },
    { question: "q7", value: "売上・集客を増やしたい", score: 1 },
    { question: "q7", value: "文章作成を楽にしたい", score: 1 },
  ],
  type4: [
    { question: "q2", value: "Excel・表作業", score: 3 },
    { question: "q5", value: "Excel", score: 2 },
    { question: "q7", value: "ミスを減らしたい", score: 1 },
    { question: "q2", value: "書類作成", score: 1 },
  ],
  type5: [
    { question: "q2", value: "マニュアル作成", score: 2 },
    { question: "q2", value: "スタッフ教育", score: 3 },
    { question: "q5", value: "紙のメモ", score: 1 },
    { question: "q7", value: "スタッフ教育を楽にしたい", score: 2 },
  ],
  type6: [
    { question: "q2", value: "外国人対応", score: 3 },
    { question: "q1", value: "宿泊施設", score: 1 },
    { question: "q1", value: "飲食店", score: 1 },
    { question: "q1", value: "小売店", score: 1 },
    { question: "q7", value: "外国人対応を強化したい", score: 2 },
  ],
};

/* 同点時、Q2の回答値に応じてどのタイプを優先するかのマッピング */
const q2TypeMap = {
  "問い合わせ返信": "type1",
  "SNS投稿": "type2",
  "Google口コミ返信": "type3",
  "書類作成": "type4",
  "見積書・提案文の作成": "type1",
  "マニュアル作成": "type5",
  "スタッフ教育": "type5",
  "Excel・表作業": "type4",
  "外国人対応": "type6",
  "その他": null,
};

/* 最終的な優先順位（同点でQ2でも決まらない場合） */
const typePriority = ["type1", "type2", "type3", "type4", "type5", "type6"];


/* ========================================
   状態管理
   currentQuestion: 現在表示している質問番号（0始まり）
   answers: { q1: "xxx", q2: "xxx", q5: ["xxx","yyy"], ... }
======================================== */
let currentQuestion = 0;
const answers = {};


/* ========================================
   画面遷移ヘルパー
======================================== */
function showPage(pageId) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");
  window.scrollTo(0, 0);
}


/* ========================================
   診断スタート
======================================== */
function startDiagnosis() {
  currentQuestion = 0;
  // answers を初期化
  for (const key in answers) delete answers[key];

  renderQuestion();
  showPage("form-page");
}


/* ========================================
   質問を描画する
======================================== */
function renderQuestion() {
  const q = questions[currentQuestion];
  const total = questions.length;

  // プログレスバー更新
  const pct = ((currentQuestion + 1) / total) * 100;
  document.getElementById("progress-fill").style.width = pct + "%";
  document.getElementById("progress-text").textContent =
    `質問 ${currentQuestion + 1} / ${total}`;

  // 「戻る」ボタンの表示制御
  document.getElementById("back-btn").style.display =
    currentQuestion === 0 ? "none" : "block";

  // 「次へ」ボタンのラベル
  document.getElementById("next-btn").textContent =
    currentQuestion === total - 1 ? "診断結果を見る →" : "次へ →";

  // 選択肢HTML生成
  const optionsHtml = q.options
    .map((opt) => {
      const checked = isChecked(q.id, q.type, opt) ? "checked" : "";
      return `
        <li class="option-item ${q.type === "checkbox" ? "checkbox" : ""}">
          <input
            type="${q.type}"
            name="${q.id}"
            id="${q.id}_${opt}"
            value="${opt}"
            ${checked}
            onchange="onAnswerChange('${q.id}', '${q.type}', this)"
          >
          <label class="option-label" for="${q.id}_${opt}">${opt}</label>
        </li>
      `;
    })
    .join("");

  document.getElementById("question-container").innerHTML = `
    <div class="question-block">
      <p class="question-number">${q.number} / ${total}</p>
      <p class="question-text">${q.text}</p>
      ${q.hint ? `<p class="question-hint">※ ${q.hint}</p>` : ""}
      <ul class="options-list">${optionsHtml}</ul>
    </div>
  `;
}

/* すでに回答済みかチェックするヘルパー */
function isChecked(qId, type, value) {
  if (!answers[qId]) return false;
  if (type === "checkbox") return answers[qId].includes(value);
  return answers[qId] === value;
}


/* ========================================
   回答が変わったときの処理
======================================== */
function onAnswerChange(qId, type, el) {
  if (type === "checkbox") {
    // チェックボックス：配列で管理
    if (!answers[qId]) answers[qId] = [];
    if (el.checked) {
      if (!answers[qId].includes(el.value)) answers[qId].push(el.value);
    } else {
      answers[qId] = answers[qId].filter((v) => v !== el.value);
    }
  } else {
    // ラジオボタン：単一値
    answers[qId] = el.value;
  }
}


/* ========================================
   「次へ」ボタン
======================================== */
function goNext() {
  const q = questions[currentQuestion];

  // 未回答チェック
  if (!isAnswered(q)) {
    alert("選択肢を選んでください。");
    return;
  }

  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
    window.scrollTo(0, 0);
  } else {
    // 最後の質問 → 結果表示
    showResult();
  }
}

/* ========================================
   「戻る」ボタン
======================================== */
function goBack() {
  if (currentQuestion > 0) {
    currentQuestion--;
    renderQuestion();
    window.scrollTo(0, 0);
  }
}

/* 回答済みかチェックするヘルパー */
function isAnswered(q) {
  if (!answers[q.id]) return false;
  if (q.type === "checkbox") return answers[q.id].length > 0;
  return answers[q.id] !== "";
}


/* ========================================
   スコア計算 → 診断タイプ判定
======================================== */
function calculateResult() {
  const scores = { type1: 0, type2: 0, type3: 0, type4: 0, type5: 0, type6: 0 };

  // 各タイプのルールに従ってスコアを加算
  for (const [typeKey, rules] of Object.entries(scoringRules)) {
    for (const rule of rules) {
      const ans = answers[rule.question];
      if (!ans) continue;
      // checkboxは配列、radioは文字列
      const matched = Array.isArray(ans)
        ? ans.includes(rule.value)
        : ans === rule.value;
      if (matched) scores[typeKey] += rule.score;
    }
  }

  // 最高スコアを取得
  const maxScore = Math.max(...Object.values(scores));

  // 同点タイプを抽出
  const tiedTypes = Object.keys(scores).filter((k) => scores[k] === maxScore);

  if (tiedTypes.length === 1) return tiedTypes[0];

  // 同点の場合：Q2の回答に最も関連するタイプを優先
  const q2Answer = answers["q2"];
  if (q2Answer && q2TypeMap[q2Answer]) {
    const q2Type = q2TypeMap[q2Answer];
    if (tiedTypes.includes(q2Type)) return q2Type;
  }

  // それでも決まらない場合：優先順位リストの先頭にあるタイプ
  for (const t of typePriority) {
    if (tiedTypes.includes(t)) return t;
  }

  return "type1"; // フォールバック
}


/* ========================================
   結果を表示する
======================================== */
function showResult() {
  const typeKey = calculateResult();
  const type = diagnosisTypes[typeKey];

  // タイプ名（改行コードを<br>に変換）
  document.getElementById("result-type-name").innerHTML =
    type.name.replace(/\n/g, "<br>");

  // 説明文
  document.getElementById("result-description").textContent = type.description;

  // AIでできること（リスト）
  document.getElementById("result-ai-things").innerHTML = type.aiThings
    .map((item) => `<li>${item}</li>`)
    .join("");

  // 最初の一手
  document.getElementById("result-first-step").textContent = type.firstStep;

  // 想定削減時間
  document.getElementById("result-time").textContent = type.time;

  // 導入難易度
  document.getElementById("result-difficulty").textContent = type.difficulty;

  // 問い合わせボタンのURL設定
  document.getElementById("contact-btn").href = CONTACT_URL;

  // 診断結果を localStorage に保存
  saveResultToStorage(typeKey);

  showPage("result-page");
}


/* ========================================
   localStorage：診断結果を保存する
   保存形式: { results: [ { id, timestamp, typeKey, typeName, answers }, ... ] }
======================================== */
function saveResultToStorage(typeKey) {
  const type = diagnosisTypes[typeKey];

  // 既存データを読み込む（なければ空配列）
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"results":[]}');

  // 新しいレコードを追加
  stored.results.push({
    id: Date.now(),                          // 一意なID（ミリ秒タイムスタンプ）
    timestamp: new Date().toISOString(),     // 診断日時
    typeKey: typeKey,                        // 例: "type2"
    typeName: type.name.replace(/\n/g, ""), // 例: "SNSネタ切れ店長タイプ"
    answers: Object.assign({}, answers),    // 回答のスナップショット
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

/* localStorage から全診断結果を取得するヘルパー（将来の集計用） */
function loadResultsFromStorage() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"results":[]}').results;
}


/* ========================================
   「もう一度診断する」ボタン
======================================== */
function retryDiagnosis() {
  showPage("top-page");
}
