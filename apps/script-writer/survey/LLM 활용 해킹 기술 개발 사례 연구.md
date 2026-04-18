# **인공지능 대규모 언어 모델 기반의 해킹 기술 개발 사례 연구 및 사이버 보안 패러다임의 전환 분석**

21세기 사이버 보안의 역사는 공격자와 방어자 간의 끊임없는 기술적 군비 경쟁으로 정의된다. 최근 대규모 언어 모델(Large Language Models, LLMs)의 비약적인 발전은 이 경쟁의 양상을 근본적으로 변화시키고 있다. 과거의 자동화가 단순 반복 작업의 효율화에 그쳤다면, 현대의 LLM 기반 해킹 기술은 추론, 기획, 그리고 적응형 실행 능력을 갖춘 자율적 에이전트의 형태로 진화하고 있다.1 이러한 기술적 전환점은 2024년과 2025년을 기점으로 더욱 명확해졌으며, 특히 DARPA의 AI 사이버 챌린지(AIxCC)와 같은 대규모 대회를 통해 그 실효성이 입증되었다.3 본 보고서는 LLM을 활용한 해킹 기술의 구체적인 개발 사례를 분석하고, 이것이 사이버 보안의 생태계에 미치는 다각적인 영향과 미래 전망을 심층적으로 고찰한다.

## **자율형 사이버 추론 시스템의 부상: DARPA AIxCC를 중심으로**

사이버 보안 분야에서 AI의 역할이 보조 도구에서 주도적인 실행자로 격상된 결정적인 계기는 DARPA(미국 방위고등연구계획국)가 주관한 AI 사이버 챌린지(AIxCC)이다.5 2023년부터 2025년까지 진행된 이 대회는 현대적인 LLM 기술과 전통적인 프로그램 분석 기법을 결합하여, 인간의 개입 없이 소프트웨어의 취약점을 탐지하고 유효한 패치를 생성하는 사이버 추론 시스템(Cyber Reasoning Systems, CRS)의 성능을 평가하는 무대였다.3

### **AIxCC의 아키텍처와 경쟁 성과**

AIxCC 최종 결선(DEF CON 33, 2025년 8월)에서는 전 세계에서 선발된 7개의 최종 후보 팀이 각자의 CRS를 선보였다.4 이 시스템들은 수천만 라인에 달하는 실제 오픈소스 소프트웨어(C, Java 등)를 대상으로 자율적인 보안 분석을 수행했다.4 2024년 세미파이널과 비교했을 때, 2025년 결선에서의 성능 향상은 놀라운 수준이었다. 취약점 식별 성공률은 37%에서 77%로 두 배 이상 증가했으며, 유효한 패치 생성 성공률 또한 25%에서 61%로 급성장했다.4

| 성과 지표 | 세미파이널 (2024) | 파이널 (2025) | 변화량 |
| :---- | :---- | :---- | :---- |
| 취약점 식별 성공률 | 37% | 77% | \+108% |
| 패치 생성 성공률 | 25% | 61% | \+144% |
| 발견된 실제 0-day 취약점 | 1건 | 18건 | 1,800% 증가 |
| 시스템당 할당 컴퓨팅 예산 | 미정 | $85,000 | \- |
| 작업당 평균 비용 | 미정 | $152 | 인간 전문가 대비 혁신적 절감 |

이러한 수치는 AI 기반 시스템이 단순한 코드 리뷰어의 수준을 넘어, 실제 환경에서 인간 보안 전문가의 역량을 대체하거나 보완할 수 있는 수준에 도달했음을 보여준다.4 특히 발견된 18건의 0-day 취약점 중 다수는 실제 중요 인프라 소프트웨어에서 식별되어 업계에 큰 충격을 주었다.4

### **우승 시스템 ATLANTIS의 기술적 메커니즘**

