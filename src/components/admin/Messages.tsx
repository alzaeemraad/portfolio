import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

const MESSAGES_PER_PAGE = 10;

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  date?: string;
}

const Messages: React.FC = () => {
  const { messages, loading } = useData();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(messages.length / MESSAGES_PER_PAGE);

  const paginatedMessages = messages.slice(
    (currentPage - 1) * MESSAGES_PER_PAGE,
    currentPage * MESSAGES_PER_PAGE
  );

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  if (loading) {
    return <p>Loading messages...</p>;
  }

  if (messages.length === 0) {
    return <p>No messages found.</p>;
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">User Messages</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-300 rounded p-4">
        {paginatedMessages.map((msg: Message) => (
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
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Messages;
