import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';
import SetupPage from './pages/SetupPage';
import WeeklyMenuPage from './pages/WeeklyMenuPage';
import ShoppingListPage from './pages/ShoppingListPage';
import RecipePage from './pages/RecipePage';
import EquivalenciasPage from './pages/EquivalenciasPage';
import './App.css';

export default function App() {
  const location = useLocation();
  const planId = location.pathname.split('/')[2];
  const inPlan = location.pathname.startsWith('/plan/');

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          <span className="brand-mark">P</span>
          <span className="font-display brand-name">PlanEats</span>
        </Link>
        <nav className="app-nav">
          {inPlan && planId && (
            <>
              <Link to={`/plan/${planId}`} className={isActive(location.pathname, `/plan/${planId}`, true)}>
                Menú
              </Link>
              <Link to={`/plan/${planId}/shopping-list`} className={isActive(location.pathname, 'shopping-list')}>
                Lista de compras
              </Link>
            </>
          )}
          <Link to="/equivalencias" className={isActive(location.pathname, 'equivalencias')}>
            Tabla de equivalencias
          </Link>
        </nav>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<ProfilePage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/plan/:planId" element={<WeeklyMenuPage />} />
          <Route path="/plan/:planId/shopping-list" element={<ShoppingListPage />} />
          <Route path="/plan/:planId/recipe/:recipeId" element={<RecipePage />} />
          <Route path="/equivalencias" element={<EquivalenciasPage />} />
        </Routes>
      </main>
    </div>
  );
}

function isActive(pathname: string, needle: string, exact = false) {
  const match = exact ? pathname === needle : pathname.includes(needle);
  return match ? 'nav-link nav-link-active' : 'nav-link';
}
