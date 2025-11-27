# 사용자 작업 목록

> 이 문서는 프로젝트 Owner가 직접 수행해야 하는 외부 서비스 설정 작업입니다.
> AI가 대신 수행할 수 없는 작업들입니다.

---

## 작업 현황

| 우선순위 | Issue | 작업 | 상태 |
|---------|-------|------|------|
| 🔴 High | #5 | Vercel 배포 설정 | ⏳ 대기 |
| 🟡 Medium | #6 | 공공데이터 API 키 설정 | ⏳ 대기 |
| 🟢 Low | #7 | Google Analytics/Search Console | ⏳ 대기 |
| 🟢 Low | #8 | 커스텀 도메인 설정 | ⏳ 대기 |

---

## 🔴 Issue #5: Vercel 배포 설정

### 단계별 작업

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. Vercel 로그인
vercel login

# 3. 프로젝트 연결
cd /Users/admin/Documents/dev/racelab
vercel link
```

### Vercel 토큰 생성
1. https://vercel.com/account/tokens 접속
2. "Create Token" 클릭
3. 이름: `github-actions`, Scope: Full Account
4. 토큰 복사

### GitHub Secrets 설정
**경로**: Repository → Settings → Secrets and variables → Actions

| Secret Name | 값 확인 방법 |
|-------------|-------------|
| `VERCEL_TOKEN` | 위에서 생성한 토큰 |
| `VERCEL_ORG_ID` | `cat .vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `cat .vercel/project.json` → `projectId` |

### 체크리스트
- [ ] Vercel 계정 생성
- [ ] Vercel CLI로 프로젝트 연결 (`vercel link`)
- [ ] Vercel 토큰 생성
- [ ] `VERCEL_TOKEN` secret 설정
- [ ] `VERCEL_ORG_ID` secret 설정
- [ ] `VERCEL_PROJECT_ID` secret 설정
- [ ] Preview 배포 테스트
- [ ] Production 배포 테스트

---

## 🟡 Issue #6: 공공데이터 API 키 설정

### API 신청 절차

1. https://www.data.go.kr 접속 및 회원가입
2. **경마 API**: "한국마사회_경마정보" 검색 → 활용 신청
3. **경륜/경정 API**: "경륜경정" 검색 → 활용 신청
4. 승인 대기 (보통 1-3일 소요)

### 승인 후 GitHub Secrets 설정

| Secret Name | 설명 |
|-------------|------|
| `KRA_API_KEY` | 한국마사회 API 키 |
| `KSPO_API_KEY` | 국민체육진흥공단 API 키 |

### 로컬 개발용 설정
```bash
# .env.local 파일 생성
echo "KRA_API_KEY=발급받은키" >> .env.local
echo "KSPO_API_KEY=발급받은키" >> .env.local
```

### 체크리스트
- [ ] 공공데이터포털 계정 생성
- [ ] KRA API 활용 신청 및 승인
- [ ] KSPO API 활용 신청 및 승인
- [ ] `KRA_API_KEY` secret 설정
- [ ] `KSPO_API_KEY` secret 설정
- [ ] 로컬 `.env.local` 파일 생성
- [ ] API 연동 테스트

---

## 🟢 Issue #7: Google Analytics/Search Console

### Google Analytics
1. https://analytics.google.com 접속
2. 속성 만들기 → 웹 스트림 설정
3. 측정 ID 복사 (`G-XXXXXXXXXX`)
4. Vercel 환경변수에 `NEXT_PUBLIC_GA_ID` 추가

### Search Console
1. https://search.google.com/search-console 접속
2. 속성 추가 → 도메인 입력
3. HTML 태그로 소유권 확인
4. 확인 코드를 AI에게 전달 → 코드 반영

### 체크리스트
- [ ] GA4 속성 생성
- [ ] 측정 ID 확인
- [ ] `NEXT_PUBLIC_GA_ID` 환경 변수 설정
- [ ] Search Console 속성 추가
- [ ] 소유권 확인 코드 발급
- [ ] Sitemap 제출

---

## 🟢 Issue #8: 커스텀 도메인 설정

### 설정 단계
1. 도메인 구매 (가비아, 후이즈 등)
2. Vercel Dashboard → Project → Settings → Domains
3. DNS 설정: A Record `76.76.21.21`

### 체크리스트
- [ ] 도메인 결정 및 구매
- [ ] Vercel에 도메인 연결
- [ ] DNS 설정 완료
- [ ] SSL 인증서 확인
- [ ] 코드 도메인 참조 통일 (AI 작업)

---

## 권장 진행 순서

```
Issue #5 (Vercel) → Issue #6 (API 키) → Issue #7 (Analytics) → Issue #8 (도메인)
```

---

*마지막 업데이트: 2025-11-27*
