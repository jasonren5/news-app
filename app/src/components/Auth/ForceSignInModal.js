import React, { useState, useEffect } from 'react';

import { useHistory } from "react-router-dom";

import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@material-ui/core';

export default function ForceSignInModal(props) {
    const history = useHistory();

    const handleClose = () => {
        props.closeModal();
        if (props.accessPage) {
            history.goBack();
        }
    };

    const handleSignIn = () => {
        props.closeModal();
        history.push("/signin");
    }

    return (
        <Dialog
            open={props.isOpen}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">Sign In Required</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    You must be logged in to access {props.accessing ? props.accessing : "this functionality"}. Please log in {props.accessPage ? "or go back to another page" : "or go back to the page"}.
          </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSignIn} color="primary">
                    Sign In
          </Button>
                <Button onClick={handleClose} color="primary" autoFocus>
                    Go Back
          </Button>
            </DialogActions>
        </Dialog>
    );
}