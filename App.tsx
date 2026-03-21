import { useState, useCallback, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
  Sun, Moon, CheckSquare, Plus, Trash2, Check,
  Star, Trophy, Target, BarChart2, Zap
} from 'lucide-react';
import { useLocalStorage } from './useLocalStorage';
import type { Task, Notification, DayData } from './types';
import './App.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function toDateStr(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function getLast7Days(): DayData[] {
  const days: DayData[] = [];
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d.getTime());
    days.push({ day: dayNames[d.getDay()], date: dateStr, completed: 0 });
  }
  return days;
}

// ── Notification Component ────────────────────────────────────────────────────
function NotifToast({ notifs }: { notifs: Notification[] }) {
  return (
    <div className="notif-container">
      {notifs.map(n => (
        <div key={n.id} className={`notif ${n.type}`}>
          {n.type === 'positive' ? <Zap size={16} /> : <Trash2 size={16} />}
          {n.message}
        </div>
      ))}
    </div>
  );
}

// ── Custom Tooltip for Chart ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-md)',
      fontSize: 13,
      color: 'var(--text-primary)'
    }}>
      <p style={{ fontWeight: 700, marginBottom: 4 }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 600 }}>
        {payload[0].value} task{payload[0].value !== 1 ? 's' : ''} completed
      </p>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [points, setPoints] = useLocalStorage<number>('points', 0);
  const [inputText, setInputText] = useState('');
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const pointsValueRef = useRef<HTMLDivElement>(null);

  // Apply theme to <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Notifications ────────────────────────────────────────────────────────
  const pushNotif = useCallback((message: string, type: 'positive' | 'negative') => {
    const id = generateId();
    setNotifs(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifs(prev => prev.filter(n => n.id !== id));
    }, 2500);
  }, []);

  // ── Animate score ─────────────────────────────────────────────────────────
  const animateScore = useCallback(() => {
    const el = pointsValueRef.current;
    if (!el) return;
    el.classList.remove('score-animate');
    void el.offsetWidth; // reflow
    el.classList.add('score-animate');
  }, []);

  // ── Add Task ─────────────────────────────────────────────────────────────
  const addTask = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const newTask: Task = {
      id: generateId(),
      text,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
    setPoints(prev => prev + 5);
    setInputText('');
    pushNotif('+5 pts — Task added! 🎯', 'positive');
    animateScore();
  }, [inputText, setTasks, setPoints, pushNotif, animateScore]);

  // ── Complete Task ─────────────────────────────────────────────────────────
  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.completed) {
        // uncomplete — take points back but don't subtract more
        setPoints(p => Math.max(0, p - 20));
        pushNotif('-20 pts — Task reopened', 'negative');
        animateScore();
        return { ...t, completed: false, completedAt: undefined };
      } else {
        setPoints(p => p + 20);
        pushNotif('+20 pts — Task completed! 🏆', 'positive');
        animateScore();
        return { ...t, completed: true, completedAt: Date.now() };
      }
    }));
  }, [setTasks, setPoints, pushNotif, animateScore]);

  // ── Delete Task ───────────────────────────────────────────────────────────
  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    // Animate out
    setRemovingIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setRemovingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      if (!task.completed) {
        setPoints(prev => Math.max(0, prev - 10));
        pushNotif('-10 pts — Incomplete task deleted', 'negative');
        animateScore();
      } else {
        pushNotif('Task removed', 'negative');
      }
    }, 300);
  }, [tasks, setTasks, setPoints, pushNotif, animateScore]);

  // ── Chart Data ────────────────────────────────────────────────────────────
  const chartData: DayData[] = (() => {
    const base = getLast7Days();
    tasks.forEach(t => {
      if (t.completed && t.completedAt) {
        const dateStr = toDateStr(t.completedAt);
        const slot = base.find(d => d.date === dateStr);
        if (slot) slot.completed++;
      }
    });
    return base;
  })();

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">✓</div>
          <div>
            <div className="header-title">TaskQuest</div>
            <div className="header-subtitle">Gamified Dashboard</div>
          </div>
        </div>
        <button
          className="theme-toggle"
          onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}
          title="Toggle theme"
          id="theme-toggle-btn"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </header>

      {/* Dashboard Grid */}
      <main className="dashboard">

        {/* Points Card */}
        <div className="card points-card">
          <div className="points-info">
            <div className="points-label">⚡ Total Points</div>
            <div className="points-value" ref={pointsValueRef}>{points.toLocaleString()}</div>
            <div className="points-subtext">Complete tasks to earn more XP</div>
          </div>
          <div className="points-badges">
            <div className="points-badge">
              <span className="points-badge-value">{totalTasks}</span>
              <span className="points-badge-label">Total</span>
            </div>
            <div className="points-badge">
              <span className="points-badge-value">{completedTasks}</span>
              <span className="points-badge-label">Done</span>
            </div>
            <div className="points-badge">
              <span className="points-badge-value">{pendingTasks}</span>
              <span className="points-badge-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Add Task Card */}
        <div className="card add-task-card">
          <div className="card-header">
            <div className="card-header-icon blue"><Plus size={15} /></div>
            <span className="card-title">Add New Task</span>
          </div>
          <div style={{ padding: '16px' }}>
            <form
              className="add-task-form"
              onSubmit={e => { e.preventDefault(); addTask(); }}
            >
              <input
                id="task-input"
                className="task-input"
                type="text"
                placeholder="What needs to be done? (+5 pts)"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                maxLength={120}
              />
              <button type="submit" className="btn-add" id="add-task-btn">
                <Plus size={16} /> Add
              </button>
            </form>
            <p style={{ marginTop: 10, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Star size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />
              +5 add · +20 complete · −10 delete incomplete
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center' }}>
          <div className="card-header" style={{ padding: 0, border: 'none' }}>
            <div className="card-header-icon purple"><Trophy size={15} /></div>
            <span className="card-title">Progress</span>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Completion Rate</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
              </span>
            </div>
            <div style={{
              width: '100%', height: 8, background: 'var(--border)',
              borderRadius: 99, overflow: 'hidden'
            }}>
              <div style={{
                width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`,
                height: '100%',
                background: 'var(--points-gradient)',
                borderRadius: 99,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <Target size={13} style={{ color: 'var(--accent)' }} />
              <span>Tasks today: <strong style={{ color: 'var(--text-primary)' }}>
                {tasks.filter(t => t.completed && t.completedAt && toDateStr(t.completedAt) === toDateStr(Date.now())).length}
              </strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              <BarChart2 size={13} style={{ color: 'var(--success)' }} />
              <span>7-day total: <strong style={{ color: 'var(--text-primary)' }}>
                {chartData.reduce((s, d) => s + d.completed, 0)}
              </strong></span>
            </div>
          </div>
        </div>

        {/* Task List Card */}
        <div className="card task-list-card">
          <div className="card-header">
            <div className="card-header-icon green"><CheckSquare size={15} /></div>
            <span className="card-title">Tasks</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {completedTasks}/{totalTasks} done
            </span>
          </div>
          <div className="task-list-body" id="task-list">
            {tasks.length === 0 ? (
              <div className="task-empty">
                <div className="task-empty-icon">📋</div>
                <p style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>No tasks yet!</p>
                <p style={{ fontSize: '0.82rem' }}>Add your first task to start earning points</p>
              </div>
            ) : (
              tasks.map(task => (
                <div
                  key={task.id}
                  className={`task-item${removingIds.has(task.id) ? ' removing' : ''}`}
                >
                  {/* Checkbox */}
                  <button
                    className={`task-checkbox${task.completed ? ' checked' : ''}`}
                    onClick={() => toggleTask(task.id)}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                    id={`check-${task.id}`}
                  >
                    {task.completed && <Check size={13} strokeWidth={3} />}
                  </button>
                  {/* Text */}
                  <span className={`task-text${task.completed ? ' done' : ''}`}>
                    {task.text}
                  </span>
                  {/* Badge */}
                  {task.completed && <span className="task-badge-done">Done</span>}
                  {/* Delete */}
                  <button
                    className="btn-delete"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                    id={`delete-${task.id}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chart Card */}
        <div className="card chart-card">
          <div className="card-header">
            <div className="card-header-icon blue"><BarChart2 size={15} /></div>
            <span className="card-title">7-Day Completion Trend</span>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'Inter' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#colorCompleted)"
                  dot={{ fill: 'var(--accent)', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: 'var(--accent)', stroke: 'var(--bg-card)', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="stats-row">
              <div className="stat-item"><div className="stat-dot blue"></div> Completed tasks</div>
            </div>
          </div>
        </div>

      </main>

      {/* Floating Notifications */}
      <NotifToast notifs={notifs} />
    </>
  );
}