대회 1위를 차지한 조지아 공대와 삼성리서치 연합팀(Team Atlanta)의 ATLANTIS 시스템은 다중 에이전트 시스템(Multi-Agent System) 아키텍처를 채택하여 복잡한 보안 문제를 해결했다.7 ATLANTIS는 전통적인 퍼징(Fuzzing) 기술이 가진 강점(메모리 손상 탐지)과 LLM의 강점(논리 오류 추론)을 유기적으로 결합했다.8

ATLANTIS의 핵심 엔진인 MLLA(Multi-Language LLM Agent)는 다음과 같은 특화된 에이전트들의 협업으로 구성된다 8:

1. **코드 탐색 에이전트(Code Exploration Agents):** 거대한 코드베이스를 탐색하여 함수 간의 호출 관계를 매핑하고, 보안상 위험한 연산(Dangerous Operations)이 포함된 경로를 우선순위화한다.8  
2. **BCDA (AI Detective):** 자동화된 분석 도구에서 발생하는 수많은 가짜 양성(False Positives)을 걸러내기 위해 다단계 조사를 수행하여 실제 취약점 여부를 확정한다.8  
3. **공격 생성 에이전트(Exploit Generation Agents):** 이 에이전트는 직접적인 페이로드를 작성하는 대신, 페이로드를 생성하는 Python 스크립트를 작성하는 방식을 취했다.8 이는 LLM이 바이너리 데이터의 미세한 문차 차이로 인해 범하기 쉬운 오류를 줄이고, ZIP이나 XML과 같은 복잡한 다중 레이어 구조를 처리하는 데 효과적이었다.8  
4. **컨텍스트 엔지니어링:** 프롬프트에 소스 코드 주석과 하향식 가이드를 구조화하여 제공함으로써 LLM의 추론 정확도를 약 92%까지 끌어올렸다.8

ATLANTIS는 시스템의 견고성을 위해 'N-버전 프로그래밍' 방식을 도입하여, C/C++ 전용 CRS와 Java 전용 CRS를 독립적으로 운영함으로써 한 쪽의 실패가 전체 시스템으로 전이되지 않도록 설계되었다.9 이러한 다양성 확보 전략은 결선에서 가장 많은 PoV(Proof of Vulnerability)를 제출하는 원동력이 되었다.8

## **자동화된 공격 코드 생성(AEG) 기술의 고도화**

LLM의 코드 생성 능력은 실행 가능한 공격 코드(Exploit)를 작성하는 데 있어 새로운 지평을 열었다. 특히 과거에는 고도의 전문 지식이 필요했던 바이너리 익스플로잇 분야에서 LLM 기반 프레임워크들이 괄목할 만한 성과를 보이고 있다.10

### **PwnGPT: 바이너리 해킹의 자동화**

PwnGPT는 바이너리 익스플로잇(pwn) 문제를 해결하기 위해 설계된 LLM 기반의 자동 공격 생성 시스템이다.10 이 프레임워크는 분석(Analysis), 생성(Generation), 검증(Verification)의 세 가지 모듈로 구성된다.10

* **분석 모듈:** ELF 실행 파일에서 정적 분석 기법을 사용하여 보안상 유의미한 정보를 추출하고, 이를 LLM이 이해하기 쉬운 구조화된 형태로 변환한다.10  
* **생성 모듈:** 추출된 정보를 바탕으로 LLM이 공격 체인을 구성하도록 유도한다. 특히 64비트 libc 함수의 16바이트 스택 정렬이나 특정 메모리 오프셋 계산과 같이 LLM이 단독으로 해결하기 어려운 기술적 세부 사항을 보조한다.10  
* **검증 모듈:** 생성된 코드를 실제 환경에서 실행해보고, 오류 발생 시 실시간 피드백을 LLM에 제공하여 코드를 반복적으로 수정하게 한다.10

실험 데이터에 따르면, OpenAI의 o1-preview 모델을 활용한 PwnGPT의 공격 성공률은 단독 모델 사용 시(26.3%)보다 두 배 이상 높은 57.9%를 기록했다.10 이는 LLM이 단독으로 작동할 때보다 전문적인 도구와 결합되었을 때 더 강력한 파괴력을 가짐을 입증한다.

