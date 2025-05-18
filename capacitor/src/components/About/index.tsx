import { ButtonPrimary, Text, colorSemiBlack } from "../../theme";
import { Modal } from "../Modal";
import { AppName, AppDescription, AppVersion, HelpUrl } from "../../constants";

interface AboutProps {
  open: boolean;
  onClose: () => void;
}

const openHelp = () => window.open(`https://r5.network`);

export function About({ open, onClose }: AboutProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <h3 style={{ marginBottom: "-10px", color: colorSemiBlack }}>
        {AppName}
      </h3>
      <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
        {AppDescription}
      </Text>
      <Text style={{ marginBottom: "10px", color: colorSemiBlack }}>
        <b>Version:</b> {AppVersion}
      </Text>
      <ButtonPrimary onClick={openHelp} style={{ marginBottom: "-10px" }}>
        Help &amp; Support
      </ButtonPrimary>
      <ButtonPrimary onClick={onClose}>Close</ButtonPrimary>
    </Modal>
  );
}
