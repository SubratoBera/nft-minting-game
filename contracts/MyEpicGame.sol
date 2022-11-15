// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

// NFT contract to inherit from.
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Helper we wrote to encode in Base64

// Helper functions OpenZeppelin provides.
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "../artifacts/contracts/libraries/Base64.sol";

import "hardhat/console.sol";

contract MyEpicGame is ERC721 {
    // We'll hold our character's attributes in a struct. Feel free to add
    // whatever you'd like as an attribute! (ex. defense, crit chance, etc).
    struct CharacterAttributes {
        uint256 characterIndex;
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    struct BigBoss {
        string name;
        string imageURI;
        uint256 hp;
        uint256 maxHp;
        uint256 attackDamage;
    }

    event CharacterNFTMinted(address sender, uint256 tokenId, uint256 charcterIndex);
    event AttackComplete(address sender, uint256 tokenId, uint256 charcterIndex);

    BigBoss public bigBoss;

    // The tokenId is the NFTs unique identifier, it's just a number that goes
    // 0, 1, 2, 3, etc.
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => CharacterAttributes) public nftHolderAttributes;

    mapping(address => uint256) public nftHolders;

    // A lil array to help us hold the default data for our characters.
    // This will be helpful when we mint new characters and need to know
    // things like their HP, AD, etc.
    CharacterAttributes[] defaultCharacters;

    // Data passed in to the contract when it's first created initializing the characters.
    // We're going to actually pass these values in from run.js.
    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDmg,
        string memory bossName,
        string memory bossImageURI,
        uint256 bossHp,
        uint256 bossAttackDamage
    ) ERC721("HEROES", "HERO") {
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            hp: bossHp,
            maxHp: bossHp,
            attackDamage: bossAttackDamage
        });

        console.log(
            "Done initializing boss %s w/ HP %s, img %s",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.imageURI
        );

        // Loop through all the characters, and save their values in our contract so
        // we can use them later when we mint our NFTs.
        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                CharacterAttributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    hp: characterHp[i],
                    maxHp: characterHp[i],
                    attackDamage: characterAttackDmg[i]
                })
            );

            CharacterAttributes memory c = defaultCharacters[i];
            console.log(
                "Done initializing %s w/ HP %s, img %s",
                c.name,
                c.hp,
                c.imageURI
            );
        }

        // I increment _tokenIds here so that my first NFT has an ID of 1.
        // More on this in the lesson!
        _tokenIds.increment();
    }

    // Users would be able to hit this function and get their NFT based on the
    // characterId they send in!
    function mintCharacterNFT(uint256 _characterIndex) external {
        // Get current tokenId (starts at 1 since we incremented in the constructor).
        uint256 newItemId = _tokenIds.current();

        // The magical function! Assigns the tokenId to the caller's wallet address.
        _safeMint(msg.sender, newItemId);

        // We map the tokenId => their character attributes. More on this in
        // the lesson below.
        nftHolderAttributes[newItemId] = CharacterAttributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            hp: defaultCharacters[_characterIndex].hp,
            maxHp: defaultCharacters[_characterIndex].maxHp,
            attackDamage: defaultCharacters[_characterIndex].attackDamage
        });

        console.log(
            "Minted NFT w/ tokenId %s and characterIndex %s",
            newItemId,
            _characterIndex
        );

        nftHolders[msg.sender] = newItemId;

        _tokenIds.increment();

        emit CharacterNFTMinted(msg.sender, newItemId, _characterIndex);
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        CharacterAttributes memory charAttributes = nftHolderAttributes[
            _tokenId
        ];

        string memory strHp = Strings.toString(charAttributes.hp);
        string memory strMaxHp = Strings.toString(charAttributes.maxHp);
        string memory strAttackDamage = Strings.toString(
            charAttributes.attackDamage
        );

        string memory json = Base64.encode(
            abi.encodePacked(
                '{"name": "',
                charAttributes.name,
                " -- NFT #: ",
                Strings.toString(_tokenId),
                '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
                charAttributes.imageURI,
                '", "attributes": [ { "trait_type": "Health Points", "value": ',
                strHp,
                ', "max_value":',
                strMaxHp,
                '}, { "trait_type": "Attack Damage", "value": ',
                strAttackDamage,
                "} ]}"
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );

        return output;
    }

    function attackBoss() public {
        // Get State of the Player's NFT
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        CharacterAttributes storage player = nftHolderAttributes[
            nftTokenIdOfPlayer
        ];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.hp,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bigBoss.name,
            bigBoss.hp,
            bigBoss.attackDamage
        );

        // make sure that the player's character has more than 0 hp
        require(player.hp > 0, "character must have HP to attack boss.");

        //make sure the boss has more than 0 hp
        require(bigBoss.hp > 0, "boss must have HP to attack character.");

        // allow player to attack boss
        if (bigBoss.hp < player.attackDamage) {
            bigBoss.hp = 0;
        } else {
            bigBoss.hp = bigBoss.hp - player.attackDamage;
        }

        //allow boss to attack player
        if (player.hp < bigBoss.attackDamage) {
            player.hp = 0;
        } else {
            player.hp = player.hp - bigBoss.attackDamage;
        }

        console.log("Player attacked boss. New boss hp: %s", bigBoss.hp);
        console.log("Boss attacked player. New player hp: %s\n", player.hp);

        emit AttackComplete(msg.sender, bigBoss.hp, player.hp);
    }

    function checkIfUserHaveNFT() public view returns (CharacterAttributes memory) {
      // Get the tokenId of the user's character NFT
      uint userNftTokenId = nftHolders[msg.sender];

      // If the user has a tokenId in the map, return their character.
      // Else, return an empty character.
      if (userNftTokenId > 0) {
        return nftHolderAttributes[userNftTokenId];
      } else {
        CharacterAttributes memory emptyStruct;
        return emptyStruct;
      }
    }

    function getAllDefaultCharacters() public view returns (CharacterAttributes[] memory) {
      return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
      return bigBoss;
    }
}
