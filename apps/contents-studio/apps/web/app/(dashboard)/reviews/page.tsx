import { ReviewsClient } from "./reviews-client";
import { mockReviewEntries } from "../../../lib/reviews/mock-entries";

export default function ReviewsPage() {
  return <ReviewsClient entries={mockReviewEntries} />;
}
