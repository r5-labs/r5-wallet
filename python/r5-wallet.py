#!/usr/bin/env python3
# Copyright 2025 R5
# This file is part of the R5 Core library.
#
# This software is provided "as is", without warranty of any kind,
# express or implied, including but not limited to the warranties
# of merchantability, fitness for a particular purpose and
# noninfringement. In no event shall the authors or copyright
# holders be liable for any claim, damages, or other liability,
# whether in an action of contract, tort or otherwise, arising
# from, out of or in connection with the software or the use or
# other dealings in the software.

import os
import sys
import json
import base64
import time
import configparser
from ecdsa import SigningKey, SECP256k1
from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from web3 import Web3

from PyQt5 import QtWidgets, QtCore, QtGui

# Global constants
WALLET_FILENAME = "r5.key"
SETTINGS_FILENAME = "wallet.ini"
DEFAULT_RPC_ADDRESS = "https://rpc-devnet.r5.network/"
DEFAULT_QUERY_INTERVAL = 60

# -------------------------------
# Wallet Helper Functions (same as CLI version)
# -------------------------------
def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    return base64.urlsafe_b64encode(kdf.derive(password.encode()))

def encrypt_wallet(wallet: dict, password: str) -> dict:
    salt = os.urandom(16)
    key = derive_key(password, salt)
    f = Fernet(key)
    wallet_json = json.dumps(wallet).encode()
    encrypted_wallet = f.encrypt(wallet_json)
    return {
        "salt": base64.urlsafe_b64encode(salt).decode(),
        "wallet": encrypted_wallet.decode()
    }

def decrypt_wallet(file_data: dict, password: str) -> dict:
    salt = base64.urlsafe_b64decode(file_data["salt"])
    key = derive_key(password, salt)
    f = Fernet(key)
    decrypted = f.decrypt(file_data["wallet"].encode())
    wallet = json.loads(decrypted.decode())
    return wallet

def load_settings():
    settings = {}
    config = configparser.ConfigParser()
    if os.path.exists(SETTINGS_FILENAME):
        try:
            config.read(SETTINGS_FILENAME)
            if 'Wallet' not in config:
                raise ValueError("Missing [Wallet] section")
            settings = dict(config['Wallet'])
        except Exception:
            settings = create_default_settings()
    else:
        settings = create_default_settings()
    if "rpc_address" not in settings:
        settings = create_default_settings()
    if "query_interval" not in settings:
        settings["query_interval"] = str(DEFAULT_QUERY_INTERVAL)
        config['Wallet'] = settings
        with open(SETTINGS_FILENAME, "w") as f:
            config.write(f)
    return settings

def create_default_settings():
    settings = {"rpc_address": DEFAULT_RPC_ADDRESS, "query_interval": str(DEFAULT_QUERY_INTERVAL)}
    config = configparser.ConfigParser()
    config['Wallet'] = settings
    with open(SETTINGS_FILENAME, "w") as f:
        config.write(f)
    return settings

def create_wallet_with_import(parent=None):
    text, ok = QtWidgets.QInputDialog.getText(parent, "Import Wallet", "Enter Private Key (hex):")
    if not ok or not text:
        return None
    try:
        sk = SigningKey.from_string(bytes.fromhex(text.strip()), curve=SECP256k1)
    except Exception:
        QtWidgets.QMessageBox.warning(parent, "Error", "Invalid private key format.")
        return None
    vk = sk.get_verifying_key()
    wallet = {
        "private_key": text.strip(),
        "public_key": vk.to_string().hex()
    }
    return wallet

def create_new_wallet():
    sk = SigningKey.generate(curve=SECP256k1)
    vk = sk.get_verifying_key()
    wallet = {
        "private_key": sk.to_string().hex(),
        "public_key": vk.to_string().hex()
    }
    return wallet

def prompt_for_password(parent, prompt_title="Encryption Password", confirm=False):
    pwd1, ok = QtWidgets.QInputDialog.getText(parent, prompt_title,
                                                "Enter password:", QtWidgets.QLineEdit.Password)
    if not ok:
        return None
    if confirm:
        pwd2, ok2 = QtWidgets.QInputDialog.getText(parent, "Confirm Password",
                                                     "Confirm password:", QtWidgets.QLineEdit.Password)
        if not ok2 or pwd1 != pwd2:
            QtWidgets.QMessageBox.warning(parent, "Error", "Passwords don't match.")
            return None
    return pwd1

