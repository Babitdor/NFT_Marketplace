import React, { Component } from 'react'
import "./css/AppNav.css"
import { getWeb3, getInstance}  from "./Web3Util";
import logo from './assets/logo.png'
// import { withRouter} from 'react-router-dom';


export class AppNav extends Component {

    constructor(props) {
      super(props); // compulsory call for all class constructors
      this.state = {
            name: '',
            symbol: ''
        };
    }

    // called automatically after component initialisation
    // set symbol and name
    componentDidMount = async () => {
      const web3 = await getWeb3();
      const contractInstance = await getInstance(web3);
      window.user = (await web3.eth.getAccounts())[0];
      const symbol = await contractInstance.methods.get_symbol().call()
      this.setState({ symbol: symbol });
      const name = await contractInstance.methods.get_name().call();
      this.setState({ name: name });
  }


  render() {
    return (
    <>
            <nav className="Nav">
                <div className="navbar-brand">  
                     
                    <strong><img src={logo} className="img-logo" alt=""/></strong>  
                      
                </div> 
                
                
            </nav>
            <nav className='Navigation'>
                    
                    <div><a className="link" href="/"> STORE</a></div>
                    <div><a className="link" href="/publishArt"> PUBLISH</a></div>
                    <div><a className="link" href="/mywallet"> INVENTORY </a></div>
                    
                </nav>
    </>
    );
  }
} // end of component

export default AppNav;
