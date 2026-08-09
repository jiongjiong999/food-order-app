-- 家常菜馆 · 订单表
-- 在 Supabase SQL Editor 中运行此脚本

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL DEFAULT '[]',
  total REAL NOT NULL DEFAULT 0,
  count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_name TEXT NOT NULL DEFAULT '匿名',
  created_at TEXT NOT NULL DEFAULT '',
  created BIGINT NOT NULL DEFAULT 0
);

-- 禁用行级安全（允许匿名访问）
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- 启用实时订阅
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- 创建索引（按时间倒序查询更快）
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created DESC);
