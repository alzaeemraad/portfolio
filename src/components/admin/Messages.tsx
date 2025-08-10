import React, { useState, useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';

const MESSAGES_PER_PAGE = 10;

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  date?: string; // ISO preferred, but DD/MM/YYYY or DD-MM-YYYY also supported
}

const parseDateSafe = (dateStr?: string): Date | null => {
  if (!dateStr) return null;

  // Try native Date parse first (works for ISO and many common formats)
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Fallback for DD/MM/YYYY or DD-MM-YYYY
  const parts = dateStr.trim().split(/[\/\-\.]/).map((p) => p.trim());
  if (parts.length === 3) {
    // If year looks like last part (YYYY)
    let day = Number(parts[0]);
    let month = Number(parts[1]) - 1;
    let year = Number(parts[2]);

    // If first part is year (YYYY-MM-DD), adapt
    if (parts[0].length === 4 && !isNaN(Number(parts[0]))) {
      year = Number(parts[0]);
      month = Number(parts[1]) - 1;
      day = Number(parts[2]);
    }

    if (![day, month, year].some(isNaN)) {
      const d2 = new Date(year, month, day);
      if (!isNaN(d2.getTime())) return d2;
    }
  }

  return null;
};

const Messages: React.FC = () => {
  const { messages = [], loading } = useData();
  const [currentPage, setCurrentPage] = useState(1);

  // Compute cutoff: 1 month ago from now
  const oneMonthAgo = useMemo(() => {
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 1);
    return cutoff;
  }, []);

  // Filter to only messages newer than or equal to oneMonthAgo
  const recentMessages = useMemo(() => {
    return messages.filter((msg: Message) => {
      const msgDate = parseDateSafe(msg.date);
      if (!msgDate) return false; // skip messages without parsable date
      return msgDate >= oneMonthAgo;
    });
  }, [messages, oneMonthAgo]);

  const totalPages = Math.max(1, Math.ceil(recentMessages.length / MESSAGES_PER_PAGE));

  // Ensure current page is valid whenever filtered messages change
  useEffect(() => {
    setCurrentPage((prev) => {
      const lastPage = Math.max(1, Math.ceil(recentMessages.length / MESSAGES_PER_PAGE));
      return Math.min(prev, lastPage);
    });
  }, [recentMessages.length]);

  const paginatedMessages = useMemo(() => {
    const start = (currentPage - 1) * MESSAGES_PER_PAGE;
    return recentMessages.slice(start, start + MESSAGES_PER_PAGE);
  }, [recentMessages, currentPage]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  if (loading) return <p>Loading messages...</p>;
  if (recentMessages.length === 0) return <p>No recent messages found (last 1 month).</p>;

  return (
    <div className="max-w-full sm:max-w-6xl mx-auto px-4 sm:px-6 md:px-8 p-4">
      <h3 className="text-xl font-semibold mb-4">User Messages (Last 1 Month)</h3>

      <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-300 rounded p-4">
        {paginatedMessages.map((msg: Message) => {
          const parsed = parseDateSafe(msg.date);
          const prettyDate = parsed ? parsed.toLocaleString() : 'Unknown date';
          return (
            <div key={msg.id} className="border-b border-gray-200 pb-2">
              <p>
                <strong>Name:</strong> {msg.name}
              </p>
              <p>
                <strong>Email:</strong> {msg.email}
              </p>
              <p>
                <strong>Message:</strong> {msg.content}
              </p>
              <p className="text-sm text-gray-500">
                <strong>Date:</strong> {prettyDate}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page {currentPage} of {Math.max(1, Math.ceil(recentMessages.length / MESSAGES_PER_PAGE))}
        </span>

        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Messages;
