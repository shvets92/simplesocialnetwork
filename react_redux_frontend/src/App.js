import React, {Component} from 'react';
import './App.css';
import {Provider} from 'react-redux';
import store from './store';
import PropTypes from 'prop-types';
import {MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import theme from './appTheme';
import CssBaseline from '@material-ui/core/CssBaseline';

import DisplayArea from './components/Display/DisplayArea';
import NavigationHeader from './components/HeaderComponents/Header';
import PopoutContainer from './components/PopoutComponents/PopoutContainer';
import ImageFetcher from "./components/ImageComponents/ImageFetcher";

const styles = theme =>({
    headerMargin: {
        marginTop: 70
    },
    backgroundColor: theme.palette.background
});

class App extends Component {

    render() {
        return (
            <Provider store={store}>
                <MuiThemeProvider theme={theme}>
                    <CssBaseline/>
                    <div className="App">
                        <NavigationHeader/>
                        <div className={this.props.classes.headerMargin}/>
                        <DisplayArea/>
                        <PopoutContainer/>
                        <ImageFetcher/>
                    </div>
                </MuiThemeProvider>
            </Provider>
        );
  }
}

App.propTypes = {
    classes: PropTypes.object.isRequired
};

export default withStyles(styles)(App);
