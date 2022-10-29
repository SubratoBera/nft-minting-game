import React, { useEffect, useState } from 'react';
import {ethers} from "ethers";
import './App.css';
import SelectCharacter from './Components/SelectCharacter/index.jsx';
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants.jsx";
import myEpicGame from './utils/MyEpicGame.json';
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator"
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_LINK = "https://twitter.com/subratabera07";

const App = () => {
  // State
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  // Actions
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');

        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);

        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
const renderContent = () => {

  if(isLoading) {
    <LoadingIndicator />
  }
  
  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://static.wikia.nocookie.net/63f5f3a7-5238-40f3-b1b4-72a8f454fdf6"
          alt="Madara Uchiha Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
      </div>
    );
    /*
     * Scenario #2
     */
  } else if (currentAccount && !characterNFT) {
    return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
  } else if (currentAccount && characterNFT) {
    return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}/>
  }
};
  
  

  useEffect(() => {
    checkIfWalletIsConnected();

    const checkNetwork = async () => {
  try { 
    if (window.ethereum.networkVersion !== '4') {
      alert("Please connect to Rinkeby!")
    }
  } catch(error) {
    console.log(error)
  }
}
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer,
    );

    const txn = await gameContract.checkIfUserHaveNFT();
    if(txn.name) {
      console.log("User has character NFT");
      setCharacterNFT(transformCharacterData(txn));
    } else {
      console.log("No character NFT found");
    }
    };

  if (currentAccount) {
    console.log("CurrentAccount:", currentAccount);
    fetchNFTMetadata();
  }
  }, [currentAccount]);

  useEffect(() => {

    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract (
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const characterNFT = await gameContract.checkIfUserHaveNFT();
      if (characterNFT.name) {
        console.log("User has character NFT");
        setCharacterNFT(transformCharacterData(characterNFT));
      }

      setIsLoading(false);
    }

    if(currentAccount) {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  },[currentAccount])

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Multiverse Madness ⚔️</p>
          <p className="sub-text">Team up to protect the Metaverse!</p>
          {/* This is where our button and image code used to be!
         *	Remember we moved it into the render method.
         */}
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >@subrato</a>
        </div>
      </div>
    </div>
  );
};

export default App;