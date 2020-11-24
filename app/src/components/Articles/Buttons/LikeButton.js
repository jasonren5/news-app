import React from 'react';

import { toggleLikeByArticleID } from '../../../utils/functions/articles';
import { withFirebase } from '../../../utils/firebase';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';

import IconButton from '@material-ui/core/IconButton';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';
import FavoriteIcon from '@material-ui/icons/Favorite';

class LikeButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            numLikes: this.props.liked_users.length
        }
        this.toggleLike = this.toggleLike.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {
        const user = this.props.firebase.doGetCurrentUser();
        const user_id = (user ? user.uid : null);
        if (this.props.liked_users.includes(user_id)) {
            this.setState({
                liked: true
            })
        }
    }

    handleClick() {
        if (this.props.firebase.auth.currentUser) {
            this.toggleLike();
        }
        else {
            const { history } = this.props;
            history.push('/signin');
        }
    }

    toggleLike() {
        this.setState({
            liked: !this.state.liked,
            numLikes: (this.state.liked ? this.state.numLikes - 1 : this.state.numLikes + 1)
        });

        toggleLikeByArticleID(this.props.firebase, this.props.article_id).then((res) => {
            if (res.error) {
                console.log("Error toggling like!");
                this.setState({
                    liked: !this.state.liked,
                    numLikes: (this.state.liked ? this.state.numLikes - 1 : this.state.numLikes + 1)
                });
            }
        }).catch((err) => {
            console.error(err);
        })
    }

    render() {
        return (
            <IconButton aria-label="Like" onClick={this.handleClick}>
                {this.state.liked ? (
                    <FavoriteIcon></FavoriteIcon>
                ) : (
                        <FavoriteBorderIcon></FavoriteBorderIcon>
                    )}
                {this.state.numLikes}
            </IconButton>
        )
    }

}

export default compose(withFirebase, withRouter)(LikeButton);