import { getBar, getBarReviews } from '@/lib/api';
import { notFound } from 'next/navigation';
import BarDetailContent from './components/BarDetailContent';

interface BarDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function BarDetailPage({ params }: BarDetailPageProps) {
  const { id: barId } = await params;

  try {
    const [barResult, reviewsResult] = await Promise.allSettled([
      getBar(barId),
      getBarReviews(barId, { limit: 10 }),
    ]);

    if (barResult.status === 'rejected') {
      notFound();
    }

    const bar = barResult.value;
    const reviews = reviewsResult.status === 'fulfilled' ? reviewsResult.value.reviews : [];
    const reviewsTotal =
      reviewsResult.status === 'fulfilled' ? reviewsResult.value.total : bar.review_count;

    return (
      <BarDetailContent bar={bar} initialReviews={reviews} initialReviewsTotal={reviewsTotal} />
    );
  } catch (_error) {
    // エラーが発生した場合は404
    notFound();
  }
}
