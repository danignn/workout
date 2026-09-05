import { useMemo, useState } from 'react';
import { MEALS, MEAL_CATEGORIES, NUTRITION_NOTES, proteinTargetFor, type Meal, type MealCategory } from '../data/meals';
import { useApp } from '../store/AppContext';
import { Sheet } from '../components/Sheet';
import { CheckIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { formatShort, todayKey } from '../utils/date';

type Tab = 'ideas' | 'today' | 'notes';

export function MealsScreen() {
  const { state, addMealLog, removeMealLog, updateHabit } = useApp();
  const [tab, setTab] = useState<Tab>('ideas');
  const [category, setCategory] = useState<MealCategory>('breakfast');
  const [detail, setDetail] = useState<Meal | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const today = todayKey();
  const logged = state.meals[today] ?? [];
  const proteinLogged = logged.reduce((n, m) => n + m.protein, 0);
  const target = state.profile.proteinTargetOverride ?? proteinTargetFor(state.profile.bodyweightKg);
  const pct = Math.min(100, Math.round((proteinLogged / target) * 100));

  const filtered = useMemo(() => MEALS.filter((m) => m.category === category), [category]);

  const logMeal = (meal: Meal) => {
    addMealLog(today, { mealId: meal.id, name: meal.name, protein: meal.protein, slot: meal.category });
    setDetail(null);
    setToast(`${meal.name} logged`);
    window.setTimeout(() => setToast(null), 1800);
  };

  return (
    <>
      <div className="page-header">
        <div className="eyebrow">Fuel the growth</div>
        <h1>Meals</h1>
        <p className="sub">Protein is the priority. Aim for {target}g a day.</p>
      </div>

      <div className="page stack">
        <div className="card">
          <div className="row-between" style={{ marginBottom: 8 }}>
            <span className="small bold">Protein today</span>
            <span className="small num bold" style={{ color: 'var(--pink-600)' }}>{proteinLogged}g / {target}g</span>
          </div>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
          <p className="tiny faint" style={{ marginTop: 8 }}>
            {proteinLogged >= target
              ? 'Target hit. That is the single most important nutrition box for glute growth.'
              : `${target - proteinLogged}g to go. Roughly ${Math.ceil((target - proteinLogged) / 25)} more protein-led ${Math.ceil((target - proteinLogged) / 25) === 1 ? 'meal or snack' : 'meals or snacks'}.`}
          </p>
        </div>

        <div className="chip-row">
          {([['ideas', 'Meal ideas'], ['today', `Today (${logged.length})`], ['notes', 'Nutrition']] as [Tab, string][]).map(([id, label]) => (
            <button key={id} className={`chip${tab === id ? ' active' : ''}`} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>

        {tab === 'ideas' && (
          <div className="stack">
            <div className="chip-row">
              {MEAL_CATEGORIES.map((c) => (
                <button key={c.id} className={`chip${category === c.id ? ' active' : ''}`} onClick={() => setCategory(c.id)}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            {filtered.map((meal) => (
              <button key={meal.id} className="card row" style={{ gap: 12, textAlign: 'left' }} onClick={() => setDetail(meal)}>
                <span className="grow">
                  <span className="bold" style={{ display: 'block' }}>{meal.name}</span>
                  <span className="tiny muted">{meal.minutes} min · {meal.calories} kcal · {meal.tags.slice(0, 2).join(', ')}</span>
                </span>
                <span className="pill">{meal.protein}g protein</span>
              </button>
            ))}
          </div>
        )}

        {tab === 'today' && (
          <div className="stack">
            <button className="btn btn-ghost btn-block" onClick={() => setCustomOpen(true)}>
              <PlusIcon size={16} /> Add something not on the list
            </button>

            {logged.length === 0 ? (
              <div className="empty-state">
                <span className="emoji">🍓</span>
                Nothing logged yet today. Tap a meal idea to add it, or log your own.
              </div>
            ) : (
              MEAL_CATEGORIES.map((c) => {
                const items = logged.filter((m) => m.slot === c.id);
                if (items.length === 0) return null;
                return (
                  <div key={c.id} className="card stack-sm">
                    <div className="section-title" style={{ margin: 0 }}>{c.emoji} {c.label}</div>
                    {items.map((item) => (
                      <div key={item.id} className="row-between" style={{ paddingTop: 8, borderTop: '1px solid var(--line)' }}>
                        <span className="grow small">{item.name}</span>
                        <span className="pill">{item.protein}g</span>
                        <button className="icon-btn" onClick={() => removeMealLog(today, item.id)} aria-label={`Remove ${item.name}`}>
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })
            )}

            {logged.length > 0 && (
              <button
                className={`btn btn-block${state.habits[today]?.proteinHit ? ' btn-ghost' : ''}`}
                onClick={() => updateHabit(today, { proteinHit: !state.habits[today]?.proteinHit })}
              >
                <CheckIcon size={17} />
                {state.habits[today]?.proteinHit ? 'Protein target marked hit' : 'Mark protein target hit'}
              </button>
            )}

            <p className="tiny faint center">Showing {formatShort(today)}. Yesterday’s log stays saved, it just is not shown here.</p>
          </div>
        )}

        {tab === 'notes' && (
          <div className="stack">
            {NUTRITION_NOTES.map((n) => (
              <div key={n.title} className="card">
                <h3>{n.title}</h3>
                <p className="small muted" style={{ marginTop: 6 }}>{n.body}</p>
              </div>
            ))}
            <div className="card card-flat">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Your target</div>
              <p className="small muted">
                Based on {state.profile.bodyweightKg}kg bodyweight, your protein target is {target}g a day.
                Change your weight in the Me tab to update it.
              </p>
            </div>
          </div>
        )}
      </div>

      <Sheet open={detail !== null} onClose={() => setDetail(null)} title={detail?.name}>
        {detail && (
          <div className="stack">
            <div className="row wrap" style={{ gap: 6 }}>
              <span className="pill">{detail.protein}g protein</span>
              <span className="pill pill-outline">{detail.calories} kcal</span>
              <span className="pill pill-outline">{detail.minutes} min</span>
              {detail.tags.map((t) => <span key={t} className="pill pill-mint">{t}</span>)}
            </div>
            <div>
              <div className="section-title" style={{ marginTop: 4 }}>Ingredients</div>
              <ul className="cue-list">
                {detail.ingredients.map((i) => <li key={i}>{i}</li>)}
              </ul>
            </div>
            <div>
              <div className="section-title">Method</div>
              <p className="small muted">{detail.method}</p>
            </div>
            <button className="btn btn-block" onClick={() => logMeal(detail)}>
              <PlusIcon size={16} /> Log this for today
            </button>
          </div>
        )}
      </Sheet>

      <CustomMealSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={(item) => {
          addMealLog(today, item);
          setCustomOpen(false);
        }}
      />

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function CustomMealSheet({
  open,
  onClose,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (item: { name: string; protein: number; slot: MealCategory }) => void;
}) {
  const [name, setName] = useState('');
  const [protein, setProtein] = useState('');
  const [slot, setSlot] = useState<MealCategory>('lunch');

  const save = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), protein: Number(protein) || 0, slot });
    setName('');
    setProtein('');
  };

  return (
    <Sheet open={open} onClose={onClose} title="Log your own">
      <div className="stack">
        <div className="field">
          <label htmlFor="c-name">What did you eat?</label>
          <input id="c-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chicken shawarma wrap" />
        </div>
        <div className="field">
          <label htmlFor="c-protein">Protein (g, estimate is fine)</label>
          <input id="c-protein" className="input" type="number" inputMode="numeric" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="30" />
        </div>
        <div className="field">
          <label htmlFor="c-slot">Meal</label>
          <select id="c-slot" className="input" value={slot} onChange={(e) => setSlot(e.target.value as MealCategory)}>
            {MEAL_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <button className="btn btn-block" onClick={save} disabled={!name.trim()}>Add to today</button>
      </div>
    </Sheet>
  );
}
