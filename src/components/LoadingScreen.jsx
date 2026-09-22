export function LoadingScreen({ visible }) {
  return (
    <div className={`loading-screen${visible ? '' : ' done'}`} aria-hidden={!visible}>
      <img src="/media/portada.jpeg" alt="Metaverso Xupply" />
      <div className="loading-fade" />
      <div className="loading-body">
        <span className="loading-badge">XUPPLY</span>
        <p className="loading-title">Metaverso Xupply</p>
        <p className="loading-sub">
          Preparando el museo, el gato-ovni y la hamburguesa voladora…
        </p>
        <div className="loading-spinner" />
      </div>
    </div>
  )
}