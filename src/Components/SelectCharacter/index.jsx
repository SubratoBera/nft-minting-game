import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from "../../Components/LoadingIndicator";
/*
 * Don't worry about setCharacterNFT just yet, we will talk about it soon!
 */
const SelectCharacter = ({ setCharacterNFT }) => {
  const [ characters, setCharacters] = useState([]);
  const [ gameContract, setGameContract ] = useState(null);

  const [ mintingCharacter, setMintingCharacter] = useState(false);

  //UseEffect
  useEffect(() => {
    const { ethereum } = window;

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log("ethereum object not found");
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log("Getting contract characters to mint");

        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log("CharacterTxn:", charactersTxn);

        const characters = charactersTxn.map((characterData) => transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch(error) {
        console.error("Something went wrong while fetching characters:", error);
      }
    };

    const onCharacterMint = async (sender, tokenId, characterIndex) => {
       console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
    );

      if(gameContract) {
        const characterNFT = await gameContract.checkIfUserHaveNFT();
        console.log("CharacterNFT:", characterNFT);
        setCharacterNFT(transformCharacterData(characterNFT))
      }
      
    }

    if (gameContract) {
      getCharacters();

      gameContract.on("CharacterNFTMinted", onCharacterMint)
    }

    return() => {
      if (gameContract) {
        
      gameContract.off("CharacterNFTMinted", onCharacterMint)
    }
    }
  }, [gameContract]);

  const renderCharacters = () => 
    characters.map((character, index) => (
    <div className = "character-item" key={character.name}>
    <div className="name-container">
    <p>{character.name}</p>
    </div>
      <img src={character.imageURI} alt={character.name}/>
      <button 
        type="button" 
        className="character-mint-button" 
        onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
    </div>
  ));

    const mintCharacterNFTAction = async (characterId) => {
      try {
        if(gameContract) {

          setMintingCharacter(true);
          console.log("Minting character in progess...");
          const mintTxn = await gameContract.mintCharacterNFT(characterId);
          await mintTxn.wait();
          console.log("MintTxn:", mintTxn);


          setMintingCharacter(false);
        }
      } catch (error) {
        console.warn("MintCharacterAction Error:", error);

        setMintingCharacter(false);
      }
    }
  
  return (
    <div className="select-character-container">
      <h2>Mint Your Hero. Choose wisely.</h2>

      {characters.length > 0 && (
      <div className="character-grid">{renderCharacters()}</div>
      )}
      {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting in progress.... </p>
        </div>
        <img src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
          alt="Minting Loading Indicator" />
      </div>
      )}
    </div>
  );
};

export default SelectCharacter;