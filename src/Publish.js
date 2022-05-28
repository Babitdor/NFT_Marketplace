import React, { Component } from 'react';
import { getWeb3, getInstance}  from "./Web3Util";
import AppNav from './AppNav';
import Web3 from 'web3';
import './css/Publish.css';
import MemoryToken from './abi/MemoryToken.json'


export class Publish extends Component {
      constructor(props) {
        super(props);
        this.state = { 
            imageValue: 'https://ipfs.infura.io/ipfs/QmXFm7SKZSJLYhR1L8HS1X2fAVTS6hsKveV8MQcfdGgSFK',
            description: '',
            title: '', 
            authorName: '',
            price: 0,
            date:'',
            user: '',
            balance: 0,
            contractInstance: '',
            tokenURIs:[],
            networkId:'',
            networkType:'',
        };
        this.imageChange = this.imageChange.bind(this); // change image
        this.submitHandler = this.submitHandler.bind(this); // called when we submit the form (i.e. publish)
        this.changeHandler = this.changeHandler.bind(this); // gets called when we edit the image/art form info
      }

    // gets called automatically after component creation
    componentDidMount = async () => {

        
        const web3 = await getWeb3();
        window.web3 = web3;
        const contractInstance = await getInstance(web3);
        window.user = (await web3.eth.getAccounts())[0];
        const balanceInWei = await web3.eth.getBalance(window.user);
        var balance = web3.utils.fromWei(balanceInWei, 'ether');
        const networkId = await web3.eth.net.getId();
        const networkType = await web3.eth.net.getNetworkType();
        this.setState({ user: window.user });
        this.setState({ balance: balance});
        this.setState({ contractInstance: contractInstance });
        this.setState({ networkId: networkId});
        this.setState({ networkType: networkType});
        await this.loadWeb3()
        await this.loadBlockchainData()
        
      }
    
      async loadWeb3() {
        if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.request({ method: 'eth_requestAccounts'});
        }
        else if (window.web3) {
          window.web3 = new Web3(window.ethereum.currentProvider)
        }
        else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      }
    
      async loadBlockchainData() {
        const web3 = window.web3
        const accounts = await web3.eth.getAccounts()
        const balances = await web3.eth.getBalance(accounts[0])/Math.pow(10,18)
        this.setState({ balance: balances })
        this.setState({ account: accounts[0] })
        
    
        
        // Load smart contract
        const networkData = MemoryToken.networks[await web3.eth.net.getId()]
        
        if(networkData) {
          const abi = MemoryToken.abi
          const address = networkData.address
          const token = new web3.eth.Contract(abi, address)
          this.setState({ token })
          const totalSupply = await token.methods.totalSupply().call()
          this.setState({ totalSupply })
          
          
          // Load Tokens
          let balanceOf = await token.methods.balanceOf(accounts[0]).call()
          for (let i = 0; i < balanceOf; i++) {
            let id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call()
            let tokenURI = await token.methods.tokenURI(id).call()
            
            const tokensIDs = tokenURI.substring(21, tokenURI.length)
            this.setState({
              tokenURIs: [...this.state.tokenURIs, tokensIDs]
            })
          }
          this.setState({ loading: false})
        } else {
          alert('Smart contract not deployed to detected network.')
        }
      }
    

      

      isNotEmpty(val) {
        return val && val.length>0;
    }
      // gets called when change in image occurs
      imageChange = (event) => {
        this.setState({ imageValue: event.target.value });
      };

      // get called when any update in the form
      changeHandler = event => {
        this.setState({
            [event.target.name]: event.target.value
            }, function(){ })
    };
      // gets called when we click publish option
      submitHandler = (event) => {
        event.preventDefault(); // react default function to be called
        const {  imageValue, description, title, authorName, price, date} = this.state;
        if(this.isNotEmpty(title) &&this.isNotEmpty(description) &&this.isNotEmpty(authorName) 
            &&this.isNotEmpty(date)&&this.isNotEmpty(imageValue) && this.isNotEmpty(price)) {
            const priceInWei =  window.web3.utils.toWei(price, 'ether');
            this.publishArt(title, description, date, authorName, priceInWei, imageValue);  
        }
    }; 

      async publishArt(title, description, date, authorName, price, imageValue) {
        try {
            console.log(this.state.contractInstance.methods)
            await this.state.contractInstance.methods.createNFTToken(title,description, date, authorName, price, imageValue).send({
                from: this.state.user
            })
            this.props.history.push(`/home`) // automatically move to home page after publishing
            window.location.reload(); 
        } catch (e) {console.log('Error', e)}
    }

    render() {
    return (
        <>
        
            <div className='App'>
            <AppNav></AppNav>
            <p className="Title-publish">PUBLISH</p>
            <section>
                <div className="row">
                    <div>
                        <div className="cards">
                            <div className="card-body">
                                <form className="text-center border border-light p-5" onSubmit={this.submitHandler}>
                                    
                                    
                                    <div className="row">
                                        <div className="Text-container">
                                        <div className='text-image'>
                                        <h5 className='walletcontents'>Wallet Contents</h5>
                                        <div><img className="NFT" alt="art" src={this.state.imageValue} /></div>
                                            
                                            <select className="Select" onChange={this.imageChange} value={this.state.imageValue}>
                                            {this.state.tokenURIs.map((tokenURI, key) => {
                                                return(
                                                <option value={tokenURI} key={key}>NFT{key+1}</option>
                                                )})}
                                            </select>
                                             
                                        </div>
                                        </div>  
                                        <div className='textinput'>
                                        <input className="form-field-1" id="title" name="title" type="text" placeholder="Title" onChange={this.changeHandler}  value={this.state.title}/>
                                        <input className="form-field-2" id="description" name="description"  type="text" placeholder="Description" onChange={this.changeHandler}  value={this.state.description}/>
                                        <input className="form-field-3" id="authorName" name="authorName" type="text" placeholder="Author Name" onChange={this.changeHandler}  value={this.state.authorName}/>
                                        <input className="form-field-4" id="date" name="date"  type="text" placeholder="Date" onChange={this.changeHandler}   value={this.state.date}/>
                                        <p className='Title-price'>Price in ETH</p>
                                        <input className="form-field-5" id="price" name="price"  type="text" placeholder="Price (ether)"  onChange={this.changeHandler}  value={this.state.price}/>
                                        <div><button className="button-layout" type="submit">PUBLISH</button></div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>


                    </div>
                    <div className="col-md-2 mb-md-0 mb-5"></div>
                </div>

            </section>

        </div>

        </>
    );  // end of render
  } 
} // end of publish

export default Publish;
