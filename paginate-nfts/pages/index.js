import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { Metaplex } from '@metaplex-foundation/js';
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { WalletDisconnectButton, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { background } from '../public/village_bedroom.jpeg';


const connection = new Connection(clusterApiUrl('mainnet-beta'));
const mx = Metaplex.make(connection);

export default function Home() {
  const { publicKey, connected } = useWallet();
  // const [address, setAddress] = useState(
  //   'HKBvP2rRpGJ8MPWJu3y4Bcy48Qb1WWrghvGrxXojbzqy',
  // );
  
  const address = publicKey ? publicKey.toString() : "Connect your wallet and click Fetch"

  const creatorAddress = 'HKBvP2rRpGJ8MPWJu3y4Bcy48Qb1WWrghvGrxXojbzqy';
  const [connectedHook, setConnectedHook] = useState(connected);
  const [nftList, setNftList] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const perPage = 9;

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setCurrentView(null);
      const list = await mx.nfts().findAllByOwner(new PublicKey(address));
      const filtered_list = list.filter((nft) => { return nft.updateAuthority.toString() === creatorAddress});
      setNftList(filtered_list);
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (!nftList) {
      return;
    }

    const execute = async () => {
      const startIndex = (currentPage - 1) * perPage;
      const endIndex = currentPage * perPage;
      await loadData(startIndex, endIndex);
      setCurrentView(nftList.slice(startIndex, endIndex));
      setLoading(false);
    };
    execute();
  }, [nftList, currentPage]);

  // listen for user to connect their wallet via hook
  // useEffect(() => {
  //   console.log("We are: " + connected)
  //   if(connected) {
  //     fetchNFTs();
  //     console.log("User has connected. Fetching Tamashi NFTs.")
  //   }
  //   else {
  //     let i = 0;
  //     while(i++ < 1) {
  //       location.reload();
  //       if(i == 2) {
  //         i = 0;
  //       }
  //     }
      
  //   }
    
  // }, [connectedHook]);

  const loadData = async (startIndex, endIndex) => {
    const nftsToLoad = nftList.filter((nft, index) => {
      return (
        index >= startIndex && index < endIndex && nft.metadataTask.isPending()
      );
    });

    const promises = nftsToLoad.map((nft) => nft.metadataTask.run());
    await Promise.all(promises);
  };

  const changeCurrentPage = (operation) => {
    setLoading(true);
    if (operation === 'next') {
      setCurrentPage((prevValue) => prevValue + 1);
    } else {
      setCurrentPage((prevValue) => (prevValue > 1 ? prevValue - 1 : 1));
    }
  };

  const startNovel = (nft) => {
    console.log("it worked: " + nft.mint)
    alert("You have chosen: " + nft.name + ".\nPlease wait a minute for the visual novel to load.")
    navigate('/game')
  };

  return (
    // <div style={{backgroundImage: "url(/village_bedroom.png)" }}>
    <div>
      <Head>
        <title>Metaplex and Next.js example</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.walletdiv}>
      <WalletMultiButton />
      <WalletDisconnectButton />
      </div>
      <div className={styles.App}>
        
        <div className={styles.container}>
        
          <h1 className={styles.title}>Choose Your Character</h1>
             <div className={styles.nftForm}>
            {/* <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
            />  */}
            <button className={styles.styledButton} onClick={fetchNFTs}>
              Fetch Souls
            </button>
          </div>
          {loading ? (
            <img className={styles.loadingIcon} src="/loading.svg" />
          ) : (
            currentView &&
            currentView.map((nft, index) => (
              <div key={index} className={styles.nftPreview}>
                <h1>{nft.name}</h1>
                <img
                  className={styles.nftImage}
                  src={nft.metadata.image || '/fallbackImage.jpg'}
                  alt="The downloaded illustration of the provided NFT address."
                />
                <button onClick={() => startNovel(nft)}>Select NFT</button>
                {/* {console.log("nft address is: " + nft.address)} */}
              </div>
            ))
          )}
          {currentView && (
            <div className={styles.buttonWrapper}>
              <button
                disabled={currentPage === 1}
                className={styles.styledButton}
                onClick={() => changeCurrentPage('prev')}
              >
                Prev Page
              </button>
              <button
                disabled={nftList && nftList.length / perPage === currentPage}
                className={styles.styledButton}
                onClick={() => changeCurrentPage('next')}
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
