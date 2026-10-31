import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { externalLinks, mainNav } from '../data/site.js'
import { Icon } from './Icons.jsx'

export function InstitutionalHeader() {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [logoFailed, setLogoFailed] = useState(false)
  const inModule =
    location.pathname.startsWith('/creditos') ||
    location.pathname.startsWith('/mis-creditos') ||
    location.pathname.startsWith('/mi-perfil')

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function submitSearch(event) {
    event.preventDefault()
    const term = query.trim()
    navigate(term ? `/creditos/catalogo?q=${encodeURIComponent(term)}` : '/creditos/catalogo')
    setSearchOpen(false)
  }

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link className="brand" to="/creditos" aria-label="ASECCSS, módulo de créditos">
          {logoFailed ? (
            <span className="logo-fallback">ASECCSS</span>
          ) : (
            <img src="/brand/logo.png" alt="ASECCSS" onError={() => setLogoFailed(true)} />
          )}
        </Link>

        <nav className="main-nav" aria-label="Secciones">
          {mainNav.map((item) =>
            item.to ? (
              <Link key={item.label} className={`nav-link ${inModule ? 'is-active' : ''}`} to={item.to} aria-current={inModule ? 'page' : undefined}>
                {item.label}
              </Link>
            ) : (
              <a key={item.label} className="nav-link" href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="header-tools">
          {searchOpen ? (
            <form className="search-form" onSubmit={submitSearch} role="search">
              <label className="sr-only" htmlFor="busqueda-creditos">
                Buscar créditos
              </label>
              <input
                id="busqueda-creditos"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar créditos"
                autoFocus
              />
              <button className="btn btn-primary btn-small" type="submit">
                Buscar
              </button>
            </form>
          ) : (
            <button className="icon-btn" type="button" aria-label="Buscar créditos" onClick={() => setSearchOpen(true)}>
              <Icon name="search" />
            </button>
          )}
          <a className="btn btn-psl" href={externalLinks.psl} target="_blank" rel="noopener noreferrer">
            Acceso PSL
          </a>
          <button
            className="icon-btn menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mobile-panel">
          <nav aria-label="Secciones móviles">
            {mainNav.map((item) =>
              item.to ? (
                <Link key={item.label} to={item.to} aria-current={inModule ? 'page' : undefined}>
                  {item.label}
                </Link>
              ) : (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer">
                  {item.label}
                </a>
              ),
            )}
            <Link to="/mis-creditos">Mis créditos</Link>
            <Link to="/mi-perfil">Mi perfil de demostración</Link>
            <a href={externalLinks.psl} target="_blank" rel="noopener noreferrer">
              Acceso PSL
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
