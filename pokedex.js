/**
 * Name: HACER AYNUR SARI
 * Date: 11/12/2021
 * Section: CSE 154 AA
 *
 * Program is part of the homework3, "This assignment is about using AJAX to fetch
 * data in text and JSON format and process it using DOM manipulation. "
 * It is a Pokemon game, that u can earn more pokemon if you win.
 */
"use strict";

(function() {

  // MODULE GLOBAL VARIABLES, CONSTANTS, AND HELPER FUNCTIONS CAN BE PLACED HERE
  const BASE_URL = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php"; // you may have more than one
  const BASE_URL_GAME = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
  let foundPokArr = ["bulbasaur", "charmander", "squirtle"];
  let guid = "";
  let pid = "";
  let target = "p1";
  let hp = "";

  /**
   * function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * this function calls makeRequest to bring all then pokemons
   * and lets user click on the buttons.
   */
  function init() {
    makeRequest();
    id("start-btn").addEventListener("click", startGame);
    id("endgame").addEventListener("click", backToPokedex);
    id("flee-btn").addEventListener("click", makeAflee);
  }

  /**
   * This request takes the parameter all and returns a plain text
   * response with a line for all 151 Pokemon names.
   * @returns {void}
   */
  function makeRequest() {
    let url = BASE_URL + "?pokedex=all";
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.text())
      .then(processData)
      .catch(console.error);
  }

  /**
   * The second request type takes as a parameter any Pokemon name
   * and returns a detailed JSON object containing data about this
   * Pokemon. The returned data will be used to populate a card for that Pokemon.
   * @param {nameOfPokemon} nameOfPokemon be used isntead of the name of pokemon
   * @param {trgt} trgt p1 or p2.
   * @returns {void}
   */
  function makeRequestforParameter(nameOfPokemon, trgt) {
    let url = BASE_URL + "?pokemon=" + nameOfPokemon;
    target = trgt;
    fetch(url)
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processDataForParameter)
      .catch(console.error);
  }

  /**
   * The third request you will use initiates a game and passes two parameters,
   * startgame and mypokemon to game.php.
   * this request is a “POST” request. Upon success, the request returns a
   * JSON response of the initial game state and unique game id (guid) and player
   * id (pid) for the player to use to access and update the current game state.
   * @returns {void}
   */
  function requestToInitialize() {
    let url = BASE_URL_GAME;
    let data = new FormData();
    let clickedPok = "";
    data.append("startgame", "true");
    let pok = id(target).getAttribute('name');
    clickedPok = pok.substring(3);
    data.append("mypokemon", clickedPok);
    fetch(url, {
      method: "POST",
      body: data
    })
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processDataForInitialize)
      .catch(console.error);
  }

  /**
   * Process the data to save pid and guid.
   * @param {gameData} gameData returns initial game state
   * @returns {void}
   */
  function processDataForInitialize(gameData) {
    guid = gameData.guid;
    pid = gameData.pid;
    target = "p2";
    processDataForParameter(gameData.p2);
  }

  /**
   * This query submits a move played by your Pokemon on the current turn and
   * requires three parameters: move as your Pokemon’s move name, guid as your
   * unique game ID, and pid as your unique player id.
   * @param {moveNameIs} moveNameIs returns move name
   * @returns {void}
   */
  function requestToMove(moveNameIs) {
    id("loading").classList.remove("hidden");
    let url = BASE_URL_GAME;
    let data = new FormData();
    data.append("guid", guid);
    data.append("pid", pid);
    data.append("movename", moveNameIs);

    fetch(url, {
      method: "POST",
      body: data
    })
      .then(statusCheck)
      .then(resp => resp.json())
      .then(processDataForMoving)
      .catch(console.error);
  }

  /**
   * This function processes the data when moves are requested.
   * @param {movingData} movingData returns initial game state
   * @returns {void}
   */
  function processDataForMoving(movingData) {
    id("loading").classList.add("hidden");
    id("p1-turn-results").classList.remove("hidden");
    id("p1-turn-results").textContent = "Player 1 played " + movingData.results["p1-move"] +
      " and " + movingData.results["p1-result"] + "!";
    id("p2-turn-results").classList.remove("hidden");
    id("p2-turn-results").textContent = "Player 2 played " + movingData.results["p2-move"] +
      " and " + movingData.results["p2-result"] + "!";
    hp = movingData.p1.hp;
    let percentage1 = (movingData.p1["current-hp"] / movingData.p1.hp) * 100;
    let percentage2 = (movingData.p2["current-hp"] / movingData.p2.hp) * 100;
    id("p1").querySelector(".health-bar").style.width = percentage1 + "%";
    id("p2").querySelector(".health-bar").style.width = percentage2 + "%";
    id("p2").querySelector(".hp").textContent = movingData.p2["current-hp"] + "HP";
    id("p1").querySelector(".hp").textContent = movingData.p1["current-hp"] + "HP";
    if (percentage1 < 20) {
      id("p1").querySelector(".health-bar").classList.add("low-health");
    }
    if (percentage2 < 20) {
      id("p2").querySelector(".health-bar").classList.add("low-health");
    }
    if (percentage1 <= 0) {
      qs("h1").textContent = "You lost!";
    }
    if (percentage2 <= 0) {
      id("p2-turn-results").classList.add("hidden");
      qs("h1").textContent = "You won!";
      foundPokArr.push(movingData.p2.shortname);
    }
    if ((percentage1 <= 0) || (percentage2 <= 0)) {
      id("endgame").classList.remove("hidden");
      id("flee-btn").classList.add("hidden");
      let buttons = document.getElementById("p1").querySelectorAll(".moves button");
      buttons.forEach(element => {
        element.disabled = true;
      });
    }

  }

  /**
   * This function processes the data when parameters are requested and
   * created their cards.
   * @param {parameterData} parameterData returns initial game state
   * @returns {void}
   */
  function processDataForParameter(parameterData) {
    qs("#" + target).setAttribute('name', "id_" + parameterData.shortname + "");
    qs("#" + target + " .name").textContent = parameterData.name;
    qs("#" + target + " .pokepic").src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/" + parameterData.images.photo;
    qs("#" + target + " .type").src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/" + parameterData.images.typeIcon;
    qs("#" + target + " .weakness").src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/" + parameterData.images.weaknessIcon;
    qs("#" + target + " .hp").textContent = parameterData.hp + "HP";
    qs("#" + target + " .info").textContent = parameterData.info.description;
    let spans = id(target).querySelectorAll(".move");
    for (let i = 0; i < spans.length; i++) {
      if (parameterData.moves[i]) {
        spans[i].textContent = parameterData.moves[i].name;
        spans[i].parentNode.querySelector('img').src = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/icons/" + parameterData.moves[i].type + ".jpg";
        if (parameterData.moves[i].dp) {
          spans[i].parentNode.querySelector('.dp').textContent = parameterData.moves[i].dp + " DP";
        } else {
          spans[i].parentNode.querySelector('.dp').textContent = "";
        }
        spans[i].parentNode.classList.remove("hidden");
      } else {
        spans[i].parentNode.classList.add("hidden");
      }

    }
    if (target === "p1") {
      id("start-btn").classList.remove("hidden");
    }

  }

  /**
   * This function processes the data and handles the plain text
   * and set them id attribute
   * @param {responseData} responseData returns all the pokemon names:nickname
   * @returns {void}
   */
  function processData(responseData) {
    let nickName = responseData.split('\n');
    let splitNickname;
    let imgSRC;
    let imgOfPok;
    for (let i = 0; i < nickName.length; i++) {
      splitNickname = nickName[i].split(':');
      imgSRC = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/sprites/" + splitNickname[1] + ".png";
      imgOfPok = gen("img");
      imgOfPok.classList.add("sprite");
      imgOfPok.src = imgSRC;
      imgOfPok.alt = "sprite img";
      imgOfPok.setAttribute("id", splitNickname[1]);
      id("pokedex-view").appendChild(imgOfPok);
      if (foundPokArr.includes(splitNickname)) {
        imgOfPok.addEventListener("click", pokemonClicked);
      }
    }
    foundPokemons();
  }

  /**
   * checks if the data is OK
   * @param {res} res send the value of ok
   * @returns {void}
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * This function adds the onclick eventListener to the clicked
   * spirits and the ones that earned.
   * @returns {void}
   */
  function foundPokemons() {
    foundPokArr.forEach(pokName => {
      id(pokName).classList.add("found");
      id(pokName).addEventListener("click", pokemonClicked);
    });
  }

  /**
   * This function adds the found the class to the sender and makes requests for
   * parameter
   * @param {sender} sender returns the clicked pokemon
   * @returns {void}
   */
  function pokemonClicked(sender) {
    sender.currentTarget.classList.add("found");
    makeRequestforParameter(sender.currentTarget.id, 'p1');
  }

  /**
   * This function makes the arrangments to start when the start button is clicked.
   * @returns {void}
   */
  function startGame() {
    id("pokedex-view").classList.add("hidden");
    id("p2").classList.remove("hidden");
    qs(".hp-info").classList.remove("hidden");
    id("results-container").classList.remove("hidden");
    id("flee-btn").classList.remove("hidden");
    id("start-btn").classList.add("hidden");
    let buttons = document.getElementById("p1").querySelectorAll(".moves button");
    buttons.forEach(element => {
      element.disabled = false;
      element.addEventListener("click", makeMove);
    });
    qs("h1").textContent = "Pokemon Battle!";
    requestToInitialize();
  }

  /**
   * This function makes all the move names lowercase and send
   * them to request information.
   * @param {sender} sender returns the clicked move
   * @returns {void}
   */
  function makeMove(sender) {
    let spanOfPok = sender.currentTarget.querySelector(".move").textContent;
    let lowerSpanOfPok = spanOfPok.toLowerCase();
    let shortMoveName = lowerSpanOfPok.replace(/\s/g, '');
    requestToMove(shortMoveName);
  }

  /**
   * This function to let user play the game again, this sets the screen for a
   * additional pokemon finding.
   * @returns {void}
   */
  function backToPokedex() {
    id("endgame").classList.add("hidden");
    id("results-container").classList.add("hidden");
    id("p2").classList.add("hidden");
    id("p1").querySelector(".hp-info").classList.add("hidden");
    id("start-btn").classList.remove("hidden");
    qs("h1").textContent = "Your Pokedex";
    id("p1").querySelector(".hp").textContent = hp + "HP";
    id("p1").querySelector(".health-bar").style.width = "100%";
    id("p2").querySelector(".health-bar").style.width = "100%";
    id("p1").querySelector(".health-bar").classList.remove("low-health");
    id("p2").querySelector(".health-bar").classList.remove("low-health");
    id("pokedex-view").classList.remove("hidden");
    foundPokemons();
  }

  /**
   * This function lets the user flee their pokemon, this will
   * result them to lost.
   * @returns {void}
   */
  function makeAflee() {
    requestToMove('flee');
    id("p2-turn-results").classList.add("hidden");
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Note: You may use these in your code, but remember that your code should not have
   * unused functions. Remove this comment in your own code.
   */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

})();