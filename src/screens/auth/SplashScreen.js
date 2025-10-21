// src/screens/auth/SplashScreen.js
import { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Text from '../../components/common/Text';
import { AUTH_GRADIENTS } from '../../styles/auth_colors';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const login = useAuthStore((state) => state.login);

  // 애니메이션 값
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const buttonSlideAnim = useRef(new Animated.Value(50)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 초기 진입 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(buttonSlideAnim, {
        toValue: 0,
        duration: 600,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // 로고 떠다니는 애니메이션
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient
      colors={AUTH_GRADIENTS.splashGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* 상단 장식 요소 */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 40,
            right: 30,
            opacity: fadeAnim,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            }}
          />
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            top: 120,
            left: -30,
            opacity: fadeAnim,
          }}
        >
          <View
            style={{
              width: 150,
              height: 150,
              borderRadius: 75,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          />
        </Animated.View>

        {/* 메인 컨텐츠 */}
        <View style={{ flex: 1, justifyContent: 'space-between', paddingHorizontal: 32 }}>
          {/* 로고 영역 */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.View
              style={{
                alignItems: 'center',
                transform: [
                  { scale: logoScaleAnim },
                  { translateY: floatAnim },
                ],
                opacity: fadeAnim,
              }}
            >
              {/* 로고 배경 원 */}
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 32,
                }}
              >
                <Text className="text-7xl">🎹</Text>
              </View>

              <Text className="text-5xl font-bold text-white mb-3">Piano Academy</Text>
              <Text className="text-white text-base opacity-90 text-center">
                학원 관리를 스마트하게
              </Text>
              <View className="mt-4 flex-row items-center space-x-2">
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  }}
                />
                <Text className="text-white text-sm opacity-70">
                  출석 · 수납 · 알림장 관리
                </Text>
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                  }}
                />
              </View>
            </Animated.View>
          </View>

          {/* 버튼 영역 */}
          <Animated.View
            style={{
              paddingBottom: 40,
              transform: [{ translateY: buttonSlideAnim }],
              opacity: fadeAnim,
            }}
          >
            {/* 시작하기 버튼 */}
            <TouchableOpacity
              className="w-full bg-white rounded-2xl py-4 items-center mb-4"
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text className="text-purple-600 text-lg font-bold">시작하기</Text>
            </TouchableOpacity>

            {/* 회원가입 버튼 */}
            <TouchableOpacity
              className="w-full border-2 border-white rounded-2xl py-4 items-center mb-4"
              onPress={() => navigation.navigate('RoleSelect')}
              activeOpacity={0.8}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            >
              <Text className="text-white text-lg font-bold">회원가입</Text>
            </TouchableOpacity>

            {/* 하단 안내 텍스트 */}
            <Text className="text-white text-xs text-center opacity-60 mt-4">
              로그인하시면 이용약관 및 개인정보처리방침에 동의하게 됩니다
            </Text>
          </Animated.View>
        </View>

        {/* 디버깅용 빠른 로그인 (개발 모드에서만) */}
        {__DEV__ && (
          <View
            style={{
              position: 'absolute',
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                // 디버그 버튼 표시/숨김 토글용 (추후 구현 가능)
              }}
            >
              <Text className="text-white text-xs text-center mb-2 opacity-40">
                개발자 모드
              </Text>
            </TouchableOpacity>
            <View className="flex-row justify-center space-x-3">
              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'rgba(139, 92, 246, 0.3)' }}
                onPress={() => {
                  login({
                    id: '1',
                    email: 'teacher@test.com',
                    displayName: '김원장',
                    role: 'teacher',
                  });
                }}
                activeOpacity={0.7}
              >
                <Text className="text-white text-xs font-semibold">선생님</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-4 py-2 rounded-lg"
                style={{ backgroundColor: 'rgba(236, 72, 153, 0.3)' }}
                onPress={() => {
                  login({
                    id: '2',
                    email: 'parent@test.com',
                    displayName: '학부모',
                    role: 'parent',
                  });
                }}
                activeOpacity={0.7}
              >
                <Text className="text-white text-xs font-semibold">학부모</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}
