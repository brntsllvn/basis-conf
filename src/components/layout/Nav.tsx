import { NavLink } from 'react-router-dom';
import { useSchedule } from '../../state/ScheduleContext';
import { downloadJson, importFromJson, saveState } from '../../state/persistence';
import { useRef } from 'react';

export function Nav() {
  const { state, dispatch } = useSchedule();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importFromJson(reader.result as string);
        dispatch({ type: 'IMPORT_STATE', state: imported });
        saveState(imported);
      } catch (err) {
        alert('Invalid file: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <nav className="app-nav">
      <div className="nav-brand">Conf Planner</div>
      <div className="nav-links">
        <NavLink to="/grid" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Grid
        </NavLink>
        <NavLink to="/schedule" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Schedule
        </NavLink>
        <NavLink to="/people" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          People
        </NavLink>
        <a href="/guide" className="nav-link" target="_blank" rel="noreferrer">
          Guide ↗
        </a>
      </div>
      <div className="nav-actions">
        <button className="nav-btn" onClick={() => downloadJson(state)} title="Download schedule as JSON backup">
          ↓ Download Backup
        </button>
        <button className="nav-btn nav-btn--primary" onClick={() => fileInputRef.current?.click()} title="Load schedule from a JSON backup file">
          ↑ Load from File
        </button>
<input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
      </div>
    </nav>
  );
}
