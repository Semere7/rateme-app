-- =============================================
-- RateMe — Public Figure Seed Data (Weighted Scoring)
-- Run AFTER public_figures_schema.sql AND weighted_scoring_schema.sql
-- Safe to re-run: deletes and re-inserts all public figures
--
-- Formula: points = category_weight × impact_level
--   global_impact: 110  technology: 110
--   human_rights:  90   sports:     90
--   business:      75   education:  50
-- =============================================

DELETE FROM public.profiles WHERE profile_type = 'public_figure';

-- =============================================
-- Profiles
-- =============================================
INSERT INTO public.profiles (id, username, full_name, bio, avatar_url, profile_type) VALUES

  ('00000000-0000-0000-0000-000000000001',
   'elonmusk', 'Elon Musk',
   'Entrepreneur and business magnate. CEO of Tesla and SpaceX, founder of Neuralink and The Boring Company.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000002',
   'billgates', 'Bill Gates',
   'Co-founder of Microsoft. Philanthropist dedicated to global health, poverty reduction, and education through the Gates Foundation.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000003',
   'stevejobs', 'Steve Jobs',
   'Co-founder of Apple Inc., NeXT Computer, and Pixar. Visionary pioneer of personal computing and consumer electronics.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000004',
   'jeffbezos', 'Jeff Bezos',
   'Founder of Amazon and Blue Origin. Transformed global e-commerce, cloud computing, and commercial spaceflight.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000005',
   'cristiano', 'Cristiano Ronaldo',
   '5× Champions League winner, 5× Ballon d''Or recipient. All-time leading international goalscorer.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000006',
   'leomessi', 'Lionel Messi',
   'Record 8× Ballon d''Or winner. Led Argentina to FIFA World Cup glory in 2022.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000007',
   'oprahwinfrey', 'Oprah Winfrey',
   'Media executive, philanthropist, and host of the highest-rated daytime talk show in history. Founder of Harpo Productions.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000008',
   'alberteinstein', 'Albert Einstein',
   'Theoretical physicist who developed the theory of relativity. Nobel Prize in Physics, 1921.',
   '', 'public_figure'),

  ('00000000-0000-0000-0000-000000000009',
   'nelsonmandela', 'Nelson Mandela',
   'Anti-apartheid revolutionary and first democratically elected President of South Africa. Nobel Peace Prize, 1993.',
   '', 'public_figure');


-- =============================================
-- Achievements  (category · impact_level · points = weight × level)
-- =============================================

-- ── Elon Musk  (total: 3,530 pts) ────────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000001','bachelor','education',3,
   'Economics – Wharton School, UPenn',
   'Bachelor of Science in Economics from the Wharton School, University of Pennsylvania.',
   150,'verified'),  -- 50×3

  ('00000000-0000-0000-0000-000000000001','bachelor','education',3,
   'Physics – University of Pennsylvania',
   'Bachelor of Arts in Physics, completed alongside the Economics degree.',
   150,'verified'),  -- 50×3

  ('00000000-0000-0000-0000-000000000001','business','business',2,
   'Zip2',
   'Founded Zip2, an online city guide sold to Compaq for $307 million in 1999.',
   150,'verified'),  -- 75×2

  ('00000000-0000-0000-0000-000000000001','business','technology',4,
   'X.com / PayPal',
   'Founded X.com, which became PayPal — the first major internet payment platform. Sold to eBay for $1.5B.',
   440,'verified'),  -- 110×4

  ('00000000-0000-0000-0000-000000000001','business','technology',5,
   'SpaceX',
   'Founded Space Exploration Technologies Corp., pioneering the world''s first reusable orbital rockets.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000001','business','technology',5,
   'Tesla, Inc.',
   'Co-founded Tesla, driving the global transition to electric vehicles and sustainable energy.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000001','business','technology',4,
   'Neuralink',
   'Co-founded Neuralink to develop high-bandwidth brain-computer interface technology.',
   440,'verified'),  -- 110×4

  ('00000000-0000-0000-0000-000000000001','work_experience','technology',5,
   'CEO – Tesla, Inc.',
   'Led Tesla to become the world''s most valuable automaker, revolutionising the automotive industry.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000001','work_experience','technology',5,
   'CEO – SpaceX',
   'Founded and leads SpaceX, successfully launching the first private spacecraft to the ISS.',
   550,'verified');  -- 110×5


-- ── Bill Gates  (total: 2,350 pts) ───────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000002','high_school','education',1,
   'Lakeside School, Seattle',
   'Attended Lakeside School where he first encountered computers and co-founded Traf-O-Data.',
   50,'verified'),   -- 50×1

  ('00000000-0000-0000-0000-000000000002','course','education',2,
   'Harvard University (attended)',
   'Enrolled at Harvard College in 1973 before leaving to co-found Microsoft.',
   100,'verified'),  -- 50×2

  ('00000000-0000-0000-0000-000000000002','business','technology',5,
   'Microsoft Corporation',
   'Co-founded Microsoft in 1975, building it into the world''s largest personal computer software company.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000002','work_experience','technology',5,
   'Chairman & CEO – Microsoft',
   'Led Microsoft from a two-person startup to a global technology giant with revenues exceeding $100B.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000002','work_experience','global_impact',5,
   'Co-Chair – Bill & Melinda Gates Foundation',
   'Leads the world''s largest private charitable foundation, focused on global health and poverty.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000002','volunteering','global_impact',5,
   'Bill & Melinda Gates Foundation – Philanthropy',
   'Has committed over $50 billion to eradicating diseases, improving education, and reducing poverty worldwide.',
   550,'verified');  -- 110×5


