import React, { Component } from 'react';
import { getWeb3, getInstance}  from "./Web3Util";
import AppNav from './AppNav';
import './css/Publish.css';


export class Publish extends Component {
      constructor(props) {
        super(props);
        this.state = { 
            imageValue: 'https://ipfs.infura.io/ipfs/QmYrKanedczhqUaKDwvDUWPm5RTutHq7uErUSrun29ipQA',
            description: '',
            title: '', 
            authorName: '',
            price: 0,
            date:'',
            user: '',
            balance: 0,
            contractInstance: '',
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
            await this.state.contractInstance.methods.createFinxterToken(title,description, date, authorName, price, imageValue).send({
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
                                        
                                        <div><img className="NFT" alt="art" src={this.state.imageValue} /></div>
                                            <select className="Select" onChange={this.imageChange} value={this.state.imageValue}>
                                                <option value="https://ipfs.infura.io/ipfs/QmYrKanedczhqUaKDwvDUWPm5RTutHq7uErUSrun29ipQA">NFT1</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmQh3vL7vhXdwTLHUQkNrLpTMjQEgCndAUCdEivEx3bsvL">NFT2</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmQFaVFKc2MTbLXFvdsZhE76Lu5PdyHPkBBMGZn79mFW3D">NFT3</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmTJVoAyB1cf6vtPgSy5WVtvoVDtKSBXVowSJVvUzLYSt5">NFT4</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmVUuUUEtoKrCtxD8JnS8gYzK5Z7WAxRAzTgdswM6QBiCf">NFT5</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmZrAArt8Hsc3KqcT854Wbb9Htp8MmEvpc9ueu9khWXtSe">NFT6</option>
                                                <option value="https://ipfs.infura.io/ipfs/QmairsmBvvs1uFYS92Uwbsb7BhK9GQT6MSmyghEHrQiBbj">NFT7</option>
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