### **공개된 CVE 정보를 이용한 N-day 공격 재구성**

최근 연구는 LLM이 취약점 공고문(CVE)이나 패치 내역과 같은 공개 정보만으로도 유효한 공격 코드(PoC)를 생성할 수 있음을 보여준다.11 특히 DeepSeek-R1과 같은 최신 추론 모델은 웹 애플리케이션 취약점 공고문만으로도 8%의 사례에서 즉각적인 PoC 생성이 가능했으며, 함수 단위의 코드 문맥이 추가될 경우 성공률은 54%까지 치솟았다.11

이러한 기술적 진보는 공격자가 특정 타겟에 대한 깊은 이해 없이도 빠르게 공격 무기를 확보할 수 있게 함으로써, 취약점 발표 후 실제 공격이 발생하기까지의 시간(Time-to-Exploit)을 극단적으로 단축시키고 있다.11

## **경쟁적 해킹과 CTF(Capture The Flag)의 패러다임 변화**

AI 에이전트의 성능은 통제된 해킹 대회인 CTF를 통해 더욱 극명하게 드러나고 있다. 2025년 한 해 동안 AI 에이전트들은 세계 유수의 CTF 대회에서 상위권을 휩쓸며 인간 해커들을 긴장시켰다.12

### **사이버 보안 AI(CAI)의 지배력 분석**

Alias Robotics가 개발한 CAI 프레임워크는 2025년 주요 CTF 대회에서 압도적인 성적을 거두었다.12 CAI는 300개 이상의 모델을 지원하며, 정찰부터 권한 상승, 데이터 유출까지의 모든 과정을 자율적으로 수행하는 에이전트 아키텍처를 갖추고 있다.12

| 대회명 | 참가 규모 | AI 성적 (CAI) | 비고 |
| :---- | :---- | :---- | :---- |
| Neurogrid CTF | 155개 팀 | 1위 (종합) | 45개 중 41개 플래그 획득, $50,000 상금 |
| Dragos OT CTF | 산업 보안 분야 | 6위 | 일시 중지 전까지 1위 유지, 인간보다 37% 빠른 속도 |
| Cyber Apocalypse 2025 | 8,129개 팀 | 피크 시 22위 | 3시간 만에 상위 0.3% 도달 |
| HTB "AI vs Humans" | 전 세계 해커 | AI 팀 중 1위 | 암호학/리버싱 19/20 문제 해결 |

CAI의 성공 비결은 경제적 자율성(Economic Autonomy)에 있다. 이 시스템은 동적 엔트로피 기반 모델 선택 기술을 통해 추론 비용을 기존 대비 98% 절감하면서도 성능을 유지했다.12 예를 들어, 10억 토큰의 추론 비용을 5,940달러에서 119달러로 낮춤으로써 24시간 중단 없는 보안 작전이 가능해졌다.12

### **CTF의 종말과 새로운 평가 방식**

AI의 이러한 지배력은 전통적인 Jeopardy 방식의 CTF가 더 이상 인간의 보안 역량을 평가하는 데 유효하지 않을 수 있다는 의문을 제기하게 했다.12 실제로 Hack The Box의 데이터 분석에 따르면, LLM 등장 이후 'First Blood'(최초 문제 해결 시간)가 매년 약 16%씩 단축되고 있으며, 특히 고난도(Insane) 등급 문제의 해결 시간은 67%나 급감했다.13

이에 따라 보안 커뮤니티는 AI가 단순 패턴 매칭으로 해결할 수 없는 '적응형 추론'과 '복원력'을 테스트하는 Attack & Defense 포맷으로의 전환을 서두르고 있다.12 이제 인간 해커의 가치는 도구의 숙련도보다는 AI 에이전트를 적재적소에 배치하고 복잡한 사회공학적 상황을 판단하는 창의적 능력으로 옮겨가고 있다.13

## **위협 행위자의 실질적 남용 사례 및 APT 그룹의 동향**

