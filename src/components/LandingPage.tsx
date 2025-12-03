'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { setAuthToken } from '@/lib/auth-client';
import { Accordion } from './marketing/Accordion';

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    practice_name: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'analytics'>('dashboard');

  const handleQuickSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setShowSignupForm(true);
    setTimeout(() => {
      const element = document.getElementById('signup-section');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleFullSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }

      if (!data.token) {
        setError('No token received');
        setLoading(false);
        return;
      }

      setAuthToken(data.token);
      router.push('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-step-bg via-step-surface to-step-bg dark:from-step-dark-bg dark:via-step-dark-surface dark:to-step-dark-bg">
      {/* Navigation - Normal flow, scrolls with page */}
      <nav className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/sl_logo.png"
                alt="StepLadder Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h1 className="text-2xl font-black text-step-primary-600 dark:text-step-primary-500">
                StepLadder
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="outline" size="sm" className="border-0 shadow-none">
                  Sign In
                </Button>
              </Link>
              <Button 
                size="sm"
                className="shadow-none"
                onClick={() => {
                  const element = document.getElementById('signup-section');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-step-text-main dark:text-step-dark-text-main mb-6 tracking-tight leading-tight">
              Supercharge Your Therapy Practice In Minutes.
            </h1>
            <p className="text-xl md:text-2xl text-step-text-muted dark:text-step-dark-text-muted mb-8 leading-relaxed">
              Connect sessions with simple, research-backed homework that scales across your caseload.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <form onSubmit={handleQuickSignup} className="flex flex-col sm:flex-row gap-3 flex-1 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="whitespace-nowrap">
                  Start Free Trial
                </Button>
              </form>
              <Button variant="outline" className="whitespace-nowrap">
                Book a demo
              </Button>
            </div>
            <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted">
              No credit card required · Setup in minutes
            </p>
          </div>
          
          {/* Product Mockup */}
          <div className="relative">
            <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg shadow-2xl overflow-hidden">
              {/* Browser Frame */}
              <div className="bg-step-bg dark:bg-step-dark-bg border-b border-step-border dark:border-step-dark-border px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-step-surface dark:bg-step-dark-surface rounded px-3 py-1 text-xs text-step-text-muted dark:text-step-dark-text-muted text-center mx-4">
                  stepladder.app/{activeTab}
                </div>
              </div>
              
              {/* Tab Navigation */}
              <div className="bg-step-bg dark:bg-step-dark-bg border-b border-step-border dark:border-step-dark-border px-6 py-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'dashboard'
                        ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white shadow-sm'
                        : 'text-step-text-muted dark:text-step-dark-text-muted hover:text-step-text-main dark:hover:text-step-dark-text-main hover:bg-step-surface dark:hover:bg-step-dark-surface'
                    }`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('clients')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'clients'
                        ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white shadow-sm'
                        : 'text-step-text-muted dark:text-step-dark-text-muted hover:text-step-text-main dark:hover:text-step-dark-text-main hover:bg-step-surface dark:hover:bg-step-dark-surface'
                    }`}
                  >
                    Clients
                  </button>
                  <button
                    onClick={() => setActiveTab('analytics')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${
                      activeTab === 'analytics'
                        ? 'bg-step-primary-600 dark:bg-step-primary-500 text-white shadow-sm'
                        : 'text-step-text-muted dark:text-step-dark-text-muted hover:text-step-text-main dark:hover:text-step-dark-text-main hover:bg-step-surface dark:hover:bg-step-dark-surface'
                    }`}
                  >
                    Analytics
                  </button>
                </div>
              </div>
              
              {/* Content Preview */}
              <div className="p-6 bg-step-bg dark:bg-step-dark-bg min-h-[400px]">
                {activeTab === 'dashboard' && (
                  <div className="animate-fadeIn">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
                        Dashboard
                      </h2>
                    </div>
                    
                    {/* Stats Preview */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Active Homework</div>
                        <div className="text-xl font-bold text-step-text-main dark:text-step-dark-text-main">12</div>
                      </div>
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Completion Rate</div>
                        <div className="text-xl font-bold text-step-text-main dark:text-step-dark-text-main">82%</div>
                      </div>
                      <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark rounded-lg p-3 border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30">
                        <div className="text-xs text-step-status-danger-text dark:text-step-status-danger-textDark mb-1">Needs Attention</div>
                        <div className="text-xl font-bold text-step-status-danger-text dark:text-step-status-danger-textDark">2</div>
                      </div>
                    </div>
                    
                    {/* Recent Activity Preview */}
                    <div className="space-y-2">
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-step-text-main dark:text-step-dark-text-main">Sarah M.</div>
                            <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted">Completed Exposure Hierarchy</div>
                          </div>
                          <span className="text-xs text-step-status-success-text dark:text-step-status-success-textDark">✓</span>
                        </div>
                      </div>
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-step-text-main dark:text-step-dark-text-main">James K.</div>
                            <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted">Thought Record assigned</div>
                          </div>
                          <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted">Pending</span>
                        </div>
                      </div>
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-step-text-main dark:text-step-dark-text-main">Maria L.</div>
                            <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted">DBT Diary Card completed</div>
                          </div>
                          <span className="text-xs text-step-status-success-text dark:text-step-status-success-textDark">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'clients' && (
                  <div className="animate-fadeIn">
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
                        Clients
                      </h2>
                      <div className="flex gap-2 mb-4">
                        <button className="px-3 py-1 text-xs font-medium bg-step-primary-600 dark:bg-step-primary-500 text-white rounded-md">
                          Active
                        </button>
                        <button className="px-3 py-1 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted rounded-md hover:bg-step-surface dark:hover:bg-step-dark-surface">
                          Archived
                        </button>
                      </div>
                    </div>
                    
                    {/* Client Cards Preview */}
                    <div className="space-y-3">
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-4 border border-step-border dark:border-step-dark-border hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-1">
                              Sarah M.
                            </h3>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              sarah.m@email.com
                            </p>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              ERP · Active
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-step-primary-50 dark:bg-step-primary-900/30 text-step-primary-700 dark:text-step-primary-300">
                              3/4 exposures this week
                            </span>
                          </div>
                          <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted">
                            Today
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-4 border border-step-border dark:border-step-dark-border hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-1">
                              James K.
                            </h3>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              james.k@email.com
                            </p>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              CBT · Active
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-step-status-warning-bg dark:bg-step-status-warning-bgDark text-step-status-warning-text dark:text-step-status-warning-textDark">
                              1/3 assignments completed
                            </span>
                          </div>
                          <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted">
                            2 days ago
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-4 border border-step-border dark:border-step-dark-border hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-step-text-main dark:text-step-dark-text-main mb-1">
                              Maria L.
                            </h3>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              maria.l@email.com
                            </p>
                            <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-2">
                              DBT · Active
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-step-status-success-bg dark:bg-step-status-success-bgDark text-step-status-success-text dark:text-step-status-success-textDark">
                              All assignments complete
                            </span>
                          </div>
                          <span className="text-xs text-step-text-muted dark:text-step-dark-text-muted">
                            1 day ago
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'analytics' && (
                  <div className="animate-fadeIn">
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main">
                            Analytics
                          </h2>
                          <p className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-1">
                            Big-picture trends across your caseload
                          </p>
                        </div>
                        <div className="flex gap-1 bg-step-surface dark:bg-step-dark-surface rounded-md p-1 border border-step-border dark:border-step-dark-border">
                          <button className="px-2 py-1 text-xs font-medium bg-step-primary-600 dark:bg-step-primary-500 text-white rounded">
                            30d
                          </button>
                          <button className="px-2 py-1 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted rounded hover:bg-step-bg dark:hover:bg-step-dark-bg">
                            Week
                          </button>
                          <button className="px-2 py-1 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted rounded hover:bg-step-bg dark:hover:bg-step-dark-bg">
                            90d
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Analytics Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Avg completion</div>
                        <div className="text-lg font-bold text-step-text-main dark:text-step-dark-text-main">82%</div>
                        <div className="text-xs text-step-status-success-text dark:text-step-status-success-textDark mt-1">
                          ↑ 8% vs last period
                        </div>
                      </div>
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Clients improving</div>
                        <div className="text-lg font-bold text-step-text-main dark:text-step-dark-text-main">10/14</div>
                        <div className="text-xs text-step-status-success-text dark:text-step-status-success-textDark mt-1">
                          ↑ 2 this month
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Preview */}
                    <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-4 border border-step-border dark:border-step-dark-border mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-step-text-main dark:text-step-dark-text-main">
                          Outcomes over time
                        </h3>
                        <div className="flex gap-1">
                          <button className="px-2 py-0.5 text-xs font-medium bg-step-primary-600 dark:bg-step-primary-500 text-white rounded">
                            SUDS
                          </button>
                          <button className="px-2 py-0.5 text-xs font-medium text-step-text-muted dark:text-step-dark-text-muted rounded hover:bg-step-bg dark:hover:bg-step-dark-bg">
                            Belief
                          </button>
                        </div>
                      </div>
                      {/* Modern line chart - SUDS scores showing improvement */}
                      <div className="h-24 relative">
                        <svg className="w-full h-full" viewBox="0 0 280 96" preserveAspectRatio="xMidYMid meet">
                          <defs>
                            <linearGradient id="sudsGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* Grid lines */}
                          {[20, 40, 60, 80].map((y) => (
                            <line
                              key={y}
                              x1="20"
                              y1={y}
                              x2="260"
                              y2={y}
                              stroke="currentColor"
                              strokeWidth="0.5"
                              className="text-step-border dark:text-step-dark-border opacity-20"
                            />
                          ))}
                          {/* Data - SUDS scores decreasing (improvement) */}
                          {(() => {
                            const data = [85, 78, 72, 68, 62, 55, 48];
                            const maxValue = 100;
                            const minValue = 0;
                            const range = maxValue - minValue;
                            const chartHeight = 80;
                            const chartWidth = 240;
                            const padding = 20;
                            
                            const points = data.map((value, i) => {
                              const x = padding + (i * chartWidth) / (data.length - 1);
                              const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
                              return { x, y, value };
                            });
                            
                            const pathData = points.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                            ).join(' ');
                            
                            // Area under curve
                            const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;
                            
                            return (
                              <>
                                {/* Area fill */}
                                <path
                                  d={areaPath}
                                  fill="url(#sudsGradient)"
                                />
                                {/* Line */}
                                <path
                                  d={pathData}
                                  fill="none"
                                  stroke="rgb(34, 197, 94)"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                {/* Data points */}
                                {points.map((point, i) => (
                                  <circle
                                    key={i}
                                    cx={point.x}
                                    cy={point.y}
                                    r="3.5"
                                    fill="rgb(34, 197, 94)"
                                    stroke="white"
                                    strokeWidth="2"
                                  />
                                ))}
                              </>
                            );
                          })()}
                        </svg>
                        {/* X-axis labels */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-[10px] text-step-text-muted dark:text-step-dark-text-muted">
                          <span>W1</span>
                          <span>W2</span>
                          <span>W3</span>
                          <span>W4</span>
                          <span>W5</span>
                          <span>W6</span>
                          <span>W7</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Risk & Modality Preview */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-step-status-danger-bg dark:bg-step-status-danger-bgDark rounded-lg p-3 border border-step-status-danger-text/20 dark:border-step-status-danger-textDark/30">
                        <div className="text-xs text-step-status-danger-text dark:text-step-status-danger-textDark mb-1">Elevated risk</div>
                        <div className="text-lg font-bold text-step-status-danger-text dark:text-step-status-danger-textDark">2</div>
                      </div>
                      <div className="bg-step-surface dark:bg-step-dark-surface rounded-lg p-3 border border-step-border dark:border-step-dark-border">
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Top modality</div>
                        <div className="text-lg font-bold text-step-text-main dark:text-step-dark-text-main">CBT</div>
                        <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mt-1">45% of entries</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-step-surface/50 dark:bg-step-dark-surface/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-4">
            How StepLadder fits your workflow
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              1. Assign in seconds
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted">
              Choose a worksheet, personalize a few fields, and send via magic link—right from your dashboard.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              2. Clients complete via magic link
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted">
              Clients click once from their inbox. No logins, no app downloads, just structured prompts they can actually finish.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              3. Review outcomes at a glance
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted">
              See SUDS, belief ratings, urges, and notes in one timeline, with flags for high risk or missed homework.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-4">
            Everything you need to scale your practice
          </h2>
          <p className="text-lg text-step-text-muted dark:text-step-dark-text-muted max-w-2xl mx-auto">
            Built specifically for therapists who want to deliver better outcomes, faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Magic Link Access
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              Clients access homework with secure, expiring magic links. No portals or passwords to forget.
            </p>
          </div>

          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Customizable, evidence-based worksheets
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              CBT thought records, ERP hierarchy builders, DBT diary cards, and more—tailor each assignment to your client.
            </p>
          </div>

          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Outcome & risk tracking
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              Monitor SUDS scores, belief ratings, urges, and crisis flags over time so you never miss concerning trends.
            </p>
          </div>

          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Practice-wide analytics
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              See completion rates, entries per client, and which modalities are driving the most improvement.
            </p>
          </div>

          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Multi-modality support
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              Organize homework by CBT, ERP, DBT, ACT, and your own modalities so your caseload never feels chaotic.
            </p>
          </div>

          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-step-primary-100 dark:bg-step-primary-900/30 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-step-primary-600 dark:text-step-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-2">
              Built for modern, secure practice
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              Privacy-focused infrastructure designed to sit alongside your existing EHR and telehealth tools.
            </p>
          </div>
        </div>
      </section>

      {/* Solo vs Group Practices */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-step-surface/50 dark:bg-step-dark-surface/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-4">
            Fits your practice, whether you're solo or part of a team
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
              Solo clinicians
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  Stay on top of every client's homework without extra admin.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  Have concrete data for supervision and case notes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  Show clients measurable progress over time.
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
              Group practices
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  Standardize homework across clinicians and modalities.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  Get a shared view of client risk and engagement.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-step-primary-600 dark:text-step-primary-500 mt-1">✓</span>
                <span className="text-step-text-muted dark:text-step-dark-text-muted">
                  See which worksheets and approaches are working across the team.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Analytics Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-6">
              See outcomes at a glance
            </h2>
            <div className="space-y-4 text-step-text-muted dark:text-step-dark-text-muted leading-relaxed">
              <p>
                StepLadder gives you a clear view of weekly homework entries, clients showing improvement, completion rates, and elevated risk clients—all in one dashboard.
              </p>
              <p>
                It's not just more data. It's clearer decisions: who needs a check-in call, which worksheets to repeat, and where your practice is making the biggest impact.
              </p>
            </div>
          </div>
          
          {/* Analytics Visual */}
          <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-6 shadow-lg">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-step-text-main dark:text-step-dark-text-main mb-4">
                Homework entries over time
              </h3>
              {/* Modern line chart - Homework entries showing growth */}
              <div className="h-32 relative mb-4">
                <svg className="w-full h-full" viewBox="0 0 280 128" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <linearGradient id="entriesGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  {[25, 50, 75, 100].map((y) => (
                    <line
                      key={y}
                      x1="24"
                      y1={y}
                      x2="256"
                      y2={y}
                      stroke="currentColor"
                      strokeWidth="0.5"
                      className="text-step-border dark:text-step-dark-border opacity-20"
                    />
                  ))}
                  {/* Data - Homework entries increasing (growth) */}
                  {(() => {
                    const data = [42, 48, 55, 62, 68, 75, 82];
                    const maxValue = 100;
                    const minValue = 0;
                    const range = maxValue - minValue;
                    const chartHeight = 100;
                    const chartWidth = 232;
                    const padding = 24;
                    
                    const points = data.map((value, i) => {
                      const x = padding + (i * chartWidth) / (data.length - 1);
                      const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
                      return { x, y, value };
                    });
                    
                    const pathData = points.map((p, i) => 
                      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                    ).join(' ');
                    
                    // Area under curve
                    const areaPath = `${pathData} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`;
                    
                    return (
                      <>
                        {/* Area fill */}
                        <path
                          d={areaPath}
                          fill="url(#entriesGradient)"
                        />
                        {/* Line */}
                        <path
                          d={pathData}
                          fill="none"
                          stroke="rgb(34, 197, 94)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {/* Data points */}
                        {points.map((point, i) => (
                          <circle
                            key={i}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="rgb(34, 197, 94)"
                            stroke="white"
                            strokeWidth="2.5"
                          />
                        ))}
                      </>
                    );
                  })()}
                </svg>
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-step-text-muted dark:text-step-dark-text-muted">
                  <span>W1</span>
                  <span>W2</span>
                  <span>W3</span>
                  <span>W4</span>
                  <span>W5</span>
                  <span>W6</span>
                  <span>W7</span>
                </div>
              </div>
            </div>
            
            {/* Stats Cluster */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-step-border dark:border-step-dark-border">
              <div>
                <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Avg completion</div>
                <div className="text-xl font-bold text-step-text-main dark:text-step-dark-text-main">82%</div>
              </div>
              <div>
                <div className="text-xs text-step-text-muted dark:text-step-dark-text-muted mb-1">Improving</div>
                <div className="text-xl font-bold text-step-text-main dark:text-step-dark-text-main">10/14</div>
              </div>
              <div>
                <div className="text-xs text-step-status-danger-text dark:text-step-status-danger-textDark mb-1">Elevated risk</div>
                <div className="text-xl font-bold text-step-status-danger-text dark:text-step-status-danger-textDark">2</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-4">
            Frequently asked questions
          </h2>
        </div>
        
        <div className="bg-step-surface dark:bg-step-dark-surface border border-step-border dark:border-step-dark-border rounded-lg p-8">
          <Accordion
            items={[
              {
                question: 'Do my clients need to download an app or remember a password?',
                answer: 'No. Clients receive a secure magic link via email. They click once, complete the worksheet, and submit—no accounts, no passwords, no friction.',
              },
              {
                question: 'Can I use my own worksheets?',
                answer: 'StepLadder includes hundreds of evidence-based worksheets across CBT, ERP, DBT, and other modalities. You can customize each worksheet with client-specific values, and we\'re working on support for custom worksheet templates. Contact us if you need something specific.',
              },
              {
                question: 'Does StepLadder replace my EHR or telehealth tool?',
                answer: 'No. StepLadder is designed to complement your existing systems. It focuses specifically on homework assignments and outcome tracking, sitting alongside your EHR and telehealth platforms.',
              },
              {
                question: 'How secure is client data?',
                answer: 'StepLadder uses bank-level encryption and HIPAA-compliant infrastructure. All client data is encrypted in transit and at rest, and we follow strict privacy protocols to protect sensitive information.',
              },
              {
                question: 'What happens if a client doesn\'t complete their homework?',
                answer: 'You\'ll see missed assignments flagged in your dashboard, along with how long it\'s been since their last entry. This helps you identify clients who might need a check-in or a different approach.',
              },
              {
                question: 'Can I track outcomes across my entire caseload?',
                answer: 'Yes. StepLadder\'s analytics dashboard shows practice-wide trends: completion rates, average entries per client, clients showing improvement, and risk signals. You can filter by time period and see which modalities are driving the best outcomes.',
              },
            ]}
          />
        </div>
      </section>

      {/* Final CTA Banner */}
      <section id="signup-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-step-primary-600/10 dark:from-step-primary-500/10 to-step-primary-500/10 dark:to-step-primary-400/10 border border-step-primary-600/20 dark:border-step-primary-500/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-step-text-main dark:text-step-dark-text-main mb-4">
            Ready to see better follow-through from your clients?
          </h2>
          <p className="text-lg text-step-text-muted dark:text-step-dark-text-muted mb-8 max-w-2xl mx-auto">
            Start a 14-day free trial and send your first worksheet in minutes.
          </p>
          
          {!showSignupForm ? (
            <form onSubmit={handleQuickSignup} className="max-w-md mx-auto mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="whitespace-nowrap">
                  Get Started
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleFullSignup} className="max-w-md mx-auto space-y-4">
              {error && (
                <div className="bg-step-status-danger-bg dark:bg-red-900/30 border border-step-status-danger-text/20 dark:border-red-500/30 text-step-status-danger-text dark:text-red-400 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Your full name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                />
                <Input
                  label="Practice Name (optional)"
                  type="text"
                  value={formData.practice_name}
                  onChange={(e) => setFormData({ ...formData, practice_name: e.target.value })}
                  placeholder="Your practice or clinic name"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          )}
          
          <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-step-primary-600 dark:text-step-primary-500 hover:underline font-medium">
              Sign in
            </Link>
            {' '}or{' '}
            <button className="text-step-primary-600 dark:text-step-primary-500 hover:underline font-medium">
              Book a demo
            </button>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-step-border dark:border-step-dark-border bg-step-surface dark:bg-step-dark-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-bold text-step-text-main dark:text-step-dark-text-main mb-2">
              StepLadder
            </h3>
            <p className="text-step-text-muted dark:text-step-dark-text-muted mb-4">
              The homework OS for modern therapy practices
            </p>
            <p className="text-sm text-step-text-muted dark:text-step-dark-text-muted">
              © {new Date().getFullYear()} StepLadder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
