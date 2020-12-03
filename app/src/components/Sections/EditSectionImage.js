import React, { useState } from 'react';
import { IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';

import EditImageModal from '../Articles/EditArticles/EditImageModal';

import { CSSTransition } from 'react-transition-group';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    image: {
        width: "100%",
        borderRadius: "8px",
        transition: ".5s ease",
    },
    wrapper: {
        position: "relative",
        margin: "1rem",
        "&:hover": {
            "& img": {
                opacity: "0.3",
            }
        },
    },
    editButton: {
        position: "absolute",
        top: 0,
        right: 0,
        opacity: "1.0",
    },
}));

export default function EditSectionImage(props) {
    const classes = useStyles();
    const [imageHover, setImageHover] = useState(false);
    const [imageEdit, setImageEdit] = useState(false);
    const [section, setSection] = useState(props.section);

    const openEditImageModal = () => {
        setImageEdit(true);
    };

    const closeEditImageModal = () => {
        setImageEdit(false);
    };

    const handleUpdateImage = section => {
        setSection(section);
        closeEditImageModal();
    }

    return (
        <div className={classes.root}>
            {section &&
                <div
                    className={classes.wrapper}
                    onMouseOver={() => setImageHover(true)}
                    onMouseOut={() => setImageHover(false)}
                >
                    <img src={section.body} alt={section.alt_text} className={classes.image} />
                    <CSSTransition
                        in={imageHover}
                        classNames="fade"
                        timeout={200}
                        unmountOnExit
                    >
                        {
                            <div className={classes.editButton} >
                                <IconButton
                                    onClick={openEditImageModal}
                                    aria-label="edit-title"
                                    color="secondary"
                                >
                                    <EditIcon />
                                </IconButton>
                            </div>
                        }
                    </CSSTransition>
                </div>
            }
            <EditImageModal isOpen={imageEdit} closeModal={closeEditImageModal} updateImage={handleUpdateImage} section={props.section} />
        </div>
    );
}