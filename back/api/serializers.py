from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Chain, Coin, Wallet, WalletBalance

"""
This file converts the Python objects into JSON or XML, so we can send them through HTTP to frontend.
It also converts any JSON or data gathered from the frontend to Python objects. Such like, user entering the register form.
"""

User = get_user_model()

# for general user display only 
class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id', 'email', 'user_type', 'first_name', 'last_name'] # we get these fields of the user, might add something later if needed. 
        read_only_fields = ['id','email','user_type', 'first_name', 'last_name'] # they will not change 

# for getting the user data from the register form 
class UserCreateSerializer(serializers.ModelSerializer):
    """
    In future or maybe never, we should add a password strength checker. 
    """
    password = serializers.CharField(write_only=True) # only to be written not accessed. 
    class Meta:
        model = User
        fields = ['email', 'password', 'user_type']

    def create(self, validated_data):
        password = validated_data.pop('password') # we take this bisssshh
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

# i guess renaming since users can only change these fields
# not sure of user_type, might be better with admin permission 
class UserUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name']

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        return instance

# this uses normal serializer since we don't need the whole fields of the model 
class PasswordUpdateSerializer(serializers.Serializer):

    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value):
        user = self.context['request'].user # don't know what this, i guess it gets the user object requested for this. 
        if not user.check_password(value):
            raise serializers.ValidationError("Current (old) password is incorrect")
        return value

    def update(self, instance, validated_data):
        instance.set_password(validated_data['new_password']) 
        instance.save()
        return instance

# Gets the chain, no updating
class ChainSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Chain
        fields = ['id', 'name', 'symbol']
        read_only_fields = ['id', 'name', 'symbol']

# Gets the coin, no updating
class CoinSerializer(serializers.ModelSerializer):

    chain = ChainSerializer(read_only=True)
    class Meta:
        model = Coin
        fields = ['id', 'name', 'symbol', 'chain']
        read_only_fields = ['id', 'name', 'symbol']

# Gets the wallet, no updating
class WalletSerializer(serializers.ModelSerializer):

    chain = ChainSerializer(read_only=True)
    user = UserSerializer(read_only=True)
    class Meta:
        model = Wallet
        fields = ['id', 'user', 'chain', 'public_key', 'created_at'] # we not adding private key 
        read_only_fields = ['id', 'public_key', 'created_at']

# Gets the walletbalance, no updating
class WalletBalanceSerializer(serializers.ModelSerializer):

    coin = CoinSerializer(read_only=True)
    wallet = WalletSerializer(read_only=True)
    class Meta:
        model = WalletBalance
        fields = ['id', 'wallet', 'coin', 'amount']
        read_only_fields = ['id', 'amount'] 

# updates the walletbalance, due to any reason deposit, withdraw, transfer
class WalletBalanceUpdateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = WalletBalance
        fields = ['amount']
    
    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError('Balance cannot be negative')
        return value
    
    def update(self, instance, validated_data):
        instance.amount = validated_data.get('amount', instance.amount)
        instance.save()
        return instance

