import { useState } from 'react';
import {
  Activity,
  Send,
  RotateCcw,
  Cpu,
  Smartphone,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Check,
} from 'lucide-react';
import Swal from 'sweetalert2';

export default function AdminSystemTab({
  systemHealth,
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
        timer: 2000,
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
        timer: 1500,
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
      title: 'Dispatch Push Notification Broadcast?',
      text: 'This notification will be delivered immediately to all registered user devices and Chrome extensions.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#FF9532',
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

  const memory = systemHealth?.memory || { rssMb: 0, heapUsedMb: 0, heapTotalMb: 0 };
  const queue = systemHealth?.queue || {};
  const uptimeMinutes = systemHealth?.uptimeSeconds ? Math.floor(systemHealth.uptimeSeconds / 60) : 0;
  const uptimeHours = Math.floor(uptimeMinutes / 60);

  const unresolvedIncidents = incidents.filter((i) => i.status === 'unresolved');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Real-time System Incidents & Failure Alert Center */}
      <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-ink">Real-time Failure Incidents & Alerts</h3>
            {unresolvedIncidents.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold animate-pulse">
                {unresolvedIncidents.length} Active Incident{unresolvedIncidents.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                All Systems Healthy
              </span>
            )}
          </div>
          <button
            onClick={onRefresh}
            className="text-xs text-brand font-semibold hover:underline cursor-pointer"
          >
            Refresh Alerts
          </button>
        </div>

        <p className="text-xs text-muted mb-4">
          Captures AI worker failures, Groq quota limits, and server errors in real-time. Alerts are instantly pushed to admin devices.
        </p>

        {incidents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface/80 border-b border-divider text-muted uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider/60">
                {incidents.map((inc) => (
                  <tr
                    key={inc._id}
                    className={[
                      'hover:bg-surface/40 transition-colors',
                      inc.status === 'unresolved' ? 'bg-red-50/15' : '',
                    ].join(' ')}
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={[
                          'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase',
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
                    <td className="py-2.5 px-3 font-semibold text-ink">
                      {inc.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-2.5 px-3 text-muted max-w-xs truncate" title={inc.message}>
                      {inc.message}
                    </td>
                    <td className="py-2.5 px-3 text-ink font-medium max-w-[120px] truncate" title={inc.userEmail}>
                      {inc.userEmail}
                    </td>
                    <td className="py-2.5 px-3 text-muted text-[11px]">
                      {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {inc.status === 'unresolved' ? (
                        <button
                          onClick={() => handleResolve(inc._id)}
                          disabled={resolvingId === inc._id}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Resolve</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted font-medium">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-surface/60 border border-divider/60 text-center text-xs text-muted">
            <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <span>No failure incidents recorded. Everything is operating smoothly.</span>
          </div>
        )}
      </div>

      {/* 2-Column Grid: Queue & Push Broadcast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* BullMQ Worker & Queue Controls */}
        <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-base text-ink">BullMQ AI Queue & Workers</h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                Online
              </span>
            </div>
            <p className="text-xs text-muted mb-6">
              Background job processing engine connected via Redis Cloud. Handles Groq AI prompt generation asynchronously.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface p-3 rounded-xl border border-divider/60">
                <span className="text-xs text-muted block">Jobs Waiting</span>
                <span className="text-xl font-bold text-ink">{queue.waiting || 0}</span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-divider/60">
                <span className="text-xs text-muted block">Jobs Active</span>
                <span className="text-xl font-bold text-blue-600">{queue.active || 0}</span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-divider/60">
                <span className="text-xs text-muted block">Jobs Completed</span>
                <span className="text-xl font-bold text-emerald-600">{queue.completed || 0}</span>
              </div>
              <div className="bg-surface p-3 rounded-xl border border-divider/60">
                <span className="text-xs text-muted block">Jobs Failed</span>
                <span className={['text-xl font-bold', queue.failed > 0 ? 'text-red-600' : 'text-muted'].join(' ')}>
                  {queue.failed || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-divider pt-4 flex items-center justify-between">
            <span className="text-xs text-muted">
              {queue.failed > 0 ? `${queue.failed} failed jobs waiting for recovery` : 'Queue is operating normally'}
            </span>
            <button
              onClick={handleRetryJobs}
              disabled={retryingJobs || !queue.failed}
              className={[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer',
                queue.failed > 0
                  ? 'bg-ink text-white hover:bg-black shadow-xs'
                  : 'bg-surface text-muted border border-divider cursor-not-allowed opacity-60',
              ].join(' ')}
            >
              <RotateCcw className={['w-3.5 h-3.5', retryingJobs ? 'animate-spin' : ''].join(' ')} />
              <span>Retry Failed Jobs</span>
            </button>
          </div>
        </div>

        {/* Firebase FCM Broadcast Notification Center */}
        <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-brand" />
              <h3 className="font-bold text-base text-ink">Broadcast Push Notification</h3>
            </div>
            <span className="text-xs font-semibold text-muted flex items-center gap-1">
              <Smartphone className="w-3.5 h-3.5" />
              {systemHealth?.notifications?.totalRegisteredDevices || 0} Devices Registered
            </span>
          </div>

          <p className="text-xs text-muted mb-4">
            Dispatch announcements directly to users' Chrome extensions and web browsers via Firebase Cloud Messaging.
          </p>

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1">Notification Title</label>
              <input
                type="text"
                placeholder="e.g. New feature: Deck sharing is here!"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1">Notification Body</label>
              <textarea
                rows={3}
                placeholder="Enter announcement text to display on user notifications..."
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface text-ink text-xs rounded-xl border border-divider focus:outline-none focus:border-brand resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="w-full py-2.5 px-4 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sendingBroadcast ? 'Dispatching...' : 'Dispatch Notification Broadcast'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Infrastructure & Runtime Diagnostics */}
      <div className="bg-white p-6 rounded-2xl border border-divider shadow-xs">
        <h3 className="font-bold text-sm text-ink mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-brand" />
          Server Environment & Runtime Health
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-divider/60">
            <span className="text-xs text-muted block mb-1">Node.js Uptime</span>
            <div className="text-xl font-bold text-ink">
              {uptimeHours > 0 ? `${uptimeHours}h ${uptimeMinutes % 60}m` : `${uptimeMinutes}m`}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3" /> Continuous Process
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-divider/60">
            <span className="text-xs text-muted block mb-1">Memory (Heap Used)</span>
            <div className="text-xl font-bold text-ink">{memory.heapUsedMb} MB</div>
            <span className="text-[11px] text-muted block mt-1">
              Heap Total: {memory.heapTotalMb} MB (RSS: {memory.rssMb} MB)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-divider/60">
            <span className="text-xs text-muted block mb-1">Database & Redis</span>
            <div className="text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <HardDrive className="w-5 h-5" /> Connected
            </div>
            <span className="text-[11px] text-muted block mt-1">
              MongoDB Atlas Pool + Redis Cloud
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
