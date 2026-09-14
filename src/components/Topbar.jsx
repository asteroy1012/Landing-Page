import ThemeToggle from './ThemeToggle'

export default function Topbar({ theme, onToggleTheme }) {
  return (
    <header className="topbar">
      <span>ADITYA RAJ</span>
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