LLM의 해킹 능력은 연구실을 넘어 실제 위협 행위자들의 무기가 되고 있다. 마이크로소프트와 OpenAI의 위협 인텔리전스 보고서에 따르면, 국가 지원 해킹 그룹(APT)들이 이미 LLM을 자신들의 공격 파이프라인에 통합하고 있음이 확인되었다.14

### **국가 지원 위협 행위자의 전략적 이용**

주요 국가 배경의 해킹 그룹들은 LLM을 사용하여 정찰, 멀웨어 개발, 사회 공학적 공격의 효율성을 극대화하고 있다.15

* **Emerald Sleet (북한):** 마이크로소프트 지원 진단 도구(MSDT)의 취약점(CVE-2022-30190)을 연구하고, 특정 대상을 타겟팅한 정교한 스피어 피싱 이메일을 작성하는 데 LLM을 활용했다.15  
* **러시아 연계 공격 그룹:** 원격 제어 트로이목마(RAT)와 자격 증명 탈취기의 코드를 프로토타이핑하고, 탐지 시스템을 회피하기 위한 코드 난독화 기법을 연구하는 데 LLM을 사용했다.16 특히 이들은 직접적인 악성 요청이 거부될 경우, 이를 "기능적 조각"으로 쪼개어 요청하는 '빌딩 블록' 전략을 구사했다.16  
* **중국어권 위협 그룹:** 대규모 피싱 캠페인을 위한 콘텐츠 번역과 C2(명령 및 제어) 인프라 스캐폴딩에 LLM을 활용했으며, 최근에는 DeepSeek와 같은 저비용 고효율 모델로의 전환을 시도하고 있다.16

### **'바이브 해킹(Vibe Hacking)'과 범죄의 민주화**

LLM은 기술적 수준이 낮은 사이버 범죄자들에게도 강력한 힘을 부여하고 있다. 이를 '바이브 해킹'이라 부르는데, 공격자는 WormGPT나 FraudGPT와 같은 특화된 모델을 사용하여 정교한 피싱 메일과 악성 스크립트를 생성한다.14 이러한 도구들은 전문적인 코딩 능력 없이도 PowerShell 스크립트를 조립하거나, 피해자의 언어와 문화적 맥락에 맞는 설득력 있는 사기 시나리오를 생성할 수 있게 해준다.14 이는 사이버 범죄의 진입 장벽을 낮추고 공격의 양적 팽창을 야기하는 주요 원인이 되고 있다.

## **고도화된 모델 공격 기술: 탈옥과 인프라 침투**

AI 모델 자체를 공격하여 보호 장치를 무력화하거나, AI 구동 인프라를 장악하는 기술 또한 급격히 발전하고 있다.

### **다회성 탈옥(Many-shot Jailbreaking, MSJ)**

앤스로픽(Anthropic)이 경고한 MSJ 기법은 LLM의 긴 맥락 인식 창(Context Window)을 악용한다.17 공격자는 수백 개의 '가짜 대화' 쌍을 프롬프트에 삽입하여 모델이 이미 유해한 질문에 답변하고 있는 것처럼 시연한다.

이 공격의 메커니즘은 다음과 같은 멱법칙(Power Law)을 따른다:

![][image1]  
여기서 ![][image2]은 예시의 수(Shot counts)이며, 샷의 수가 증가할수록 모델의 안전 훈련은 무력화되고 유해한 답변을 내놓을 확률이 급격히 높아진다.17 연구에 따르면 256회 이상의 샷이 제공될 경우, 대부분의 프론티어 모델은 강력한 안전 튜닝에도 불구하고 공격자의 의도대로 작동한다.17

### **AI 인프라 취약점: CVE-2024-0132 사례**

Black Hat 2025에서 발표된 NVIDIA 컨테이너 툴킷의 취약점(CVE-2024-0132)은 AI 보안이 단순히 모델의 입출력 제어에 그쳐서는 안 됨을 보여준다.20 이 결함은 TOCTOU(Time-of-Check Time-of-Use) 취약점으로, 공격자가 악성 컨테이너 이미지를 사용하여 호스트 파일시스템의 루트(/) 디렉토리를 컨테이너 내부에 마운트하게 만들 수 있었다.20 이를 통해 공격자는 AI 워크로드가 실행되는 호스트 시스템 전체를 장악하고, 민감한 모델 가중치나 데이터 세트를 탈취할 수 있는 심각한 위험에 노출되었다.20

