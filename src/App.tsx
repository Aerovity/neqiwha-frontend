import { Navigate, Route, Routes } from 'react-router';
import { APIProvider } from '@vis.gl/react-google-maps';
import { useConfig } from './lib/queries';
import { useHistoryTrail } from './lib/history';
import { AppFrame } from './components/AppFrame';
import { Splash } from './components/Splash';
import { FatalError } from './components/FatalError';
import { RequireUser } from './components/RequireUser';
import { RewardCelebration } from './components/RewardCelebration';
import { MapScreen } from './screens/MapScreen';
import { LoginScreen } from './screens/LoginScreen';
import { CodeScreen } from './screens/CodeScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { RanksScreen } from './screens/RanksScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';
import { SpotScreen } from './screens/SpotScreen';
import { CreateSpotScreen } from './screens/CreateSpotScreen';
import { CheckinScreen } from './screens/CheckinScreen';
import { FinishScreen } from './screens/FinishScreen';
import { MyQrScreen } from './screens/MyQrScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ShopScreen } from './screens/ShopScreen';
import { WalletScreen } from './screens/WalletScreen';
import { VoucherScreen } from './screens/VoucherScreen';
import { KitScreen } from './screens/KitScreen';
import { AdminScreen } from './screens/AdminScreen';

export function App() {
  useHistoryTrail();
  const config = useConfig();
  if (config.isPending) return <Splash />;
  if (config.isError) return <FatalError onRetry={() => config.refetch()} />;
  return (
    <APIProvider apiKey={config.data.mapsApiKey}>
      <AppFrame>
        <Routes>
          <Route path="/" element={<MapScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/login/code" element={<CodeScreen />} />
          <Route path="/ranks" element={<RanksScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/spots/:id" element={<SpotScreen />} />
          {config.data.devTools && <Route path="/kit" element={<KitScreen />} />}
          <Route element={<RequireUser />}>
            <Route path="/onboarding" element={<OnboardingScreen />} />
            <Route path="/spots/new" element={<CreateSpotScreen />} />
            <Route path="/spots/:id/checkin" element={<CheckinScreen />} />
            <Route path="/spots/:id/finish" element={<FinishScreen />} />
            <Route path="/me/qr" element={<MyQrScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/shop" element={<ShopScreen />} />
            <Route path="/wallet" element={<WalletScreen />} />
            <Route path="/wallet/:id" element={<VoucherScreen />} />
            <Route path="/admin" element={<AdminScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <RewardCelebration />
      </AppFrame>
    </APIProvider>
  );
}
