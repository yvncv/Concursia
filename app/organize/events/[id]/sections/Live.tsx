'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Play } from 'lucide-react';
import { LiveContestRunning } from './LiveModules/LiveContestRunning';
import LiveSchedule from './LiveModules/LiveSchedule';

const Live = ({ event, onBack }) => {
  const [viewState, setViewState] = useState('schedule');
  const [contestStarted, setContestStarted] = useState(false);

  useEffect(() => {
    if (event?.status === 'live') {
      setContestStarted(true);
    }
  }, [event?.status]);

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      {
        id: 'schedule',
        label: 'Principal',
        icon: Calendar,
        active: viewState === 'schedule',
        completed: viewState === 'execution',
        clickable: true
      }
    ];

    if (viewState === 'execution' || contestStarted) {
      breadcrumbs.push({
        id: 'execution',
        label: 'Ejecución',
        icon: Play,
        active: viewState === 'execution',
        completed: false,
        clickable: contestStarted
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBreadcrumbClick = (breadcrumbId: string) => {
    if (breadcrumbId === 'schedule') {
      setViewState('schedule');
    } else if (breadcrumbId === 'execution' && contestStarted) {
      setViewState('execution');
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-6 p-4 bg-white rounded-lg border border-gray-200">
        {breadcrumbs.map((breadcrumb, index) => {
          const Icon = breadcrumb.icon;
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <React.Fragment key={breadcrumb.id}>
              <div 
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                  breadcrumb.active 
                    ? 'bg-red-100 text-red-700 font-semibold' 
                    : breadcrumb.completed
                    ? 'text-green-600 hover:bg-green-50'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${!breadcrumb.clickable ? 'cursor-not-allowed opacity-50' : ''}`}
                onClick={() => breadcrumb.clickable && handleBreadcrumbClick(breadcrumb.id)}
              >
                <Icon className={`h-4 w-4 ${
                  breadcrumb.active 
                    ? 'text-red-600' 
                    : breadcrumb.completed 
                    ? 'text-green-500' 
                    : 'text-gray-400'
                }`} />
                <span className="text-sm">{breadcrumb.label}</span>
                
                {breadcrumb.completed && !breadcrumb.active && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                
                {breadcrumb.active && (
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              
              {!isLast && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="w-full">
        {viewState === 'schedule' && (
          <LiveSchedule
            event={event}
            onContestStart={(started) => {
              setContestStarted(started);
              if (started) {
                setViewState('execution');
              }
            }}
          />
        )}
        {viewState === 'execution' && (
          <LiveContestRunning 
            event={event} 
            onBack={onBack}
            onBackToSchedule={() => setViewState('schedule')}
          />
        )}
      </div>
    </div>
  );
};

export default Live;