-- ── Steve Jobs  (total: 2,115 pts) ───────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000003','high_school','education',1,
   'Homestead High School, Cupertino',
   'Attended Homestead High School where he met Steve Wozniak.',
   50,'verified'),   -- 50×1

  ('00000000-0000-0000-0000-000000000003','business','technology',5,
   'Apple Computer',
   'Co-founded Apple in 1976, revolutionising personal computing, smartphones, tablets, and digital media.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000003','business','technology',4,
   'NeXT Computer',
   'Founded NeXT in 1985; its operating system became the foundation of modern macOS and iOS.',
   440,'verified'),  -- 110×4

  ('00000000-0000-0000-0000-000000000003','business','business',4,
   'Pixar Animation Studios',
   'Acquired Pixar from George Lucas and built it into the world''s leading computer animation studio.',
   300,'verified'),  -- 75×4

  ('00000000-0000-0000-0000-000000000003','work_experience','technology',5,
   'CEO – Apple Inc.',
   'Led Apple to become the world''s most valuable company, launching the iMac, iPod, iPhone, and iPad.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000003','work_experience','business',3,
   'CEO – NeXT Computer',
   'Led NeXT from 1985 to 1997; NeXT''s acquisition by Apple paved the way for his historic return.',
   225,'verified');  -- 75×3


-- ── Jeff Bezos  (total: 1,965 pts) ───────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000004','bachelor','education',4,
   'Computer Science & Electrical Engineering – Princeton',
   'Graduated summa cum laude from Princeton University in 1986.',
   200,'verified'),  -- 50×4

  ('00000000-0000-0000-0000-000000000004','work_experience','business',3,
   'VP – D. E. Shaw & Co.',
   'Rose to Vice President at hedge fund D. E. Shaw before leaving to found Amazon.',
   225,'verified'),  -- 75×3

  ('00000000-0000-0000-0000-000000000004','business','technology',5,
   'Amazon.com',
   'Founded Amazon in 1994 from a garage — grew it from an online bookstore to the world''s largest e-commerce and cloud company.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000004','business','technology',4,
   'Blue Origin',
   'Founded Blue Origin to develop reusable launch vehicles and make space travel accessible.',
   440,'verified'),  -- 110×4

  ('00000000-0000-0000-0000-000000000004','work_experience','technology',5,
   'Founder & CEO – Amazon',
   'Built Amazon from a garage startup into a trillion-dollar company and one of the world''s largest employers.',
   550,'verified');  -- 110×5


-- ── Cristiano Ronaldo  (total: 2,460 pts) ────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000005','work_experience','sports',4,
   'Manchester United',
   'Two stints at Manchester United (2003–2009, 2021–2023), winning the Premier League 3× and Champions League once.',
   360,'verified'),  -- 90×4

  ('00000000-0000-0000-0000-000000000005','work_experience','sports',5,
   'Real Madrid',
   'Spent nine seasons at Real Madrid (2009–2018), scoring 450 goals and winning 4 Champions League titles.',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000005','work_experience','sports',3,
   'Juventus FC',
   'Spent three seasons at Juventus (2018–2021), winning 2 Serie A titles.',
   270,'verified'),  -- 90×3

  ('00000000-0000-0000-0000-000000000005','work_experience','sports',2,
   'Al Nassr FC',
   'Joined Al Nassr in 2023, breaking multiple Saudi Pro League scoring records.',
   180,'verified'),  -- 90×2

  ('00000000-0000-0000-0000-000000000005','business','business',4,
   'CR7 Brand',
   'Built the CR7 global brand encompassing hotels, fragrance, clothing, and gyms.',
   300,'verified'),  -- 75×4

  ('00000000-0000-0000-0000-000000000005','certification','sports',5,
   '5× UEFA Champions League Winner',
   'Won the Champions League with Manchester United (2008) and Real Madrid (2014, 2016, 2017, 2018).',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000005','certification','sports',5,
   '5× Ballon d''Or',
   'Awarded the Ballon d''Or in 2008, 2013, 2014, 2016, and 2017 — recognised as world''s best footballer.',
   450,'verified');  -- 90×5


