import React, { useState, createContext, useEffect, useRef } from "react";
import { BigNumber, providers } from 'ethers';
import { SUPER_COOL_NFT_CONTRACT, abi } from "../constant/constant";
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { RandomPrompts } from "../components/RandomImgs";
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc } from "firebase/firestore";

import { getDatabase, ref, set } from "firebase/database";
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";

export const SupercoolAuthContext = createContext(undefined);

export const SupercoolAuthContextProvider = (props) => {

  const networkInfo = {
    network: ZDKNetwork.Zora,
    chain: ZDKChain.ZoraGoerli,
  }

  const API_ENDPOINT = "https://api.zora.co/graphql";
  // const API_ENDPOINT = "https://api.thegraph.com/subgraphs/name/kolber/zora-create-goerli";
  const args = {
    endPoint: API_ENDPOINT,
    networks: [networkInfo],
    // apiKey: process.env.API_KEY
  }

  const zdk = new ZDK(args)
  // console.log(zdk);
  const [loading, setLoading] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [userAdd, setUserAdd] = useState();
  const [genRanImgLoding, setGenRanImgLoding] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userNftsCollection, setUserNftsCollection] = useState([]);
  const [allNftsCollection, setAllNftsCollection] = useState([]);
  const [loggedInAccount, setLoggedInAccount] = useState(null);

