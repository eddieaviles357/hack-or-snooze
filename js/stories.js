"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, hasTrashIcon = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  return getStoryMarkup({...story, hostName}, hasTrashIcon);
}

/************** Start story markUp for a default User or a Logged in User *******************/
function getStoryMarkup({storyId, url, author, username, title, hostName}, hasTrashIcon) {
  let favMarkUp = '';
  let trashMarkUp = '';
  if(currentUser) { // generate appropiate icons for users favorites and own stories
    (hasFavoriteStoryId(storyId)) 
      ? favMarkUp = "<i class='fas fa-star'></i>" 
      : favMarkUp = "<i class='far fa-star'></i>";
    if(hasOwnStory(storyId) && hasTrashIcon) trashMarkUp = "<i class='far fa-trash-alt'></i>";
  }

  return $(`
  <li id="${storyId}">
  <span class="Icon">${favMarkUp}</span>
  <span class="Icon">${trashMarkUp}</span>
    <a href="${url}" target="a_blank" class="story-link">
      ${title}
    </a>
    <small class="story-hostname">(${hostName})</small>
    <small class="story-author">by ${author}</small>
    <small class="story-user">posted by ${username}</small>
  </li>
`);
} /************** End story markUp for a default User or a Logged in User *******************/


/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");
  $allStoriesList.empty();
  $myOwnStories.empty();
  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }
  $allStoriesList.show();
}


/** Gets the story form data and prepends it to the story list */
async function getUserStoryFormData() {
  let storyBody = { // get values from form
    author: $('#author-name').val(), 
    title: $('#story-title').val(), 
    url: $('#url').val()
  };
  // add story to StoryList class method addStory( userToken, storyBody )
  await storyList.addStory(currentUser, storyBody);
}


/** fills a favorite stories list when user is logged in from new to oldest*/
function putFavoritesStoriesOnPage(evt) {
  if(currentUser){
    $allStoriesList.empty();
    $myOwnStories.empty();
    // loop through all of our favorite stories and generate HTML for them
    for (let favStory of currentUser.favorites) {
      const $favStory = generateStoryMarkup(favStory);
      $allStoriesList.prepend($favStory); // favorite older stories will be at the bottom
    }
    $allStoriesList.show();
  }
}

/** Generate Own story ui  */
function putOwnStoriesOnPage(evt) {
  if(currentUser.loginToken){
    $allStoriesList.empty();
    $myOwnStories.empty();
  
    // loop through all of our own stories and generate HTML for them
    for (let ownStory of currentUser.ownStories) {
      const $ownStory = generateStoryMarkup(ownStory, true);
      $myOwnStories.prepend($ownStory); // newer stories will show on top and oldest on bottom
    }
    $myOwnStories.show(); // show users own stories
  }
}

/** UTIL FUNCTIONS */
/** return true if the storyId matches the users favorites */
function hasFavoriteStoryId(id) {
  // return (currentUser.favoritesId.hasOwnProperty(id))
  return currentUser.favorites.some( ({storyId}) => storyId === id)
}
/** return true if the Users own storyId matches the story */
function hasOwnStory(id) {
  return currentUser.ownStories.some( ({storyId}) => storyId === id);
}

/** Deletes story */
async function deleteStory(storyId) {
  await storyList.removeStory(currentUser, storyId); //remove story from onwStories
  let storyIdx = storyList.stories.findIndex(story => story.storyId === storyId);
  let ownStoryIdx = currentUser.ownStories.findIndex(story => story.storyId === storyId)
  storyList.stories.splice(storyIdx,1);// update story list
  currentUser.ownStories.splice(ownStoryIdx,1);// update own story list
  putOwnStoriesOnPage() // update ui
}

/** Add to user favorites list */
async function addToFavorites($target, storyId) {
  console.debug('added favorites')
  $target.removeClass('far'); // remove the unfilled star class from fontawesome
  $target.addClass('fas'); // add the filled star class from fontawesome
  let story = await User.addToFavorites(currentUser, storyId); // add to Users favorites
  currentUser.favorites.push(new Story(story));
}

/** Remove users favorites list */
async function removeFromFavorites($target, storyId) {
  console.debug('removed favorite');
  $target.removeClass('fas'); // remove the filled star class from fontawesome
  $target.addClass('far'); // add the unfilled star class from fontawesome

  await User.removeFromFavorites(currentUser, storyId); // remove from Users favorites
  let idx = currentUser.favorites.findIndex(story => story.storyId === storyId);
  currentUser.favorites.splice(idx,1); // remove favorites from user favorites list
}

/****************** Start event delegation for clicking favorites and delete ******************** */
async function storyListAndOwnListHandler(evt) {
  const $target = $(evt.target);

  // event handler for favorites ( star icon )
  if($target.hasClass('fa-star')) { // if User is logged in should have a class of star
    const storyId = $target.closest('li').attr('id'); // get story id from attribute
    
    if(hasFavoriteStoryId(storyId)) { // if user id matches the id then remove the favorites story
      removeFromFavorites($target, storyId);
    } else {
      addToFavorites($target, storyId);
    }
  }
  if($target.hasClass('fa-trash-alt')) {
    const storyId = $target.closest('li').attr('id'); // get story id from attribute
    deleteStory(storyId);
  }
}

$allStoriesList.on('click', storyListAndOwnListHandler);
$myOwnStories.on('click', storyListAndOwnListHandler);
/** ^^^^^^^^^^^^^^^ End event delegation for clicking favorites and delete ^^^^^^^^^^^^^^^^^^^^^^^ */
