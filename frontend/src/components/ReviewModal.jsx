import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import Modal from './Modal';

// get the public API from environment variables, localhost is backup 
const API = import.meta.env.PUBLIC_API_URL || 'http://localhost:5050';

export default function ReviewModal({ filmId, open, onClose }) {
  // reviews list for this film
  const [reviews, setReviews] = useState([]);
  // average rating from reviews
  const [avg, setAvg] = useState(0);
  // current user-selected rating
  const [rating, setRating] = useState(0);
  // current user reviews
  const [comment, setComment] = useState('');

  // fetch reviews and average when modal opens
  useEffect(() => {
    if (!open) return;
    fetch(`${API}/api/reviews?film_id=${filmId}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.reviews);
        setAvg(data.average);
      })
      .catch(console.error);
  }, [open, filmId]);

  // submit a new review
  const submitReview = async () => {
    let userKey = localStorage.getItem('user_key');
    // generate and store a user key if missing
    if (!userKey) {
      userKey = crypto.randomUUID();
      localStorage.setItem('user_key', userKey);
    }
    const payload = { film_id: filmId, user_key: userKey, rating, comment };
    const res = await fetch(`${API}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const newReview = await res.json();
      // add new review
      setReviews([newReview, ...reviews]);
      // recalculate average and round to 2 dp
      const newAvg = ((avg * (reviews.length || 0)) + newReview.rating) / (reviews.length + 1);
      setAvg(parseFloat(newAvg.toFixed(2)));
      // reset input
      setRating(0);
      setComment('');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      {/* modal header with average rating */}
      <h2 className="text-lg font-bold mb-2">Reviews (avg: {avg.toFixed(1)})</h2>
      {/* star rating input */}
      <div className="flex gap-1 mb-2">
        {[1,2,3,4,5].map(n => (
          <Star
            key={n}
            size={24}
            fill={n <= rating ? 'currentColor' : 'none'}
            strokeWidth={2}
            onClick={() => setRating(n)}
            className="cursor-pointer"
          />
        ))}
      </div>
      {/* review text area */}
      <textarea
        className="w-full p-2 border rounded mb-2"
        placeholder="Write your thoughts..."
        value={comment}
        onChange={e => setComment(e.target.value)}
      />
      {/* submit button (doesn't work if no rating) */}
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        disabled={rating === 0}
        onClick={submitReview}
      >
        Submit
      </button>
      {/* divider */}
      <hr className="my-4" />
      {/* list of existing reviews */}
      <ul className="space-y-2 max-h-64 overflow-auto">
        {reviews.map(r => (
          <li key={r.id} className="border-b pb-2">
           {/* display stars for rating */}
            <div className="flex items-center gap-0.5 mb-1">
              {[...Array(r.rating)].map((_,i)=><Star key={i} size={16} fill="currentColor" />)}
            </div>
             {/* review text */}
            <p className="mb-1">{r.comment}</p>
             {/* review timestamp */}
            <small className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </Modal>
  );
}