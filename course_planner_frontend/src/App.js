import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import './styles.css';
import { apiFetch } from './api';

// PUBLIC_INTERFACE
function AppShell() {
  /** Main application shell with sidebar navigation and routed content. */
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [authError, setAuthError] = useState('');
  const [loadingMe, setLoadingMe] = useState(true);

  const isAuthed = !!me;

  const loadMe = async () => {
    setLoadingMe(true);
    setAuthError('');
    try {
      const user = await apiFetch('/auth/me/');
      setMe(user);
    } catch (e) {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const headerRight = useMemo(() => {
    if (!isAuthed) return null;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>
          {me.email}
        </span>
        <button
          className="btn"
          onClick={async () => {
            await apiFetch('/auth/logout/', { method: 'POST' });
            setMe(null);
            navigate('/login');
          }}
        >
          Logout
        </button>
      </div>
    );
  }, [isAuthed, me, navigate]);

  if (loadingMe) {
    return (
      <div className="main">
        <div className="card">
          <div className="cardBody">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="main" style={{ maxWidth: 520, margin: '0 auto', paddingTop: 40 }}>
        {authError ? <div className="error">{authError}</div> : null}
        <Routes>
          <Route path="/register" element={<Register onAuthed={setMe} />} />
          <Route path="*" element={<Login onAuthed={setMe} />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark" aria-hidden />
          <div>
            <div className="brandTitle">Lesson Planner</div>
            <div className="brandSub">Plan. Schedule. Track.</div>
          </div>
        </div>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end>
            Dashboard
          </NavLink>
          <NavLink to="/courses">Courses</NavLink>
          <NavLink to="/students">Students</NavLink>
        </nav>

        <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 12, padding: '0 8px' }}>
          Tip: Open a course to manage topics, lessons, and progress.
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em' }}>
            Teacher Workspace
          </div>
          {headerRight}
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/students" element={<Students />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

function NotFound() {
  return (
    <div className="card">
      <div className="cardBody">Not found.</div>
    </div>
  );
}

function Login({ onAuthed }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Login</div>
        <button className="btn" onClick={() => navigate('/register')}>
          Create account
        </button>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                const user = await apiFetch('/auth/login/', {
                  method: 'POST',
                  body: JSON.stringify({ email, password }),
                });
                onAuthed(user);
                navigate('/');
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Register({ onAuthed }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Create account</div>
        <button className="btn" onClick={() => navigate('/login')}>
          Back to login
        </button>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Email</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Password</label>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                const user = await apiFetch('/auth/register/', {
                  method: 'POST',
                  body: JSON.stringify({ email, password, name }),
                });
                onAuthed(user);
                navigate('/');
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      setErr('');
      try {
        const data = await apiFetch('/dashboard/');
        setStats(data);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  return (
    <div>
      {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
      <div className="grid">
        <div className="card kpi">
          <div className="kpiLabel">Courses</div>
          <div className="kpiValue">{stats ? stats.courses_count : '—'}</div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Topics</div>
          <div className="kpiValue">{stats ? stats.topics_count : '—'}</div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Lessons</div>
          <div className="kpiValue">{stats ? stats.lessons_count : '—'}</div>
        </div>
        <div className="card kpi">
          <div className="kpiLabel">Students</div>
          <div className="kpiValue">{stats ? stats.students_count : '—'}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="cardHeader">
          <div style={{ fontWeight: 900 }}>How to use</div>
          <span className="badge badgePrimary">Light theme</span>
        </div>
        <div className="cardBody" style={{ color: 'var(--muted)', lineHeight: 1.6 }}>
          Create a course, add topics, schedule lessons with dates/times, then add students and
          update progress per topic.
        </div>
      </div>
    </div>
  );
}

function Courses() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr('');
    try {
      const data = await apiFetch('/courses/');
      setItems(data);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Courses</div>
        <button className="btn" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}

        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Description</label>
            <input
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                await apiFetch('/courses/', {
                  method: 'POST',
                  body: JSON.stringify({ title, description }),
                });
                setTitle('');
                setDescription('');
                await load();
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Creating...' : 'Create course'}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Description</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 800 }}>{c.title}</td>
                  <td style={{ color: 'var(--muted)' }}>{c.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" onClick={() => navigate(`/courses/${c.id}`)}>
                        Open
                      </button>
                      <button
                        className="btn btnDanger"
                        onClick={async () => {
                          if (!window.confirm('Delete this course?')) return;
                          await apiFetch(`/courses/${c.id}/`, { method: 'DELETE' });
                          await load();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan="3" style={{ color: 'var(--muted)', padding: 14 }}>
                    No courses yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CourseDetail() {
  const navigate = useNavigate();
  const courseId = window.location.pathname.split('/').pop(); // simple parsing to avoid extra deps

  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);

  const [err, setErr] = useState('');

  const loadAll = async () => {
    setErr('');
    try {
      const c = await apiFetch(`/courses/${courseId}/`);
      const t = await apiFetch(`/courses/${courseId}/topics/`);
      const l = await apiFetch(`/courses/${courseId}/lessons/`);
      const s = await apiFetch('/students/');
      const p = await apiFetch(`/courses/${courseId}/progress/`);
      setCourse(c);
      setTopics(t);
      setLessons(l);
      setStudents(s);
      setProgress(p);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {err ? <div className="error">{err}</div> : null}

      <div className="card">
        <div className="cardHeader">
          <div style={{ fontWeight: 900 }}>{course ? course.title : 'Course'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" onClick={() => navigate('/courses')}>
              Back
            </button>
            <button className="btn" onClick={loadAll}>
              Refresh
            </button>
          </div>
        </div>
        <div className="cardBody" style={{ color: 'var(--muted)' }}>
          {course ? course.description : 'Loading...'}
        </div>
      </div>

      <TopicsCard courseId={courseId} topics={topics} onChanged={loadAll} />
      <LessonsCard courseId={courseId} topics={topics} lessons={lessons} onChanged={loadAll} />
      <ProgressCard
        courseId={courseId}
        topics={topics}
        students={students}
        progress={progress}
        onChanged={loadAll}
      />
    </div>
  );
}

function TopicsCard({ courseId, topics, onChanged }) {
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Topics</div>
        <span className="badge badgeMuted">{topics.length} total</span>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Order</label>
            <input
              className="input"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value || '0', 10))}
            />
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                await apiFetch(`/courses/${courseId}/topics/`, {
                  method: 'POST',
                  body: JSON.stringify({ title, order }),
                });
                setTitle('');
                setOrder(0);
                onChanged();
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Adding...' : 'Add topic'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Title</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t) => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--muted)', fontWeight: 800 }}>{t.order}</td>
                  <td style={{ fontWeight: 800 }}>{t.title}</td>
                  <td>
                    <button
                      className="btn btnDanger"
                      onClick={async () => {
                        if (!window.confirm('Delete topic?')) return;
                        await apiFetch(`/topics/${t.id}/`, { method: 'DELETE' });
                        onChanged();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!topics.length ? (
                <tr>
                  <td colSpan="3" style={{ color: 'var(--muted)', padding: 14 }}>
                    No topics yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LessonsCard({ courseId, topics, lessons, onChanged }) {
  const [title, setTitle] = useState('');
  const [topicId, setTopicId] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [notes, setNotes] = useState('');

  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Lessons (schedule)</div>
        <span className="badge badgePrimary">{lessons.length} scheduled</span>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Topic</label>
            <select className="select" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">(Optional)</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Start (ISO)</label>
            <input
              className="input"
              placeholder="2026-01-14T09:00:00Z"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>End (ISO)</label>
            <input
              className="input"
              placeholder="2026-01-14T10:00:00Z"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Notes</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                await apiFetch(`/courses/${courseId}/lessons/`, {
                  method: 'POST',
                  body: JSON.stringify({
                    title,
                    topic: topicId ? parseInt(topicId, 10) : null,
                    start_at: startAt,
                    end_at: endAt,
                    notes,
                  }),
                });
                setTitle('');
                setTopicId('');
                setStartAt('');
                setEndAt('');
                setNotes('');
                onChanged();
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Scheduling...' : 'Schedule lesson'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>When</th>
                <th>Lesson</th>
                <th>Topic</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => {
                const t = topics.find((x) => x.id === l.topic);
                return (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--muted)', fontWeight: 800 }}>
                      {l.start_at} → {l.end_at}
                    </td>
                    <td style={{ fontWeight: 800 }}>{l.title}</td>
                    <td style={{ color: 'var(--muted)' }}>{t ? t.title : '—'}</td>
                    <td>
                      <button
                        className="btn btnDanger"
                        onClick={async () => {
                          if (!window.confirm('Delete lesson?')) return;
                          await apiFetch(`/lessons/${l.id}/`, { method: 'DELETE' });
                          onChanged();
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!lessons.length ? (
                <tr>
                  <td colSpan="4" style={{ color: 'var(--muted)', padding: 14 }}>
                    No lessons scheduled yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 10, color: 'var(--muted)', fontSize: 12 }}>
          Note: Enter timestamps as ISO strings (example: 2026-01-14T09:00:00Z).
        </div>
      </div>
    </div>
  );
}

function Students() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setErr('');
    try {
      const data = await apiFetch('/students/');
      setItems(data);
    } catch (e) {
      setErr(e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Students</div>
        <button className="btn" onClick={load}>
          Refresh
        </button>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}

        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Email (optional)</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setErr('');
              try {
                await apiFetch('/students/', {
                  method: 'POST',
                  body: JSON.stringify({ name, email }),
                });
                setName('');
                setEmail('');
                await load();
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Adding...' : 'Add student'}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 800 }}>{s.name}</td>
                  <td style={{ color: 'var(--muted)' }}>{s.email || '—'}</td>
                  <td>
                    <button
                      className="btn btnDanger"
                      onClick={async () => {
                        if (!window.confirm('Delete student?')) return;
                        await apiFetch(`/students/${s.id}/`, { method: 'DELETE' });
                        await load();
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan="3" style={{ color: 'var(--muted)', padding: 14 }}>
                    No students yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProgressCard({ courseId, topics, students, progress, onChanged }) {
  const [studentId, setStudentId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [status, setStatus] = useState('not_started');
  const [percent, setPercent] = useState(0);
  const [notes, setNotes] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const progressByKey = useMemo(() => {
    const map = new Map();
    progress.forEach((p) => map.set(`${p.student}:${p.topic}`, p));
    return map;
  }, [progress]);

  return (
    <div className="card">
      <div className="cardHeader">
        <div style={{ fontWeight: 900 }}>Progress tracking</div>
        <span className="badge badgeSuccess">Update per student/topic</span>
      </div>
      <div className="cardBody">
        {err ? <div className="error" style={{ marginBottom: 12 }}>{err}</div> : null}
        <div className="row">
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Student</label>
            <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">Select…</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Topic</label>
            <select className="select" value={topicId} onChange={(e) => setTopicId(e.target.value)}>
              <option value="">Select…</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Status</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Percent</label>
            <input
              className="input"
              type="number"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(parseInt(e.target.value || '0', 10))}
            />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <label style={{ fontWeight: 800, fontSize: 12, color: 'var(--muted)' }}>Notes</label>
          <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <button
            className="btn"
            onClick={() => {
              if (!studentId || !topicId) return;
              const p = progressByKey.get(`${studentId}:${topicId}`);
              if (!p) return;
              setStatus(p.status);
              setPercent(p.percent);
              setNotes(p.notes || '');
            }}
          >
            Load existing
          </button>

          <button
            className="btn btnPrimary"
            disabled={busy}
            onClick={async () => {
              if (!studentId || !topicId) {
                setErr('Select a student and topic.');
                return;
              }
              setBusy(true);
              setErr('');
              try {
                await apiFetch(`/courses/${courseId}/progress/`, {
                  method: 'POST',
                  body: JSON.stringify({
                    student: parseInt(studentId, 10),
                    topic: parseInt(topicId, 10),
                    status,
                    percent,
                    notes,
                    course: parseInt(courseId, 10),
                  }),
                });
                onChanged();
              } catch (e) {
                setErr(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? 'Saving...' : 'Save progress'}
          </button>
        </div>

        <div style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Topic</th>
                <th>Status</th>
                <th>Percent</th>
              </tr>
            </thead>
            <tbody>
              {progress.map((p) => {
                const s = students.find((x) => x.id === p.student);
                const t = topics.find((x) => x.id === p.topic);
                const badgeClass =
                  p.status === 'completed'
                    ? 'badgeSuccess'
                    : p.status === 'in_progress'
                    ? 'badgePrimary'
                    : 'badgeMuted';

                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 800 }}>{s ? s.name : `#${p.student}`}</td>
                    <td style={{ color: 'var(--muted)' }}>{t ? t.title : `#${p.topic}`}</td>
                    <td>
                      <span className={`badge ${badgeClass}`}>{p.status}</span>
                    </td>
                    <td style={{ fontWeight: 800 }}>{p.percent}%</td>
                  </tr>
                );
              })}
              {!progress.length ? (
                <tr>
                  <td colSpan="4" style={{ color: 'var(--muted)', padding: 14 }}>
                    No progress entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function App() {
  /** Root component providing router context. */
  return <AppShell />;
}