def wallet_setup(parent):
    if not os.path.exists(WALLET_FILENAME):
        choice = QtWidgets.QMessageBox.question(parent, "Wallet Setup",
                    "No existing wallet detected!\nDo you want to import a wallet with a private key?",
                    QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No)
        if choice == QtWidgets.QMessageBox.Yes:
            wallet = create_wallet_with_import(parent)
            if wallet is None:
                return None
        else:
            wallet = create_new_wallet()
        password = prompt_for_password(parent, "Create Encryption Password", confirm=True)
        if password is None:
            return None
        file_contents = encrypt_wallet(wallet, password)
        with open(WALLET_FILENAME, "w") as f:
            json.dump(file_contents, f)
        QtWidgets.QMessageBox.information(parent, "Success", "Wallet file created.")
        return wallet
    else:
        try:
            with open(WALLET_FILENAME, "r") as f:
                file_data = json.load(f)
        except Exception:
            QtWidgets.QMessageBox.warning(parent, "Error", "Wallet file is corrupt.")
            return None

        password, ok = QtWidgets.QInputDialog.getText(parent, "Wallet Login",
                                                      "Enter encryption password:", QtWidgets.QLineEdit.Password)
        if not ok:
            return None
        try:
            wallet = decrypt_wallet(file_data, password)
            return wallet
        except Exception:
            choice = QtWidgets.QMessageBox.question(parent, "Wallet Login",
                                                      "Incorrect password or corrupt wallet.\nDo you want to reimport the wallet?",
                                                      QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No)
            if choice == QtWidgets.QMessageBox.Yes:
                wallet = create_wallet_with_import(parent)
                if wallet is None:
                    return None
                password = prompt_for_password(parent, "Create Encryption Password", confirm=True)
                if password is None:
                    return None
                file_contents = encrypt_wallet(wallet, password)
                with open(WALLET_FILENAME, "w") as f:
                    json.dump(file_contents, f)
                return wallet
            else:
                choice2 = QtWidgets.QMessageBox.question(parent, "Wallet Login",
                              "Do you want to create a new wallet?", QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No)
                if choice2 == QtWidgets.QMessageBox.Yes:
                    wallet = create_new_wallet()
                    password = prompt_for_password(parent, "Create Encryption Password", confirm=True)
                    if password is None:
                        return None
                    file_contents = encrypt_wallet(wallet, password)
                    with open(WALLET_FILENAME, "w") as f:
                        json.dump(file_contents, f)
                    return wallet
                else:
                    QtWidgets.QMessageBox.critical(parent, "Error", "Could not initiate R5 Wallet.")
                    sys.exit(1)

def get_wallet_address(wallet: dict, w3: Web3) -> str:
    try:
        account = w3.eth.account.from_key(wallet["private_key"])
        return account.address
    except Exception:
        return "Unknown"

def fetch_block_height(w3: Web3) -> int:
    try:
        return w3.eth.block_number
    except Exception:
        return 0

def fetch_balance(w3: Web3, wallet: dict):
    address = get_wallet_address(wallet, w3)
    try:
        balance_wei = w3.eth.get_balance(address)
        balance = w3.from_wei(balance_wei, 'ether')
        return float(balance)
    except Exception:
        return 0.0

def fetch_history(w3: Web3, wallet: dict, block_range: int = 1080):
    address = get_wallet_address(wallet, w3).lower()
    current_block = fetch_block_height(w3)
    start_block = max(0, current_block - block_range)
    transactions = []
    for blk in range(start_block, current_block + 1):
        try:
            block = w3.eth.get_block(blk, full_transactions=True)
            for tx in block.transactions:
                if tx['from'].lower() == address or (tx.to and tx.to.lower() == address):
                    tx_info = {
                        "blockNumber": tx.blockNumber,
                        "from": tx['from'],
                        "to": tx.to,
                        "value": w3.from_wei(tx.value, 'ether'),
                        "hash": tx.hash.hex()
                    }
                    transactions.append(tx_info)
        except Exception:
            continue
    return transactions

def estimate_gas(w3: Web3, wallet: dict, destination: str, amount_wei: int):
    sender = get_wallet_address(wallet, w3)
    tx = {
        "from": sender,
        "to": destination,
        "value": amount_wei
    }
    try:
        gas_estimate = w3.eth.estimate_gas(tx)
        return gas_estimate
    except Exception:
        return 21000

