import React, { Component } from 'react';
import './App.css';
import closeImg from './icon_close.png';

function Error(props){
	if(props.message !== "")
		var string = "ERROR: " + props.message;
	else
		var string = "";
	return(
			<p className="error"> {string} </p>
		)
}

function Favorite(props){
	var imageStyle = {
	  backgroundImage: 'url(' + props.image + ')',
	};
	return (
		<div className="favoriteImageContainer">
		  <img className="favoriteImageDelete" src={closeImg} onClick={props.onPostClick} />
		  <a className="imageLink" href={"#"+props.id} style={imageStyle}></a>
		  <div className="favoriteInfo">
		      <a className="favoriteLink" target="_blank" href={"https://www.reddit.com" + props.link}>/u/{props.author}</a>
		  </div>
		</div>
	)
}

function MainPost(props){
	var divStyle = {
	  backgroundImage: 'url(' + props.image + ')',
	};
    return(
      <div className="postOuterContainer">
        <div id={props.id} className="postBackgroundImage" style={divStyle}> </div>
        <img className="postImage" src={props.image} onClick={props.onPostClick} />
      </div>
     )
}

class SearchBar extends React.Component{
	constructor(){
		super();
		this.handleOnEnter = this.handleOnEnter.bind(this);
		this.handleFilterTextInputChangeLocal = this.handleFilterTextInputChangeLocal.bind(this);
	}

	handleFilterTextInputChangeLocal(e){
		this.props.onFilterTextInput(e.target.value);
	}

	handleOnEnter(e){
		if(e.key === 'Enter')
			this.props.onFilterTextInput(e.target.value);
	}

	render(){
		return(
			//<form>
			<div className="searchInputContainer">
			  <input type="text" placeholder="sneakers" onKeyPress={this.handleOnEnter} onBlur={this.handleFilterTextInputChangeLocal} />
			</div>
			//</form>
		)
	}
}

class Settings extends React.Component{
	constructor(){
		super();
		this.state = {
			small: false,
			zoom: 100,
		}
		this.handleZoom = this.handleZoom.bind(this);
		this.handleCheckbox = this.handleCheckbox.bind(this);
	}


	handleZoom(e){
		//target: #mainPost .row {
		document.styleSheets[0].cssRules[6].style.width = e.target.value + "%";	
		if(!this.state.small){
			//super hack. target: #mainPost .postOuterContainer{
			document.styleSheets[0].cssRules[7].style.height = e.target.value + "vh";
		}
		this.setState({zoom:e.target.value});
	}

	handleCheckbox(e){
		if(e.target.checked) {
			//target: #mainPost img
			document.styleSheets[0].cssRules[9].style.height = "auto";
			document.styleSheets[0].cssRules[9].style.width = "100%";

			//target: #mainPost .postOuterContainer{
			document.styleSheets[0].cssRules[7].style.height = "auto";
		} else {
			//target: #mainPost img
			document.styleSheets[0].cssRules[9].style.height = "100%";
			document.styleSheets[0].cssRules[9].style.width = "auto";
			//target: #mainPost .postOuterContainer{
			document.styleSheets[0].cssRules[7].style.height = this.state.zoom + "vh";
		}
		this.setState({small: e.target.checked});
	}

	render(){
		return(
		<div className="settingsContainer">
			<div style={{float:"right", width:"50%"}}>
				<h3>Size </h3>
				<input type="range" id="myRange" value={this.state.zoom} maks="100" min="20" step="1" onChange={this.handleZoom} />
			</div>
			<div style={{float:"left", width:"50%"}}>
				<h3> True size </h3>
				<input type="checkbox" checked={this.state.small} onClick={this.handleCheckbox} />
			</div>
		</div>
		)
	}
}


class App extends React.Component {
  	constructor(){
    	super();
	    this.state = {
	      postRows: [],
	      savedPosts: {},
	      after: null,
	      subreddit: "sneakers",
	      loading: false,
	      errorMessage: "",
	    }

	    this.handleScroll = this.handleScroll.bind(this);
	    this.handleFilterTextInput = this.handleFilterTextInput.bind(this);
	}

	handleScroll(e) {
		if(this.state.postRows.length == 0)
			return;

		if ((window.innerHeight + window.scrollY)+100 >= document.documentElement.scrollHeight) {
		    //bottom
		    var amount = this.state.postRows.length;
		    this.fetchPosts(amount, "bottom");
		}

		if (window.scrollY === 0) {
			//top
			var amount = this.state.postRows.length;
			this.fetchPosts(amount, "top");

		} 
		if((window.innerWidth + window.scrollX)+100 >= document.documentElement.scrollWidth) {
			//right
			var amount = this.state.postRows[0].length;
			this.fetchPosts(amount, "right");
		}
		if(window.scrollX < window.innerWidth*0.2) {
			//LEFT
			var amount = this.state.postRows[0].length;
			this.fetchPosts(amount, "left");
		}
	}

	generateObject(post){
	  	if(post.data.preview == null || post.data.preview.images == null)
	  		return null;

	    var myObj = {};
	    myObj.Id = post.data.id;
	    myObj.Image = post.data.preview.images[0].resolutions[post.data.preview.images[0].resolutions.length-1].url.replace(/&amp;/g, '&');
	    myObj.Author = post.data.author;
	    myObj.Score = post.data.score;
	    myObj.Link = post.data.permalink;
	    myObj.Title = post.data.title;
	    myObj.Comments = post.data["num_comments"];
	    myObj.Extlink = post.data.url;

	    return myObj;
  }

