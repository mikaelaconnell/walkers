import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/auth';
import { colors, creamA, fonts } from '@/theme/tokens';

const LABELS: Record<string, string> = { walks: 'walks', recaps: 'recaps', shop: 'shop', you: 'you' };

export function TextTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.clubBlue, borderTopWidth: 1.5, borderColor: creamA(0.4), paddingBottom: insets.bottom }}>
      {state.routes.map((route, i) => {
        const active = state.index === i;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 14, minHeight: 44, borderTopWidth: 2.5, borderColor: active ? colors.cream : 'transparent', marginTop: -1.5 }}
          >
            <Text style={{ fontFamily: active ? fonts.heading : fonts.headingSemi, fontSize: 11, color: active ? colors.cream : creamA(0.5) }}>
              {LABELS[route.name] ?? route.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const { session, profile, loading } = useAuth();
  if (loading) return null;
  if (session && !profile) return <Redirect href="/apply" />;
  if (session && profile && profile.membership_status !== 'approved') return <Redirect href="/pending" />;
  // expo-router SDK 57 vendors its own bottom-tabs types; they match @react-navigation/bottom-tabs at runtime but differ in unused header option types, so the props are cast once here
  return (
    <Tabs tabBar={(props) => <TextTabBar {...(props as unknown as BottomTabBarProps)} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.clubBlue } }}>
      <Tabs.Screen name="walks" />
      <Tabs.Screen name="recaps" />
      <Tabs.Screen name="shop" />
      <Tabs.Screen name="you" />
    </Tabs>
  );
}