# -------------------------------
# Async Worker for Transaction History
# -------------------------------
class HistoryWorker(QtCore.QObject):
    finished = QtCore.pyqtSignal(list)
    
    def __init__(self, w3, wallet, parent=None):
        super().__init__(parent)
        self.w3 = w3
        self.wallet = wallet

    @QtCore.pyqtSlot()
    def run(self):
        transactions = fetch_history(self.w3, self.wallet)
        self.finished.emit(transactions)

# -------------------------------
# Custom Dialog for Sending Transactions
# -------------------------------
class SendTransactionDialog(QtWidgets.QDialog):
    def __init__(self, w3, wallet, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Send Transaction")
        self.w3 = w3
        self.wallet = wallet
        
        layout = QtWidgets.QFormLayout(self)
        
        self.dest_edit = QtWidgets.QLineEdit()
        self.amount_edit = QtWidgets.QLineEdit()
        self.gas_limit_edit = QtWidgets.QLineEdit()
        self.gas_price_edit = QtWidgets.QLineEdit()
        
        # Set default gas values
        default_amount = "0"
        default_gas = estimate_gas(self.w3, self.wallet, "0x0", 0)
        default_gas_price = self.w3.eth.gas_price
        
        self.amount_edit.setText(default_amount)
        self.gas_limit_edit.setText(str(default_gas))
        self.gas_price_edit.setText(str(self.w3.from_wei(default_gas_price, 'gwei')))
        
        layout.addRow("Destination Address:", self.dest_edit)
        layout.addRow("Amount (in R5):", self.amount_edit)
        layout.addRow("Gas Limit:", self.gas_limit_edit)
        layout.addRow("Gas Price (gwei):", self.gas_price_edit)
        
        btn_box = QtWidgets.QDialogButtonBox(QtWidgets.QDialogButtonBox.Ok | QtWidgets.QDialogButtonBox.Cancel)
        btn_box.accepted.connect(self.accept)
        btn_box.rejected.connect(self.reject)
        layout.addRow(btn_box)
    
    def get_data(self):
        dest = self.dest_edit.text().strip()
        try:
            amount = float(self.amount_edit.text())
        except Exception:
            amount = 0.0
        try:
            gas_limit = int(self.gas_limit_edit.text())
        except Exception:
            gas_limit = estimate_gas(self.w3, self.wallet, dest, self.w3.to_wei(amount, 'ether'))
        try:
            gas_price = self.w3.to_wei(float(self.gas_price_edit.text()), 'gwei')
        except Exception:
            gas_price = self.w3.eth.gas_price
        return dest, amount, gas_limit, gas_price

def send_transaction(w3: Web3, wallet: dict, parent):
    dlg = SendTransactionDialog(w3, wallet, parent)
    if dlg.exec_() != QtWidgets.QDialog.Accepted:
        return
    
    dest, amount, gas_limit, gas_price = dlg.get_data()
    if not dest:
        QtWidgets.QMessageBox.warning(parent, "Error", "Destination address is required.")
        return
    amount_wei = w3.to_wei(amount, 'ether')
    sender = get_wallet_address(wallet, w3)
    
    msg = (f"From: {sender}\nTo: {dest}\nAmount: {amount} R5\n"
           f"Gas Limit: {gas_limit}\nGas Price: {w3.from_wei(gas_price, 'gwei'):.0f} gwei")
    confirm = QtWidgets.QMessageBox.question(parent, "Confirm Transaction", msg,
                                             QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No)
    if confirm != QtWidgets.QMessageBox.Yes:
        return

    try:
        nonce = w3.eth.get_transaction_count(sender)
    except Exception as e:
        QtWidgets.QMessageBox.warning(parent, "Error", f"Error fetching nonce: {e}")
        return
    tx = {
        "nonce": nonce,
        "to": dest,
        "value": amount_wei,
        "gas": gas_limit,
        "gasPrice": gas_price,
    }
    try:
        signed_tx = w3.eth.account.sign_transaction(tx, wallet["private_key"])
    except Exception as e:
        QtWidgets.QMessageBox.warning(parent, "Error", f"Error signing transaction: {e}")
        return
    try:
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=1200)
        QtWidgets.QMessageBox.information(parent, "Success", f"Transaction mined!\nReceipt:\n{Web3.to_hex(tx_hash)}")
    except Exception as e:
        QtWidgets.QMessageBox.warning(parent, "Error", f"Error sending transaction: {e}")

