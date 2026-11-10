import { useState } from 'react';
import {
  Activity,
  Send,
  RotateCcw,
  Smartphone,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Check,
  Server,
  Radio,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { UI_TIMERS } from '../../shared/constants';

export default function AdminSystemTab({
  stats,
  incidents = [],
  onRefresh,
  onRetryFailedJobs,
  onBroadcastNotification,
  onResolveIncident,
}) {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [retryingJobs, setRetryingJobs] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);

  const handleRetryJobs = async () => {
    try {
      setRetryingJobs(true);
      const res = await onRetryFailedJobs();
      Swal.fire({
        icon: 'success',
        title: 'Jobs Re-queued',
        text: res?.data?.message || 'Failed BullMQ jobs have been queued for retry.',
        timer: UI_TIMERS.ALERT_MEDIUM_MS,
        showConfirmButton: false,
      });
      onRefresh();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setRetryingJobs(false);
    }
  };

  const handleResolve = async (incidentId) => {
    try {
      setResolvingId(incidentId);
      await onResolveIncident(incidentId);
      Swal.fire({
        icon: 'success',
        title: 'Incident Resolved',
        timer: UI_TIMERS.ALERT_SHORT_MS,
        showConfirmButton: false,
      });
      onRefresh();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      Swal.fire('Missing fields', 'Please enter both title and body for the broadcast notification', 'warning');
      return;
    }

    const result = await Swal.fire({
      title: 'Dispatch Push Broadcast?',
      text: 'This notification will be delivered immediately to all registered user devices and Chrome extensions.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF385C',
      confirmButtonText: 'Yes, Send Now',
    });

    if (!result.isConfirmed) return;

    try {
      setSendingBroadcast(true);
      const res = await onBroadcastNotification({
        title: broadcastTitle,
        body: broadcastBody,
      });

      Swal.fire({
        icon: 'success',
        title: 'Broadcast Dispatched!',
        text: res?.data?.message || 'Notification broadcast completed.',
      });

      setBroadcastTitle('');
      setBroadcastBody('');
      onRefresh();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || err.message, 'error');
    } finally {
      setSendingBroadcast(false);
    }
  };

  const queue = stats?.queue || {};
  const totalRegisteredDevices = stats?.notifications?.totalRegisteredDevices || 0;
  const unresolvedIncidents = incidents.filter((i) => i.status === 'unresolved');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Real-time System Incidents & Failure Alert Center */}
      <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-neutral-900 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-ink">Failure Incidents &amp; Alerts</h3>
                {unresolvedIncidents.length > 0 ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-bold border border-red-200 animate-pulse">
                    {unresolvedIncidents.length} Active
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                    All Healthy
                  </span>
                )}
              </div>
              <p className="text-xs text-muted mt-0.5">
                Real-time tracking of AI worker timeouts, rate limits, and system health exceptions.
              </p>
            </div>
          </div>
          <button
            onClick={onRefresh}
            className="self-start sm:self-auto px-4 py-2 rounded-full border border-divider hover:border-ink text-xs font-semibold text-ink transition-colors cursor-pointer bg-white"
          >
            Refresh Alerts
          </button>
        </div>

        {incidents.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold text-[10px]">
                  <tr>
                    <th className="py-3 px-4 rounded-l-xl">Severity</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-divider/60">
                  {incidents.map((inc) => (
                    <tr
                      key={inc._id}
                      className={[
                        'hover:bg-surface/50 transition-colors',
                        inc.status === 'unresolved' ? 'bg-red-50/20' : '',
                      ].join(' ')}
                    >
                      <td className="py-3 px-4">
                        <span
                          className={[
                            'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                            inc.severity === 'critical'
                              ? 'bg-red-100 text-red-700'
                              : inc.severity === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700',
                          ].join(' ')}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-ink">
                        {inc.type.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-4 text-muted max-w-xs truncate" title={inc.message}>
                        {inc.message}
                      </td>
                      <td className="py-3 px-4 text-ink font-medium max-w-[140px] truncate" title={inc.userEmail}>
                        {inc.userEmail}
                      </td>
                      <td className="py-3 px-4 text-muted text-[11px]">
                        {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inc.status === 'unresolved' ? (
                          <button
                            onClick={() => handleResolve(inc._id)}
                            disabled={resolvingId === inc._id}
                            className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Resolve</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted font-medium">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View (< 768px) */}
            <div className="md:hidden space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc._id}
                  className={[
                    'p-4 rounded-2xl border border-divider transition-all space-y-3',
                    inc.status === 'unresolved' ? 'bg-red-50/15 border-red-100' : 'bg-surface/40',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase',
                        inc.severity === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : inc.severity === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-700',
                      ].join(' ')}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-[11px] text-muted">
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-ink block mb-0.5">
                      {inc.type.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-muted leading-relaxed line-clamp-2">
                      {inc.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-divider/60 text-xs">
                    <span className="text-muted font-medium truncate max-w-[180px]">
                      {inc.userEmail}
                    </span>
                    {inc.status === 'unresolved' ? (
                      <button
                        onClick={() => handleResolve(inc._id)}
                        disabled={resolvingId === inc._id}
                        className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted font-medium">Resolved</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-8 rounded-2xl bg-surface/50 border border-divider text-center text-xs text-muted">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            <span className="font-medium">No failure incidents recorded. All systems operating with zero alerts.</span>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Queue & Push Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* BullMQ Worker & Queue Controls */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-neutral-900 shrink-0" />
                <div>
                  <h3 className="font-bold text-base text-ink">BullMQ AI Queue</h3>
                  <p className="text-xs text-muted">Background Worker Queue Engine</p>
                </div>
              </div>
              <span className={[
                'px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0',
                queue?.waiting !== undefined || queue?.completed !== undefined
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200',
              ].join(' ')}>
                <span className={[
                  'w-1.5 h-1.5 rounded-full',
                  queue?.waiting !== undefined || queue?.completed !== undefined
                    ? 'bg-emerald-500 animate-pulse'
                    : 'bg-amber-500',
                ].join(' ')} />
                {queue?.waiting !== undefined || queue?.completed !== undefined ? 'Online' : 'Standby'}
              </span>
            </div>

            <p className="text-xs text-muted mb-6">
              Manages asynchronous Groq AI card generation and SM-2 spaced repetition calculation queues.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 mb-4 border-y border-divider/60">
              <div>
                <span className="text-xs text-muted font-medium block">Waiting</span>
                <span className="text-2xl font-black text-ink mt-0.5 block">{queue.waiting || 0}</span>
              </div>
              <div>
                <span className="text-xs text-muted font-medium block">Active</span>
                <span className="text-2xl font-black text-blue-600 mt-0.5 block">{queue.active || 0}</span>
              </div>
              <div>
                <span className="text-xs text-muted font-medium block">Completed</span>
                <span className="text-2xl font-black text-emerald-600 mt-0.5 block">{queue.completed || 0}</span>
              </div>
              <div>
                <span className="text-xs text-muted font-medium block">Failed</span>
                <span className={['text-2xl font-black mt-0.5 block', queue.failed > 0 ? 'text-red-600' : 'text-muted'].join(' ')}>
                  {queue.failed || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-divider pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-xs text-muted">
              {queue.failed > 0 ? `${queue.failed} failed jobs awaiting recovery` : 'Queue is operating smoothly'}
            </span>
            <button
              onClick={handleRetryJobs}
              disabled={retryingJobs || !queue.failed}
              className={[
                'flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer',
                queue.failed > 0
                  ? 'bg-ink text-white hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.15)]'
                  : 'bg-surface text-muted border border-divider cursor-not-allowed opacity-60',
              ].join(' ')}
            >
              <RotateCcw className={['w-3.5 h-3.5', retryingJobs ? 'animate-spin' : ''].join(' ')} />
              <span>Retry Failed Jobs</span>
            </button>
          </div>
        </div>

        {/* Firebase FCM Broadcast Notification Center */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-neutral-900 shrink-0" />
              <div>
                <h3 className="font-bold text-base text-ink">Broadcast Push</h3>
                <p className="text-xs text-muted">Firebase Cloud Messaging</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-surface border border-divider text-xs font-semibold text-muted flex items-center gap-1.5 shrink-0">
              <Smartphone className="w-3.5 h-3.5 text-brand" />
              {totalRegisteredDevices} Devices
            </span>
          </div>

          <p className="text-xs text-muted mb-4">
            Instantly dispatch push announcements to all active Chrome extensions and enrolled web sessions.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Notification Title</label>
              <input
                type="text"
                placeholder="e.g. New feature: Deck sharing is here!"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-none focus:border-brand focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">Notification Body</label>
              <textarea
                rows={3}
                placeholder="Enter announcement text to display on user screens..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface text-ink text-xs rounded-2xl border border-divider focus:outline-none focus:border-brand focus:bg-white transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="w-full py-3 px-5 rounded-full bg-brand hover:bg-brand-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_rgba(255,56,92,0.25)] cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingBroadcast ? 'Dispatching...' : 'Dispatch Notification Broadcast'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Infrastructure & Service Health */}
      <div className="bg-white p-5 sm:p-6 lg:p-7 rounded-2xl border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <Server className="w-5 h-5 text-neutral-900 shrink-0" />
          <div>
            <h3 className="font-bold text-base text-ink">Platform Core Services</h3>
            <p className="text-xs text-muted">Backend microservices and persistent infrastructure status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
          <div className="sm:border-r sm:border-divider/60 sm:pr-6">
            <span className="text-xs text-muted font-medium block mb-1">Database Cluster</span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              <span>Connected</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Primary Replica Pool
            </span>
          </div>

          <div className="sm:border-r sm:border-divider/60 sm:pr-6">
            <span className="text-xs text-muted font-medium block mb-1">Worker Queue Engine</span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <span>Operational</span>
            </div>
            <span className="text-[11px] text-muted block mt-1.5">
              BullMQ Redis · {queue.waiting || 0} waiting · {queue.active || 0} active
            </span>
          </div>

          <div>
            <span className="text-xs text-muted font-medium block mb-1">Push Gateway</span>
            <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span>Online</span>
            </div>
            <span className="text-[11px] text-muted block mt-1.5">
              FCM Service · {totalRegisteredDevices} registered clients
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
