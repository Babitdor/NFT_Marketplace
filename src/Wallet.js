import React, { Component } from 'react';
import { getWeb3, getInstance}  from "./Web3Util";
import AppNav from './AppNav';
import './css/Wallet.css';
import meta from './assets/meta.png'


export class Wallet extends Component {
  constructor(props) {
        super(props);
        this.state = {
            hasData: false,
            message: "",
            rows:[],
            columns: [],
            // image data
            tokenIds: [],
            title: [],
            desc: [],
            price: [],
            publishDate: [],
            author: [],
            image: [],
            status:[],
            total: 0,

            user: '',
            balance: 0,
            contractInstance: '',
            networkId:'',
            networkType:'',
        // for reselling the art
            sellTokenId: '',            
            sellPrice:0,
            showModal: false
        };
        this.changeHandler = this.changeHandler.bind(this);
    }

    resetPendingArts() {
        this.setState({ 
        tokenIds: [],
        title: [],
        desc: [],
        price: [],
        publishDate: [],
        author: [],
        image: [],
        status:[],
        total: 0
        });
    }

        // gets automatically called
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
        await this.loadMyFinxterArts(web3);
  }

      async loadMyFinxterArts(web3) {  // only load arts that belong to me as a owner

        try {
            let ids;
            const result = await this.state.contractInstance.methods.findMyFinxterArts().call();
            ids = result[0];
            let _total = ids.length;
            if(ids && _total>0) {
                let row;
                if(_total<=3) {
                    row = 1;
                } 
                else {
                row = Math.ceil(_total/3);
                }
                let columns = 3;
                this.setState({ rows: [], columns: [] });
                let rowArr = Array.apply(null, {length: row}).map((currentElement, i) => i);
                let colArr = Array.apply(null, {length: columns}).map((currentElement, i) => i);
                this.setState({ rows: rowArr, columns: colArr });
                let _tokenIds= [], _title =[],  _desc= [], _price= [], _publishDate= [],  _image =[], _author=[], _status=[];
                let idx =0;
                this.resetPendingArts();

                for(let i = 0; i<row; i++) {
                    for(let j = 0; j < columns; j++) {
                    if(idx<_total) {
                        let tokenId= ids[idx];
                        const art = await this.state.contractInstance.methods.findFinxterArt(tokenId).call();
                        const priceInEther = web3.utils.fromWei(art[3], 'ether');
                       _tokenIds.push(art[0]);
                       _title.push(art[1]);
                       _desc.push(art[2]);

                       if(art[4]==='1') {
                          _status.push("Currently in Store");
                        } else {
                       _status.push("In Wallet");
                       }
                
                      _price.push(priceInEther);
                      _publishDate.push(art[5]);
                      _image.push(art[9]);
                      _author.push(art[6]);
                    }
                    idx++;
                   }
                } // end of for loop

                this.setState({ 
                    tokenIds: _tokenIds,
                    title: _title,
                    desc: _desc,
                    price: _price,
                    publishDate: _publishDate,
                    author: _author,
                    image: _image,
                    total: _total,
                    status:_status
                });
              
                this.setState({ hasData: true });
            }  // end of if
          else
          {
            this.setState({ hasData: false });
          }

        } catch (e) {console.log('Error', e)}

    } // end of loadMyFinxterArts


    changeHandler = event => {
        this.setState({
            [event.target.name]: event.target.value
            }, function(){ })
    };

  // helper function called when we want to resell - republish.
  sellArt(tokenId) {
    try {
        this.setState({ sellTokenId: tokenId, showModal: true });
    } catch (e) {console.log('Error', e)}
  };

     // resell art
    async submitArtSell() {
        try {
            const priceInWei =  window.web3.utils.toWei(this.state.sellPrice, 'ether');
            await this.state.contractInstance.methods.resellFinxterArt(this.state.sellTokenId, priceInWei).send({
            from: this.state.user, gas: 6000000
        })
        window.location.reload(); 
        } catch (e) {console.log('Error', e)}
    };


  render() {

    
    if (this.state.hasData) {
            return (
                <div className="App">
                  <AppNav/>
                  <h5 className="Title-inventory">INVENTORY</h5>
                    <div className="walletinfo">
                        <img src={meta} alt="" className='meta-logo'/>
                        <div className="col-md-2 mb-md-0 mb-1"></div>
                            <div className="col-md-8 mb-md-0 mb-1">
                                <div className="card">
                                    <div className="card-body ">
                                    <div style={{display:'flex', alignItems:'center', justifyContent:'center',flexDirection:'column',padding:30}}>
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">My Address:</span> {this.state.user}
                                        </div>
                                        <div style={{padding:10}}>
                                            <span className="font-weight-bold blue-grey-text">NetworkId:</span> {this.state.networkId}
                                        </div>
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">Balance:</span> {this.state.balance} (ETH)
                                        </div>
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">NetworkType:</span> {this.state.networkType}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>
                        <div className="col-md-2 mb-md-0 mb-1"></div>
                    </div>



                    <div id="submitModal" tabIndex="-1" role="dialog" aria-labelledby="submitModalLabel"  aria-hidden="true">
                        {this.state.showModal ? <div className="modal-dialog" role="document">
                            <div>
                                <div>
                                    <h5 className="TitleSell" id="myLabel">Sell Art</h5>
                                    <button type="button" className="btn-container" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">Close</span>
                                    </button>
                                </div>
                            <div>
                                <input className="form-fieldresell" id="sellPrice" name="sellPrice"  type="text" placeholder="Price (ether)"  onChange={this.changeHandler}  value={this.state.sellPrice}/>
                            </div>
                                <div>
                                     <button type="button" className="btn-container" data-dismiss="modal" onClick={e => (this.submitArtSell())}>Submit</button>
                                </div>
                            </div>
                        </div>:''
                        }
                    </div>
                    



                    
                    {this.state.rows.map((row, i) =>
                        <div  className='walletpage' key={i}>
                        {this.state.columns.map((col, j) =>
                            <div key={j}>
                                { i*3+j < this.state.total &&
                                    <div className="card-layout_inventory">

                                            <div>
                                            <div><img className='img-display' src={this.state.image[i*3+j]} alt="Sample"/></div>
                                                <div className='desc-container'>
                                            
                                                <div className="text">TokenId: {this.state.tokenIds[i*3+j]}</div>
                                                <h5 className="text">Title: {this.state.title[i*3+j]}</h5>
                                                <p className="text"> {this.state.price[i*3+j]} (ether)</p>
                                                <p>by <span className="text">{this.state.author[i*3+j]}</span>, {this.state.publishDate[i*3+j]}</p>
                                    
                                                <p className="text">{this.state.desc[i*3+j]}</p>
                                                <p className="store">{this.state.status[i*3+j]}</p>
                                                { 
                                                this.state.status[i*3+j]==='In Wallet' && <button className="btn-container" data-toggle="modal" onClick={e => (this.sellArt(this.state.tokenIds[i*3+j]))} data-target=".sell-modal" >Publish</button>
                                                }
                                                </div>
                                            </div>
                                </div>
                                }
                            </div>
                        )}
                        </div>
                    )}


                    


                    
                
              </div>

            );
    }
    else 
    {  // case if no art is available
        return (
                <div className="App">
                <AppNav></AppNav>
                {/* <section className="text-center">
                <div className="row mb-3 mt-3">
                        <div className="col-md-2 mb-md-0 mb-1"></div>
                            <div className="col-md-8 mb-md-0 mb-1">
                                <div className="card">
                                    <div className="card-body ">
                                    <div className="row">
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">My Address:</span> {this.state.user}
                                        </div>
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">NetworkId:</span> {this.state.networkId}
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">Balance:</span> {this.state.balance} (ether)
                                        </div>
                                        <div className="col-md-6 mb-md-0">
                                            <span className="font-weight-bold blue-grey-text">NetworkType:</span> {this.state.networkType}
                                        </div>
                                    </div>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-2 mb-md-0 mb-1"></div>
                        </div>

                </section> */}
                </div>

        );
    }
  }
}

export default Wallet;
