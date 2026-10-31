import { NavLink } from 'react-router-dom'
import { Icon } from './Icons.jsx'

const items = [
  { to: '/admin/creditos', label: 'Inicio', icon: 'home', end: true },
  { to: '/admin/creditos/solicitudes', label: 'Solicitudes', icon: 'folder' },
  { to: '/admin/creditos/documentos', label: 'Documentos', icon: 'file' },
  { to: '/admin/creditos/catalogo', label: 'Catálogo de créditos', icon: 'layers' },
  { to: '/admin/creditos/requisitos', label: 'Requisitos', icon: 'check' },
  { to: '/admin/creditos/reportes', label: 'Reportes', icon: 'chart' },
  { to: '/admin/creditos/configuracion', label: 'Configuración', icon: 'shield' },
]

export function AdminSidebar({ onNavigate }) {
  return (
    <aside className="admin-side">
      <p className="eyebrow">Demostración</p>
      <strong>Panel interno simulado</strong>
      <nav aria-label="Administración de demostración">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate}>
            <Icon name={item.icon} size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
