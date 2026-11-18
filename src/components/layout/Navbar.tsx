import { Bell, ChevronDown, Lock, LogOut, UserRound, Users, Utensils } from 'lucide-react';
import { usePos } from '../../context/PosContext';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { settings, currentUser, logout, notifications, markNotificationAsRead, clearAllNotifications, currentTime } = usePos();
  const navigate = useNavigate();
  const unread = notifications.filter((item) => !item.read).length;
  const signOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="workspace-header">
      <div className="workspace-brand">
        <span><Utensils size={19} /></span>
        <strong>{settings.general.restaurantName} <small>POS</small></strong>
      </div>
      <div className="workspace-terminal">
        {settings.general.branchName}
        <time>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
      </div>
      <div className="flex items-center gap-1 sm:gap-3">
        <details className="workspace-popover">
          <summary title="Notifications" aria-label={`Notifications (${unread} unread)`}>
            <Bell size={19} />{unread > 0 && <span className="notification-dot" />}
          </summary>
          <div className="workspace-dropdown">
            <div className="flex items-center justify-between border-b px-3">
              <strong>Notifications</strong>
              <button type="button" onClick={clearAllNotifications}>Clear all</button>
            </div>
            <div className="max-h-72 overflow-auto">
              {notifications.length === 0 && <p className="p-3 text-slate-500">No notifications</p>}
              {notifications.map((item) => (
                <button key={item.id} type="button" className="notification-row" onClick={() => markNotificationAsRead(item.id)}>
                  <strong className={item.read ? 'text-slate-600' : 'text-blue-700'}>{item.title}</strong>
                  <span>{item.message}</span>
                </button>
              ))}
            </div>
          </div>
        </details>
        <details className="workspace-popover">
          <summary title="My profile" aria-label="My profile">
            <UserRound size={19} />
            <span className="hidden sm:grid text-left"><strong>{currentUser.name}</strong><small className="capitalize text-slate-300">{currentUser.role}</small></span>
            <ChevronDown size={14} className="hidden sm:block" />
          </summary>
          <div className="workspace-dropdown">
            <div className="border-b p-3">
              <strong>{currentUser.name}</strong>
              <p className="break-words text-slate-600">{currentUser.email}</p>
              <p className="mt-1 capitalize text-emerald-700">{currentUser.role} / Signed in</p>
            </div>
            <button type="button" onClick={signOut}><Users size={17} /> Switch user</button>
            <button type="button" onClick={logout}><Lock size={17} /> Lock POS</button>
            <button type="button" onClick={signOut}><LogOut size={17} /> Sign out</button>
          </div>
        </details>
      </div>
    </header>
  );
}
