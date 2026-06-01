-- ============================================================
-- CRM: customers & deals
-- Supabase SQL Editor で一発実行可能
-- ============================================================


-- ------------------------------------------------------------
-- 1. クリーンアップ（初回実行でも安全）
--    CASCADE によりトリガ・ポリシーごと削除される
-- ------------------------------------------------------------
DROP TABLE IF EXISTS deals     CASCADE;
DROP TABLE IF EXISTS customers CASCADE;


-- ------------------------------------------------------------
-- 2. customers テーブル
-- ------------------------------------------------------------
CREATE TABLE customers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company    text        NOT NULL,
  name       text        NOT NULL,
  title      text,
  email      text,
  phone      text,
  memo       text,
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- 3. deals テーブル
-- ------------------------------------------------------------
CREATE TABLE deals (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid        NOT NULL
                          REFERENCES customers(id) ON DELETE CASCADE,
  title       text        NOT NULL,
  amount      numeric,
  status      text,
  memo        text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);


-- ------------------------------------------------------------
-- 4. RLS 有効化
-- ------------------------------------------------------------
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals     ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- 5. customers ポリシー（Publishable key = anon ロールで全操作許可）
-- ------------------------------------------------------------
CREATE POLICY "anon_customers_select"
  ON customers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_customers_insert"
  ON customers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_customers_update"
  ON customers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_customers_delete"
  ON customers FOR DELETE
  TO anon
  USING (true);


-- ------------------------------------------------------------
-- 6. deals ポリシー（同上）
-- ------------------------------------------------------------
CREATE POLICY "anon_deals_select"
  ON deals FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "anon_deals_insert"
  ON deals FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "anon_deals_update"
  ON deals FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_deals_delete"
  ON deals FOR DELETE
  TO anon
  USING (true);


-- ------------------------------------------------------------
-- 7. 初期データ: customers 3件
--    固定 UUID を使うことで deals の customer_id と確実に紐付く
-- ------------------------------------------------------------
INSERT INTO customers (id, company, name, title, email, phone, memo) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '株式会社サンプル',
    '山田 太郎',
    '営業部長',
    'yamada@sample.co.jp',
    '03-0000-0001',
    '大口顧客。毎年更新あり'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'テスト商事株式会社',
    '鈴木 花子',
    '購買部長',
    'suzuki@test-corp.co.jp',
    '06-0000-0002',
    '定期発注あり。担当窓口は花子さん'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'デモ工業株式会社',
    '佐藤 次郎',
    'CEO',
    'sato@demo-industry.jp',
    '052-000-0003',
    '新規開拓。決裁者が佐藤社長のみ'
  );


-- ------------------------------------------------------------
-- 8. 初期データ: deals 5件
-- ------------------------------------------------------------
-- status は アプリの STATUS_ORDER に合わせて lead / proposal / won を使用
INSERT INTO deals (customer_id, title, amount, status, memo) VALUES
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    'ERPシステム導入',
    5000000,
    'proposal',
    '来月デモ予定。IT部門の承認待ち'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000001',
    '保守サポート契約',
    1200000,
    'won',
    '年間契約。自動更新設定済み'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    '在庫管理システム',
    3000000,
    'proposal',
    '見積もり送付済み。先方検討中'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000002',
    'トレーニングサービス',
    500000,
    'lead',
    '他社とも比較検討中'
  ),
  (
    'aaaaaaaa-0000-0000-0000-000000000003',
    'クラウド移行支援',
    8000000,
    'lead',
    '先月初訪問。来月提案書提出予定'
  );
