import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'
import{providers, Contract, utils } from "ethers"
import Web3Modal from "web3modal";
import { NFT_CONTRACT_ADDRESS, abi} from '../contents'

export default function Home() {
  //跟踪已生成的代币数量
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  //跟踪是否在加载
  const [loading ,setLoading] = useState(false);
  //跟踪钱包是否连接
  const [walletConnect, setWalletConnect] = useState(false);
  //跟踪整个页面是否打开
  const web3ModalRef = useRef();

  /**
   * 公开铸币
   */
  const publicMint = async () => {
    try {
      console.log("Public mint");
      //需要签名
      const signer = await getProviderorSinger(true);
      //创建一个带签名的合约实例，这允许更新方法
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      //从合约中调用铸币厂来制造LW3Punks
      const tx = await nftContract.mint({
        //value表示一个LW3Punks的价值为0.01eth
        //我们使用ether.js库将0.01字符串解析为ether
        value: utils.parseEther("0.01"),
      });
      //等待交易被加载
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("Your successfully minted a LW3Punk!")

    } catch (err) {
      console.error(err);
    }
  };

  /**
   * 获取已铸造的代币数量
   */
  const getTokenIdsMinted = async () => {
    try {
      //从web3Modal获取Provider ,在这里是MetaMask
      //不需要签名。因为我们只从区块链读取状态
      const provider = await getProviderorSinger();
      //我们使用provider连接到合约，所有我们将对合约只有只读访问权限
      const nftContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        provider
      );
      //从合约中调用tokenids
      const _tokenIds = await nftContract.tokenIds();
      console.log("TOkenIds",_tokenIds);
      //tokrmids是一个BigNumber，我们需要将BigNumber转换为字符串
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * 连接钱包
   */
  const connectWallet = async () => {
    try {
      await getProviderorSinger();
      setWalletConnect(true);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 判断是Provider or signer(需要签名)
   * 查看网络是否连接上Mumbai
   */
  const getProviderorSinger = async (needSigner = false) => {
     const provider = await web3ModalRef.current.connect();
     const web3Provider = new providers.Web3Provider(provider)
     const {chainId} = await web3Provider.getNetwork();
     if(chainId !== 80001){
      window.alert("Change the network to Mumbai");
      throw new Error("Change the network to Mumbai");
     }

     if(needSigner){
      const signer = web3Provider.getSigner();
      return signer
     }
     return web3Provider;
    };

  /**
   * 监控页面状态的变化
   */
  useEffect(() => {
    //如果钱包没连接，创建一个W二八Modal新实例，并连接钱包
    if(!walletConnect){
      //通过设置引用对象Current值来分配Web3odal
      //只要页面打开，current值就会一直保持
      web3ModalRef.current = new Web3Modal({
        network:"mumbai",
        providerOptions:{},
        disableInjectedProvider:false,
      });

      connectWallet();

      getTokenIdsMinted();
      //设置一个间隔来获取每5秒生成的代币数量
      setInterval(async function () {
        await getTokenIdsMinted();
      },5 * 1000);
    }
  },[walletConnect]) ;

  const renderButton = () => {
    if(!walletConnect){
      return(
        <button onClick={connectWallet} className={styles.button}>
          Connect your wallet!
        </button>
      );
    }

    if(loading) {
      return <button className={styles.button}>Loading...</button>
    }

    return (
      <button className={styles.button} onClick={publicMint}>
        Public Mint 🚀
      </button>
    );
  };

  return (
    <div>
      <Head>
        <title>LW3Punks</title>
        <meta name='description' content='LW3Punks-Dapp'/>
        <link rel='icon' href='/favicon.ico'/>
      </Head>
      <div className={styles.main}>
        <div>
          <h1 className={styles.title}>Welcome t LW3Punks!</h1>
          <div className={styles.description}>
            Its an NFT collection for LearnWeb3 students.
          </div>
          <div className={styles.description}>
              {tokenIdsMinted}/10 have been minted
          </div>
          {renderButton()}
        </div>
        <div>
          <img className={styles.image} src="./LW3Punks/1.png"/>
        </div>
      </div>

      <footer className={styles.footer}>
        Make with by LW3Punks
      </footer>
    </div>
  )
}
