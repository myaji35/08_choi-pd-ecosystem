# 접근성 가이드 (Accessibility Guide)

이 문서는 최범희 PD 통합 브랜드 허브의 접근성 표준 및 테스트 방법을 설명합니다.

## 접근성 표준

이 프로젝트는 **WCAG 2.1 Level AA** 표준을 준수합니다.

## 주요 접근성 원칙

### 1. **대체 텍스트 (Alternative Text)**
- 모든 이미지에는 적절한 `alt` 속성이 있어야 합니다
- 히어로 이미지의 대체 텍스트는 10-200자 사이여야 합니다
- 장식용 이미지는 `alt=""` 사용

### 2. **색상 대비 (Color Contrast)**
- 텍스트와 배경의 대비율은 최소 4.5:1 (WCAG AA)
- 큰 텍스트(18pt 이상)는 최소 3:1

### 3. **키보드 접근성 (Keyboard Navigation)**
- 모든 인터랙티브 요소는 키보드로 접근 가능해야 합니다
- Tab 키로 모든 폼 필드 및 버튼 이동 가능
- Enter/Space로 버튼 활성화 가능

### 4. **폼 레이블 (Form Labels)**
- 모든 입력 필드는 명시적인 `<label>` 요소를 가져야 합니다
- `placeholder`만으로는 불충분 (접근성 도구가 읽지 못함)

### 5. **헤딩 구조 (Heading Hierarchy)**
- 페이지는 하나의 `<h1>` 태그를 가져야 합니다
- 헤딩 레벨은 순차적으로 사용 (h1 → h2 → h3)

### 6. **포커스 표시 (Focus Indicators)**
- 모든 포커스 가능한 요소는 명확한 포커스 표시를 가져야 합니다
- Tailwind의 `focus:` 유틸리티 클래스 사용

## 접근성 테스트 도구

### 1. **자동화 테스트**
```bash
# Playwright + axe-core를 이용한 접근성 테스트
npm run test:e2e -- accessibility.spec.ts
```

### 2. **수동 테스트 도구**
- **Chrome DevTools**: Lighthouse 접근성 점수
- **NVDA/JAWS**: 스크린 리더 테스트
- **Keyboard Only**: 마우스 없이 탭 키로 탐색

### 3. **브라우저 확장 프로그램**
- **axe DevTools** (Chrome/Firefox)
- **WAVE** (Web Accessibility Evaluation Tool)

## 주요 접근성 체크리스트

### 이미지
- [ ] 모든 이미지에 `alt` 속성 존재
- [ ] 의미 있는 이미지는 설명적인 alt 텍스트
- [ ] 장식용 이미지는 `alt=""`

### 폼
- [ ] 모든 입력 필드에 `<label>` 연결
- [ ] 에러 메시지가 명확하고 접근 가능
- [ ] 필수 필드가 명시됨 (`required` 속성)

### 네비게이션
- [ ] 키보드로 모든 링크/버튼 접근 가능
- [ ] Skip to content 링크 제공 (선택사항)
- [ ] 포커스 순서가 논리적

### 색상 및 대비
- [ ] 텍스트 대비율 4.5:1 이상
- [ ] 색상만으로 정보 전달하지 않음

### 시맨틱 HTML
- [ ] 적절한 HTML5 시맨틱 태그 사용
- [ ] `<button>` vs `<a>` 올바른 사용
- [ ] ARIA 속성이 필요한 경우에만 사용

## 일반적인 접근성 문제 해결

### 문제: 이미지에 alt 텍스트 없음
```tsx
// ❌ 잘못된 예
<img src="/hero.jpg" />

// ✅ 올바른 예
<img src="/hero.jpg" alt="최범희 PD의 교육, 미디어, 작품 활동을 상징하는 이미지" />
```

### 문제: 레이블 없는 입력 필드
```tsx
// ❌ 잘못된 예
<input type="text" placeholder="이름" />

// ✅ 올바른 예
<label htmlFor="name">이름</label>
<input type="text" id="name" placeholder="이름을 입력하세요" />
```

### 문제: 버튼에 텍스트 없음 (아이콘만)
```tsx
// ❌ 잘못된 예
<button><TrashIcon /></button>

// ✅ 올바른 예
<button aria-label="삭제">
  <TrashIcon />
</button>
```

## 참고 자료

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
