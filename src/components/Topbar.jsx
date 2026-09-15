import ThemeToggle from './ThemeToggle'

export default function Topbar({ theme, onToggleTheme, showWordmark }) {
  return (
    <header className="topbar">
      {/* Hidden while the hero's giant name is on screen, so it isn't said twice. */}
      <span className={`topbar__wordmark${showWordmark ? '' : ' is-hidden'}`}>ADITYA RAJ</span>
      <div className="topbar-links">
        <a href="/aditya-raj-resume.pdf" target="_blank" rel="noopener noreferrer">
          Resume ↗
        </a>
        <a href="#connect">Contact ↓</a>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
