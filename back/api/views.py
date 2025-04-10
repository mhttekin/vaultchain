from django.shortcuts import render
import re
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import NotFound, ValidationError
from .serializers import UserCreateSerializer, WalletSerializer, WalletBalanceSerializer, WalletBalanceUpdateSerializer, UserUpdateSerializer, PasswordUpdateSerializer, UserSerializer, CoinSerializer, ChainSerializer, TransactionViewSerializer, TransactionCreateSerializer
from .services import create_user_wallets, create_self_transaction_log
from .models import Wallet, WalletBalance, Coin, Chain, Transaction
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework_simplejwt.authentication import JWTAuthentication
from .models import Profile
"""
This is the place where we take Web Requests like GET, POST and turn them into Web responses.
Ex: Front-end asks for user wallets, this is the place where we create the right functions to
let that happen. JWT Auth is required for most of the stuff.
"""

User = get_user_model()

# generics class
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

# For the Deposit or Withdraw
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
        we will call a method which logs the deposit/withdrawal after this. 
        """
        old_amount = serializer.instance.amount 
        wallet_balance = serializer.save()
        wallet = wallet_balance.wallet 
        coin = wallet_balance.coin
        amount_changed = abs(wallet_balance.amount - old_amount)
        if wallet_balance.amount > old_amount:
            t_type = 'deposit'
        else:
            t_type = 'withdrawal'
        create_self_transaction_log(
                sender=wallet,
                coin=coin,
                amount=amount_changed,
                t_type=t_type
        )
        
#name or surname update
class UserFieldsUpdateView(generics.UpdateAPIView):
    serializer_class = UserUpdateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['patch']
    
    def get_object(self):
        return self.request.user
    
    def perform_update(self, serializer):
        serializer.save()

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

# Search engine
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
        if chain_id:
            return Chain.objects.filter(id=chain_id) 
        else:
            return Chain.objects.all()
       
"""
Now after these we definitely need a transactionhistory model, serializer, and a get view,
also add a services method so we can create a record when deposit or withdraw.
Also, probably transaction model, serializer, put view, a method in services which will update
the balance of recipient wallet address
"""
class TransactionHistoryView(generics.ListAPIView):
    serializer_class = TransactionViewSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_queryset(self):
        return Transaction.objects.filter(Q(wallet__user = self.request.user) 
                                          | Q(counterparty_wallet__user = self.request.user)).order_by('-timestamp') # we ordering 

class TransactionCreateView(generics.CreateAPIView):
    # this creates the transaction
    serializer_class = TransactionCreateSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['post']

    def perform_create(self, serializer):
        serializer.save()


"""
This function is for transfer recipient address check. If the sender doesn't know the recipient's public key,
this view method let's the user check by the email address and grab it.
"""

class WalletLookupView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get(self, request):
        search_term = self.request.query_params.get('search')
        chain_id = self.request.query_params.get('chain_id')

        if not search_term or not chain_id:
            return Response({"error":"Both search term and chain id is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # checking if it's an email
        is_email = '@' in search_term
        if is_email:
            try:
                user = User.objects.get(email=search_term)
                wallet = Wallet.objects.get(user=user, chain__id=chain_id)
                return Response({
                    'wallet_found': True,
                    'search_type': 'email',
                    'wallet': {
                        'public_key': wallet.public_key,
                        'chain': {
                            'id': chain_id,
                            'name': wallet.chain.name,
                            'symbol': wallet.chain.symbol
                            },
                        'user_email': wallet.user.email
                        }
                    })
            except (User.DoesNotExist, Wallet.DoesNotExist):
                return Response({"error":"No wallet on this email address."}, status=status.HTTP_404_NOT_FOUND)
        else:
            if not is_email and not re.match(r'^[a-z0-9_]{17,63}$', search_term):
                return Response({"error":"Invalid wallet address format"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                wallet = Wallet.objects.get(public_key=search_term, chain__id=chain_id)
                return Response({
                    'wallet_found': True,
                    'search_type': 'public_key',
                    'wallet': {
                        'public_key': search_term,
                        'chain': {
                            'id': chain_id,
                            'name': wallet.chain.name,
                            'symbol': wallet.chain.symbol
                            }
                        }
                })
            except Wallet.DoesNotExist:
                return Response({"error":"No wallet with this public key"}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET', 'POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def profile_image(request):
    user = request.user

    if request.method == "GET":
        profile, created = Profile.objects.get_or_create(user=user)
        return Response({"profile_image": profile.profile_image})

    elif request.method == "POST":
        image_url = request.data.get("imageUrl", "")
        profile, created = Profile.objects.get_or_create(user=user)
        profile.profile_image = image_url
        profile.save()
        return Response({"success": True, "profile_image": profile.profile_image})


@api_view(['PATCH'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile_image(request):
    user = request.user
    image_url = request.data.get("imageUrl", "")
    profile, created = Profile.objects.get_or_create(user=user)
    profile.profile_image = image_url
    profile.save()
    return Response({"success": True, "profile_image": profile.profile_image})