import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { TodayPage } from './pages/TodayPage'
import { RecipesPage } from './pages/RecipesPage'
import { RecipeDetailPage } from './pages/RecipeDetailPage'
import { AddRecipePage } from './pages/AddRecipePage'
import { PlanPage } from './pages/PlanPage'
import { ShoppingPage } from './pages/ShoppingPage'
import { ProfilePage } from './pages/ProfilePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/recipes" replace />} />
          <Route path="/today" element={<TodayPage />} />
          <Route path="/recipes" element={<RecipesPage />} />
          <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          <Route path="/recipes/add" element={<AddRecipePage />} />
          <Route path="/plan" element={<PlanPage />} />
          <Route path="/shopping" element={<ShoppingPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
