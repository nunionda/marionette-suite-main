# Marionette Studio: Mobile App Scale-up (Phase 27)

바이브 코딩 1인 창업 5단계 가이드라인에 따른 **크로스 플랫폼 모바일 앱 패키징 및 글로벌 엑시트 전략**입니다.
Next.js 로 구축된 마리오네트 스튜디오를 단일 코드베이스로 iOS와 Android 앱으로 변환합니다.

## 📱 1. Expo 프레임워크 Webview 연동 전략

기존 구축된 Cloudflare Pages (Next.js) 프로덕트를 네이티브 앱스토어에 노출시키기 위해 `react-native-webview`를 활용한 Expo 기반 감싸기(Wrapper) 앱을 구축합니다.

### 설치 및 초기화
```bash
npx create-expo-app marionette-app
cd marionette-app
npx expo install react-native-webview
```

### Expo Webview 코드 템플릿 (`App.tsx`)
```tsx
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Cloudflare Pages로 배포된 실제 프로덕션 URL 기입 */}
      <WebView 
        source={{ uri: 'https://marionette-studio.pages.dev' }} 
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Marionette Studio Dark Theme Edge
  },
});
```

### 배포(EAS Build)
이후 Expo Application Services (EAS)를 사용하여 클라우드 상에서 컴파일 및 스토어 제출을 수행합니다.
```bash
npx eas-cli build -p all
```

---

## 📈 2. 수익화/엑시트 전략 가이드라인 (Polar & Stripe Atlas)

### 수익 창출 (Merchant of Record)
저희는 미국이나 유럽 현지 법인이 없어도 글로벌 결제 관리를 위임할 수 있는 **Polar (폴라)**를 연동했습니다. (참고: `apps/studio/components/Monetization/UpgradeModal.tsx`) 이를 통해 세금 처리(VAT), 환불, 구독자 관리 등을 별도 조치 없이 수행 가능합니다.

### 미국 법인 설립 및 엑시트 (Exit)
나스닥 상장 수순을 밟거나 실리콘밸리 VC 투자를 받기 위해서는 **미국 델라웨어 주**에 법인(C-Corp)을 설립해야 합니다.
1. **Stripe Atlas 활용**: 세무, 자본금, 주식 배분, 은행 계좌(Mercury 등) 발급을 단 며칠 만에 온라인으로 대면 없이 처리합니다. ($500 내외 소요)
2. **PMF 달성 후**: Google Analytics 4 (AARRR 획득/유지 율) + MS Clarity (고객 체류 시간 및 히트맵) 데이터 증빙을 통해 투자자 Pitching을 진행합니다. (현재 Layout에 이미 트래킹 로직이 심어져 있습니다.)

---
이 가이드라인이 프로젝트의 마지막 성장기(Scale-up)에 실질적인 나침반이 될 것입니다.
