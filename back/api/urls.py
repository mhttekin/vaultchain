from django.urls import path
from .views import (
    RegisterView, WalletListView, WalletBalanceView, WalletBalanceUpdateView,
    UserFieldsUpdateView, PasswordUpdateView, UserFieldsInfoView,
    CoinListView, ChainListView, TransactionHistoryView
)

urlpatterns = [
    # User authentication and management
    path('register/', RegisterView.as_view(), name='register'),
    path('user/profile/', UserFieldsInfoView.as_view(), name='user-profile'),
    path('user/update/', UserFieldsUpdateView.as_view(), name='user-update'),
    path('user/password/', PasswordUpdateView.as_view(), name='password-update'),
    
    # Wallet management
    path('wallets/', WalletListView.as_view(), name='wallet-list'),
    path('wallets/<int:wallet_id>/balances/', WalletBalanceView.as_view(), name='wallet-balances'),
    path('wallets/<int:wallet_id>/coins/<int:coin_id>/balance/', WalletBalanceUpdateView.as_view(), name='wallet-balance-update'),
    
    # Blockchain data
    path('chains/', ChainListView.as_view(), name='chain-list'),
    path('chains/<int:chain_id>/', ChainListView.as_view(), name='chain-detail'),
    path('chains/<int:chain_id>/coins/', CoinListView.as_view(), name='coin-list'),
    
    # Transaction history
    path('transactions/', TransactionHistoryView.as_view(), name='transaction-history'),
]
