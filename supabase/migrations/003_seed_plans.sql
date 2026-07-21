-- =========================================================
-- Sanad — Seed Default Plans
-- Based on 02_MASTER_BUILD_PROMPT.md Section 7
-- =========================================================

insert into public.plans (name, slug, price_pkr_monthly, price_pkr_yearly, max_students, max_staff, storage_limit_mb, features) values
  ('Trial', 'trial', 0, 0, 100, 20, 500, '{"all": true}'),
  ('Starter', 'starter', 2999, 29990, 100, 30, 1000, '{"all": true}'),
  ('Growth', 'growth', 7999, 79990, 500, 100, 5000, '{"all": true}'),
  ('Institution', 'institution', 15999, 159990, 1500, 300, 20000, '{"all": true}'),
  ('Enterprise', 'enterprise', 0, 0, null, null, null, '{"all": true}');
