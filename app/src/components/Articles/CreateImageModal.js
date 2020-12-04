import React, { useState, useEffect } from 'react';

import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    submitButton: {
        color: theme.palette.success.main
    },
    cancelButton: {
        color: theme.palette.error.main
    },
}));

const INITIAL_STATE = {
    editValue: "",
    publishingChanges: false,
};

export default function CreateImageModal(props) {
    const theme = useTheme();
    const classes = useStyles(theme);

    const [state, setState] = useState({
        ...INITIAL_STATE
    });

    useEffect(() => {
        setState(prevState => ({
            ...prevState,
            editValue: "",
            publishingChanges: false,
        }));
    }, [props.isOpen]);

    const handleChange = event => {
        const { id, value } = event.target;

        setState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const handleSubmit = () => {
        console.log("here2");
        props.handleSubmitModal(state.editValue)
    };

    //eslint-disable-next-line
    const isInvalid = state.editValue === '' || (state.editValue && !/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|jpeg|gif|png)/gi.test(state.editValue));

    // TODO: Allow for direct uploads of images

    return (
        <Dialog open={props.isOpen} onClose={props.closeModal} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Create Image Section</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To create an image, please submit a new URL ending in <i>.jpg</i> or <i>.png</i>.
          </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    id="editValue"
                    type="url"
                    onChange={handleChange}
                    label="Image URL"
                    fullWidth
                    disabled={state.merging}
                    required
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSubmit} className={classes.submitButton} disabled={isInvalid}>
                    {state.publishingChanges
                        ? <CircularProgress size={20} color="primary" />
                        : 'Create Section'
                    }
                </Button>
                <Button onClick={props.closeModal} className={classes.cancelButton}>
                    Cancel
                 </Button>
            </DialogActions>
        </Dialog>
    );
}