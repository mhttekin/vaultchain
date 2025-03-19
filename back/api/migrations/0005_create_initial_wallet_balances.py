# Generated by Django 5.1.7 on 2025-03-19 19:14

from django.db import migrations
from decimal import Decimal

def create_initial_wallet_balances(apps, schema_editor):
    """
    Bla bla blba bla bla bla
    """
    User = apps.get_model('api', 'CustomUser')
    Wallet = apps.get_model('api', 'Wallet')
    Coin = apps.get_model('api', 'Coin')
    WalletBalance = apps.get_model('api', 'WalletBalance')

    try:
        btc_coin = Coin.objects.get(symbol="BTC")
        eth_coin = Coin.objects.get(symbol="ETH")
        sol_coin = Coin.objects.get(symbol="SOL")

        for user in User.objects.filter(user_type__in=["standard", "advanced"]):
            user_wallets = Wallet.objects.filter(user=user)

            for wallet in user_wallets:
                if wallet.chain.symbol == "BTC":
                    coin = btc_coin
                elif wallet.chain.symbol == "ETH":
                    coin = eth_coin
                elif wallet.chain.symbol == "SOL":
                    coin = sol_coin
                else:
                    continue

                WalletBalance.objects.get_or_create(
                    wallet=wallet,
                    coin=coin,
                    defaults={'amount': Decimal(0)}
                )
    except Coin.DoesNotExist:
        pass

def remove_initial_wallet_balances(apps, schema_editor):
    Coin = apps.get_model('api', 'Coin')
    WalletBalance = apps.get_model('api', 'WalletBalance')

    try:
        btc_coin = Coin.objects.get(symbol="BTC")
        eth_coin = Coin.objects.get(symbol="ETH")
        sol_coin = Coin.objects.get(symbol="SOL")

        WalletBalance.objects.filter(coin__in=[btc_coin, eth_coin, sol_coin]).delete()

    except Coin.DoesNotExist:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_create_initial_coins'),
    ]

    operations = [
        migrations.RunPython(create_initial_wallet_balances, remove_initial_wallet_balances)
    ]
