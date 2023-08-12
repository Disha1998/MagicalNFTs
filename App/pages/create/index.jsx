import React, { useEffect, useRef, useState } from "react";
import "tippy.js/dist/tippy.css"; // optional
import Meta from "../../components/Meta";
import { Configuration, OpenAIApi } from "openai";
import { SUPER_COOL_NFT_CONTRACT, abi } from "../../constant/constant";
import { ethers } from "ethers";
import { SupercoolAuthContext } from "../../context/supercoolContext";
import { NFTStorage, File } from 'nft.storage'
import axios from "axios";
import Options from "../filterCategory/category";
import CircularProgress from '@mui/material/CircularProgress';
import ImageModal from "../modal/modal";
import RendersellNft from "../renderSellNft/renderSellNft";

import { BaseError, Address, parseEther } from "viem";
import { zoraNftCreatorV1Config } from "@zoralabs/nft-drop-contracts";
import { erc721DropABI } from "@zoralabs/nft-drop-contracts";


const Create = () => {
  const superCoolContext = React.useContext(SupercoolAuthContext);
  const { fetchAllCollections, storeCollection, GenerateNum, prompt, setPrompt, genRanImgLoding, getAllNfts, storeDataInFirebase } = superCoolContext;
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Profile avatar" || category);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState();
  const [chain, setChain] = useState("Ethereum" || chain);
  const [rendersellNFT, setrendersellNFT] = useState(false)
  const [imageUrl, setImageUrl] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [mintLoading, setMintLoading] = useState(false);
  const [collectionAddress, setCollectionAddress] = useState(false);

  const imgRef = useRef();
  const [placeholder, setPlaceholder] = useState(
    "Search a lion with Paint Brushes painting the mona lisa painting..."
  );
  const [images, setImages] = React.useState([]);
  const [selectedImage, setSelectedImage] = React.useState(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
    if (isMounted && imageUrl) {
      imgRef.current = imageUrl;
      console.log('imgRef==', imgRef);
    }
  }, [imageUrl, isMounted]);

  const configuration = new Configuration({
    apiKey: process.env.apiKey,
  });
  const openai = new OpenAIApi(configuration);


  const NFT_STORAGE_TOKEN = process.env.REACT_APP_NFT_STORAGE_TOKEN;
  const client = new NFTStorage({ token: NFT_STORAGE_TOKEN });





  //   const {
  //     data: receipt,
  //     isLoading: isPending,
  //     isSuccess,
  //   } = useWaitForTransaction({ hash: data?.hash });
  // console.log('receipt---',receipt);


  const createNftCol = async () => {
    setMintLoading(true);
    const address = localStorage.getItem('address');
    // console.log('cur add--',zoraNftCreatorV1Config.abi);

    const symbol = "MNFT";
    const editionSize = 2n;
    const royaltyBps = 0;
    const fundsRecipient = address;
    const defaultAdmin = address;
    const animationUri = "0x0";

    const maxSalePurchasePerAddress = 1;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(address);

    let contract;
    try {
      contract = new ethers.Contract(
        zoraNftCreatorV1Config.address[999],
        zoraNftCreatorV1Config.abi,
        signer
      );
    } catch (e) {
      console.error("Failed to instatiate contract: " + e.message);
      setMintLoading(false);

    }

    try {
      const tx = await contract.createEdition(
        title,
        symbol,
        editionSize,
        royaltyBps,
        fundsRecipient,
        defaultAdmin,
        {
          maxSalePurchasePerAddress,
          presaleEnd: 0n,
          presaleStart: 0n,
          presaleMerkleRoot:
            "0x0000000000000000000000000000000000000000000000000000000000000000",
          publicSaleEnd: 18446744073709551615n,
          publicSalePrice: parseEther(price),
          publicSaleStart: 0n,
        },
        description,
        animationUri,
        selectedImage

      );

      const receipt = await tx.wait();
      console.log('recept--', receipt, receipt.events[0].address);

      if (receipt.status == 1) {
        let con = new ethers.Contract(
          receipt.events[0].address,
          erc721DropABI,
          signer
        );

        let fee = 0.000777;
        let p = Number(price);
        let val = fee + p;
        console.log('value--', val);
        const txx = await con.purchase(1, { value: ethers.utils.parseUnits(val.toString(), "ether") })
        const res = await txx.wait();

        if (res.status == 1) {
          await storeCollection(receipt.events[0].address);
          await fetchAllCollections();
          setMintLoading(false);

        }
        setMintLoading(false);

      }


    } catch (e) {
      console.error("Failed to mint NFT: " + e.message);
      setMintLoading(false);
    }

  }













  const generateImage = async () => {
    setGenerateLoading(true);
    setPlaceholder(`Search ${prompt}...`);
    try {
      const res = await openai.createImage({
        prompt: prompt,
        n: 1,
        size: "256x256",
      });
      console.log(res);

      let arry = [];
      for (let i = 0; i < res.data.data.length; i++) {
        const img_url = res.data.data[i].url;
        console.log('img_url', img_url);
        const api = await axios.create({
          baseURL:
            "https://open-ai-enwn.onrender.com",
        });
        const obj = {
          url: img_url
        }
        let response = await api
          .post("/image", obj)
          .then((res) => {
            return res;
          })
          .catch((error) => {
            console.log(error);
          });
        const arr = new Uint8Array(response.data.data);
        const blob = new Blob([arr], { type: 'image/jpeg' });
        const imageFile = new File(
          [blob],
          `data.png`,
          {
            type: "image/jpeg",
          }
        );
        const metadata = await client.store({
          name: "data",
          description: "data",
          image: imageFile
        });
        const imUrl = `https://nftstorage.link/ipfs/${metadata.ipnft}/metadata.json`;
        console.log(imUrl, "imUrl");
        const data = (await axios.get(imUrl)).data;
        console.log(data.image, "data");
        const rep = data.image.replace(
          "ipfs://",
          "https://nftstorage.link/ipfs/"
        );
        console.log(rep, '==rep');

        arry.push(rep);
      }
      console.log(arry, '----arry');
      setImages(arry);
      setGenerateLoading(false);

    } catch (error) {
      console.error(`Error generating image: ${error}`);
      setGenerateLoading(false);
    }
  };

  function handleSelectedImg(url) {
    setrendersellNFT(false);
    setSelectedImage(url);
    setModalOpen(true);
  }

  return (
    <>
      <div className="container">
        <div className="grid grid-cols-12 ">
          <div className="col-span-3">
            <div
              className="categories-scroll"
              style={{ marginTop: "160px" }}
            >
              <p className="dark:text-jacarta-300 text-4xs mb-3">
                Experiment and train modal as per your preference
              </p>
              <Options />
            </div>
          </div>
          <div className="col-span-9">
            <Meta title="SuperCool" />

            <section className="relative py-24 nft-sections fixed">
              <picture className="pointer-events-none absolute inset-0 -z-10 dark:hidden">
                <img
                  src="/images/gradient_light.jpg"
                  alt="gradient"
                  className="h-full w-full"
                />
              </picture>

              <div className="container nft-sections">
                <h1 className="font-display text-jacarta-700 py-16 text-center text-4xl font-medium dark:text-white">
                  Let your creativity shine and give us a clear picture with your words
                </h1>

                <div className="mx-auto max-w-[48.125rem]">

                  <div className="mb-6">
                    <p className="dark:text-jacarta-300 text-4xs mb-3">
                      We're excited to bring your NFT to life, but we need your input. Please provide us with a brief description of what you want it to look like. Or
                      <span>
                        <a
                          className="hover:text-accent dark:hover:text-white text-jacarta-700 font-bold font-display mb-6 text-center text-md dark:text-white md:text-left lg:text-md xl:text-md animate-gradient"
                          style={{ cursor: "pointer" }} onClick={GenerateNum}
                        > {
                            genRanImgLoding ?
                              "generating random prompt..." : "generate random image."

                          }  </a>
                      </span>
                    </p>

                    <textarea
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={placeholder}
                      value={prompt}
                      id="item-description"
                      className="dark:bg-jacarta-700 border-jacarta-100 hover:ring-accent/10 focus:ring-accent dark:border-jacarta-600 dark:placeholder:text-jacarta-300 w-full rounded-lg py-3 px-3 hover:ring-2 dark:text-white"
                      rows="6"
                      required
                    >
                    </textarea>

                    <div className="generate-btn">
                      {generateLoading ?
                        <CircularProgress />
                        :
                        <button
                          className="bg-accent-lighter rounded-full py-3 px-8 text-center font-semibold text-white transition-all  "
                          style={{ marginBottom: "15px" }}
                          onClick={generateImage}
                        >
                          Generate
                        </button>
                      }
                    </div>
                    <br />

                    {
                      images.length > 0 ?
                        <>
                          <div className="row main-row">
                            {console.log(images, '===images')}
                            {images && images.map((url) => (

                              <div
                                className="col-lg-4 mb-4 mb-lg-0"
                                onClick={() => handleSelectedImg(url)}
                              >
                                <div
                                  className="bg-image hover-overlay ripple shadow-1-strong rounded col-4"
                                  data-ripple-color="light"
                                >
                                  <div className="img-nft">
                                    <img
                                      src={url}
                                      alt='nft-images'
                                    />
                                  </div>
                                  <div className="radio-img">
                                    <input
                                      type="radio"
                                      id="huey"
                                      name="drone"
                                      value="huey"
                                      checked={url == selectedImage}
                                      className="mt-3"
                                    />
                                  </div>
                                </div>
                              </div>

                            ))}

                          </div>
                          <div>
                            <p style={{ textAlign: "center" }} className="dark:text-jacarta-300 text-4xs mb-3"
                            >Select the image you wish to mint.</p>
                          </div>
                        </>
                        : ""
                    }

                  </div>

                  {modalOpen &&
                    <div className="img-overlay">
                      <ImageModal setModalOpen={setModalOpen}
                        selectedImage={selectedImage}
                        setSelectedImage={setSelectedImage}
                        // createNft={createNft}
                        setrendersellNFT={setrendersellNFT}
                      />
                    </div>
                  }

                </div>
                <RendersellNft
                  rendersellNFT={rendersellNFT}
                  setTitle={setTitle}
                  setDescription={setDescription}
                  setPrice={setPrice}
                  createNft={createNftCol}
                  mintLoading={mintLoading}
                  category={category}
                  setCategory={setCategory}
                  chain={chain}
                  setChain={setChain}
                />
              </div >
            </section >
          </div>
        </div>
      </div>
    </>
  );
};

export default Create;
