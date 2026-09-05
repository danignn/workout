import { useMemo, useState } from 'react';
import {
  COOKWARE_LABEL,
  GROCERY_LIST,
  MEALS,
  MEAL_CATEGORIES,
  NUTRITION_NOTES,
  OPTIONAL_ITEMS,
  PRICE_NOTE,
  SUNDAY_PREP,
  basketCount,
  basketTotal,
  bestNextItem,
  fullListTotal,
  mealsFromBasket,
  proteinTargetFor,
  type Cuisine,
  type Meal,
  type MealCategory,
} from '../data/meals';
import { useApp } from '../store/AppContext';
import { Sheet } from '../components/Sheet';
import { CheckIcon, InfoIcon, PlusIcon, TrashIcon } from '../components/Icons';
import { formatShort, todayKey } from '../utils/date';

type Tab = 'ideas' | 'today' | 'grocery' | 'notes';

const peso = (n: number) => `₱${n.toLocaleString()}`;

export function MealsScreen() {
  const { state, addMealLog, removeMealLog, updateHabit, toggleGrocery, resetGrocery } = useApp();
  const [tab, setTab] = useState<Tab>('ideas');
  const [category, setCategory] = useState<MealCategory>('breakfast');
  const [cuisine, setCuisine] = useState<Cuisine | 'all'>('all');
  const [detail, setDetail] = useState<Meal | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const today = todayKey();
  const logged = state.meals[today] ?? [];
  const proteinLogged = logged.reduce((n, m) => n + m.protein, 0);
  const target = state.profile.proteinTargetOverride ?? proteinTargetFor(state.profile.bodyweightKg);
  const pct = Math.min(100, Math.round((proteinLogged / target) * 100));

  const filtered = useMemo(
    () => MEALS.filter((m) => m.category === category && (cuisine === 'all' || m.cuisine === cuisine)),
    [category, cuisine],
  );
  const basket = basketTotal(state.grocery);
  const picked = basketCount(state.grocery);
  const { ready, almost } = useMemo(() => mealsFromBasket(state.grocery), [state.grocery]);
  const nextItem = useMemo(() => bestNextItem(state.grocery), [state.grocery]);

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
        <p className="sub">Filipino and everything else, stovetop and rice cooker only. No oven, no tofu, no eggplant. Aim for {target}g of protein a day.</p>
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
          {([['ideas', 'Meal ideas'], ['today', `Today (${logged.length})`], ['grocery', 'Grocery & prep'], ['notes', 'Nutrition']] as [Tab, string][]).map(([id, label]) => (
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
            <div className="chip-row">
              {([['all', 'Everything'], ['filipino', 'Filipino'], ['international', 'Everything else']] as [Cuisine | 'all', string][]).map(
                ([id, label]) => (
                  <button key={id} className={`chip${cuisine === id ? ' active' : ''}`} onClick={() => setCuisine(id)}>
                    {label}
                  </button>
                ),
              )}
            </div>
            {filtered.map((meal) => (
              <button key={meal.id} className="card row" style={{ gap: 12, textAlign: 'left' }} onClick={() => setDetail(meal)}>
                <span className="grow">
                  <span className="bold" style={{ display: 'block' }}>{meal.name}</span>
                  <span className="tiny muted">
                    {meal.minutes} min · {COOKWARE_LABEL[meal.cookware]} · {meal.calories} kcal
                  </span>
                </span>
                <span className="pill">{meal.protein}g</span>
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
                <span className="emoji">🍚</span>
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
            <p className="tiny faint center">Showing {formatShort(today)}.</p>
          </div>
        )}

        {tab === 'grocery' && (
          <div className="stack">
            <div className="card">
              <div className="row-between">
                <span className="grow">
                  <span className="bold" style={{ display: 'block' }}>Your basket</span>
                  <span className="tiny muted">
                    {picked === 0 ? 'Tick what you actually want this week' : `${picked} ${picked === 1 ? 'item' : 'items'} picked`}
                  </span>
                </span>
                <span style={{ textAlign: 'right' }}>
                  <span className="bold num" style={{ fontSize: 22, color: 'var(--pink-600)', display: 'block' }}>
                    {peso(basket)}
                  </span>
                </span>
              </div>
              {picked > 0 && (
                <button className="btn btn-soft btn-sm" style={{ marginTop: 10 }} onClick={resetGrocery}>
                  Clear basket
                </button>
              )}
              <p className="tiny faint" style={{ marginTop: 10 }}>
                Nothing is pre-selected. Buy as much or as little as you want — the total is only what you tick.
                The whole list would come to {peso(fullListTotal())}, but there is no reason to buy it all.
              </p>
            </div>

            {picked > 0 && (
              <div className="card">
                <div className="section-title" style={{ margin: '0 0 6px' }}>What you can cook</div>
                {ready.length === 0 && almost.length === 0 && (
                  <p className="small muted">Nothing matches yet. Add a protein and a vegetable and this fills up fast.</p>
                )}
                {ready.length > 0 && (
                  <>
                    <p className="small bold" style={{ marginBottom: 4 }}>Ready to make now ({ready.length})</p>
                    {ready.slice(0, 8).map(({ meal }) => (
                      <button key={meal.id} className="grocery-item basket-meal" onClick={() => setDetail(meal)}>
                        <span className="grocery-check" style={{ background: 'var(--pink-500)', borderColor: 'var(--pink-500)', color: '#fff' }}>
                          <CheckIcon size={15} />
                        </span>
                        <span className="grow">
                          <span className="small bold" style={{ display: 'block' }}>{meal.name}</span>
                          <span className="tiny faint">{meal.minutes} min · {meal.protein}g protein</span>
                        </span>
                      </button>
                    ))}
                  </>
                )}
                {almost.length > 0 && (
                  <>
                    <p className="small bold" style={{ margin: '12px 0 4px' }}>Almost — just need one or two more</p>
                    {almost.slice(0, 6).map(({ meal, missing }) => (
                      <button key={meal.id} className="grocery-item basket-meal" onClick={() => setDetail(meal)}>
                        <span className="grocery-check" />
                        <span className="grow">
                          <span className="small bold" style={{ display: 'block' }}>{meal.name}</span>
                          <span className="tiny faint">needs {missing.join(' + ')}</span>
                        </span>
                      </button>
                    ))}
                  </>
                )}
                {nextItem && (
                  <p className="tiny" style={{ marginTop: 10, color: 'var(--pink-700)', fontWeight: 600 }}>
                    Adding {nextItem.name} would unlock {nextItem.unlocks} more {nextItem.unlocks === 1 ? 'meal' : 'meals'}.
                  </p>
                )}
              </div>
            )}

            <div className="card card-flat card-tight row" style={{ gap: 10, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--pink-500)', flexShrink: 0, marginTop: 1 }}><InfoIcon size={16} /></span>
              <span className="tiny muted">{PRICE_NOTE}</span>
            </div>

            {GROCERY_LIST.map((section) => (
              <div key={section.id} className="card">
                <div className="row-between" style={{ marginBottom: 4 }}>
                  <span className="bold small">{section.emoji} {section.label}</span>
                  <span className="pill pill-outline">
                    {peso(section.items.filter((i) => state.grocery[i.name]).reduce((n, i) => n + i.price, 0))}
                  </span>
                </div>
                <p className="tiny faint" style={{ marginBottom: 4 }}>{section.aisle}</p>
                {section.items.map((item) => {
                  const checked = !!state.grocery[item.name];
                  return (
                    <button
                      key={item.name}
                      className={`grocery-item${checked ? ' checked' : ''}`}
                      onClick={() => toggleGrocery(item.name)}
                      aria-pressed={checked}
                    >
                      <span className="grocery-check"><CheckIcon size={15} /></span>
                      <span className="grow">
                        <span className="small bold name" style={{ display: 'block' }}>{item.name}</span>
                        <span className="tiny faint">
                          {item.qty}{item.staple ? ' · staple, lasts a month+' : ''}{item.note ? ` · ${item.note}` : ''}
                        </span>
                      </span>
                      <span className="small muted num">{peso(item.price)}</span>
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="card">
              <div className="section-title" style={{ margin: '0 0 6px' }}>Optional</div>
              {OPTIONAL_ITEMS.map((item) => (
                <button
                  key={item.name}
                  className={`grocery-item${state.grocery[item.name] ? ' checked' : ''}`}
                  onClick={() => toggleGrocery(item.name)}
                  aria-pressed={!!state.grocery[item.name]}
                >
                  <span className="grocery-check"><CheckIcon size={15} /></span>
                  <span className="grow">
                    <span className="small bold name" style={{ display: 'block' }}>{item.name}</span>
                    <span className="tiny faint">{item.qty} · {item.note}</span>
                  </span>
                  <span className="small muted num">{peso(item.price)}</span>
                </button>
              ))}
            </div>

            <div className="section-title">Sunday prep, about 2 hours</div>
            <div className="card">
              {SUNDAY_PREP.map((step) => (
                <div className="mobility-item" key={step.order}>
                  <span className="exercise-num" style={{ width: 26, height: 26, fontSize: 12, borderRadius: 9 }}>{step.order}</span>
                  <span className="grow">
                    <span className="small bold" style={{ display: 'block' }}>
                      {step.title} <span className="muted" style={{ fontWeight: 500 }}>· {step.minutes} min</span>
                    </span>
                    <span className="tiny muted">{step.detail}</span>
                  </span>
                </div>
              ))}
            </div>
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
              <span className="pill pill-lilac">{COOKWARE_LABEL[detail.cookware]}</span>
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
            {detail.prepAhead && (
              <div className="card card-flat card-tight">
                <p className="tiny muted"><strong>Meal prep:</strong> {detail.prepAhead}</p>
              </div>
            )}
            <button className="btn btn-block" onClick={() => logMeal(detail)}>
              <PlusIcon size={16} /> Log this for today
            </button>
          </div>
        )}
      </Sheet>

      <CustomMealSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        onSave={(item) => { addMealLog(today, item); setCustomOpen(false); }}
      />

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}

function CustomMealSheet({
  open, onClose, onSave,
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
          <input id="c-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Chicken inasal, 1 cup rice" />
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
