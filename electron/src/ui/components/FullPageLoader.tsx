import { Modal } from "./Modal";
import { Loading } from "./Loading";

interface FullPageLoaderProps {
  open: boolean;
}

export function FullPageLoader({ open }: FullPageLoaderProps) {
  // onClose no-op so clicking outside does nothing
  return <Modal open={open} onClose={() => {}}><Loading /></Modal>;
}
