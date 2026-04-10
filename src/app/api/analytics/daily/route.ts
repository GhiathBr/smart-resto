import { NextRequest, NextResponse } from 'next/server';
import { getDailyAnalytics, getWeeklyAnalytics } from '@/services/analytics.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'today';

    if (period === 'week') {
      const analytics = await getWeeklyAnalytics();
      return NextResponse.json(analytics);
    }

    // Default to today
    const analytics = await getDailyAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
