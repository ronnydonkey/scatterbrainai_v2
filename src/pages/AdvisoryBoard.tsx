import React from 'react';
import { BoardOfDirectors } from '@/components/board/BoardOfDirectors';
import { useAuth } from '@/hooks/useAuth';

export default function AdvisoryBoard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <BoardOfDirectors userId={user?.id} />
    </div>
  );
}