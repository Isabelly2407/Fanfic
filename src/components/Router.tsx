import { MemberProvider } from '@/integrations';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { ScrollToTop } from '@/lib/scroll-to-top';
import ErrorPage from '@/integrations/errorHandlers/ErrorPage';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

// Pages
import HomePage from '@/components/pages/HomePage';
import ProfilePage from '@/components/pages/ProfilePage';
import EditorPage from '@/components/pages/EditorPage';
import CharactersPage from '@/components/pages/CharactersPage';
import NarrativeTreePage from '@/components/pages/NarrativeTreePage';
import TimelinePage from '@/components/pages/TimelinePage';
import LanguageBankPage from '@/components/pages/LanguageBankPage';
import SettingsPage from '@/components/pages/SettingsPage';

// Layout component that includes ScrollToTop
function Layout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />, // MIXED ROUTE: Shows different content for authenticated vs anonymous users
      },
      {
        path: "profile",
        element: (
          <MemberProtectedRoute>
            <ProfilePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "editor",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para acessar o editor de histórias">
            <EditorPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "characters",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para gerenciar seus personagens">
            <CharactersPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "narrative-tree",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para visualizar sua árvore narrativa">
            <NarrativeTreePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "timeline",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para acessar sua linha do tempo">
            <TimelinePage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "language-bank",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para acessar o banco de linguagem">
            <LanguageBankPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <MemberProtectedRoute messageToSignIn="Faça login para acessar as configurações">
            <SettingsPage />
          </MemberProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
], {
  basename: import.meta.env.BASE_NAME,
});

export default function AppRouter() {
  return (
    <MemberProvider>
      <RouterProvider router={router} />
    </MemberProvider>
  );
}
