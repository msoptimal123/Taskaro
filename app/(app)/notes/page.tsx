import { createServerClient } from '@/lib/supabase/server';
import type { Note } from '@/types/domain';

export default async function NotesPage() {
  const supabase = createServerClient();

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  const typedNotes = (notes ?? []) as Note[];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 shrink-0">
        <h1 className="text-2xl font-bold text-text">Zapiski</h1>
      </div>

      {/* Notes list */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 flex flex-col gap-3">
        {typedNotes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center pt-16">
            <p className="text-muted text-sm">Ni zapiskov</p>
          </div>
        ) : (
          typedNotes.map((note) => (
            <div key={note.id} className="bg-card rounded-2xl shadow-card px-4 py-3">
              <p className="text-sm text-text">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
