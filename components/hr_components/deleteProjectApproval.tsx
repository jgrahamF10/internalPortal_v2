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
import { deleteProjectApproval } from "@/app/hr/hrActions";
  
export function DeleteProjectApproval({ projectId }: { projectId: number }) {
      
    async function deleteApproval() {
        try {
            await deleteProjectApproval(projectId);
        } catch (error) {
            console.error("Error deleting project approval:", error);
        } finally {
            window.location.reload();
        }
    }
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-green-500 hover:bg-green-600">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-700 hover:bg-red-500" onClick={deleteApproval}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  