## **방어 체계의 진화와 글로벌 거버넌스**

공격 기술의 진화에 맞서 방어 진영에서도 LLM을 활용한 지능형 보안 체계와 제도적 가이드라인을 강화하고 있다.21

### **지능형 가드레일: Llama Guard 3**

메타(Meta)가 공개한 Llama Guard 3는 LLM의 입출력을 실시간으로 감시하는 특화된 안전 분류기 모델이다.21 13개 이상의 위험 카테고리(폭력, 혐오 표현, 성범죄, 개인정보 유출 등)를 처리하며, 특히 최신 버전은 코드 인터프리터 오용을 통한 컨테이너 탈출 시도나 서비스 거부 공격을 탐지하는 능력을 갖추고 있다.21 Llama Guard 3는 int8 및 int4 양자화를 통해 지연 시간을 최소화하여, 실제 서비스 환경에서도 사용자 경험을 저해하지 않으면서 강력한 보호막 역할을 수행한다.21

### **글로벌 표준 및 가이드라인**

전 세계 정부와 국제기구는 AI 오용 위험을 관리하기 위한 프레임워크를 신속히 도입하고 있다.25

1. **NIST AI 100-4:** 합성 콘텐츠에 의한 위험을 줄이기 위해 워터마킹, 메타데이터 기록, 딥페이크 탐지 기술의 표준을 제시한다.25  
2. **G7 히로시마 AI 프로세스:** AI 개발자가 배포 전 레드팀 테스트를 수행하고, 시스템의 한계와 위험성을 투명하게 공개하도록 하는 국제적 행동 강령을 수립했다.26  
3. **대한민국 국정원 및 KISA 가이드라인:** 공공기관 및 민간 기업이 LLM을 안전하게 도입하기 위한 구체적인 수칙을 제시한다. 여기에는 외부 LLM 사용 시 민감 정보 입력 금지, 사적/업무용 계정 분리, 그리고 강력한 MFA(다중 인증) 적용 등이 포함된다.30 특히 중요 기관은 외부망과 물리적으로 분리된 온프레미스(On-premise) 방식의 AI 구축을 권고받는다.30

## **종합 분석 및 미래 전망**

본 연구를 통해 분석한 LLM 기반 해킹 기술은 단순한 자동화의 단계를 넘어 '자율적 판단력을 갖춘 공격 주체'의 등장을 의미한다.2 AIxCC에서 입증된 바와 같이, AI는 이제 인간보다 훨씬 저렴한 비용($152/bug)으로 실제 0-day 취약점을 찾아내고 유효한 패치를 생성할 수 있는 능력을 보유하게 되었다.4

이러한 기술적 환경의 변화는 다음과 같은 보안 패러다임의 전환을 요구한다:

첫째, **방어의 에이전트화**이다. 공격자가 자율형 에이전트를 사용하여 초당 수백 건의 공격 시나리오를 실행하는 상황에서, 인간의 수동 대응은 한계에 부딪힐 수밖에 없다. 따라서 방어 측면에서도 실시간으로 위협을 탐지하고 패치를 자동 적용하는 '에이전틱 방어(Agentic Defense)' 체계로의 전환이 필수적이다.31

둘째, **데이터 중심 보안에서 추론 중심 보안으로의 확장**이다. 과거의 보안이 악성 파일의 시그니처를 찾는 방식이었다면, 이제는 LLM이 수행하는 비정상적인 '추론 패턴'과 '논리적 흐름'을 감시해야 한다.14 '바이브 해킹'과 같이 겉보기에는 정상적인 코드가 내포한 악의적 의도를 파악하는 능력이 핵심 보안 역량이 될 것이다.

