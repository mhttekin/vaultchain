from django.shortcuts import render
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from rest_framework.status import status
from rest_framework.response import Response
from .serializers import UserCreateSerializer, WalletSerializer, WalletBalanceSerializer, WalletBalanceUpdateSerializer, UserUpdateSerializer, PasswordUpdateSerializer, UserSerializer, CoinSerializer, ChainSerializer, TransactionViewSerializer
from .services import create_user_wallets
from .models import Wallet, WalletBalance, Coin, Chain, Transaction
"""
This is the place where we take Web Requests like GET, POST and turn them into Web responses.
Ex: Front-end asks for user wallets, this is the place where we create the right functions to
let that happen. JWT Auth is required for most of the stuff.
"""

# generics class hopefully does all the magic
# This only supports POST by default
class RegisterView(generics.CreateAPIView):
    serializer_class = UserCreateSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        create_user_wallets(user)

# This lists the wallets
class WalletListView(generics.ListAPIView):
    serializer_class = WalletSerializer 
    permission_classes = [IsAuthenticated]
    http_method_names = ['get'] # Only GET 

    def get_queryset(self):
        return Wallet.objects.filter(user=self.request.user)

# This lists the wallet balances for the user 
class WalletBalanceView(generics.ListAPIView):
    serializer_class = WalletBalanceSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get'] # Only GET

    def get_queryset(self):
        # if we want to filter with a url parameter >>
        wallet_id = self.kwargs.get('wallet_id')
        if wallet_id:
            return WalletBalance.objects.filter(
                wallet__id=wallet_id,
                wallet__user=self.request.user
            )
        else:
            # if no parameter bring them all >> 
            return WalletBalance.objects.filter(wallet__user=self.request.user)

# For the Deposit or Withdraw probably i don't know
class WalletBalanceUpdateView(generics.UpdateAPIView):
    serializer_class = WalletBalanceUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch'] # Only Patch (Patch is when part of the fields change) 

    def get_object(self):
        wallet_id = self.kwargs.get('wallet_id')
        coin_id = self.kwargs.get('coin_id')

        return WalletBalance.objects.get(
            wallet__id=wallet_id,
            coin__id=coin_id,
            wallet__user=self.request.user
        )
    def perform_update(self, serializer):
        """
        we will call a method which logs the transaction after this. later. 
        """
        old_amount = serializer.instance.amount 
        serializer.save()
    
# either name or surname update; nothing else
class UserFieldsUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']
    
    def get_object(self):
        return self.request.user
    
    def perform_update(self, serializer):
        serializer.save()

# hard to tell 
class PasswordUpdateView(generics.UpdateAPIView):
    serializer_class = PasswordUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['put']

    def get_object(self):
        return self.request.user
    def perform_update(self, serializer):
        serializer.save()

# gets the user fields displays them in a golden plate
class UserFieldsInfoView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_object(self):
        return self.request.user

# some search engine shit  
class CoinListView(generics.ListAPIView):
    serializer_class = CoinSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_queryset(self):
        chain_id = self.kwargs.get('chain_id')
        search_query = self.request.query_params.get('search', None)
        
        queryset = Coin.objects.filter(chain__id=chain_id)
        
        if search_query:
            queryset = queryset.filter(
                    Q(name__icontains=search_query) |
                    Q(symbol__icontains=search_query)
            )
        return queryset

class ChainListView(generics.ListAPIView):
    serializer_class = ChainSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_queryset(self):
        chain_id = self.kwargs.get('chain_id')
        if chain_id: # not sure if we will ever use this but better implemented now
            return Chain.objects.filter(id=chain_id) 
        else:
            return Chain.objects.all()
       
"""
Now after these we definitely need a transactionhistory model, serializer, and a get view,
also add a services method so we can create a record when deposit or withdraw.
Also, probably transaction model, serializer, put view, a method in services which will update
the balance of recipient wallet address yadaydaydadyadayyad of amk
"""
class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionViewSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_queryset(self):
        return Transaction.objects.filter(Q(wallet__user = self.request.user) 
                                          | Q(counterparty_wallet__user = self.request.user)).order_by('-timestamp') # we ordering 