-- ── Lionel Messi  (total: 1,950 pts) ─────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000006','work_experience','sports',5,
   'FC Barcelona',
   'Spent 21 years at FC Barcelona (2004–2021), the club''s all-time top scorer with 672 goals in 778 appearances.',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000006','work_experience','sports',3,
   'Paris Saint-Germain',
   'Played two seasons at PSG (2021–2023), winning Ligue 1 and preparing for his World Cup year.',
   270,'verified'),  -- 90×3

  ('00000000-0000-0000-0000-000000000006','work_experience','sports',2,
   'Inter Miami CF',
   'Joined Inter Miami in 2023, instantly elevating MLS''s global profile.',
   180,'verified'),  -- 90×2

  ('00000000-0000-0000-0000-000000000006','certification','sports',5,
   '8× Ballon d''Or',
   'Record 8 Ballon d''Or awards (2009–2012, 2015, 2019, 2021, 2023) — the most in football history.',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000006','certification','sports',5,
   'FIFA World Cup Winner – Argentina 2022',
   'Led Argentina to their third FIFA World Cup title in Qatar 2022, winning the Golden Ball award.',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000006','business','business',2,
   'MiM Hotels',
   'Co-founded MiM Hotels, a luxury hotel chain operating in Spain and Andorra.',
   150,'verified');  -- 75×2


-- ── Oprah Winfrey  (total: 1,665 pts) ────────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000007','bachelor','education',3,
   'Communications – Tennessee State University',
   'Graduated from Tennessee State University with a degree in Communication.',
   150,'verified'),  -- 50×3

  ('00000000-0000-0000-0000-000000000007','work_experience','global_impact',5,
   'Host – The Oprah Winfrey Show',
   'Hosted the highest-rated daytime talk show in television history for 25 years (1986–2011).',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000007','business','business',4,
   'Harpo Productions',
   'Founded Harpo Productions, producing The Oprah Winfrey Show, films, and the OWN Network.',
   300,'verified'),  -- 75×4

  ('00000000-0000-0000-0000-000000000007','business','business',3,
   'OWN: Oprah Winfrey Network',
   'Founded OWN, a cable television network reaching over 85 million households.',
   225,'verified'),  -- 75×3

  ('00000000-0000-0000-0000-000000000007','volunteering','global_impact',4,
   'Oprah Winfrey Foundation',
   'Donated hundreds of millions to educational causes, scholarships, and humanitarian aid worldwide.',
   440,'verified');  -- 110×4


-- ── Albert Einstein  (total: 1,820 pts) ──────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000008','bachelor','education',5,
   'Physics & Mathematics – ETH Zürich',
   'Graduated from ETH Zürich in 1900 with a teaching diploma in physics and mathematics.',
   250,'verified'),  -- 50×5

  ('00000000-0000-0000-0000-000000000008','master','education',5,
   'PhD in Physics – University of Zurich',
   'Earned his doctorate in 1905 — the same year he published four landmark papers including special relativity.',
   250,'verified'),  -- 50×5

  ('00000000-0000-0000-0000-000000000008','work_experience','technology',2,
   'Patent Examiner – Swiss Patent Office',
   'Worked at the Bern Patent Office (1902–1909) evaluating technical inventions while secretly developing special relativity.',
   220,'verified'),  -- 110×2  (technology, not education)

  ('00000000-0000-0000-0000-000000000008','work_experience','global_impact',5,
   'Professor – Institute for Advanced Study, Princeton',
   'Held a permanent research position at Princeton''s Institute for Advanced Study from 1933 until his death — producing work that reshaped modern physics.',
   550,'verified'),  -- 110×5  (global_impact research, not education)

  ('00000000-0000-0000-0000-000000000008','certification','global_impact',5,
   'Nobel Prize in Physics, 1921',
   'Awarded for the discovery of the law of the photoelectric effect and his services to Theoretical Physics.',
   550,'verified');  -- 110×5


-- ── Nelson Mandela  (total: 2,110 pts) ───────────────────────────────────────
INSERT INTO public.achievements
  (user_id, achievement_type, category, impact_level, title, description, points, verification_status)
VALUES
  ('00000000-0000-0000-0000-000000000009','high_school','education',1,
   'Clarkebury Boarding Institute',
   'Completed his junior certificate at Clarkebury — the first in his family to receive a Western education.',
   50,'verified'),   -- 50×1

  ('00000000-0000-0000-0000-000000000009','bachelor','education',3,
   'Law – University of South Africa',
   'Completed his Bachelor of Arts degree while imprisoned on Robben Island in 1989.',
   150,'verified'),  -- 50×3

  ('00000000-0000-0000-0000-000000000009','military','human_rights',4,
   'Umkhonto we Sizwe (MK)',
   'Co-founded and commanded the armed wing of the ANC in response to the Sharpeville massacre.',
   360,'verified'),  -- 90×4

  ('00000000-0000-0000-0000-000000000009','volunteering','human_rights',5,
   'Anti-Apartheid Movement',
   'Dedicated 27 years of imprisonment and a lifetime of activism to ending apartheid and achieving racial justice.',
   450,'verified'),  -- 90×5

  ('00000000-0000-0000-0000-000000000009','work_experience','global_impact',5,
   'President of South Africa (1994–1999)',
   'Served as the first democratically elected President of South Africa, overseeing the transition from apartheid.',
   550,'verified'),  -- 110×5

  ('00000000-0000-0000-0000-000000000009','certification','global_impact',5,
   'Nobel Peace Prize, 1993',
   'Jointly awarded with F.W. de Klerk for their work to peacefully dismantle the apartheid regime.',
   550,'verified');  -- 110×5
