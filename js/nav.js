"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  // console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  // console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  /** Hide forms when signed up or logged in is successful  */
  $navLogin.hide();
  $loginForm.hide();
  $signupForm.hide();

  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function onSubmitHandler(evt) {
  $storySubmitForm.show();
  $myOwnStories.hide();
  $allStoriesList.hide();
}
// show/hide submit story form when nav link submit is clicked
$navSubmit.on('click', onSubmitHandler)

/** when a user clicks on the submit tab */
function navSubmitStory(evt) {
  evt.preventDefault();
  getUserStoryFormData();
  $storySubmitForm.hide(); // hide the form when it gets submitted
  getAndShowStoriesOnStart(); // update the stories list to reflect the change
  this.reset(); // remove all input fields
}

$storySubmitForm.on('submit', navSubmitStory);

/** updates favorites tab*/
function displayFavoriteStories(evt) {
  console.debug('favorites tab');
  $storySubmitForm.hide();
  $myOwnStories.hide();
  putFavoritesStoriesOnPage();
}

$navFavorites.on('click', displayFavoriteStories);

/** update Display User own stories */
function displayOwnStories(evt) {
  console.debug('own stories');
  $allStoriesList.hide();
  $storySubmitForm.hide(); 
  putOwnStoriesOnPage(evt);
}

$navMyStories.on('click', displayOwnStories);