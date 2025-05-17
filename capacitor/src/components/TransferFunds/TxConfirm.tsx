import { ButtonPrimary, BoxContent, Text, colorSemiBlack } from "../../theme";
import { ModalInner } from "../ModalInner";

interface TxConfirmProps {
  open: boolean;
  amount: string;
  recipient: string;
  fee: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function TxConfirm({
  open,
  amount,
  recipient,
  fee,
  onCancel,
  onConfirm
}: TxConfirmProps) {
  return (
    <ModalInner open={open} onClose={onCancel}>
      <h3 style={{ color: colorSemiBlack }}>Confirm Transaction</h3>
      <Text style={{ color: colorSemiBlack }}>
        Do you confirm sending <b>{amount} R5</b> to <b>{recipient}</b>?
      </Text>
      <Text style={{ color: colorSemiBlack, marginBottom: "10px" }}>
        Estimated Fee: <b>R5 {fee}</b>
      </Text>
      <BoxContent>
        <ButtonPrimary onClick={onCancel}>Cancel</ButtonPrimary>
        <ButtonPrimary onClick={onConfirm}>Confirm & Proceed</ButtonPrimary>
      </BoxContent>
    </ModalInner>
  );
}
