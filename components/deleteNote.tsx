import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
import { deleteAttachment } from "@/app/rentals/rentalActions";
import { TrashOutline } from "@/components/icons/trash";
  
export default function NoteDelete({ noteId }: { noteId: number }) {
      
    async function confirmDelete() {
        try {
            await deleteAttachment(noteId);
        } catch (error) {
            console.error("Error deleting project approval:", error);
        } finally {
            window.location.reload();
        }
    }
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="bg-transparent hover:bg-transparent"><TrashOutline className="h-4 w-4 hover:text-red-600" /> </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this note.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-green-500 hover:bg-green-600">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-700 hover:bg-red-500" onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  