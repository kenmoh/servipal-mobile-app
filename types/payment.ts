export interface WithdrawalResponse {
  status: string;
  message: string;
  transaction_id: string;
  amount: string;
  bank_name: string;
  account_number: string;
  beneficiary: string;
  timestamp: string;
}

export interface PayWithWalletResponse {
  amount: string;
}

export interface InitBankTransferResponse {
  status: string;
  message: string;
  transfer_reference: string;
  account_expiration: string;
  transfer_account: string;
  transfer_bank: string;
  transfer_amount: string;
  transfer_note: string;
  mode: string;
}

export interface PaymentLink {
  payment_link: string;
}