console.log('users--',userNftsCollection);
console.log('alls--',allNftsCollection);
  const firebaseConfig = {
    apiKey: "AIzaSyD_QcPwBliazXtbuwLiW-dJxJLX9zustG0",
    authDomain: "magicalnft-a3a61.firebaseapp.com",
    projectId: "magicalnft-a3a61",
    storageBucket: "magicalnft-a3a61.appspot.com",
    messagingSenderId: "63741533323",
    appId: "1:63741533323:web:70563f84eec3101694888e"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // const analytics = getAnalytics(app);
  const firestore = getFirestore();
  const collectionRef = collection(firestore, "TokenUri");
  const collectionCon = collection(firestore, "collection");

  class NftData {
    constructor(collectionAddress, name, description, symbol, image, owner, price, tokenid) {
      this.collectionAddress = collectionAddress;
      this.name = name;
      this.description = description;
      this.symbol = symbol;
      this.image = image;
      this.owner = owner;
      this.price = price;
      this.tokenid = tokenid;
    }
  }

  useEffect(() => {
    setupMetamask();
    fetchAllCollections();
    getSignerFromProvider();
  }, [loggedInAccount])

  const getCollectionData = async (_addr) => {
    // let arr = []
    const argsNFT = {
      token: {
        address: _addr,
        tokenId: "1"
      },
      includeFullDetails: true
    }
    const response = await zdk.token(argsNFT);
    // console.log('gettin data',response.token.token);

    let nft = response.token.token;
      const newNftData = new NftData(nft.collectionAddress, nft.metadata.properties.name, nft.metadata.description, nft.tokenContract.symbol, nft.metadata.image, nft.owner, nft.mintInfo.price.chainTokenPrice.decimal, nft.tokenId)
      return newNftData;

  }



  async function storeCollection(_collectionAdd) {
    const walletAddress = localStorage.getItem('address');
    const q = query(
      collection(db, "collection"),
      where("walletAddress", "==", walletAddress)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // No matching walletAddress found, store the collection address in a new array
      await addDoc(collection(db, "collection"), {
        walletAddress: walletAddress,
        collectionAddresses: [_collectionAdd] // Start with a new array containing the current address
      });
      console.log("Collection stored!!");
    } else {
      // Matching walletAddress found, update the array of collection addresses
      querySnapshot.forEach(async (doc) => {
        const existingAddresses = doc.data().collectionAddresses || []; // Get existing addresses or start with an empty array
        existingAddresses.push(_collectionAdd); // Add the new address to the array
        await updateDoc(doc.ref, {
          collectionAddresses: existingAddresses
        });
      });
      console.log("Collection address added!");
    }
  }

  async function fetchAllCollections() {
    const querySnapshot = await getDocs(collectionCon);
    const data = querySnapshot.docs.map((doc) => doc.data());
    console.log(data);
    let allNftsArr = [];
    let userNftArr = [];

    for (let i = 0; i <= data.length - 1; i++) {
      console.log('data l', data.length);
      const collectionAddresses = data[i].collectionAddresses || [];
      for (let i = 0; i <= collectionAddresses.length - 1; i++) {
      console.log('col l', collectionAddresses.length);

        let NftData = await getCollectionData(collectionAddresses[i])
        if(NftData.owner == localStorage.getItem('address')){
          userNftArr.push(NftData);
        }else{
          allNftsArr.push(NftData);
        }
      }
    }
    setUserNftsCollection(userNftArr);
    setAllNftsCollection(allNftsArr);
  }


  async function getSignerFromProvider() {
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      const signer = provider.getSigner();
      setSigner(signer);
    } else {
      console.log('No wallet connected or logged out');
    }
  }

  async function setupMetamask() {
    if (window.ethereum) {
      try {
        await window.ethereum.enable();

        const networkId = await window.ethereum.request({ method: 'net_version' });
        if (Number(networkId) !== 999) {
          alert("Please switch to the Zora goerli network.");
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setLoggedInAccount(accounts[0]);
          localStorage.setItem('address', accounts[0]);
        }
      } catch (error) {
        console.error("Error while setting up Metamask:", error);
      }
    } else {
      console.error("Metamask not detected in your browser.");
    }
  }

  const login = async () => {
    if (window.ethereum) {
      try {
        const networkId = await window.ethereum.request({ method: 'net_version' });
        if (Number(networkId) !== desiredNetworkId) {
          alert("Please switch to the correct network.");
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setLoggedInAccount(accounts[0]);
          localStorage.setItem('loggedInAccount', accounts[0]);
        }
      } catch (error) {
        console.error("Error while logging in:", error);
      }
    }
  };

  const logout = () => {
    setLoggedInAccount(null);
    localStorage.removeItem('address');
  };


  const auth =
    "Basic " +
    Buffer.from(
      process.env.infuraProjectKey + ":" + process.env.infuraSecretKey
    ).toString("base64");

  const client = create({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
      authorization: auth,
    },
  });

  const uploadOnIpfs = async (e) => {
    let dataStringify = JSON.stringify(e);
    const ipfsResult = await client.add(dataStringify);
    const contentUri = `https://superfun.infura-ipfs.io/ipfs/${ipfsResult.path}`;

    return contentUri;
  }

  const handleImgUpload = async (file) => {
    const added = await client.add(file);
    const hash = added.path;
    const ipfsURL = `https://superfun.infura-ipfs.io/ipfs/${hash}`;
    return ipfsURL;
  };

  // Edit profile

  const uploadDatainIpfs = async (e) => {
    let dataStringify = JSON.stringify(e);
    const ipfsResult = await client.add(dataStringify);
    const contentUri = `https://superfun.infura-ipfs.io/ipfs/${ipfsResult.path}`;
    // console.log('contentUri', contentUri);
    return contentUri;
  }

  const generateText = async (detailPrompt) => {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/text-davinci-003/completions',
        {
          prompt: detailPrompt,
          max_tokens: 700,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // console.log(response.data.choices[0].text);
      setPrompt(response.data.choices[0].text);
      // return response.data.choices[0].text;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <SupercoolAuthContext.Provider
      value={{
        login,
        logout,
        uploadOnIpfs,
        allNfts,
        handleImgUpload,
        client,
        loading,
        setLoading,
        prompt,
        setPrompt,
        genRanImgLoding,
        userAdd,
        uploadDatainIpfs,
        generateText,
        provider,
        storeCollection,
        allNftsCollection,
        userNftsCollection,
        fetchAllCollections
      }}
      {...props}
    >
      {props.children}
    </SupercoolAuthContext.Provider>
  );
};
