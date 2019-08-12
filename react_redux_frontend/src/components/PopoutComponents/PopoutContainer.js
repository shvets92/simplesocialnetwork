import React from 'react';
import connect from 'react-redux/es/connect/connect';
import PropTypes from 'prop-types';
import compose from 'recompose/compose';

import Popper from '@material-ui/core/Popper';

import {withStyles} from '@material-ui/core/styles';

const styles = theme => ({
    popper: {
        zIndex: 1200,
        '&[x-placement*="bottom"] $arrow': {
            top: 0,
            left: 0,
            marginTop: '-0.9em',
            width: '3em',
            height: '1em',
            '&::before': {
                borderWidth: '0 1em 1em 1em',
                borderColor: `transparent transparent #ffffff transparent`,
            },
        },
        '&[x-placement*="top"] $arrow': {
            bottom: 0,
            left: 0,
            marginBottom: '-0.9em',
            width: '3em',
            height: '1em',
            '&::before': {
                borderWidth: '1em 1em 0 1em',
                borderColor: `#ffffff transparent transparent transparent`,
            },
        },
        '&[x-placement*="right"] $arrow': {
            left: 0,
            marginLeft: '-0.9em',
            height: '3em',
            width: '1em',
            '&::before': {
                borderWidth: '1em 1em 1em 0',
                borderColor: `transparent #ffffff transparent transparent`,
            },
        },
        '&[x-placement*="left"] $arrow': {
            right: 0,
            marginRight: '-0.9em',
            height: '3em',
            width: '1em',
            '&::before': {
                borderWidth: '1em 0 1em 1em',
                borderColor: `transparent transparent transparent #ffffff`,
            },
        },
    },
    arrow: {
        position: 'absolute',
        fontSize: 8,
        width: '3em',
        height: '3em',
        '&::before': {
            content: '""',
            margin: 'auto',
            display: 'block',
            width: 0,
            height: 0,
            borderStyle: 'solid',
        },
    }
});

const mapStateToProps = state => ({
    anchorEl: state.popout.anchorElement,
    content: state.popout.content,
    offset: state.popout.offset,
    trigger: state.popout.trigger,
    displayPage: state.navigation.displayPage,
    isLoggedIn: state.accountAccess.isLoggedIn
});

class PopoutContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            trigger: false,
            popoutRef: null,
            arrowRef: null,
        };

        this.open = false;
        this.anchorEl = null;
        this.content = null;
        this.offset = 0;

        this.setArrowRef = this.setArrowRef.bind(this);
        this.setPopoutRef = this.setPopoutRef.bind(this);
        this.startClickListening = this.startClickListening.bind(this);
        this.stopClickListening = this.stopClickListening.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.trigger !== this.props.trigger) {
            if (this.anchorEl === this.props.anchorEl) {
                this.open = !this.open;
            } else {
                this.open = true;
            }

            this.anchorEl = this.props.anchorEl;
            this.content = this.props.content;
            this.offset = this.props.offset;

            this.setState({
                trigger: !this.state.trigger
            })
        }
        if(this.open && prevProps.displayPage !== this.props.displayPage) {
            this.open = false;
            this.setState({
                trigger: !this.state.trigger,
            });
        }
        if(!this.props.isLoggedIn) {

                this.open = false;
                this.anchorEl = null;
                this.content = null;
                this.offset = 0;
        }
    }

    setArrowRef = node => {
        this.setState({
            arrowRef: node
        })
    };
    setPopoutRef = node => {
        this.setState({
            popoutRef: node
        })
    };

    startClickListening = () => {
        document.addEventListener('mouseup', this.handleClick, false);
    };
    stopClickListening = () => {
        document.removeEventListener('mouseup', this.handleClick, false);
    };
    handleClick = (e) => {
        if (this.state.popoutRef.contains(e.target) || this.anchorEl.contains(e.target)) {
            return;
        }

        this.open = false;
        this.setState({
            trigger: !this.state.trigger,
        });
    };

    render() {
        const classes = this.props.classes;

        if (this.open) {
            this.startClickListening();
        } else {
            this.stopClickListening();
        }

        return (
            <div ref={this.setPopoutRef}>
                <Popper
                    open={this.open}
                    anchorEl={this.anchorEl}
                    placement="bottom-end"
                    disablePortal={true}
                    className={classes.popper}
                    modifiers={{
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'scrollParent',
                        },
                        arrow: {
                            enabled: true,
                            element: this.state.arrowRef,
                        },
                        offset: {
                            enabled: true,
                            offset: this.offset
                        }
                    }}
                >
                    <span className={classes.arrow} ref={this.setArrowRef}/>
                    {this.content}
                </Popper>
            </div>
        );
    }
}

PopoutContainer.propTypes = {
    classes: PropTypes.object.isRequired,
    anchorEl: PropTypes.any,
    offset: PropTypes.number,
    content: PropTypes.any,
    trigger: PropTypes.bool.isRequired,
    displayPage: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.bool.isRequired
};

export default compose(withStyles(styles), connect(mapStateToProps, null))(PopoutContainer);