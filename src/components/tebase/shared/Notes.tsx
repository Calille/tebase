import React, { useState } from "react";
import { format } from "date-fns";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: {
    name: string;
    avatar?: string;
  };
}

interface NotesProps {
  entityId: string;
  entityType: "teacher" | "school";
  notes?: Note[];
  onAddNote?: (note: Omit<Note, "id" | "createdAt" | "createdBy">) => void;
  onDeleteNote?: (noteId: string) => void;
}

const Notes = ({
  entityId,
  entityType,
  notes: initialNotes,
  onAddNote,
  onDeleteNote,
}: NotesProps) => {
  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState<Note[]>(
    initialNotes || [
      {
        id: "1",
        content:
          entityType === "teacher"
            ? "Teacher is very reliable and has excellent classroom management skills."
            : "School has a great working environment and staff are very supportive.",
        createdAt: new Date(2023, 5, 15, 10, 30),
        createdBy: {
          name: "Alex Johnson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
        },
      },
      {
        id: "2",
        content:
          entityType === "teacher"
            ? "Prefers secondary schools and is available for last-minute bookings."
            : "School requires teachers to arrive 30 minutes before class starts.",
        createdAt: new Date(2023, 5, 10, 14, 45),
        createdBy: {
          name: "Morgan Smith",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=morgan",
        },
      },
      {
        id: "3",
        content:
          entityType === "teacher"
            ? "Has strong subject knowledge in advanced mathematics topics."
            : "School has requested the same teachers for consistency when possible.",
        createdAt: new Date(2023, 4, 28, 9, 15),
        createdBy: {
          name: "Jamie Wilson",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jamie",
        },
      },
    ],
  );

  const handleAddNote = () => {
    if (!newNote.trim()) return;

    const note = {
      content: newNote,
    };

    if (onAddNote) {
      onAddNote(note);
    } else {
      // Local state management if no callback provided
      const newNoteObj: Note = {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date(),
        createdBy: {
          name: "Current User",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
        },
      };

      setNotes([newNoteObj, ...notes]);
    }

    setNewNote("");
  };

  const handleDeleteNote = (noteId: string) => {
    if (onDeleteNote) {
      onDeleteNote(noteId);
    } else {
      // Local state management if no callback provided
      setNotes(notes.filter((note) => note.id !== noteId));
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-gray-800">
          {entityType === "teacher" ? "Teacher" : "School"} Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Textarea
            placeholder={`Add a new note about this ${entityType}...`}
            className="min-h-[80px] w-full"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <Button
            className="mt-2 flex items-center gap-1"
            onClick={handleAddNote}
          >
            <PlusCircle className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {notes.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No notes yet. Add your first note above.
            </p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage
                        src={note.createdBy.avatar}
                        alt={note.createdBy.name}
                      />
                      <AvatarFallback>
                        {note.createdBy.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {note.createdBy.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(note.createdAt, "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-500 hover:text-red-500"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-gray-500">
        <p>Notes are visible to all team members</p>
      </CardFooter>
    </Card>
  );
};

export default Notes;
