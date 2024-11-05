import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import "./index.css";

import "../vendor/fonts.css";
import "./index.css";

// Import image files for Webpack
import logoImage from "../images/logo.svg";
import avatarImage from "../images/avatar.jpg";
import pencilImage from "../images/pencil.svg";
import plusImage from "../images/plus.svg";
import whitePencilIcon from "../images/White-Pencil.png";

// Import Api
import Api from "../utils/Api.js";

// Set image sources
document.querySelector(".header__logo").src = logoImage;
document.querySelector(".profile__avatar").src = avatarImage;
document.querySelector(".profile__pencil-icon").src = pencilImage;
document.querySelector(".profile__plus-icon").src = plusImage;
document.querySelector(".white__pencil-icon").src = whitePencilIcon;

let selectedCard, selectedCardId;

// Initialize API instance
const api = new Api("https://around-api.en.tripleten-services.com/v1", {
  authorization: "d4e5590c-631d-43b1-a995-240237f6ac96",
  "Content-Type": "application/json",
});

// Function to open and close modals
function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscClose);
  modal.addEventListener("mousedown", handleOverlayClick);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscClose);
  modal.removeEventListener("mousedown", handleOverlayClick);
}

// Escape key close handler
function handleEscClose(event) {
  if (event.key === "Escape") {
    const openedModal = document.querySelector(".modal_opened");
    if (openedModal) closeModal(openedModal);
  }
}

// Overlay click close handler
function handleOverlayClick(event) {
  if (event.target.classList.contains("modal_opened")) {
    closeModal(event.target);
  }
}

// Load initial data: user info and cards
api
  .getAppInfo()
  .then(([userInfo, cards]) => {
    document.querySelector(".profile__avatar").src = userInfo.avatar;
    document.querySelector(".profile__name").textContent = userInfo.name;
    document.querySelector(".profile__description").textContent =
      userInfo.about;

    const cardsList = document.querySelector(".cards__list");
    if (!cardsList) {
      console.error("cardsList element not found");
      return;
    }

    // Append each card to the list
    cards.forEach((item) => {
      const cardElement = getCardElement(item);
      if (cardElement) cardsList.append(cardElement);
    });
  })
  .catch((err) => {
    console.error("Failed to load initial app data:", err);
  });

// Function to create a card element from data
function getCardElement(data) {
  const cardTemplate = document.querySelector("#card-template");
  if (!cardTemplate) {
    console.error("Card template not found");
    return null;
  }

  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);
  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Add event listeners for like and delete buttons
  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-btn_liked");
  });

  cardDeleteBtn.addEventListener("click", () => {
    handleDeleteCard(cardElement, data._id);
  });

  return cardElement;
}

// Handle delete button click and open delete modal
function handleDeleteCard(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  const deleteModal = document.querySelector("#delete-modal");
  if (deleteModal) openModal(deleteModal);
  else console.error("Delete modal not found");
}

// Handle delete confirmation submit
function handleDeleteSubmit(evt) {
  evt.preventDefault();
  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(document.querySelector("#delete-modal"));
    })
    .catch(console.error);
}

// Event listener for delete form submit
const deleteForm = document.querySelector("#delete-form");
if (deleteForm) {
  deleteForm.addEventListener("submit", handleDeleteSubmit);
} else {
  console.error("Delete form not found");
}

// Enable validation
enableValidation(settings);
