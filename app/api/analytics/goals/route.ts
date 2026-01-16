import { NextRequest, NextResponse } from 'next/server';
import { FEATURE_FUNNEL_GOALS } from '@/lib/feature-flags';
import { GoalType, FunnelName, FunnelStep, GoalEvent, FunnelStepEvent } from '@/lib/analytics-goals';

// Force dynamic rendering to prevent build-time analysis issues
export const dynamic = 'force-dynamic';

/**
 * In-memory storage for goals and funnel steps
 * In production, replace with database storage
 */
interface StoredGoalEvent extends GoalEvent {
  id: string;
}

interface StoredFunnelStepEvent extends FunnelStepEvent {
  id: string;
}

const goals: StoredGoalEvent[] = [];
const funnelSteps: StoredFunnelStepEvent[] = [];

// Configuration
const MAX_STORAGE_SIZE = 10000; // Maximum number of records to keep
const RETENTION_DAYS = 90; // Keep goals for 90 days

/**
 * Cleanup old data
 */
function cleanupOldData() {
  const cutoffTime = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  
  // Remove old goals
  const filteredGoals = goals.filter(g => g.timestamp > cutoffTime);
  goals.length = 0;
  goals.push(...filteredGoals);
  
  // Remove old funnel steps
  const filteredSteps = funnelSteps.filter(s => s.timestamp > cutoffTime);
  funnelSteps.length = 0;
  funnelSteps.push(...filteredSteps);
}

// Cleanup on startup and periodically
if (typeof setInterval !== 'undefined') {
  cleanupOldData();
  setInterval(cleanupOldData, 60 * 60 * 1000); // Cleanup every hour
}

/**
 * POST /api/analytics/goals
 * 
 * Accepts goal events and funnel step events
 */
export async function POST(request: NextRequest) {
  // Check feature flag
  if (!FEATURE_FUNNEL_GOALS) {
    return NextResponse.json(
      { error: 'Funnel goals tracking is disabled' },
      { status: 404 }
    );
  }

  try {
    const body = await request.json();
    
    // Handle goal events
    if (body.type && Object.values(GoalType).includes(body.type)) {
      const goalEvent: StoredGoalEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: body.type as GoalType,
        timestamp: body.timestamp || Date.now(),
        metadata: body.metadata || {},
      };
      
      // Prevent storage overflow
      if (goals.length >= MAX_STORAGE_SIZE) {
        goals.shift(); // Remove oldest
      }
      
      goals.push(goalEvent);
      
      return NextResponse.json({ success: true, id: goalEvent.id }, { status: 201 });
    }
    
    // Handle funnel step events
    if (body.type === 'funnel_step' && body.funnel && body.step) {
      const stepEvent: StoredFunnelStepEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        funnel: body.funnel as FunnelName,
        step: body.step as FunnelStep,
        timestamp: body.timestamp || Date.now(),
        metadata: body.metadata || {},
      };
      
      // Prevent storage overflow
      if (funnelSteps.length >= MAX_STORAGE_SIZE) {
        funnelSteps.shift(); // Remove oldest
      }
      
      funnelSteps.push(stepEvent);
      
      return NextResponse.json({ success: true, id: stepEvent.id }, { status: 201 });
    }
    
    return NextResponse.json(
      { error: 'Invalid event type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing goal event:', error);
    return NextResponse.json(
      { error: 'Failed to process goal event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/goals
 * 
 * Returns goal counts and basic conversion metrics
 */
export async function GET(request: NextRequest) {
  // Check feature flag
  if (!FEATURE_FUNNEL_GOALS) {
    return NextResponse.json(
      { error: 'Funnel goals tracking is disabled' },
      { status: 404 }
    );
  }

  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    const startTimestamp = startDate ? parseInt(startDate, 10) : Date.now() - 30 * 24 * 60 * 60 * 1000; // Default: last 30 days
    const endTimestamp = endDate ? parseInt(endDate, 10) : Date.now();
    
    // Filter goals by date range
    const filteredGoals = goals.filter(
      g => g.timestamp >= startTimestamp && g.timestamp <= endTimestamp
    );
    
    // Filter funnel steps by date range
    const filteredSteps = funnelSteps.filter(
      s => s.timestamp >= startTimestamp && s.timestamp <= endTimestamp
    );
    
    // Count goals by type
    const goalCounts: Record<string, number> = {};
    filteredGoals.forEach(goal => {
      goalCounts[goal.type] = (goalCounts[goal.type] || 0) + 1;
    });
    
    // Count funnel steps by funnel and step
    const funnelCounts: Record<string, Record<string, number>> = {};
    filteredSteps.forEach(step => {
      if (!funnelCounts[step.funnel]) {
        funnelCounts[step.funnel] = {};
      }
      funnelCounts[step.funnel][step.step] = (funnelCounts[step.funnel][step.step] || 0) + 1;
    });
    
    // Calculate conversion rates (placeholder - can be enhanced)
    const conversionRates: Record<string, number> = {};
    Object.keys(funnelCounts).forEach(funnel => {
      const steps = funnelCounts[funnel];
      const pageLoads = steps[FunnelStep.PAGE_LOAD] || 0;
      const successes = steps[FunnelStep.SUCCESS] || 0;
      if (pageLoads > 0) {
        conversionRates[funnel] = (successes / pageLoads) * 100;
      }
    });
    
    return NextResponse.json({
      goals: {
        total: filteredGoals.length,
        byType: goalCounts,
      },
      funnels: {
        steps: funnelCounts,
        conversionRates,
      },
      period: {
        start: startTimestamp,
        end: endTimestamp,
      },
    });
  } catch (error) {
    console.error('Error fetching goal metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch goal metrics' },
      { status: 500 }
    );
  }
}

