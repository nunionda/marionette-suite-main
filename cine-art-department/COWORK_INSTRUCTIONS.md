# ART DEPARTMENT AI — Cowork 세팅 가이드

## 파일 구조 (프로젝트 폴더 예시)

```
~/Projects/ArtDepartment/
├── art_department_agent.html     ← 메인 에이전트 앱
├── outputs/                      ← 자동 출력 폴더
│   ├── [프로젝트명]_art_dept.txt
│   └── [프로젝트명]_art_bible.txt
└── COWORK_INSTRUCTIONS.md        ← 이 파일
```

---

## Cowork 설정 방법

### 1. Claude Desktop 실행
- Cowork 탭 클릭
- "Work in a Folder" 체크 → `~/Projects/ArtDepartment/` 선택

### 2. Global Instructions (설정 > Cowork > Edit)
```
나는 영화 프로덕션 소프트웨어 아키텍트 Daniel입니다.
- 미술 부서 AI 에이전트 시스템을 운영합니다
- 모든 출력은 outputs/ 폴더에 저장하세요
- 파일명은 [날짜]_[프로젝트명] 형식으로 저장하세요
- 한국어로 소통하되, 코드와 파일명은 영어로 작성하세요
```

### 3. Cowork에서 실행할 수 있는 명령어 예시

**새 프로젝트 시작:**
```
영화 프로젝트 "밤의 서울"의 Art Department 세션을 열어줘.
art_department_agent.html 파일을 브라우저로 실행하고,
완료 후 outputs 폴더에 결과를 저장해줘.
```

**배치 처리:**
```
다음 3개 프로젝트의 Art Bible을 순서대로 생성해줘:
1. 밤의 서울 (Neo-noir 1980s)
2. VOID (Hard Sci-Fi)
3. 채홍 (조선 시대극)
각각 outputs/ 폴더에 저장해줘.
```

**결과 정리:**
```
outputs/ 폴더의 모든 Art Bible 파일을 읽고
공통된 색채 팔레트 키워드를 추출해서 
color_palette_analysis.md 파일로 정리해줘.
```

---

## 스케줄 설정 (Cowork /schedule)

```
매주 월요일 오전 9시에:
art_department_agent.html 앱을 확인하고
지난 주 outputs/ 폴더의 결과물을 weekly_summary.md로 정리해줘
```

---

## 에이전트 파이프라인 구조

```
[브리프 입력]
      ↓
01. Production Designer   ← 비주얼 세계 설계
      ↓
02. Art Director          ← 실행 계획 수립
      ↓ (병렬)
03. Set Designer          → 공간 & 구조
04. Set Decorator         → 오브젝트 & 분위기  
05. Property Master       → 소품 & 의미
      ↓ (통합)
06. Art Bible Compiler    ← 최종 문서 생성
      ↓
[.txt 파일 출력]
```

---

## API 키 관리

앱 실행 시 API 키를 직접 입력합니다.
로컬 메모리에만 저장되며, 브라우저 종료 시 초기화됩니다.

Anthropic API 키 발급: https://console.anthropic.com/settings/keys
