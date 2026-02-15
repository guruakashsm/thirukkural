import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

interface CategoryCardProps {
  name: string
  tamilName: string
  englishName: string
  icon: string
  chapterCount: number
  color: string
}

export default function CategoryCard({ name, tamilName, englishName, icon, chapterCount, color }: CategoryCardProps) {
  const { t } = useLanguage()
  const translatedName = t(englishName.toLowerCase())

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(name)}&focus=division`}
      className="no-underline block bg-gradient-to-br from-white to-parchment/30 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-500 hover:-translate-y-1"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-3xl mb-4"
        style={{ backgroundColor: color + '15', border: `1px solid ${color}30` }}
      >
        {icon}
      </div>
      <h3 className="font-tamil text-xl font-semibold text-dark mb-1">{tamilName}</h3>
      <p className="text-sm font-medium mb-3" style={{ color }}>{translatedName}</p>
      <p className="font-tamil text-xs text-gray-light">{chapterCount} {t('chapters')}</p>
    </Link>
  )
}
