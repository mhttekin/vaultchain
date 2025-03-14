import secrets
from django.db import transaction
from .models import Chain, Wallet, WalletBalance, Coin

"""
Some logic for api calls and creating stuff
"""

def create_user_wallets(user):
    """
    For standard or advanced users, function for creating automatic wallets to users
    """
    if user.user_type not in ['standard', 'advanced']:
        return []

    chains = Chain.objects.filter(symbol__in=["BTC", "ETH", "SOL"])
    wallets = []

    with transaction.atomic(): # i dont know what this line is
        for chain in chains:
            # Now normally we would have had some real cryptographic stuff, but this is all mimicing
            public_key = f"{chain.symbol.lower()}_{secrets.token_hex(16)}"
            private_key = f"{chain.symbol.lower()}_{secrets.token_hex(32)}"

            wallet = Wallet.objects.create(
                user=user,
                chain=chain,
                public_key=public_key,
                private_key=private_key # now this is fucked up 
            )

            # not sure if we should create walletbalance for each coin on the chain i don't think it's clever. 
            wallets.append(wallet)
    
    return wallets
