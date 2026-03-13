import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="bg-card border-border"
        data-ocid="delete.dialog"
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-foreground">
            Delete this clip?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            This will permanently remove the clip and its video from storage.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="border-border text-muted-foreground"
            data-ocid="delete.cancel_button"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-ocid="delete.confirm_button"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