def expose_private_key(wallet: dict, parent):
    entered_password = prompt_for_password(parent, "Enter password to expose private key")
    if entered_password is None:
        return
    try:
        with open(WALLET_FILENAME, "r") as f:
            file_data = json.load(f)
        _ = decrypt_wallet(file_data, entered_password)
        QtWidgets.QMessageBox.information(parent, "Private Key", f"Your Private Key:\n{wallet['private_key']}")
    except Exception:
        QtWidgets.QMessageBox.warning(parent, "Error", "Incorrect password or error decrypting wallet.")

def reset_wallet(parent):
    reply = QtWidgets.QMessageBox.question(parent, "Reset Wallet",
                "THIS WILL DELETE THE EXISTING WALLET FROM THE SYSTEM, MAKING IT UNACCESSIBLE FOREVER!\nAre you sure?",
                QtWidgets.QMessageBox.Yes | QtWidgets.QMessageBox.No)
    if reply != QtWidgets.QMessageBox.Yes:
        return
    entered_password = prompt_for_password(parent, "Enter password to confirm wallet reset")
    if entered_password is None:
        return
    try:
        with open(WALLET_FILENAME, "r") as f:
            file_data = json.load(f)
        _ = decrypt_wallet(file_data, entered_password)
        os.remove(WALLET_FILENAME)
        QtWidgets.QMessageBox.information(parent, "Wallet Reset", "Wallet has been reset. Restart the application.")
        sys.exit(0)
    except Exception:
        QtWidgets.QMessageBox.warning(parent, "Error", "Incorrect password or error decrypting wallet.")

