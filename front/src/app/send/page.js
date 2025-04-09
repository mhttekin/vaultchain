"use client"
import React, { useState, useEffect} from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import TransferIcon from "@/components/icons/transfer.svg";
import BackArrow from "@/components/icons/back-arrow.svg"
import axiosInstance from "@/lib/axios";

const SendPage = () => {
  const {walletBalances, updateWalletBalance,
    refreshWalletData, walletLoading, marketData} = useWallet();
  const [inputValue, setInputValue] = useState("");
  const [balancesTabOpen, setBalancesTabOpen] = useState(false);
  const [sendAddress, setSendAddress] = useState(null);
  const [confirmSendTab, setConfirmSendTab] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [addressTabOpen, setAddressTabOpen] = useState(false);
  const [usdMode, setUsdMode] = useState(true);
  const [activeWalletBalance, setActiveWalletBalance] = useState(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  const formatNumber = (value, reverse) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";
    if (reverse){
      return number.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: usdMode ? 7 : 2,
      });
    } 
    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: usdMode ? 2 : 7,
    });
  };

  const formatTokenAmount = (value) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";
    const formatted = number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });
    const plainFormatted = formatted.replace(/,/g, "");

    if (plainFormatted.length > 9) {
      return formatted.slice(0, 9) + "...";
    }
    return formatted;
  };

  const buttons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    ".", "0", "DEL",
  ];

  const handleInputChange = (val) => {
    if (val === "DEL"){
      if (Number(inputValue) === 0) setInputValue("");
      else setInputValue(prev => prev.slice(0, -1));
      return
    } else {
      if (val === "." && inputValue.includes(".")) return;
      const decimalIndex = inputValue.indexOf(".");
      const isDecimalMode = decimalIndex !== -1;
      if (isDecimalMode) {
        const decimalPlaces = inputValue.length - decimalIndex - 1;
        const maxDecimal = usdMode ? 2 : 7;
        if (val !== '.' && decimalPlaces >= maxDecimal) return;
      }
      const wholePartLength = isDecimalMode ? decimalIndex : inputValue.length;
      if (!isDecimalMode && wholePartLength >= 11) return;
      setInputValue(prev => prev + val);
    }
  };

  const calculatedAmount = (value, mode, balance) => {
    if (!activeWalletBalance || !marketData) return "--";

    const number = Number(value);
    const sym = balance.coin.symbol?.toUpperCase();
    const price = Number(marketData[sym]?.price || 0);
    if (isNaN(number) || isNaN(price) || price === 0) return "--";

    const res = mode ? number / price : number * price;
    console.log(res);
    const resa = Number(res.toFixed(mode ? 7 : 2)).toString();
    console.log(resa);
    return resa;
  };

  const handleModeChange = () => {
    if (marketData) {
      setUsdMode(prev => !prev);
      setInputValue(calculatedAmount(inputValue, usdMode, activeWalletBalance));
    }
  };

  const handleMaxPress = () => {
    if (marketData && activeWalletBalance) {
      const sym = activeWalletBalance.coin.symbol?.toUpperCase();
      const price = Number(marketData[sym]?.price || 0); 
      if (usdMode) setInputValue(String(Number(activeWalletBalance.amount) * price))
      else setInputValue(activeWalletBalance.amount);
    }
  };

  const searchTheAddress = async (value, chainId) => {
    if (value && axiosInstance){
      try {
        const response = await axiosInstance.get('/api/wallet-lookup/', {
          params: {
            search: value,
            chain_id: chainId,
          },
        });
        if (response?.data){
          console.log(response.data);
          setSearchResult(response.data);
        }
      }catch (error) {
        return null;
      }
    }
  }; 

  const formatAddress = (address) => {
    if (address && address.length > 20) {
      return `${address.slice(0, 5)}...${address.slice(-4)}`; 
    }
    return address;
  };

  const handleSearchAddress = (e) => {
    const address = e.target.value || "";
    const isEmail = address.indexOf('@') !== -1;
    const shouldSearch = (isEmail && address.includes('.')) || (!isEmail && address.length > 30);
    if (shouldSearch && activeWalletBalance?.coin?.chain?.id) {
      searchTheAddress(address, activeWalletBalance.coin.chain.id);
    }
  }

  const handleActiveBalance = (balance) => {
    if (activeWalletBalance) {
      setActiveWalletBalance(balance);
      setBalancesTabOpen(false);
    }
  };
  const handleSendBalance = async () => {
    if (activeWalletBalance && sendAddress && inputValue) {
      let sendAmount = Number(inputValue);
      if (usdMode) sendAmount /= marketData[activeWalletBalance.coin.chain.symbol].price;
      const safeAmount = sendAmount.toFixed(8);
      try {
        const response = await axiosInstance.post('/api/transactions/create/',{
          "sender_public_key": activeWalletBalance.wallet.public_key,
          "recipient_public_key": sendAddress,
          "coin_id": activeWalletBalance.coin.id,
          "amount": safeAmount,
        });
        console.log(response.data);
      } catch (error) {
        console.warn('Could not transfer',error);
        return;
      }
      refreshWalletData();
      router.push("/");
    }
  }; 
  const handleAddressSave = () => {
    if (searchResult) {
      setSendAddress(searchResult?.wallet?.public_key);
      setAddressTabOpen(false);
      setConfirmSendTab(true);
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && walletBalances && !walletLoading){
      setActiveWalletBalance(walletBalances[0]);
      console.log(walletBalances);
    }
  }, [user, walletBalances, walletLoading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-[100vh] w-full relative flex flex-col px-4 overflow-hidden">
      {balancesTabOpen && (
        <div className="w-full h-[93.5vh] flex flex-col absolute top-0 left-0 z-999 bg-[#000000] px-3">
          <div className="w-full flex justify-start mt-10 items-center gap-4">
            <BackArrow className="w-5 h-5 cursor-pointer" onMouseDown={() => setBalancesTabOpen(false)}/>
            <h1 className="text-2xl font-bold">Choose asset</h1>
          </div>
          {walletBalances && (
            <div className="flex flex-col w-full gap-4 h-[30rem] justify-center">
            {walletBalances.map(balance => (
              <button key={balance.id}
              onClick={() => handleActiveBalance(balance)}
              className="flex w-full">
                <img src={`/assets/${balance.coin.chain.name}.png`}
                className="w-8 h-8"/>
                <h2 className="ml-3 font-bold text-lg w-full text-start">{balance.coin.name}</h2>
                <div className="flex flex-col w-60 justify-end text-end">
                  <h2 className="font-[500]">{formatNumber(calculatedAmount(balance.amount, false, balance))}
                  {'\u00A0'}{balance.coin.symbol}</h2>
                  <h2 className="text-gray-400">{formatTokenAmount(balance.amount)}</h2>
                </div>
              </button>
            ))}
            </div>
          )}
        </div>
      )}
      {addressTabOpen && (
        <div className="w-full h-[93.5vh] flex flex-col absolute top-0 left-0 z-999 bg-[#000000] px-3">
          <div className="w-full flex justify-start mt-10 items-center gap-4">
            <BackArrow className="w-5 h-5 cursor-pointer" onMouseDown={() => setAddressTabOpen(false)}/>
            <h1 className="text-2xl font-bold">Choose recipient</h1>
          </div>
          <div className="w-full flex mt-10 px-3 border-b border-gray-600 pb-5">
            <input
              type="text"
              placeholder="Email or public key"
              onChange={(e) => handleSearchAddress(e)}
              className="w-full px-5 py-3 border border-gray-300 rounded-3xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
            />
          </div>
          <div className="flex mt-7 flex-col">
            <h1 className="flex text-xl font-bold">Result</h1>
            {searchResult && (
            <button 
              onClick={handleAddressSave}
              className=" min-h-20 w-full flex flex-col gap-2 p-4 mt-5 text-start bg-[#151515]
              rounded-2xl">
              <h1 className="font-bold transition-all duration-150 text-sm hover:text-[16px]">{searchResult.wallet.user_email}</h1> 
              <h1 className="font-light text-sm">{searchResult.wallet.public_key}</h1> 
            </button>
            )}
          </div>
        </div>
      )}
      {confirmSendTab && sendAddress && activeWalletBalance && (
        <div className="w-full h-[93.5vh] flex flex-col absolute top-0 left-0 z-999 bg-[#000000] px-3">
          <div className="w-full flex justify-start mt-10 items-center gap-4">
            <BackArrow className="w-5 h-5 cursor-pointer" onMouseDown={() => {
              setConfirmSendTab(false);
              setAddressTabOpen(true);
            }}/>
            <h1 className="text-2xl font-bold">Send</h1>
          </div>
          <div className="flex mt-10 p-5 w-80 h-52 self-center bg-[#101010] rounded-xl">
            <div className="flex flex-col w-full">
              <div className="flex flex-row w-full py-1 h-full items-center justify-center">
                <img src={`/assets/${activeWalletBalance.coin.chain.name}.png`}
                className="w-6 h-6"/>
                <h2 className="ml-3 font-bold text-lg w-full text-start">{activeWalletBalance.coin.name}</h2>
                <div className="flex flex-col w-32 justify-end text-end">
                  <h2 className="font-[500] text-sm">
                    ${usdMode ? formatNumber(inputValue) : 
                      formatNumber(calculatedAmount(inputValue, usdMode, activeWalletBalance))}
                  </h2>
                  <h2 className="text-gray-400 text-sm">
                {usdMode ? formatTokenAmount(calculatedAmount(inputValue, usdMode, activeWalletBalance)) : formatTokenAmount(inputValue)}
                {'\u00A0'}{activeWalletBalance.coin.symbol}</h2>
                </div>
              </div>
              <div className="flex flex-row w-full py-1 h-full items-center justify-start">
                <h2 className="text-sm text-start">{formatAddress(sendAddress)}</h2>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full mt-10 h-30">
            <div className="flex w-full p-5 justify-between">
              <h1 className="text-sm font-bold flex text-start">Wallet Used:</h1>
              <h1 className="text-sm font-bold text-right">
                {formatAddress(activeWalletBalance.wallet.public_key)}
              </h1>
            </div>
            <div className="flex w-full p-5 justify-between">
              <h1 className="text-sm font-bold flex text-start">Network:</h1>
              <h1 className="text-sm font-bold text-right">
                {activeWalletBalance.coin.chain.name}
              </h1>
            </div>
            <div className="flex w-full p-5 justify-between">
              <h1 className="text-sm font-bold flex text-start">Network Fee:</h1>
              <h1 className="text-sm font-bold text-right">
                $0.00
              </h1>
            </div>
          </div>
          <div className="flex flex-row mt-32 w-full items-start justify-center gap-2 font-bold">
            <button 
            onClick={() => {
              setConfirmSendTab(false);
              setAddressTabOpen(false);
            }}
            className="w-full flex justify-center p-3 rounded-3xl bg-blue-600 hover:text-xl transition-all duration-300"
            style={{boxShadow: '0px 10px 120px -3px oklch(62.3% 0.214 259.815)'}}>
              <span>Cancel</span></button> 
            <button 
            onClick={() => handleSendBalance()}
            className="w-full flex justify-center p-3 rounded-3xl hover:text-xl transition-all duration-300
            bg-gradient-to-r from-blue-600 to-purple-500"
            style={{boxShadow: '0px 10px 120px -3px oklch(62.7% 0.265 303.9)'}}><span>Send</span></button>
          </div>
        </div>
      )}

      <div className="flex flex-row w-full flex-1 items-end pt-10">
        <div className={`flex flex-row w-full h-32 items-center
          ${inputValue.length > 8 ? 'text-3xl' : inputValue.length > 4 ? 'text-4xl'
            : 'text-6xl'}`}>
          <span className="font-semibold">
            {inputValue ? formatNumber(inputValue, false) : "0.00"}
          </span>
          <span className="font-normal text-gray-500">{'\u00A0'}{usdMode ? 'USD' :
              activeWalletBalance.coin.symbol}</span>
        </div>
        <div className="flex h-32">
          {!Number(inputValue) && (
          <button 
          onClick={handleMaxPress}
          className="px-4 bg-[#353535] rounded-xl h-8
          self-center flex items-center transition-all duration-300 hover:bg-[#404040]">
            <span className="text-sm font-bold">Max</span>
          </button>
          )}
        </div>  
      </div>
      <div className="-mt-2">
        {activeWalletBalance && (
        <button
        onClick={handleModeChange}
        className="flex flex-row text-blue-600 text-sm font-[500] cursor-pointer items-center">
          <TransferIcon className="w-4 h-4 fill-blue-600"/>
          <span>{inputValue ? formatNumber(calculatedAmount(inputValue, usdMode, activeWalletBalance), true): "0.00"}</span>
        </button>
        )}
      </div>
      <div className="flex w-full h-16 mt-14 items-center">
        {activeWalletBalance && (
        <button className="w-full flex flex-row
          px-2 py-3 items-center"
          onMouseDown={() => setBalancesTabOpen(prev => !prev)}>
          <img src={`/assets/${activeWalletBalance.coin.chain.name}.png`}
          className="w-8 h-8"/>
          <h2 className="ml-3 font-bold text-lg w-full text-start">{activeWalletBalance.coin.name}</h2>
          <div className="flex flex-col w-32 justify-end text-end">
            <h2 className="font-[500]">{formatTokenAmount(activeWalletBalance.amount)}
           {'\u00A0'}{activeWalletBalance.coin.symbol}</h2>
            <h2 className="text-gray-400">Available</h2>
          </div>
          <h2 className="text-gray-400 ml-2">{`>`}</h2>
        </button>
        )}
      </div>
      <div className="flex flex-2 w-full items-center justify-center">
        <div className="grid grid-cols-3 gap-x-[5rem] gap-y-12">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleInputChange(btn)}
              className="text-2xl w-12 h-8 font-medium"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row flex-1 w-full items-start justify-center gap-2 font-bold">
        <button className="w-full flex justify-center p-3 rounded-3xl bg-blue-600 hover:text-xl transition-all duration-300"
        style={{boxShadow: '0px 10px 120px -3px oklch(62.3% 0.214 259.815)'}}>
          <span>Receive</span></button> 
        <button 
        onClick={() => setAddressTabOpen(true)}
        className="w-full flex justify-center p-3 rounded-3xl hover:text-xl transition-all duration-300
        bg-gradient-to-r from-blue-600 to-purple-500"
        style={{boxShadow: '0px 10px 120px -3px oklch(62.7% 0.265 303.9)'}}><span>Send</span></button>
      </div>
    </div>
  );
};

export default SendPage;

