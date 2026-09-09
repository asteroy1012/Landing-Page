import { SECTIONS } from '../data/content'

export default function Rail({ activeKey, visible }) {
  return (
    <nav className={`rail${visible ? ' is-visible' : ''}`} aria-label="Section navigation">
      {SECTIONS.map((s) => (
        <a key={s.key} href={`#${s.key}`} className={activeKey === s.key ? 'is-active' : ''}>
          {s.label}
        </a>
      ))}
    </nav>
  )
}
