import { Outlet } from 'react-router-dom'
import { DemoBanner } from './DemoBanner.jsx'
import { InstitutionalFooter } from './InstitutionalFooter.jsx'
import { InstitutionalHeader } from './InstitutionalHeader.jsx'

export function PublicLayout() {
  return (
    <>
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      <InstitutionalHeader />
      <DemoBanner />
      <main id="contenido">
        <Outlet />
      </main>
      <InstitutionalFooter />
    </>
  )
}
