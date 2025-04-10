from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings

class CustomUserManager(BaseUserManager):
    """
    Since we have custom user, we need CustomUserManager,
    not by choice; we obligated.
    """

    def create_user(self, email, password, user_type='standard', **extra_fields):
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, user_type=user_type, **extra_fields)
        user.set_password(password)
        user.save()
        return user
    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True) # Already is but security measure
        extra_fields.setdefault('user_type', 'admin')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    # we not gonna login with username, email instead
    username = None 
    email = models.EmailField('email address', unique=True)
    # user types les gooooo
    USER_TYPE_CHOICES = (
            ('standard', 'Standard User'),
            ('advanced', 'Advanced User'),
            ('admin', 'Admin User'),
    )
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='standard')

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email

class Chain(models.Model):
    # Maybe we can add id for this but not sure
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10, unique=True)
    
    def __str__(self):
        return f"{self.name} : {self.symbol}"

class Coin(models.Model):
    """
    Coin is a type of currency under the chain, lets say we have ETH Chained Wallet,
    our user stores some ETH, DogeCoin, DuckCoin, this class gives the name, symbol, and chain
    """
    
    chain = models.ForeignKey(Chain, on_delete=models.CASCADE, related_name="coins")
    name = models.CharField(max_length=50, unique=True)
    symbol = models.CharField(max_length=10, unique=True)
    
    def __str__(self):
        return f"{self.name} : {self.symbol}"
    
class Wallet(models.Model):
    """
    Wallet depends on the existence of user, so CASCADE kills it if we remove user from database,
    But we will use user.is_active = false instead so we won't fuck the db. 
    """

    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE, related_name="wallets")
    chain = models.ForeignKey(Chain, on_delete=models.CASCADE, related_name="wallets")
    public_key = models.CharField(max_length=63, unique=True)
    private_key = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Wallet for {self.user.email}"
 

class WalletBalance(models.Model):
    """
    This is an intermediate table which stores the coin amount and the wallet belonging to it
    """
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="balance")
    coin = models.ForeignKey(Coin, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=20, decimal_places=8, default=0.0)

    def __str__(self):
        return f"{self.wallet.user.email} - {self.amount} {self.coin.symbol}"

class Transaction(models.Model):
    """
    Transaction can be deposit, withdrawal, or transfer, the transferhistory should be both ways for 
    the recipient as well.
    """
    TRANSACTION_TYPES = (
            ('deposit', 'Deposit'),
            ('withdrawal', 'Withdrawal'),
            ('transfer', 'Transfer')
    )
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE, related_name="transactions")
    counterparty_wallet = models.ForeignKey(Wallet, on_delete=models.SET_NULL, null=True, blank=True)
    coin = models.ForeignKey(Coin, on_delete=models.CASCADE) 
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    amount = models.DecimalField(max_digits=20, decimal_places=8)

    sender_previous_balance = models.DecimalField(max_digits=20, decimal_places=8)
    sender_new_balance = models.DecimalField(max_digits=20, decimal_places=8)
    # recipient changes if there is // i didn't want to make a duplicate transaction object for the other party 
    recipient_previous_balance = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)
    recipient_new_balance = models.DecimalField(max_digits=20, decimal_places=8, null=True, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    profile_image = models.URLField(default='', blank=True)

    def __str__(self):
        return self.user.username