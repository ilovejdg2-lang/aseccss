import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { DemoBanner } from './DemoBanner.jsx'
import { AdminSidebar } from './AdminSidebar.jsx'
import { InstitutionalFooter } from './InstitutionalFooter.jsx'
import { Icon } from './Icons.jsx'

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  return (
    <div className="admin-shell">
      <a className="skip" href="#contenido">
        Saltar al contenido
      </a>
      {open ? <button className="admin-backdrop" type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)} /> : null}
      <div className={open ? 'admin-drawer is-open' : 'admin-drawer'}>
        <AdminSidebar onNavigate={() => setOpen(false)} />
      </div>
      <div className="admin-content">
        <header className="admin-top">
          <button className="icon-btn menu-toggle" type="button" aria-label="Abrir menú del panel" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
          <div>
            <strong>ASECCSS</strong>
            <span>Panel de demostración</span>
          </div>
          <Link to="/creditos">Volver al módulo público</Link>
        </header>
        <DemoBanner compact />
        <main id="contenido" className="admin-main">
          <Outlet />
        </main>
        <InstitutionalFooter />
      </div>
    </div>
  )
}
