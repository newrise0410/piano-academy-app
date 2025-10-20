# 컴포넌트 라이브러리 (Component Library)

피아노 학원 앱의 재사용 가능한 공통 컴포넌트 가이드입니다.

## 📋 목차

- [개요](#개요)
- [설치 및 사용](#설치-및-사용)
- [폼 컴포넌트](#폼-컴포넌트)
- [레이아웃 컴포넌트](#레이아웃-컴포넌트)
- [상태 표시 컴포넌트](#상태-표시-컴포넌트)
- [필터 및 선택 컴포넌트](#필터-및-선택-컴포넌트)
- [빈 상태 컴포넌트](#빈-상태-컴포넌트)
- [통계 컴포넌트](#통계-컴포넌트)

---

## 개요

모든 공통 컴포넌트는 `src/components/common/`에 위치하며, 중앙 index 파일을 통해 export됩니다.

### 디자인 원칙

1. **일관성**: 모든 컴포넌트는 동일한 디자인 시스템 사용
2. **재사용성**: Props를 통한 유연한 커스터마이징
3. **접근성**: 명확한 시각적 피드백 및 상태 표시
4. **타입 안전성**: JSDoc을 통한 명확한 타입 정의

---

## 설치 및 사용

### Import 방법

```javascript
// 개별 import
import { FormInput, Button, SectionCard } from '../../components/common';

// 또는 특정 컴포넌트만
import FormInput from '../../components/common/FormInput';
```

### 스타일링

- **NativeWind v4** 사용 (TailwindCSS for React Native)
- **색상**: `src/styles/teacher_colors.js`, `parent_colors.js`, `auth_colors.js`
- **폰트**: MaruBuri (Regular, Bold)

---

## 폼 컴포넌트

### FormInput

텍스트 입력 필드 컴포넌트입니다.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | string | - | 입력 필드 레이블 |
| `value` | string | - | 입력값 |
| `onChangeText` | function | - | 값 변경 핸들러 |
| `placeholder` | string | - | 플레이스홀더 |
| `error` | string | - | 에러 메시지 |
| `iconName` | string | - | 왼쪽 아이콘 (Ionicons) |
| `rightIconName` | string | - | 오른쪽 아이콘 (Ionicons) |
| `type` | string | `'text'` | 입력 타입: `text`, `email`, `phone`, `password`, `numeric`, `multiline` |
| `disabled` | boolean | `false` | 비활성화 상태 |
| `required` | boolean | `false` | 필수 입력 여부 |
| `maxLength` | number | - | 최대 글자 수 |
| `size` | string | `'medium'` | 크기: `small`, `medium`, `large` |

#### 사용 예시

```javascript
// 기본 사용
<FormInput
  label="이름"
  placeholder="학생 이름"
  value={name}
  onChangeText={setName}
  required
/>

// 전화번호 입력
<FormInput
  label="연락처"
  type="phone"
  iconName="call-outline"
  value={phone}
  onChangeText={setPhone}
/>

// 에러 표시
<FormInput
  label="이메일"
  type="email"
  value={email}
  onChangeText={setEmail}
  error="올바른 이메일을 입력하세요"
/>

// 여러 줄 입력
<FormInput
  label="메모"
  type="multiline"
  numberOfLines={4}
  value={memo}
  onChangeText={setMemo}
  maxLength={500}
/>
```

### Button

재사용 가능한 버튼 컴포넌트 (로딩 상태 지원)

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | 버튼 텍스트 |
| `onPress` | function | - | 클릭 핸들러 |
| `variant` | string | `'primary'` | 스타일: `primary`, `secondary`, `danger`, `success`, `outline`, `ghost` |
| `size` | string | `'medium'` | 크기: `small`, `medium`, `large` |
| `icon` | string | - | 왼쪽 아이콘 |
| `iconRight` | string | - | 오른쪽 아이콘 |
| `loading` | boolean | `false` | 로딩 상태 |
| `disabled` | boolean | `false` | 비활성화 상태 |
| `fullWidth` | boolean | `false` | 전체 너비 사용 |

#### 사용 예시

```javascript
// Primary 버튼
<Button
  title="저장"
  onPress={handleSave}
/>

// 로딩 상태
<Button
  title="저장 중..."
  loading={isSaving}
  disabled={isSaving}
/>

// Danger 버튼 (삭제)
<Button
  title="삭제"
  variant="danger"
  icon="trash-outline"
  onPress={handleDelete}
/>

// Outline 버튼
<Button
  title="취소"
  variant="outline"
  onPress={() => navigation.goBack()}
/>

// 전체 너비
<Button
  title="등록 완료"
  onPress={handleSubmit}
  fullWidth
/>
```

---

## 레이아웃 컴포넌트

### SectionCard

섹션 제목이 있는 카드 컴포넌트입니다.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | 섹션 제목 |
| `subtitle` | string | - | 부제목 |
| `iconName` | string | - | 제목 옆 아이콘 |
| `rightText` | string | - | 오른쪽 텍스트 |
| `onRightPress` | function | - | 오른쪽 영역 클릭 핸들러 |
| `variant` | string | `'default'` | 스타일: `default`, `gradient`, `outlined`, `flat`, `accent` |
| `noPadding` | boolean | `false` | 콘텐츠 패딩 제거 |
| `children` | ReactNode | - | 콘텐츠 |

#### 사용 예시

```javascript
// 기본 카드
<SectionCard title="기본 정보" iconName="person-outline">
  <FormInput label="이름" value={name} onChangeText={setName} />
  <FormInput label="나이" value={age} onChangeText={setAge} />
</SectionCard>

// 액션 버튼 있는 카드
<SectionCard
  title="출석 기록"
  rightText="전체보기"
  onRightPress={() => navigation.navigate('AttendanceList')}
>
  {/* 콘텐츠 */}
</SectionCard>

// 그라디언트 카드
<SectionCard
  title="이번 달 통계"
  variant="gradient"
  gradientColors={['#8B5CF6', '#7C3AED']}
>
  {/* 통계 콘텐츠 */}
</SectionCard>

// 강조 보더 카드
<SectionCard
  title="중요 공지"
  variant="accent"
  accentColor="#EF4444"
>
  {/* 공지 내용 */}
</SectionCard>
```

### InfoCard

키-값 쌍 정보 표시 카드

```javascript
<InfoCard
  title="학생 정보"
  items={[
    { label: '이름', value: '김철수' },
    { label: '나이', value: '10세' },
    { label: '레벨', value: '중급' },
    { label: '수업 시간', value: '월/수 16:00' },
  ]}
/>
```

### StatCard

통계 표시 카드

```javascript
<StatCard
  title="전체 학생"
  value="24명"
  iconName="people"
  color="#8B5CF6"
/>
```

### ActionCard

클릭 가능한 액션 카드

```javascript
<ActionCard
  title="공지사항 작성"
  description="새로운 공지를 작성하세요"
  iconName="megaphone-outline"
  onPress={() => navigation.navigate('NoticeCreate')}
/>
```

---

## 상태 표시 컴포넌트

### StatusBadge

상태/레벨/카테고리 배지

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'custom'` | 타입: `level`, `attendance`, `payment`, `category`, `ticket`, `custom` |
| `value` | string | - | 배지 값 |
| `variant` | string | `'small'` | 크기: `small`, `medium`, `large` |
| `iconName` | string | - | 아이콘 (Ionicons) |
| `customColors` | object | - | 커스텀 색상 `{ bg, text, border }` |

#### 사용 예시

```javascript
// 레벨 배지
<StatusBadge type="level" value="중급" />

// 출석 상태
<StatusBadge type="attendance" value="출석" />

// 결제 상태
<StatusBadge type="payment" value="미납" />

// 커스텀 배지
<StatusBadge
  type="custom"
  value="진행 중"
  customColors={{ bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' }}
  iconName="time-outline"
/>
```

#### 사전 정의된 배지 변형

```javascript
import {
  LevelBadge,
  AttendanceStatusBadge,
  PaymentStatusBadge,
  CategoryBadge,
  UnpaidBadge
} from '../../components/common';

// 레벨 배지
<LevelBadge level="초급" />

// 출석 상태 배지
<AttendanceStatusBadge status="출석" />

// 결제 상태 배지
<PaymentStatusBadge status="완납" />

// 카테고리 배지
<CategoryBadge category="클래식" />

// 미납 경고
<UnpaidBadge />
```

---

## 필터 및 선택 컴포넌트

### FilterChip

필터 칩 컴포넌트 (단일/다중 선택)

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | Array | - | 옵션 배열 `[{ value, label, icon?, count? }]` |
| `value` | string\|Array | - | 선택된 값 |
| `onChange` | function | - | 변경 핸들러 |
| `multiple` | boolean | `false` | 다중 선택 여부 |
| `variant` | string | `'default'` | 스타일: `default`, `outlined`, `filled` |
| `layout` | string | `'horizontal'` | 레이아웃: `horizontal`, `wrapped` |
| `size` | string | `'medium'` | 크기: `small`, `medium`, `large` |

#### 사용 예시

```javascript
// 단일 선택 필터
<FilterChip
  options={[
    { value: 'all', label: '전체', count: 24 },
    { value: 'beginner', label: '초급', count: 10 },
    { value: 'intermediate', label: '중급', count: 8 },
    { value: 'advanced', label: '고급', count: 6 },
  ]}
  value={selectedLevel}
  onChange={setSelectedLevel}
/>

// 다중 선택
<FilterChip
  options={[
    { value: 'mon', label: '월', icon: 'calendar' },
    { value: 'wed', label: '수' },
    { value: 'fri', label: '금' },
  ]}
  value={selectedDays}
  onChange={setSelectedDays}
  multiple
/>

// Wrapped 레이아웃
<FilterChip
  options={categories}
  value={selectedCategory}
  onChange={setSelectedCategory}
  layout="wrapped"
/>
```

### SegmentedControl

세그먼트 컨트롤 (탭 형태)

```javascript
<SegmentedControl
  options={[
    { value: 'count', label: '회차권' },
    { value: 'period', label: '기간권' },
  ]}
  value={ticketType}
  onChange={setTicketType}
/>
```

---

## 빈 상태 컴포넌트

### EmptyState

데이터 없음 상태 표시

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconName` | string | `'alert-circle-outline'` | 아이콘 (Ionicons) |
| `title` | string | - | 제목 |
| `description` | string | - | 설명 |
| `ctaText` | string | - | CTA 버튼 텍스트 |
| `onCtaPress` | function | - | CTA 버튼 핸들러 |
| `variant` | string | `'default'` | 스타일: `default`, `compact`, `illustration` |

#### 사용 예시

```javascript
// 기본 빈 상태
<EmptyState
  iconName="people-outline"
  title="등록된 학생이 없습니다"
  description="새 학생을 등록하여 관리를 시작하세요"
  ctaText="학생 등록"
  onCtaPress={() => navigation.navigate('StudentForm')}
/>

// Compact 변형
<EmptyState
  iconName="search-outline"
  title="검색 결과가 없습니다"
  variant="compact"
/>
```

#### 사전 정의된 빈 상태 컴포넌트

```javascript
import {
  NoStudents,
  NoNotices,
  NoSearchResults,
  NoAttendanceRecords,
  NetworkError
} from '../../components/common';

// 학생 없음
<NoStudents onAddStudent={() => navigation.navigate('StudentForm')} />

// 공지사항 없음
<NoNotices onCreateNotice={() => navigation.navigate('NoticeCreate')} />

// 검색 결과 없음
<NoSearchResults searchQuery={query} onClear={() => setQuery('')} />

// 출석 기록 없음
<NoAttendanceRecords />

// 네트워크 에러
<NetworkError onRetry={fetchData} />
```

---

## 통계 컴포넌트

### StatBox

통계 박스 컴포넌트

```javascript
<StatBox
  number="24"
  label="전체 학생"
  icon="people"
  variant="purple"
/>
```

### ProgressBar

진행률 표시 바

```javascript
<ProgressBar
  progress={75}
  color="#8B5CF6"
  height={8}
/>
```

---

## 컴포넌트 조합 예시

### 학생 등록 폼

```javascript
<ScrollView>
  <SectionCard title="기본 정보" iconName="person-outline">
    <FormInput
      label="이름"
      value={name}
      onChangeText={setName}
      required
      style={{ marginBottom: 16 }}
    />

    <FormInput
      label="연락처"
      type="phone"
      iconName="call-outline"
      value={phone}
      onChangeText={setPhone}
      style={{ marginBottom: 16 }}
    />

    <View className="mb-4">
      <Text className="text-sm font-semibold text-gray-700 mb-2">레벨</Text>
      <SegmentedControl
        options={[
          { value: 'beginner', label: '초급' },
          { value: 'intermediate', label: '중급' },
          { value: 'advanced', label: '고급' },
        ]}
        value={level}
        onChange={setLevel}
      />
    </View>
  </SectionCard>

  <Button
    title="등록 완료"
    onPress={handleSubmit}
    loading={isSubmitting}
    fullWidth
  />
</ScrollView>
```

### 학생 목록 화면

```javascript
<View className="flex-1">
  {/* 필터 */}
  <FilterChip
    options={levelOptions}
    value={selectedLevel}
    onChange={setSelectedLevel}
  />

  {/* 리스트 또는 빈 상태 */}
  {students.length === 0 ? (
    <NoStudents
      onAddStudent={() => navigation.navigate('StudentForm')}
    />
  ) : (
    <FlatList
      data={students}
      renderItem={({ item }) => (
        <StudentCard student={item} />
      )}
    />
  )}
</View>
```

### 상세 정보 화면

```javascript
<ScrollView>
  <SectionCard
    title="학생 정보"
    rightText="수정"
    onRightPress={handleEdit}
  >
    <InfoCard
      items={[
        { label: '이름', value: student.name },
        { label: '나이', value: `${student.age}세` },
        { label: '레벨', value: student.level },
      ]}
    />
  </SectionCard>

  <SectionCard title="출석 현황" iconName="calendar-outline">
    <View className="flex-row items-center justify-between mb-2">
      <Text>출석률</Text>
      <Text className="font-bold">85%</Text>
    </View>
    <ProgressBar progress={85} color="#10B981" />
  </SectionCard>

  <Button
    title="삭제"
    variant="danger"
    onPress={handleDelete}
    fullWidth
  />
</ScrollView>
```

---

## 스타일 커스터마이징

### 색상 오버라이드

```javascript
<Button
  title="커스텀 버튼"
  variant="primary"
  className="bg-pink-500"  // 기본 색상 오버라이드
/>
```

### 추가 스타일

```javascript
<FormInput
  label="이름"
  value={name}
  onChangeText={setName}
  style={{ marginBottom: 20, borderRadius: 20 }}
  inputStyle={{ fontSize: 18 }}
/>
```

---

## 베스트 프랙티스

### ✅ DO (권장)

1. **일관된 컴포넌트 사용**
   ```javascript
   // ✅ 공통 컴포넌트 사용
   <FormInput label="이름" value={name} onChangeText={setName} />

   // ❌ 직접 TextInput 사용
   <TextInput placeholder="이름" value={name} onChangeText={setName} />
   ```

2. **Props 재사용**
   ```javascript
   // ✅ Props 분리
   const inputProps = {
     label: "이름",
     required: true,
     style: { marginBottom: 16 }
   };
   <FormInput {...inputProps} value={name} onChangeText={setName} />
   ```

3. **조건부 렌더링**
   ```javascript
   // ✅ 조건부로 EmptyState 표시
   {students.length === 0 ? (
     <NoStudents onAddStudent={handleAdd} />
   ) : (
     <StudentList data={students} />
   )}
   ```

### ❌ DON'T (비권장)

1. **인라인 스타일 남용**
   ```javascript
   // ❌ 과도한 인라인 스타일
   <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>

   // ✅ SectionCard 사용
   <SectionCard style={{ marginBottom: 16 }}>
   ```

2. **중복 코드**
   ```javascript
   // ❌ 반복되는 입력 필드 스타일
   <TextInput className="bg-gray-50 rounded-xl p-4 border border-gray-200" />
   <TextInput className="bg-gray-50 rounded-xl p-4 border border-gray-200" />

   // ✅ FormInput 재사용
   <FormInput label="이름" value={name} onChangeText={setName} />
   <FormInput label="나이" value={age} onChangeText={setAge} />
   ```

---

## 향후 계획

- [ ] DatePicker 컴포넌트 추가
- [ ] Modal/Dialog 컴포넌트 추가
- [ ] BottomSheet 컴포넌트 추가
- [ ] Avatar 컴포넌트 추가
- [ ] Checkbox/Radio 컴포넌트 추가
- [ ] Switch 컴포넌트 추가
- [ ] Storybook 통합

---

## 참고 자료

- [컴포넌트 소스 코드](../src/components/common/)
- [에러 처리 가이드](./ERROR_HANDLING.md)
- [상태 관리 가이드](./ZUSTAND_STATE_MANAGEMENT.md)
- [유틸리티 함수](../src/utils/)

---

**작성일**: 2025-10-20
**버전**: 1.0.0
