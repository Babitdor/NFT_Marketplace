//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";


contract Marketplace is ERC721 {
    struct Art {
        uint256 id;
        string title;
        string description;
        uint256 price;
        string date;
        string authorName;
        address payable author;
        address payable owner;
        // 1 means token has sale status (or still in selling) and 0 means token is already sold,
        // ownership transferred and moved to off-market gallery
        uint256 status;
        string image;
    }

    struct ArtTxn {
        uint256 id;
        uint256 price;
        address seller;
        address buyer;
        uint256 txnDate;
        uint256 status;
    }

    uint256 private pendingArtCount; // gets updated during minting(creation), buying and reselling
    mapping(uint256 => ArtTxn[]) private artTxns;
    uint256 public index; // uint256 value; is cheaper than uint256 value = 0;.
    Art[] public arts;

    event LogArtSold(
        uint256 _tokenId,
        string _title,
        string _authorName,
        uint256 _price,
        address _author,
        address _current_owner,
        address _buyer
    );
    event LogArtTokenCreate(
        uint256 _tokenId,
        string _title,
        string _category,
        string _authorName,
        uint256 _price,
        address _author,
        address _current_owner
    );
    event LogArtResell(uint256 _tokenId, uint256 _status, uint256 _price);

    constructor(string memory name, string memory symbol)
        ERC721(name, symbol)
    {}

    /* Create or minting the token */
    function createNFTToken(
        string memory _title,
        string memory _description,
        string memory _date,
        string memory _authorName,
        uint256 _price,
        string memory _image
    ) public {
        require(bytes(_title).length > 0, "The title cannot be empty");
        require(bytes(_date).length > 0, "The Date cannot be empty");
        require(
            bytes(_description).length > 0,
            "The description cannot be empty"
        );
        require(_price > 0, "The price cannot be empty");
        require(bytes(_image).length > 0, "The image cannot be empty");

        Art memory _art = Art({
            id: index,
            title: _title,
            description: _description,
            price: _price,
            date: _date,
            authorName: _authorName,
            author: payable(msg.sender),
            owner: payable(msg.sender),
            status: 1,
            image: _image
        });

        arts.push(_art); // push to the array
        uint256 tokenId = arts.length - 1; // array length -1 to get the token ID = 0, 1,2 ...
        _safeMint(msg.sender, tokenId);
        emit LogArtTokenCreate(
            tokenId,
            _title,
            _date,
            _authorName,
            _price,
            msg.sender,
            msg.sender
        );
        index++;
        pendingArtCount++;
    }

   
    function buyNFTArt(uint256 _tokenId) public payable {
        (
            uint256 _id,
            string memory _title,
            ,
            uint256 _price,
            uint256 _status,
            ,
            string memory _authorName,
            address _author,
            address payable _current_owner,

        ) = findNFTArt(_tokenId);
        require(_current_owner != address(0));
        require(msg.sender != address(0));
        require(msg.sender != _current_owner);
        require(msg.value >= _price);
        require(arts[_tokenId].owner != address(0));

        _safeTransfer(_current_owner, msg.sender, _tokenId, ""); // transfer ownership of the art
        //return extra payment
        if (msg.value > _price)
            payable(msg.sender).transfer(msg.value - _price);
        //make a payment to the current owner
        _current_owner.transfer(_price);

        arts[_tokenId].owner = payable(msg.sender);
        arts[_tokenId].status = 0;

        ArtTxn memory _artTxn = ArtTxn({
            id: _id,
            price: _price,
            seller: _current_owner,
            buyer: msg.sender,
            txnDate: block.timestamp,
            status: _status
        });

        artTxns[_id].push(_artTxn);
        pendingArtCount--;
        emit LogArtSold(
            _tokenId,
            _title,
            _authorName,
            _price,
            _author,
            _current_owner,
            msg.sender
        );
    }

    /* Pass the token ID and get the art Information */
    function findNFTArt(uint256 _tokenId)
        public
        view
        returns (
            uint256,
            string memory,
            string memory,
            uint256,
            uint256 status,
            string memory,
            string memory,
            address,
            address payable,
            string memory
        )
    {
        Art memory art = arts[_tokenId];
        return (
            art.id,
            art.title,
            art.description,
            art.price,
            art.status,
            art.date,
            art.authorName,
            art.author,
            art.owner,
            art.image
        );
    }

   
    function resellNFTArt(uint256 _tokenId, uint256 _price) public payable {
        require(msg.sender != address(0));
        require(isOwnerOf(_tokenId, msg.sender));
        arts[_tokenId].status = 1;
        arts[_tokenId].price = _price;
        pendingArtCount++;
        emit LogArtResell(_tokenId, 1, _price);
    }

    /* returns all the pending arts (status =1) back to the user */
    function findAllPendingArt()
        public
        view
        returns (
            uint256[] memory,
            address[] memory,
            address[] memory,
            uint256[] memory
        )
    {
        if (pendingArtCount == 0) {
            return (
                new uint256[](0),
                new address[](0),
                new address[](0),
                new uint256[](0)
            );
        }

        uint256 arrLength = arts.length;
        uint256[] memory ids = new uint256[](pendingArtCount);
        address[] memory authors = new address[](pendingArtCount);
        address[] memory owners = new address[](pendingArtCount);
        uint256[] memory status = new uint256[](pendingArtCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < arrLength; ++i) {
            Art memory art = arts[i];
            if (art.status == 1) {
                ids[idx] = art.id;
                authors[idx] = art.author;
                owners[idx] = art.owner;
                status[idx] = art.status;
                idx++;
            }
        }

        return (ids, authors, owners, status);
    }

    /* Return the token ID's that belong to the caller */
    function findMyNFTArts()
        public
        view
        returns (uint256[] memory _myArts, uint256 tokens)
    {
        require(msg.sender != address(0));
        uint256 numOftokens = balanceOf(msg.sender);
        if (numOftokens == 0) {
            return (new uint256[](0), 0);
        } else {
            uint256[] memory myArts = new uint256[](numOftokens);
            uint256 idx = 0;
            uint256 arrLength = arts.length;
            for (uint256 i = 0; i < arrLength; i++) {
                if (ownerOf(i) == msg.sender) {
                    myArts[idx] = i;
                    idx++;
                }
            }
            return (myArts, numOftokens);
        }
    }

    /* return true if the address is the owner of the token or else false */
    function isOwnerOf(uint256 tokenId, address account)
        public
        view
        returns (bool)
    {
        address owner = ownerOf(tokenId);
        require(owner != address(0));
        return owner == account;
    }
     function get_symbol() external view returns (string memory) {
        return symbol();
    }

    function get_name() external view returns (string memory) {
        return name();
    }
}
