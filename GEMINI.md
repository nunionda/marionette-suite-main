# GEMINI.md 

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0. Response Tone & Accuracy (CRITICAL)
- **사실적 전달**: 모든 답변(response)은 사실에 기반하여(fact-based) 객관적으로 전달합니다.
- **과장 금지**: 과장된 표현(exaggerated expressions)은 일절 사용하지 않습니다.
- **구현 결과만 보고**: 구현된 결과만 있는 그대로 보고합니다.
- **추측 금지**: 추측성 발언은 일절 사용하지 않습니다.
- **Phase가 끝나면 다음 우선수위가 높은 Phase 작업을 진행한다.** 

## 1. 전통적 영화 제작 파이프라인에 맞게 구현한다.
- 각 Phase는 독립적으로 동작하며, 이전 Phase의 결과물을 입력으로 받는다.

## 2. 워크스페이스 규범
"1. 논리적 구조화: 멀티 루트 워크스페이스 (Multi-root Workspaces)
단일 폴더만 열고 작업하기보다 관련 있는 여러 프로젝트를 하나의 워크스페이스로 묶으세요.

관련 리포지토리 통합: 프론트엔드, 백엔드, 인프라(IaC) 코드가 별도 레포로 관리되더라도 하나의 워크스페이스에 추가하면 전체 코드 흐름을 한눈에 파악하기 좋습니다.

심볼릭 링크 활용 지양: 물리적 구조를 건드리지 않고 IDE 레벨에서 논리적으로만 결합하여 프로젝트 간 참조를 쉽게 만듭니다.

2. 프로젝트별 독립 설정 (.vscode / .idea 활용)
모든 프로젝트에 동일한 설정을 적용하는 것은 위험합니다. 워크스페이스 전용 설정 파일을 적극 활용하세요.

Linting & Formatting: 프로젝트 A는 Prettier, 프로젝트 B는 ESLint를 쓴다면 이를 워크스페이스 설정에 명시하여 협업 시 코드 스타일 충돌을 방지합니다.

Exclude Patterns: node_modules나 dist 외에도 검색에서 제외할 로그 파일, 임시 데이터 폴더를 지정하세요. 이는 IDE의 인덱싱 속도를 높여 심볼 검색과 자동 완성을 쾌적하게 만듭니다.

3. 작업 환경의 자동화 (Tasks & Debugging)
워크스페이스 단위로 정의된 Task는 개발자의 손을 자유롭게 합니다.

Launch Configurations: 프로젝트별로 디버깅 실행 환경(Environment Variables, Port 등)을 launch.json에 미리 세팅해 두면, 누구나 버튼 하나로 디버깅을 시작할 수 있습니다.

Build/Test Tasks: 터미널에 매번 긴 명령어를 입력하지 말고, IDE의 Task 기능을 통해 빌드와 테스트를 자동화하세요.

4. 컨텍스트 보존과 이동 (Profiles)
최근 최신 IDE(VS Code 등)들은 Profiles 기능을 지원합니다.

직무별 프로필: 'Frontend 개발용 프로필'(React 확장 프로그램 위주)과 'DevOps용 프로필'(Docker, Kubernetes, YAML 관련)을 분리하세요. 불필요한 확장 프로그램 로드를 줄여 메모리를 절약하고 인터페이스를 깔끔하게 유지할 수 있습니다.

5. 팀 협업 및 일관성 (Dev Containers)
워크스페이스 설정을 넘어 아예 개발 환경 자체를 코드화하는 단계입니다.

Dev Containers: 워크스페이스에 .devcontainer 설정을 포함하면, 팀원들이 동일한 Docker 컨테이너 환경에서 개발할 수 있습니다. "내 컴퓨터에서는 되는데 왜 안 되지?"라는 고질적인 문제를 원천 봉쇄합니다.

💡 시니어 멘토의 한마디
"좋은 워크스페이스 구성은 단순히 코드를 모아두는 곳이 아니라, **당신이 코딩에만 집중할 수 있게 설계된 최적화된 조종석(Cockpit)**이어야 합니다. 검색 결과가 너무 지저분하거나 설정이 꼬인다면, 지금 바로 워크스페이스 설정을 점검해 보세요."