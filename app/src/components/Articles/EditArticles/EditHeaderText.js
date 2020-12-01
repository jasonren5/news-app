import React, { useState } from 'react';

import {
    Typography,
    TextField,
    Button,
    IconButton,
    CardActions,
    Card,
    CardContent
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';

import EditIcon from '@material-ui/icons/Edit';

import { CSSTransition } from 'react-transition-group';


const useStyles = makeStyles((theme) => ({
    root: {
        zIndex: "-1"
    },
    title: {
        margin: "1rem",
        fontWeight: "bold",
    },
    editField: {
        width: "100%",
        height: "200%",
    },
    highlightWrapper: {
        position: "relative",
        marginTop: "1rem",
        padding: ".25rem",
        borderRadius: "8px",
        transition: ".5s ease",
        zIndex: "200",
        "&:hover": {
            background: "#8eacbb",
        },
    },
    wrapper: {
        // position: "relative",
        margin: "1rem",
        padding: ".5rem",
    },
    editButtonWrapper: {
        position: "absolute",
        top: 0,
        right: 0,
    },
    submitButton: {
        color: theme.palette.success.main
    },
    cancelButton: {
        color: theme.palette.error.main
    },
}));

// TODO: Deal with merge conflicts
export default function EditHeaderText(props) {
    const theme = useTheme();
    const classes = useStyles(theme);

    const [titleHover, setTitleHover] = useState(false);
    const [titleEdit, setTitleEdit] = useState(false);
    const [editValue, setEditValue] = useState(props.title);

    const handleSubmitEdit = () => {
        // TODO: Jason: Firebase function to deal with an updated title
        console.log("submit edit");
    };

    const handleChange = (event) => {
        setEditValue(event.target.value);
    };

    return (
        <div className={classes.root}>
            {titleEdit ?
                <Card className={classes.wrapper}>
                    <CardContent>
                        <TextField
                            id="edit-header-title"
                            label="Edit Title"
                            multiline
                            // disabled={this.state.merging}
                            rowsMax={10}
                            value={editValue}
                            onChange={handleChange}
                            className={classes.editField}
                        />
                    </CardContent>
                    <CardActions>
                        <Button
                            component="span"
                            onClick={handleSubmitEdit}
                            aria-label="submit-edit"
                            className={classes.submitButton}
                        >
                            Submit Changes
                        </Button>
                        <Button
                            component="span"
                            onClick={() => setTitleEdit(false)}
                            aria-label="cancel-edit"
                            className={classes.cancelButton}
                        >
                            Cancel
                        </Button>
                    </CardActions>
                </Card>
                :
                <div
                    className={classes.highlightWrapper}
                    onMouseEnter={() => setTitleHover(true)}
                    onMouseLeave={() => setTitleHover(false)}
                >
                    <Typography variant="h4" className={classes.title} >{props.title}</Typography>
                    <CSSTransition
                        in={titleHover}
                        classNames="fade"
                        timeout={200}
                        unmountOnExit
                    >
                        <div className={classes.editButtonWrapper} >
                            <IconButton
                                onClick={() => setTitleEdit(true)}
                                aria-label="edit-title"
                                color="secondary"
                            >
                                <EditIcon />
                            </IconButton>
                        </div>
                    </CSSTransition>
                </div>
            }
        </div>

    );
}