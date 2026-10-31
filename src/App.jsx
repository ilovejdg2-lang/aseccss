import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout.jsx'
import { PublicLayout } from './components/PublicLayout.jsx'
import {
  AdminApplicationDetailPage,
  AdminApplicationsPage,
  AdminCatalogPage,
  AdminDashboardPage,
  AdminDocumentsPage,
  AdminReportsPage,
  AdminRequirementsPage,
  AdminSettingsPage,
} from './pages/admin/AdminPages.jsx'
import {
  ConfirmationStepPage,
  CreditDataStepPage,
  DocumentsStepPage,
  EmploymentStepPage,
  PersonalStepPage,
  ResultPage,
} from './pages/ApplicationPages.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CreditDetailPage } from './pages/CreditDetailPage.jsx'
import { CreditsHome } from './pages/CreditsHome.jsx'
import { FaqPage } from './pages/FaqPage.jsx'
import { MyCreditDetailPage } from './pages/MyCreditDetailPage.jsx'
import { MyCreditsPage } from './pages/MyCreditsPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProfilePage } from './pages/ProfilePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/creditos" replace />} />
        <Route path="/creditos" element={<CreditsHome />} />
        <Route path="/creditos/catalogo" element={<CatalogPage />} />
        <Route path="/creditos/preguntas-frecuentes" element={<FaqPage />} />
        <Route path="/creditos/solicitud/:id/datos-personales" element={<PersonalStepPage />} />
        <Route path="/creditos/solicitud/:id/informacion-laboral" element={<EmploymentStepPage />} />
        <Route path="/creditos/solicitud/:id/datos-del-credito" element={<CreditDataStepPage />} />
        <Route path="/creditos/solicitud/:id/documentos" element={<DocumentsStepPage />} />
        <Route path="/creditos/solicitud/:id/confirmacion" element={<ConfirmationStepPage />} />
        <Route path="/creditos/solicitud/:id/resultado" element={<ResultPage />} />
        <Route path="/creditos/:id" element={<CreditDetailPage />} />
        <Route path="/mis-creditos" element={<MyCreditsPage />} />
        <Route path="/mis-creditos/:ref" element={<MyCreditDetailPage />} />
        <Route path="/mi-perfil" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/admin/creditos" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="solicitudes" element={<AdminApplicationsPage />} />
        <Route path="solicitudes/:ref" element={<AdminApplicationDetailPage />} />
        <Route path="documentos" element={<AdminDocumentsPage />} />
        <Route path="catalogo" element={<AdminCatalogPage />} />
        <Route path="requisitos" element={<AdminRequirementsPage />} />
        <Route path="reportes" element={<AdminReportsPage />} />
        <Route path="configuracion" element={<AdminSettingsPage />} />
      </Route>
    </Routes>
  )
}
