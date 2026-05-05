-- =============================================
-- RateMe — Fix Public Figure Achievement Categories
-- Run this to correct any rows inserted by an older version of the seed.
-- Safe to re-run: uses UPDATE … WHERE title = … so no rows are added/removed.
--
-- Formula: points = category_weight × impact_level
--   global_impact: 110  technology: 110
--   human_rights:  90   sports:     90
--   business:      75   education:  50
-- =============================================

-- ── Elon Musk (00000000-0000-0000-0000-000000000001) ────────────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 3, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'Economics – Wharton School, UPenn';

UPDATE public.achievements
SET category = 'education', impact_level = 3, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'Physics – University of Pennsylvania';

UPDATE public.achievements
SET category = 'business', impact_level = 2, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'Zip2';

UPDATE public.achievements
SET category = 'technology', impact_level = 4, points = 440
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'X.com / PayPal';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'SpaceX';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'Tesla, Inc.';

UPDATE public.achievements
SET category = 'technology', impact_level = 4, points = 440
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'Neuralink';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'CEO – Tesla, Inc.';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000001'
  AND title = 'CEO – SpaceX';


-- ── Bill Gates (00000000-0000-0000-0000-000000000002) ───────────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 1, points = 50
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Lakeside School, Seattle';

UPDATE public.achievements
SET category = 'education', impact_level = 2, points = 100
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Harvard University (attended)';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Microsoft Corporation';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Chairman & CEO – Microsoft';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Co-Chair – Bill & Melinda Gates Foundation';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000002'
  AND title = 'Bill & Melinda Gates Foundation – Philanthropy';


-- ── Steve Jobs (00000000-0000-0000-0000-000000000003) ───────────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 1, points = 50
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'Homestead High School, Cupertino';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'Apple Computer';

UPDATE public.achievements
SET category = 'technology', impact_level = 4, points = 440
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'NeXT Computer';

UPDATE public.achievements
SET category = 'business', impact_level = 4, points = 300
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'Pixar Animation Studios';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'CEO – Apple Inc.';

UPDATE public.achievements
SET category = 'business', impact_level = 3, points = 225
WHERE user_id = '00000000-0000-0000-0000-000000000003'
  AND title = 'CEO – NeXT Computer';


-- ── Jeff Bezos (00000000-0000-0000-0000-000000000004) ───────────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 4, points = 200
WHERE user_id = '00000000-0000-0000-0000-000000000004'
  AND title = 'Computer Science & Electrical Engineering – Princeton';

UPDATE public.achievements
SET category = 'business', impact_level = 3, points = 225
WHERE user_id = '00000000-0000-0000-0000-000000000004'
  AND title = 'VP – D. E. Shaw & Co.';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000004'
  AND title = 'Amazon.com';

UPDATE public.achievements
SET category = 'technology', impact_level = 4, points = 440
WHERE user_id = '00000000-0000-0000-0000-000000000004'
  AND title = 'Blue Origin';

UPDATE public.achievements
SET category = 'technology', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000004'
  AND title = 'Founder & CEO – Amazon';


-- ── Cristiano Ronaldo (00000000-0000-0000-0000-000000000005) ────────────────
UPDATE public.achievements
SET category = 'sports', impact_level = 4, points = 360
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = 'Manchester United';

UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = 'Real Madrid';

UPDATE public.achievements
SET category = 'sports', impact_level = 3, points = 270
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = 'Juventus FC';

UPDATE public.achievements
SET category = 'sports', impact_level = 2, points = 180
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = 'Al Nassr FC';

UPDATE public.achievements
SET category = 'business', impact_level = 4, points = 300
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = 'CR7 Brand';

UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = '5× UEFA Champions League Winner';

UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000005'
  AND title = '5× Ballon d''Or';


-- ── Lionel Messi (00000000-0000-0000-0000-000000000006) ─────────────────────
UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = 'FC Barcelona';

UPDATE public.achievements
SET category = 'sports', impact_level = 3, points = 270
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = 'Paris Saint-Germain';

UPDATE public.achievements
SET category = 'sports', impact_level = 2, points = 180
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = 'Inter Miami CF';

UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = '8× Ballon d''Or';

UPDATE public.achievements
SET category = 'sports', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = 'FIFA World Cup Winner – Argentina 2022';

UPDATE public.achievements
SET category = 'business', impact_level = 2, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000006'
  AND title = 'MiM Hotels';


-- ── Oprah Winfrey (00000000-0000-0000-0000-000000000007) ────────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 3, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000007'
  AND title = 'Communications – Tennessee State University';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000007'
  AND title = 'Host – The Oprah Winfrey Show';

UPDATE public.achievements
SET category = 'business', impact_level = 4, points = 300
WHERE user_id = '00000000-0000-0000-0000-000000000007'
  AND title = 'Harpo Productions';

UPDATE public.achievements
SET category = 'business', impact_level = 3, points = 225
WHERE user_id = '00000000-0000-0000-0000-000000000007'
  AND title = 'OWN: Oprah Winfrey Network';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 4, points = 440
WHERE user_id = '00000000-0000-0000-0000-000000000007'
  AND title = 'Oprah Winfrey Foundation';


-- ── Albert Einstein (00000000-0000-0000-0000-000000000008) ──────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 5, points = 250
WHERE user_id = '00000000-0000-0000-0000-000000000008'
  AND title = 'Physics & Mathematics – ETH Zürich';

UPDATE public.achievements
SET category = 'education', impact_level = 5, points = 250
WHERE user_id = '00000000-0000-0000-0000-000000000008'
  AND title = 'PhD in Physics – University of Zurich';

-- Key fix: was education/2/100, now technology/2/220
UPDATE public.achievements
SET category = 'technology', impact_level = 2, points = 220
WHERE user_id = '00000000-0000-0000-0000-000000000008'
  AND title = 'Patent Examiner – Swiss Patent Office';

-- Key fix: was education/4/200, now global_impact/5/550
UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000008'
  AND title = 'Professor – Institute for Advanced Study, Princeton';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000008'
  AND title = 'Nobel Prize in Physics, 1921';


-- ── Nelson Mandela (00000000-0000-0000-0000-000000000009) ───────────────────
UPDATE public.achievements
SET category = 'education', impact_level = 1, points = 50
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'Clarkebury Boarding Institute';

UPDATE public.achievements
SET category = 'education', impact_level = 3, points = 150
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'Law – University of South Africa';

UPDATE public.achievements
SET category = 'human_rights', impact_level = 4, points = 360
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'Umkhonto we Sizwe (MK)';

UPDATE public.achievements
SET category = 'human_rights', impact_level = 5, points = 450
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'Anti-Apartheid Movement';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'President of South Africa (1994–1999)';

UPDATE public.achievements
SET category = 'global_impact', impact_level = 5, points = 550
WHERE user_id = '00000000-0000-0000-0000-000000000009'
  AND title = 'Nobel Peace Prize, 1993';
