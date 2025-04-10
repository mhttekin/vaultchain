import secrets
from django.db import transaction
from .models import Chain, Wallet, WalletBalance, Coin, Transaction 

"""
Some logic for api calls and creating
"""

def create_user_wallets(user):
    """
    For standard or advanced users, function for creating automatic wallets to users
    """
    if user.user_type not in ['standard', 'advanced']:
        return []

    chains = Chain.objects.filter(symbol__in=["BTC", "ETH", "SOL"])
    wallets = []

    with transaction.atomic(): #either create all of them or add none of them.
        for chain in chains:
            public_key = f"{chain.symbol.lower()}_{secrets.token_hex(16)}"
            private_key = f"{chain.symbol.lower()}_{secrets.token_hex(32)}"

            wallet = Wallet.objects.create(
                user=user,
                chain=chain,
                public_key=public_key,
                private_key=private_key
            )
            try:
                native_coin = Coin.objects.get(symbol=chain.symbol)
                WalletBalance.objects.create(
                    wallet=wallet,
                    coin=native_coin,
                    amount=0
                )
            except Coin.DoesNotExist:
                pass

            wallets.append(wallet)
    
    return wallets

def create_self_transaction_log(sender, coin, amount, t_type):
    sender_balance = WalletBalance.objects.get(wallet=sender, coin=coin)
    sender_current = sender_balance.amount
    sender_previous = sender_current + amount

    if t_type == 'deposit':
        sender_previous = sender_current - amount

    transaction = Transaction.objects.create(
        wallet=sender,
        counterparty_wallet=None,
        coin=coin,
        amount=amount,
        sender_previous_balance=sender_previous,
        sender_new_balance=sender_current,
        recipient_previous_balance=None,
        recipient_new_balance=None,
        transaction_type=t_type
    )

    return transaction
