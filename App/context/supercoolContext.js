import React, { useState, createContext, useEffect, useRef } from "react";
import { BigNumber, providers } from 'ethers';
import { SUPER_COOL_NFT_CONTRACT, abi } from "../constant/constant";
import { Buffer } from 'buffer';
import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import { RandomPrompts } from "../components/RandomImgs";
import axios from 'axios';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { ZDK, ZDKNetwork, ZDKChain } from "@zoralabs/zdk";
import { Strategies, Networks } from '@zoralabs/nft-hooks'


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
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allNfts, setAllNfts] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [userAdd, setUserAdd] = useState();
  const [genRanImgLoding, setGenRanImgLoding] = useState(false);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  // console.log(allNfts);
  useEffect(() => {
    // getCollectionData()
    getSignerFromProvider();
  }, [])


<<<<<<< HEAD
  // Zora   // Zora   // Zora   // Zora   // Zora   // Zora   // Zora   // Zora   // Zora 

  const networkInfo = {
    network: ZDKNetwork.Zora,
    chain: ZDKChain.ZoraGoerli,
  }

  const API_ENDPOINT = "https://api.zora.co/graphql";
  const args = {
    endPoint: API_ENDPOINT,
    networks: [networkInfo],
    // apiKey: process.env.API_KEY
  }

  const zdk = new ZDK(args) // All arguments are optional

  // Zora  // Zora   // Zora   // Zora   // Zora   // Zora   // Zora   // Zora   // Zora 


=======

  // const getCollectionData = async () => {
  //   try {
  //     const args = `{
  //       where: {
  //         collectionAddresses: [
  //           "0x2EaF89a07991540D070145f3ddCff938b7239535"
  //         ]
  //       },
  //       includeFullDetails: false
  //     }`;
  
  //     let res = await zdk.collection(args);
  
  //     console.log('res--', res);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  
>>>>>>> 795bb7c

  const firebaseConfig = {
    apiKey: "AIzaSyDllIicX42GplfgbeZTqZG5aqI_Xg3PUt0",
    authDomain: "supercool-fbc8f.firebaseapp.com",
    projectId: "supercool-fbc8f",
    storageBucket: "supercool-fbc8f.appspot.com",
    messagingSenderId: "76744592998",
    appId: "1:76744592998:web:c7a075000ef0629135e7a7",
    measurementId: "G-QJZKGMDTX3"
  };


  const app = initializeApp(firebaseConfig);
  // const analytics = getAnalytics(app);
  const firestore = getFirestore();
  const collectionRef = collection(firestore, "TokenUri");

  // const database = getDatabase(app);
  const totalNfts = async () => {
    const contractPro = new ethers.Contract(
      SUPER_COOL_NFT_CONTRACT,
      abi,
      provider
    );
    const numOfNfts = await contractPro.getTotalSupply();
    return Number(numOfNfts) + 1;
  }
  // totalNfts()
  async function storeDataInFirebase(metadataUrl) {
    let tokenid = await totalNfts();
<<<<<<< HEAD
    console.log(tokenid, '-----tokenid');
=======
    // console.log(tokenid);
>>>>>>> 795bb7c
    const newData = {
      id: tokenid,
      url: metadataUrl
    };
    const docRef = await addDoc(collectionRef, newData);
    // console.log("Data stored successfully! Document ID:", docRef.id);
  }

  // 0x9b3bb95f64e59c6429b1a7bc6659c7f0e5f437cb //2nd nft

  const address = '0x466aCA3325F7D5da77b05D1683D98aA498319Dd6'

  const getCollection = async () => {
    try {
      const getdata = await zdk.collection(
        { address }
      );
      console.log('getdata--------------', getdata);

    } catch (error) {
      console.log(error);
    }
  };
  getCollection();


  // const getMintData = async () => {
  //   let tokenid = await totalNfts();
  //   console.log('tokenid===>', tokenid);
  //   console.log('mints',mints);
  //   const { mints } = await zdk.mints({
  //     where: {
  //       tokens: [
  //         {
  //           address: 0x8b0B87e6C1D2F7Bb513C08aD268F97B89f3561E5,
  //           tokenid,
  //         },
  //       ],
  //     },
  //     includeFullDetails: true,
  //   });
  //   return {
  //     mints,
  //   };
  // };
  // getMintData();
  // storeDataInFirebase()


  // fetchAllDataFromCollection()

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



  const GenerateNum = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contract = new ethers.Contract(
      SUPER_COOL_NFT_CONTRACT,
      abi,
      signer
    );

    setGenRanImgLoding(true);
    const tx = await contract.getRandomNumber();
    await tx.wait();
    const num = await contract.ranNum();
    setPrompt(RandomPrompts[num]);
    setGenRanImgLoding(false);
  }
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
        zdk
      }}
      {...props}
    >
      {props.children}
    </SupercoolAuthContext.Provider>
  );
};
