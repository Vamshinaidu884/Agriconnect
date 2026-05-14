import { Star } from 'lucide-react';
import './RatingStars.css';

export default function RatingStars({ rating = 0, max = 5, size = 16, interactive = false, onChange = null }) {
  return (
    <div className="rating-stars" id="rating-stars">
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          className={`rating-star ${i < Math.round(rating) ? 'filled' : ''}`}
          onClick={() => interactive && onChange?.(i + 1)}
          disabled={!interactive}
          type="button"
        >
          <Star size={size} fill={i < Math.round(rating) ? 'currentColor' : 'none'} />
        </button>
      ))}
      {!interactive && rating > 0 && (
        <span className="rating-value">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
