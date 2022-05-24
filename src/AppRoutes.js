import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";
import Home from './Home';
import Publish from './Publish';
import Wallet from './Wallet';

export class AppRoutes extends Component {
  render() {
    return (
      <Switch>
                <Route exact path="/" component={Home} />
                <Route exact path="/home"  component={Home} />
                <Route exact path="/publishArt" component={Publish}/>
                <Route exact path="/mywallet" component={Wallet}/>
                <Route
                    render={function() {
                        return <h1>Not Found</h1>;
                    }}
                />
    </Switch>
    );
  }
}

export default AppRoutes;
