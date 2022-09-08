// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract LW3Punks is ERC721Enumerable, Ownable {
    using Strings for uint256;

    /**
    * 用于计算{tokenURI}的baseTokenURI,如果设置，每个代币的结果URI
    * 将是baseURI和tokenId的连接
    */
    string _baseTokenURI;
    //price 是一个LW3Punks NFT 的价格
    uint256 public _price = 0.01 ether;
    //pause用于在紧急情况下暂停合约
    bool public _paused;
    //最大数量的LW3Punks
    uint256 public maxTokenIds = 10;
    //铸造的代币总数
    uint256 public tokenIds;
   
    modifier onlyWhenNotPaused {
        require(!_paused, "Contract currently paused");
        _;
    }
    
    /**
    *  REC721构造函数接受一个“名称”和一个“缩写”到代币集合
    *  在哦我们的例子下，名称为LW3Punks, 缩写为LW3P
    *  LW3P的构造函数接受baseURI来设置集合的baseTokenURI
     */
    constructor (string memory baseURI) ERC721("LW3Punks", "LW3P") {
        _baseTokenURI = baseURI;
    }

    /**
    * mint 允许用户在每个事务中生成1个NFT
     */
    function mint() public payable onlyWhenNotPaused {
        require(tokenIds < maxTokenIds, "Exceed maximum LW3Punks supply");
        require(msg.value >= _price, "Ether sent is not coeerct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }
    
    /**
    *  baseURI 覆盖了OPenzeppelin的ERI721实现，
    *  默认情况下为baseURi返回一个空字符串
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    /**
    *  tokenURI覆盖了Openzeppelin的ERC721对tokenURI 函数的实现，
    *  该函数返回URI，从中我们可以提取给定tokenId的元数据（metadata）
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory){
        require(_exists(tokenId), "ERC721Metadata: URI query for monexistent token");
        string memory baseURI = _baseURI();
        //这里它检查baseURI 的长度是否大于0 ，如果大于0 则返回baseURI 并附加到tokenId和json上，
        //存储在IPFS的tokenid
        //如果baseURI为空返回一个空字符串
        return bytes(baseURI).length > 0 ? string(abi.encodePacked(baseURI,tokenId.toString(),".json")): "";
    }
    
    /**
      * 使合约暂停或取消暂停
     */
    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }

    /*
       将合约中的所有内容发送给合约的所有者
     */
    function withdraw() public onlyOwner {
        address _owner = owner();
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value: amount}("");
        require(sent, "Failed to sand Ether");
    }
   
   //数据为空，接收ether
    receive() external payable {}
   //数据不为空，调用后备功能
    fallback() external payable {}

}
