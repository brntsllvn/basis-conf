import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { GridPage } from './components/grid/GridPage';
import { LinearSchedulePage } from './components/schedule/LinearSchedulePage';
import { PeoplePage } from './components/people/PeoplePage';
import { ScheduleProvider } from './state/ScheduleContext';
import { AttendeePage } from './components/guide/AttendeePage';
import { LandingPage } from './components/landing/LandingPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/grid" replace /> },
      { path: 'grid', element: <GridPage /> },
      { path: 'schedule', element: <LinearSchedulePage /> },
      { path: 'people', element: <PeoplePage /> },
    ],
  },
  {
    path: '/northwest-2026',
    element: <LandingPage />,
  },
  {
    path: '/northwest-2026/agenda',
    element: (
      <ScheduleProvider>
        <AttendeePage />
      </ScheduleProvider>
    ),
  },
]);