셋째, **인적 역량의 재정의**이다. CTF 결과가 보여주듯 단순 기술 숙련도는 AI에 의해 대체되고 있다. 미래의 보안 전문가는 AI 도구를 지휘하는 '오케스트레이터'로서, 시스템의 구조적 결함을 설계 단계에서부터 예방하고 AI가 놓치기 쉬운 복잡한 사회적, 비즈니스적 맥락을 판단하는 능력을 갖추어야 한다.13

결론적으로, 인공지능 기반의 해킹 기술은 사이버 보안의 위협 수준을 전례 없는 수준으로 높이고 있으나, 동시에 이를 방어에 활용함으로써 더욱 견고한 디지털 생태계를 구축할 수 있는 기회도 제공하고 있다.31 공격과 방어 양측에서 AI를 얼마나 효과적으로 내재화하느냐가 향후 국가 및 기업의 사이버 경쟁력을 결정짓는 결정적 요인이 될 것이다. 국제적인 공조와 윤리적 가이드라인의 준수 하에 기술 혁신을 지속하는 것만이 지능화된 위협에 대응하는 유일한 길이다.29

#### **참고 자료**

1. LLMs in Cyber Security: Bridging Practice and Education \- MDPI, 3월 18, 2026에 액세스, [https://www.mdpi.com/2504-2289/9/7/184](https://www.mdpi.com/2504-2289/9/7/184)  
2. On the Surprising Efficacy of LLMs for Penetration-Testing \- arXiv.org, 3월 18, 2026에 액세스, [https://arxiv.org/html/2507.00829v1](https://arxiv.org/html/2507.00829v1)  
3. SoK: DARPA's AI Cyber Challenge (AIxCC): Competition Design, Architectures, and Lessons Learned \- arXiv, 3월 18, 2026에 액세스, [https://arxiv.org/html/2602.07666v2](https://arxiv.org/html/2602.07666v2)  
4. DARPA Announces Winners of AI Cyber Challenge \- MeriTalk, 3월 18, 2026에 액세스, [https://www.meritalk.com/articles/darpa-announces-winners-of-ai-cyber-challenge/](https://www.meritalk.com/articles/darpa-announces-winners-of-ai-cyber-challenge/)  
5. OSS-CRS: Liberating AIxCC Cyber Reasoning Systems for Real-World Open-Source Security \- arXiv, 3월 18, 2026에 액세스, [https://arxiv.org/html/2603.08566v1](https://arxiv.org/html/2603.08566v1)  
6. AIxCC: The AI Cyber Challenge Semifinals – aicyberchallenge.com, 3월 18, 2026에 액세스, [https://aicyberchallenge.com/aixcc-the-ai-cyber-challenge-semifinals/](https://aicyberchallenge.com/aixcc-the-ai-cyber-challenge-semifinals/)  
7. \[2509.14589\] ATLANTIS: AI-driven Threat Localization, Analysis, and Triage Intelligence System \- arXiv.org, 3월 18, 2026에 액세스, [https://arxiv.org/abs/2509.14589](https://arxiv.org/abs/2509.14589)  
8. Team Atlanta Wins DARPA AI Cyber Challenge (AIxCC) | Dongkwan ..., 3월 18, 2026에 액세스, [https://0xdkay.me/posts/team-atlanta-wins-darpa-aixcc/](https://0xdkay.me/posts/team-atlanta-wins-darpa-aixcc/)  
9. AIxCC Final and Team Atlanta, 3월 18, 2026에 액세스, [https://team-atlanta.github.io/blog/post-afc/](https://team-atlanta.github.io/blog/post-afc/)  
10. PwnGPT: Automatic Exploit Generation Based on ... \- ACL Anthology, 3월 18, 2026에 액세스, [https://aclanthology.org/2025.acl-long.562.pdf](https://aclanthology.org/2025.acl-long.562.pdf)  
11. A Systematic Study on Generating Web Vulnerability Proof-of-Concepts Using Large Language Models \- arXiv, 3월 18, 2026에 액세스, [https://arxiv.org/html/2510.10148v1](https://arxiv.org/html/2510.10148v1)  
12. Cybersecurity AI: The World's Top AI Agent for Security ... \- arXiv, 3월 18, 2026에 액세스, [https://arxiv.org/pdf/2512.02654](https://arxiv.org/pdf/2512.02654)  
13. The Death of the CTF: How Agentic AI Is Reshaping Competitive Hacking, 3월 18, 2026에 액세스, [https://securityboulevard.com/2026/03/the-death-of-the-ctf-how-agentic-ai-is-reshaping-competitive-hacking/](https://securityboulevard.com/2026/03/the-death-of-the-ctf-how-agentic-ai-is-reshaping-competitive-hacking/)  
14. Disrupting Malicious AI: Five Key Takeaways from OpenAI's June 2025 Report \- Ontinue, 3월 18, 2026에 액세스, [https://www.ontinue.com/resource/takeaways-from-openai-june-2025-report/](https://www.ontinue.com/resource/takeaways-from-openai-june-2025-report/)  
15. AI as tradecraft: How threat actors operationalize AI | Microsoft Security Blog, 3월 18, 2026에 액세스, [https://www.microsoft.com/en-us/security/blog/2026/03/06/ai-as-tradecraft-how-threat-actors-operationalize-ai/](https://www.microsoft.com/en-us/security/blog/2026/03/06/ai-as-tradecraft-how-threat-actors-operationalize-ai/)  
16. Disrupting malicious uses of our models: an update ... \- OpenAI, 3월 18, 2026에 액세스, [https://cdn.openai.com/threat-intelligence-reports/7d662b68-952f-4dfd-a2f2-fe55b041cc4a/disrupting-malicious-uses-of-ai-october-2025.pdf](https://cdn.openai.com/threat-intelligence-reports/7d662b68-952f-4dfd-a2f2-fe55b041cc4a/disrupting-malicious-uses-of-ai-october-2025.pdf)  
17. Many-shot jailbreaking \\ Anthropic, 3월 18, 2026에 액세스, [https://www.anthropic.com/research/many-shot-jailbreaking](https://www.anthropic.com/research/many-shot-jailbreaking)  
18. Mitigating Many-Shot Jailbreaking \- arXiv.org, 3월 18, 2026에 액세스, [https://arxiv.org/html/2504.09604v3](https://arxiv.org/html/2504.09604v3)  
19. Many-shot Jailbreaking \- ResearchGate, 3월 18, 2026에 액세스, [https://www.researchgate.net/publication/397214068\_Many-shot\_Jailbreaking](https://www.researchgate.net/publication/397214068_Many-shot_Jailbreaking)  
20. Black Hat USA 2025 in the Age of AI (Part 1\) | by VXRL \- Medium, 3월 18, 2026에 액세스, [https://vxrl.medium.com/black-hat-usa-2025-in-the-age-of-ai-part-1-67070c15df4b](https://vxrl.medium.com/black-hat-usa-2025-in-the-age-of-ai-part-1-67070c15df4b)  
21. Llama Guard 3: Modular Safety Classifier \- Emergent Mind, 3월 18, 2026에 액세스, [https://www.emergentmind.com/topics/llama-guard-3](https://www.emergentmind.com/topics/llama-guard-3)  
22. AI Guardrails Platforms & Open-Source Solutions Comparison 2025 \- SlashLLM, 3월 18, 2026에 액세스, [https://slashllm.com/resources/platforms-comparison](https://slashllm.com/resources/platforms-comparison)  
23. llama-guard3 \- Ollama, 3월 18, 2026에 액세스, [https://ollama.com/library/llama-guard3](https://ollama.com/library/llama-guard3)  
24. 19 large language models redefining AI safety—and danger \- InfoWorld, 3월 18, 2026에 액세스, [https://www.infoworld.com/article/4140809/19-large-language-models-redefining-ai-safety-and-danger.html](https://www.infoworld.com/article/4140809/19-large-language-models-redefining-ai-safety-and-danger.html)  
25. Navigating the New NIST Deepfake Standards: Protecting Against Social Engineering and Impersonation \- Netarx, 3월 18, 2026에 액세스, [https://www.netarx.com/blog/navigating-the-new-nist-deepfake-standards-protecting-against-social](https://www.netarx.com/blog/navigating-the-new-nist-deepfake-standards-protecting-against-social)  
26. G7 AI Principles and Code of Conduct | EY \- Global, 3월 18, 2026에 액세스, [https://www.ey.com/en\_gl/insights/ai/g7-ai-principles-and-code-of-conduct](https://www.ey.com/en_gl/insights/ai/g7-ai-principles-and-code-of-conduct)  
27. G7 \- Center for AI and Digital Policy, 3월 18, 2026에 액세스, [https://www.caidp.org/resources/g7/](https://www.caidp.org/resources/g7/)  
28. Reducing Risks Posed by Synthetic Content: An Overview of Technical Approaches to Digital Content Transparency, 3월 18, 2026에 액세스, [https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-4.pdf)  
29. Diverging paths to AI governance: how the Hiroshima AI Process offers common ground, 3월 18, 2026에 액세스, [https://www.weforum.org/stories/2025/12/hiroshima-ai-process-governance/](https://www.weforum.org/stories/2025/12/hiroshima-ai-process-governance/)  
30. KISA 생성형 AI 보안 가이드 완벽 정리(2025년 최신판) \- 피카부랩스 블로그, 3월 18, 2026에 액세스, [https://peekaboolabs.ai/blog/kisa-ai-security-guide](https://peekaboolabs.ai/blog/kisa-ai-security-guide)  
31. Look What You Made Us Patch: 2025 Zero-Days in Review | Google Cloud Blog, 3월 18, 2026에 액세스, [https://cloud.google.com/blog/topics/threat-intelligence/2025-zero-day-review](https://cloud.google.com/blog/topics/threat-intelligence/2025-zero-day-review)  
32. New Mandiant AI security report: Boost fundamentals with AI to counter adversaries, 3월 18, 2026에 액세스, [https://cloud.google.com/transform/new-mandiant-report-boost-basics-with-ai-to-counter-adversaries](https://cloud.google.com/transform/new-mandiant-report-boost-basics-with-ai-to-counter-adversaries)  
33. GTIG AI Threat Tracker: Advances in Threat Actor Usage of AI Tools | Google Cloud Blog, 3월 18, 2026에 액세스, [https://cloud.google.com/blog/topics/threat-intelligence/threat-actor-usage-of-ai-tools](https://cloud.google.com/blog/topics/threat-intelligence/threat-actor-usage-of-ai-tools)  
34. Progress Report \- Google AI, 3월 18, 2026에 액세스, [https://ai.google/static/documents/ai-responsibility-update-2026.pdf](https://ai.google/static/documents/ai-responsibility-update-2026.pdf)  
35. Governing AI for Humanity \- Final Report \- the United Nations, 3월 18, 2026에 액세스, [https://www.un.org/sites/un2.un.org/files/governing\_ai\_for\_humanity\_final\_report\_en.pdf](https://www.un.org/sites/un2.un.org/files/governing_ai_for_humanity_final_report_en.pdf)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAYCAYAAAD3Va0xAAAA3UlEQVR4XmNgGAWkgnlA/BmI/0PxAhRZCPjLgJAHYWdUaVSArBAb2AfEKuiC6IARiLcD8XoGiEFBqNJggMsCFJAPxCZQNi5X/UEXwAbeIrE/MEAM4kMSUwPiTiQ+ToDsAlA4gPg3kcSWATEPEh8rAIXPZjQxdO9h8yoGQA4fZDGQ5m4o/xeSHE7wDl0ACmCu0gbiFjQ5rACXs3czQOTuATEnmhwGYAHiveiCUMDEgBlWWAEzEL8B4pPoEkjgGxB/RxdEBquA+CMDJP2A0g0oL2ED+kCcjS44CkYBEAAABi803bhnVOIAAAAASUVORK5CYII=>