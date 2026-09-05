import { NavLink } from 'react-router-dom';
import { CalendarIcon, ChartIcon, HomeIcon, MealIcon, UserIcon } from './Icons';

const TABS = [
  { to: '/', label: 'Today', Icon: HomeIcon, end: true },
  { to: '/plan', label: 'Plan', Icon: CalendarIcon, end: false },
  { to: '/progress', label: 'Progress', Icon: ChartIcon, end: false },
  { to: '/meals', label: 'Meals', Icon: MealIcon, end: false },
  { to: '/me', label: 'Me', Icon: UserIcon, end: false },
];

export function TabBar() {
  return (
    <nav className="tabbar" aria-label="Main">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