	fetchPosts(amount, direction){
	    if(this.state.loading)
	      return;

	    this.state.loading = true;
	    console.log("FETCHING!");
	    //fetching triple the amount to be sure i can get enought images.. This is poor code and living on an assumption that atleast 1/3 post contains an image
	    var url = "https://www.reddit.com/r/" + this.state.subreddit + "/hot.json?limit=" + (amount*3) + "&after=" + this.state.after;
	    var test = fetch(url)
	        .then((response) => response.json())
	        .then((responseJson) => {

				if(responseJson == null || responseJson.data == null || responseJson.data.children.length == 0) {
					this.state.loading = false;
					this.setState({loading: false, errorMessage: "Could not fetch images"});
					return;
				}

				var redditPosts = responseJson.data.children;
				var after = "";
				var posts=[];

				//getting first (amount) of posts that holds a picture
				for(var i = 0; i<redditPosts.length;i++){
					var post = this.generateObject(redditPosts[i]);
					if(post != null) {
						posts.push(post);
						//setting last fetched post
						after = redditPosts[i].data.name;
					}
					if(posts.length === amount)
						break;
				}

				if(posts.length > amount){
					this.setState({loading: false, errorMessage: "Could not find anymore images"});
					return;
				}

				const temp = this.state.postRows.slice();
				switch(direction) {
					case "top":
						//Puts one post of the fetched first in every array (row)
						for(var i = 0; i < temp.length; i++) {
							temp[i].unshift(posts[i]);
						}
						this.setState({after: after, postRows: temp, loading: false, errorMessage: ""});
						//restore scroll. Scrolls down 1x windows size because i know every post is exactly the height of the window
						window.scrollTo(window.scrollX,window.innerHeight);
						console.log("done fetching top");
						break;
					case "bottom":
						//puts one post of the fetched last in every arrey (row)
						for(var i = 0; i < temp.length; i++){
							temp[i].push(posts[i]);
						}
						this.setState({after: after, postRows: temp, loading: false, errorMessage: ""});
						console.log("done fetching bottom");
						break;
					case "left":
						//Makes a new array of the fetched posts and insert as the first array (row)
						temp.unshift(posts);
						this.setState({after: after, postRows: temp, loading: false, errorMessage: ""});
						//restore scroll. Taking into account that 20% is the sidebar
						window.scrollTo(window.innerWidth*0.8,window.scrollY);
						console.log("done fetching left");
						break;
					case "right":
						//Makes a new array of the fetched posts and insert af the last array (row)
						temp.push(posts);
						this.setState({after: after, postRows: temp, loading: false, errorMessage: ""});
						console.log("done fetching right");
						break;
					case "center":
						var postRows = this.generateInitialArray(posts);
						this.setState({after: after, postRows: postRows, loading: false, errorMessage: ""});
						//restore scroll to middle, That should be one post down, one post right. one post = window.inner*
						window.scrollTo(window.innerWidth*0.8,window.innerHeight);
						console.log("done fetching center");
						break;
					default:
						this.state.loading = false;
						throw "CASE NOT RECOGNIZED";
				}
	        })
	        .catch((error) => {
	        	console.log("Error: ", error);
				this.setState({loading: false, errorMessage: "Could not find subreddit"});
	        });
	}

	//makes the initial grid of posts. 3x3
	generateInitialArray(posts){
		var postRows = [];// new Array[rows];
		var rows = Math.sqrt(posts.length);

		for(var i = 0; i < posts.length;i++){
			if(postRows[i%rows] == null)
				postRows[i%rows] = [posts[i]];
			else
				postRows[i%rows].push(posts[i]);
		}
		return postRows;
	}

	renderPost(post){
		return(
			<MainPost key={post.Id} id={post.Id} image={post.Image} title={post.Title} onPostClick={() => this.handlePostClick(post)} />
		)
	}

	renderPostList(postList){
		return (
			<div className="row">
				{postList.map((post) => this.renderPost(post))}
			</div>
		)
	}

	renderFavorites(post){
		return(
		  <li>
			<Favorite key={post.Id} 
					  id={post.Id} 
					  image={post.Image} 
					  title={post.Title} 
					  author={post.Author}
					  score={post.Score}
					  link={post.Link}
					  comments={post.Comments}
					  extlink={post.Extlink}
					  onPostClick={() => this.handlePostClick(post)} />
		  </li>
		)
	}

	handlePostClick(post){
		const temp = this.state.savedPosts;
		if(post.Id in temp)
			delete temp[post.Id];
		else
			temp[post.Id] = post;
		this.setState({savedPosts: temp});
	}

	handleFilterTextInput(subreddit){
		if(!subreddit.trim() || subreddit.trim() == this.state.subreddit)
			return;
		const temp = this.state.postRows.splice();
		temp.length = 0;
		//second function is alled automatically and enforces our postRows to be updated
		this.setState({postRows: temp, after: null, subreddit: subreddit}, function() {this.fetchPosts(9,"center");});
	}


	render() {
		return (
			<div id="container">
				<div id="postOverview">
					<SearchBar onFilterTextInput={this.handleFilterTextInput} />
					<Error message={this.state.errorMessage} />
					<Settings />
					<ul>
						{Object.keys(this.state.savedPosts).map((post) => this.renderFavorites(this.state.savedPosts[post]))}
					</ul>
				</div>
				<div id="mainPost">
					{this.state.postRows.map((postList) => this.renderPostList(postList))}
				</div>
			</div>
		)
	}

	componentDidMount(){
		/* window.onbeforeunload = function(e) {
		return "Are you sure you want to leave?";
		}; */
		document.title = "ReddiMage - by adae"
		var posts = this.fetchPosts(9, "center");
		window.addEventListener('scroll', this.handleScroll);
	}
}
export default App;