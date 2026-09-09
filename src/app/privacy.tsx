import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { MonoLabel } from '../components/MonoLabel';
import { Screen } from '../components/Screen';
import { Serif } from '../components/Serif';
import { StripedHeading } from '../components/StripedHeading';

const SECTIONS: Array<{ heading: string; body: string }> = [
  {
    heading: 'who we are',
    body: 'Walkers Social Club New York is a small walking club in New York City. This page explains what information we keep when you use the Walkers New York app or website, and what we do with it.',
  },
  {
    heading: 'what we collect',
    body: 'When you apply to the club we ask for your name, email address, Instagram handle, and what you tell us about yourself and your dog. If you join, we also keep your walk RSVPs so we know who is coming on Saturday. If you buy something from the shop, we keep your email address and what you ordered so we can fulfill it.',
  },
  {
    heading: 'payments',
    body: 'Checkout is handled by Stripe. Your card number goes to Stripe, not to us. We never see it and we never store it.',
  },
  {
    heading: 'emails',
    body: 'We email you sign-in codes, a decision on your application, and club updates. We use a standard email delivery service to send them. We do not send marketing email for anyone else.',
  },
  {
    heading: 'what we do not do',
    body: 'We do not sell your information. We do not show ads. We do not track you across other apps or websites. Your information is used to run the club and the shop, and for nothing else.',
  },
  {
    heading: 'where it lives',
    body: 'Your information is stored with our database provider and protected by access rules, so members can only see what members should see. Walk meet points are only revealed to approved members shortly before each walk.',
  },
  {
    heading: 'deleting your account',
    body: 'You can delete your account any time from the You tab in the app. That permanently removes your profile, application, and walk history. You can also email us and we will delete it for you.',
  },
  {
    heading: 'questions',
    body: 'Email hello@walkersnewyork.com and a real person will get back to you.',
  },
];

export default function Privacy() {
  const router = useRouter();
  return (
    <Screen pad={24} gap={22}>
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={{ minHeight: 44, justifyContent: 'center' }}>
        <MonoLabel size={10}>{'←'} Back</MonoLabel>
      </Pressable>
      <StripedHeading text="privacy" size={30} />
      <MonoLabel size={9}>Effective September 9, 2026</MonoLabel>
      {SECTIONS.map((s) => (
        <View key={s.heading} style={{ gap: 8 }}>
          <StripedHeading text={s.heading} size={20} stripeHeight={14} />
          <Serif size={14}>{s.body}</Serif>
        </View>
      ))}
    </Screen>
  );
}
