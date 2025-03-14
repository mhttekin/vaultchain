from django.db import migrations

"""
Wallets and other stuff need chains to initialise, so this stuff puts it on the database after you migrate
We put stuff like BTC, ETH, SOL chains, and maybe we'll put some coins later. 
"""

def create_initial_chains(apps, schema_editor):
    Chain = apps.get_model('api', 'Chain') # We get the model from the app, you can check models.py for all defined models.
    chains = [
            {"name": "Bitcoin", "symbol": "BTC"},
            {"name": "Ethereum", "symbol": "ETH"},
            {"name": "Solana", "symbol": "SOL"}
    ]

    # now we create them
    for chain_data in chains:
        Chain.objects.get_or_create(
                name=chain_data["name"],
                defaults={"symbol": chain_data["symbol"]}
        )

# This thing is needed when reversing the migrations, its used automatically
def remove_initial_chains(apps, schema_editor):
    Chain = apps.get_model('api', 'Chain')
    Chain.objects.filter(name__in=["Bitcoin", "Ethereum", "Solana"]).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
            migrations.RunPython(create_initial_chains, remove_initial_chains),
    ]
