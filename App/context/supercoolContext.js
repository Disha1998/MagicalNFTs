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
// import { Strategies, Networks } from '@zoralabs/nft-hooks'



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
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [userAdd, setUserAdd] = useState();
  
  const [genRanImgLoding, setGenRanImgLoding] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [userNfts, setUserNfts] = useState([]);

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
  const UserProfileRef = collection(firestore, "UserProfile");

  class NftData {
    constructor(collectionAddress, name, description, symbol, image, owner) {
      this.collectionAddress = collectionAddress;
      this.name = name;
      this.description = description;
      this.symbol = symbol;
      this.image = image;
      this.owner = owner;
    }
  }

  useEffect(() => {
    fetchAllCollections();
    // getCollectionData();
    getSignerFromProvider();
  }, [])

  const getCollectionData = async (_addr) => {
    const argsNFT = {
      token: {
        address: _addr,
        tokenId: "1"
      },
      includeFullDetails: true
    }
    console.log('gettin data');
    const response = await zdk.token(argsNFT);
  }

  //   const args = {
  //     where: {
  //       collectionAddresses: [_addr],
  //       ownerAddresses: [localStorage.getItem('address')]
  //     },

  //     pagination: { limit: 10 },
  //     includeFullDetails: true,
  //     includeSalesHistory: true
  //   };

  //   const res = await zdk.tokens(args);
  //   console.log('respons--', res);

  //   if (res.tokens.nodes.length > 0) {
  //     let arr = []
  //     let nft = res.tokens.nodes[0].token;
  //     const newNftData = new NftData(nft.collectionAddress, nft.metadata.properties.name, nft.metadata.description, nft.tokenContract.symbol, nft.metadata.image, nft.owner)
  //     arr.push(newNftData)
  //     setUserNfts(arr);
  //   }

  //   console.log('user nft--', userNfts);
  // };










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
    const q = query(
      collection(db, "collection")
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const walletAddress = data.walletAddress;
        const collectionAddresses = data.collectionAddresses || [];

        console.log(`Wallet Address: ${walletAddress}`);
        console.log("Collection Addresses:");
        collectionAddresses.forEach((address) => {
          console.log(address);
        });
      });
    } else {
      console.log("No collections found in the database.");
    }
  }

  // async function fetchAllCollections() {
  //   const querySnapshot = await getDocs(collectionCon);
  //   const data = querySnapshot.docs.map((doc) => doc.data());
  //   console.log(data);

  //   for (let i = 0; i <= data.length - 1; i++) {
  //     console.log('data l', data.length);
  //     const collectionAddresses = data[i].collectionAddresses || [];
  //     for (let i = 0; i <= collectionAddresses.length - 1; i++) {
  //     console.log('col l', collectionAddresses.length);

  //       let NftData = await getCollectionData(collectionAddresses[i])
  //     }
  //   }
  // }






  const totalNfts = async () => {
    const contractPro = new ethers.Contract(
      SUPER_COOL_NFT_CONTRACT,
      abi,
      provider
    );
    const numOfNfts = await contractPro.getTotalSupply();
    return Number(numOfNfts) + 1;
  }
  async function storeDataInFirebase(metadataUrl) {
    let tokenid = await totalNfts();
    // console.log(tokenid);
    const newData = {
      id: tokenid,
      url: metadataUrl
    };
    const docRef = await addDoc(collectionRef, newData);
    // console.log("Data stored successfully! Document ID:", docRef.id);
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

  const login = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setUserAdd(accounts[0]);
      if (typeof window !== 'undefined') {
        localStorage.setItem('address', accounts[0]);
      }

      if (window.ethereum.networkVersion === '999') {
        setWalletConnected(true);
      } else {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x13881' }] // Polygon Mumbai chain ID
        });
        setWalletConnected(true);
      }

      if (ethereum && ethereum.selectedAddress) {
        const address = await signer.getAddress();

      } else {
        console.log('No wallet connected or logged out');
      }
      getAllNfts();
    } catch (error) {
      console.error('Login error:', error);
    }
    getAllNfts();
  }

  const logout = async () => {
    localStorage.removeItem('address');
    setWalletConnected(false);
  }

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

  const GenerateNum = () => {
    const index = Math.floor(Math.random() * RandomPrompts.length);
    setPrompt(RandomPrompts[index])
  };


  const getProfileData = async (add) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      SUPER_COOL_NFT_CONTRACT,
      abi,
      signer
    );
    // console.log('use add--', add);
    if (add !== undefined) {
      const dataurl = await contract.getUserProfile(add);
      // console.log(dataurl);
      const response = await axios.get(dataurl);
      // console.log(response.data);
      return response;
    }
  }

  async function getAllNfts() {
    try {
      const querySnapshot = await getDocs(collectionRef);
      const data = querySnapshot.docs.map((doc) => doc.data());
      // console.log("Fetched data:", data);
      const metadatas = [];

      for (let i = 0; i <= data.length - 1; i++) {
        // console.log(data[i], '------------');
        let tokenURI = data[i].url;
        // console.log(tokenURI);
        const response = await fetch(tokenURI);
        const metadata = await response.json();

        // console.log(await response.json());
        metadatas.push(metadata);
      }
      setAllNfts(metadatas);
    } catch (error) {
      console.error("Error fetching data: ", error);
      return [];
    }
  }

  useState(() => {
    setTimeout(() => {
      // console.log('running usestate');
      getAllNfts()
    }, 5000);
  }, [loading])

  const maticToUsdPricee = async (_price) => {
    const contractPro = new ethers.Contract(
      SUPER_COOL_NFT_CONTRACT,
      abi,
      provider
    );
    return await contractPro.convertMaticUsd(ethers.utils.parseUnits(_price, 'ether'));
  }
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
        GenerateNum,
        prompt,
        setPrompt,
        genRanImgLoding,
        userAdd,
        uploadDatainIpfs,
        getAllNfts,
        getProfileData,
        generateText,
        storeDataInFirebase,
        maticToUsdPricee,
        provider,
        storeCollection,
        UserProfileRef
      }}
      {...props}
    >
      {props.children}
    </SupercoolAuthContext.Provider>
  );
};