# -------------------------------
# Main UI Window
# -------------------------------
class WalletWindow(QtWidgets.QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("R5 Wallet")
        self.resize(600, 400)
        self.central_widget = QtWidgets.QWidget()
        self.setCentralWidget(self.central_widget)
        
        # Layouts
        self.v_layout = QtWidgets.QVBoxLayout(self.central_widget)
        self.info_layout = QtWidgets.QFormLayout()
        self.button_layout = QtWidgets.QHBoxLayout()
        
        # Wallet info labels
        self.address_label = QtWidgets.QLabel("Loading...")
        self.copy_btn = QtWidgets.QPushButton("Copy")
        self.copy_btn.setToolTip("Copy address to clipboard")
        self.copy_status = QtWidgets.QLabel("")  # For temporary "Copied!" message
        self.copy_status.setStyleSheet("color: green")

        # Horizontal layout for address + copy
        self.address_row_layout = QtWidgets.QHBoxLayout()
        self.address_row_layout.addWidget(self.address_label)
        self.address_row_layout.addWidget(self.copy_btn)
        self.address_row_layout.addWidget(self.copy_status)
        self.address_row_layout.addStretch()

        self.rpc_label = QtWidgets.QLabel("Loading...")
        self.block_height_label = QtWidgets.QLabel("Loading...")
        self.balance_label = QtWidgets.QLabel("Loading...")
        self.query_interval_label = QtWidgets.QLabel("Loading...")
        
        self.info_layout.addRow("Address:", self.address_row_layout)
        self.info_layout.addRow("RPC URL:", self.rpc_label)
        self.info_layout.addRow("Block Height:", self.block_height_label)
        self.info_layout.addRow("Available Balance:", self.balance_label)
        self.info_layout.addRow("Query Interval:", self.query_interval_label)
        
        self.v_layout.addLayout(self.info_layout)
        
        # Buttons
        self.send_tx_btn = QtWidgets.QPushButton("Send Transaction")
        self.refresh_btn = QtWidgets.QPushButton("Refresh Wallet")
        self.history_btn = QtWidgets.QPushButton("Transaction History")
        self.expose_pk_btn = QtWidgets.QPushButton("Expose Private Key")
        self.reset_btn = QtWidgets.QPushButton("Reset Wallet")
        self.exit_btn = QtWidgets.QPushButton("Exit")
        
        for btn in [self.send_tx_btn, self.refresh_btn, self.history_btn,
                    self.expose_pk_btn, self.reset_btn, self.exit_btn]:
            self.button_layout.addWidget(btn)
        
        self.v_layout.addLayout(self.button_layout)
        
        self.original_history_text = self.history_btn.text()
        self.loading_timer = QtCore.QTimer(self)
        self.loading_timer.timeout.connect(self.update_loading_text)
        self.loading_texts = ["loading", "loading.", "loading..", "loading..."]
        self.loading_index = 0
        
        self.send_tx_btn.clicked.connect(self.send_transaction)
        self.refresh_btn.clicked.connect(self.refresh_wallet)
        self.history_btn.clicked.connect(self.show_history_async)
        self.expose_pk_btn.clicked.connect(self.expose_private_key)
        self.reset_btn.clicked.connect(self.reset_wallet)
        self.exit_btn.clicked.connect(self.close)
        self.copy_btn.clicked.connect(self.copy_address_to_clipboard)

        self.settings = load_settings()
        self.rpc_address = self.settings.get("rpc_address", DEFAULT_RPC_ADDRESS)
        try:
            self.query_interval = int(self.settings.get("query_interval", DEFAULT_QUERY_INTERVAL))
        except Exception:
            self.query_interval = DEFAULT_QUERY_INTERVAL
        self.w3 = Web3(Web3.HTTPProvider(self.rpc_address))
        if not self.w3.is_connected():
            QtWidgets.QMessageBox.critical(self, "Error", f"Unable to connect to RPC at {self.rpc_address}")
            sys.exit(1)
        
        self.rpc_label.setText(self.rpc_address)
        self.query_interval_label.setText(str(self.query_interval))
        
        self.wallet = wallet_setup(self)
        if self.wallet is None:
            sys.exit(1)
        
        self.timer = QtCore.QTimer(self)
        self.timer.timeout.connect(self.refresh_wallet)
        self.timer.start(self.query_interval * 1000)
        self.refresh_wallet()
    
    def update_loading_text(self):
        self.history_btn.setText(self.loading_texts[self.loading_index])
        self.loading_index = (self.loading_index + 1) % len(self.loading_texts)
    
    def refresh_wallet(self):
        block_height = fetch_block_height(self.w3)
        balance = fetch_balance(self.w3, self.wallet)
        address = get_wallet_address(self.wallet, self.w3)
        self.block_height_label.setText(str(block_height))
        self.balance_label.setText(f"{balance:.4f} R5")
        self.address_label.setText(address)
    
    def send_transaction(self):
        send_transaction(self.w3, self.wallet, self)
        self.refresh_wallet()
    
    def show_history_async(self):
        self.history_btn.setEnabled(False)
        self.loading_index = 0
        self.loading_timer.start(500)
        QtWidgets.QApplication.processEvents()
        
        self.thread = QtCore.QThread()
        self.worker = HistoryWorker(self.w3, self.wallet)
        self.worker.moveToThread(self.thread)
        self.thread.started.connect(self.worker.run)
        self.worker.finished.connect(self.display_history)
        self.worker.finished.connect(self.thread.quit)
        self.worker.finished.connect(self.worker.deleteLater)
        self.thread.finished.connect(self.thread.deleteLater)
        self.thread.start()
    
    def display_history(self, transactions):
        self.loading_timer.stop()
        self.history_btn.setText(self.original_history_text)
        self.history_btn.setEnabled(True)

        dlg = QtWidgets.QDialog(self)
        dlg.setWindowTitle("Transaction History")
        dlg.resize(500, 400)
        layout = QtWidgets.QVBoxLayout(dlg)
        table = QtWidgets.QTableWidget()
        table.setColumnCount(5)
        table.setHorizontalHeaderLabels(["Block", "From", "To", "Amount", "Tx Hash"])
        table.setRowCount(len(transactions))
        for i, tx in enumerate(transactions):
            table.setItem(i, 0, QtWidgets.QTableWidgetItem(str(tx["blockNumber"])))
            table.setItem(i, 1, QtWidgets.QTableWidgetItem(tx["from"]))
            table.setItem(i, 2, QtWidgets.QTableWidgetItem(tx["to"] or ""))
            table.setItem(i, 3, QtWidgets.QTableWidgetItem(str(tx["value"])))
            table.setItem(i, 4, QtWidgets.QTableWidgetItem(tx["hash"]))
        table.resizeColumnsToContents()
        layout.addWidget(table)
        btn_close = QtWidgets.QPushButton("Close")
        btn_close.clicked.connect(dlg.accept)
        layout.addWidget(btn_close)
        dlg.exec_()

    def expose_private_key(self):
        expose_private_key(self.wallet, self)

    def reset_wallet(self):
        reset_wallet(self)

    def copy_address_to_clipboard(self):
        clipboard = QtWidgets.QApplication.clipboard()
        clipboard.setText(self.address_label.text())
        self.copy_status.setText("Copied!")
        QtCore.QTimer.singleShot(1500, lambda: self.copy_status.setText(""))


# -------------------------------
# Main function
# -------------------------------
def main():
    app = QtWidgets.QApplication(sys.argv)
    window = WalletWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == '__main__':
    main()
