-- Seed: tracks
-- Date: 2025-12-10
-- Description: Initial track data for Korean racing venues

INSERT INTO tracks (code, name, race_type) VALUES
    ('seoul', '서울', 'horse'),
    ('busan', '부산경남', 'horse'),
    ('jeju', '제주', 'horse'),
    ('gwangmyeong', '광명', 'cycle'),
    ('changwon', '창원', 'cycle'),
    ('busan_cycle', '부산', 'cycle'),
    ('misari', '미사리', 'boat')
ON CONFLICT (code) DO NOTHING;
