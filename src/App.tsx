import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AppProvider } from './store/AppContext';
import { RestTimerProvider } from './components/RestTimer';
import { TabBar } from './components/TabBar';
import { ThemeApplier } from './components/ThemeApplier';
import { Mascot } from './components/Mascot';
import { TodayScreen } from './screens/TodayScreen';
import { PlanScreen } from './screens/PlanScreen';
import { WorkoutScreen } from './screens/WorkoutScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { MealsScreen } from './screens/MealsScreen';
import { MeScreen } from './screens/MeScreen';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <ThemeApplier />
        <RestTimerProvider>
          <div className="app-shell">
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<TodayScreen />} />
              <Route path="/plan" element={<PlanScreen />} />
              <Route path="/workout/:sessionId" element={<WorkoutScreen />} />
              <Route path="/progress" element={<ProgressScreen />} />
              <Route path="/meals" element={<MealsScreen />} />
              <Route path="/me" element={<MeScreen />} />
              <Route path="*" element={<TodayScreen />} />
            </Routes>
            <TabBar />
          </div>
          <Mascot />
        </RestTimerProvider>
      </AppProvider>
    </HashRouter>
  );
}
