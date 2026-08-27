import React, { useState, useEffect } from 'react';
import { Brain, Calendar, Target, Globe, Activity, Loader2, Flame, Clock } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import axios from 'axios';
import { API_URL } from './config';
import Confetti from 'react-confetti';

const AnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let timeoutId;
    if (data && data.additionStreak > 0) {
      const milestones = [3, 7, 14, 30, 50, 100, 365];
      if (milestones.includes(data.additionStreak)) {
        const lastConfetti = localStorage.getItem('lastConfettiDate');
        const today = new Date().toISOString().split('T')[0];
        if (lastConfetti !== today) {
          setShowConfetti(true);
          localStorage.setItem('lastConfettiDate', today);
          timeoutId = setTimeout(() => setShowConfetti(false), 8000); // Stop after 8s
        }
      }
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [data]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const response = await axios.get(`${API_URL}/analytics?timezone=${timezone}`, { withCredentials: true });
        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching analytics", error);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF5A5F]" />
      </div>
    );
  }

  if (!data) return <div className="text-center mt-20 text-red-500 font-bold text-xl">Failed to load analytics data. Are you logged into the extension?</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti 
            width={windowDimension.width} 
            height={windowDimension.height} 
            recycle={false} 
            numberOfPieces={600} 
            gravity={0.12} 
            colors={['#FF5A5F', '#FF385C', '#ff8a8f', '#ffffff']}
          />
        </div>
      )}
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Brain Dashboard</h1>
            <p className="text-gray-500 mt-1">Total Flashcards: {data.totalCards || 0}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">

            {/* Streak Card */}
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#FF5A5F]/15 to-transparent rounded-full blur-2xl"></div>
              <div className="relative z-10 text-[#FF5A5F]">
                <Flame className="w-8 h-8 fill-[#FF5A5F]/20 drop-shadow-sm" />
              </div>
              <div className="relative z-10">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Creation Streak</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 tracking-tighter">{data.additionStreak || 0}</p>
                  <span className="text-xs font-bold text-[#FF5A5F] bg-[#FF5A5F]/10 border border-[#FF5A5F]/20 px-2 py-0.5 rounded-full shadow-sm">Max {data.maxStreak || 0}</span>
                </div>
              </div>
            </div>

            {/* Retention Card (Large Typography + Circular Ring) */}
            <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-[#10b981]/10 to-transparent rounded-full blur-2xl"></div>
              <div className="relative flex items-center justify-center z-10">
                <svg width="48" height="48" viewBox="0 0 48 48" className="transform -rotate-90 drop-shadow-sm">
                  <circle cx="24" cy="24" r="20" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
                  <circle
                    cx="24" cy="24" r="20"
                    stroke="url(#retentionGradient)"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - ((Number(data.retentionRate) || 0) / 100) * 125.6}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="retentionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div className="relative z-10">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Retention Rate</p>
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 tracking-tighter">
                  {data.retentionRate || 0}<span className="text-xl text-gray-400 font-bold ml-0.5">%</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Top Row: Mastery & Workload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="text-[#FF5A5F] w-6 h-6" />
              <h2 className="text-xl font-bold">Knowledge Mastery</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.mastery}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.mastery.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="text-blue-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Upcoming Workload</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.workload}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Bottom Row: Heatmap & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="text-green-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Learning Consistency (Last 30 Days)</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.heatmap}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="text-purple-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Top Sources</h2>
            </div>
            <div className="space-y-4">
              {data.sources.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No sources tracked yet.</p>
              ) : (
                data.sources.map((source, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs shrink-0">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-gray-700 truncate">{source.domain}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full shrink-0">
                      {source.count}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Third Row: Accuracy by Time of Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="text-yellow-500 w-6 h-6" />
              <h2 className="text-xl font-bold">Accuracy by Time of Day</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.accuracyByTime}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    formatter={(value, name, props) => [
                      `${value}% (${props.payload.correct} / ${props.payload.total} correct)`, 
                      'Accuracy'
                    ]} 
                  />
                  <Bar dataKey="accuracy" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsDashboard;
