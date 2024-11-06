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
// Import helper.js
import { showLoading } from "../utils/helpers.js";

// Set image sources
document.querySelector(".header__logo").src = logoImage;
document.querySelector(".profile__avatar").src = avatarImage;
document.querySelector(".profile__pencil-icon").src = pencilImage;
document.querySelector(".profile__plus-icon").src = plusImage;
document.querySelector(".white__pencil-icon").src = whitePencilIcon;

let selectedCard, selectedCardId;

// Initialize API instance with baseUrl and headers
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "d4e5590c-631d-43b1-a995-240237f6ac96",
    "Content-Type": "application/json",
  },
});

// Selectors for modals
const editModal = document.querySelector("#edit-modal");
const cardModal = document.querySelector("#add-card-modal");
const avatarModal = document.querySelector("#avatar-modal");
const deleteModal = document.querySelector("#delete-modal");

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
  .then(([cards, userInfo]) => {
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

  // Set up initial like state
  if (data.isLiked) {
    cardLikeBtn.classList.add("card__like-btn_liked");
  }

  // updated like button handler
  cardLikeBtn.addEventListener("click", () => {
    const isLiked = cardLikeBtn.classList.contains("card__like-btn_liked");

    // Call the API to update like status
    api
      .handleLikeStatus(data._id, isLiked)
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          cardLikeBtn.classList.add("card__like-btn_liked");
        } else {
          cardLikeBtn.classList.remove("card__like-btn_liked");
        }
      })
      .catch((error) => {
        console.error("Error updating like status:", error);
      });
  });

  // Delete button listener
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

// Single declaration and setup for deleteForm
const deleteForm = document.querySelector("#delete-form");

if (deleteForm) {
  const deleteSubmitButton = deleteForm.querySelector(
    ".modal__submit-btn_type_delete"
  );

  deleteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showLoading(deleteSubmitButton, true, "Deleting...");

    api
      .deleteCard(selectedCardId)
      .then(() => {
        selectedCard.remove();
        closeModal(deleteModal);
      })
      .catch((error) => console.error("Failed to delete card:", error))
      .finally(() => showLoading(deleteSubmitButton, false, "Delete"));
  });
} else {
  console.error("Delete form not found");
}

// Profile Edit button listener
const profileEditButton = document.querySelector(".profile__edit-btn");
if (profileEditButton) {
  profileEditButton.addEventListener("click", () => {
    console.log("Edit profile button clicked"); // Check if listener is triggered
    openModal(editModal);
  });
} else {
  console.error("Profile Edit button not found");
}

// Add Card button listener
const profileCardModalButton = document.querySelector(".profile__add-btn");
if (profileCardModalButton) {
  profileCardModalButton.addEventListener("click", () => {
    console.log("Add card button clicked"); // Check if listener is triggered
    openModal(cardModal);
  });
} else {
  console.error("Add Card button not found");
}

// Avatar Edit button listener
const avatarModalBtn = document.querySelector(".profile__avatar-btn");
if (avatarModalBtn) {
  avatarModalBtn.addEventListener("click", () => {
    console.log("Avatar edit button clicked"); // Check if listener is triggered
    openModal(avatarModal);
  });
} else {
  console.error("Avatar Edit button not found");
}

// Delete Modal Cancel button listener
const deleteCancelButton = document.querySelector(
  ".modal__submit-btn_type_cancel"
);
if (deleteCancelButton) {
  deleteCancelButton.addEventListener("click", () => {
    console.log("Delete modal cancel button clicked"); // Check if listener is triggered
    closeModal(deleteModal);
  });
} else {
  console.error("Delete modal cancel button not found");
}

// Avatar Modal Close Button Listener
const avatarModalCloseBtn = document.querySelector("#avatar-modal-close-btn");
if (avatarModalCloseBtn) {
  avatarModalCloseBtn.addEventListener("click", () => closeModal(avatarModal));
} else {
  console.error("Avatar modal close button not found");
}

// Edit Profile Modal Close Button Listener
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
if (editModalCloseBtn) {
  editModalCloseBtn.addEventListener("click", () => closeModal(editModal));
} else {
  console.error("Edit profile modal close button not found");
}

// Add Card Modal Close Button Listener
const addCardModalCloseBtn = document.querySelector("#add-card-close-btn");
if (addCardModalCloseBtn) {
  addCardModalCloseBtn.addEventListener("click", () => closeModal(cardModal));
} else {
  console.error("Add card modal close button not found");
}

// Preview Modal Close Button Listener
const previewModalCloseBtn = document.querySelector("#preview-modal-close-btn");
if (previewModalCloseBtn) {
  previewModalCloseBtn.addEventListener("click", () =>
    closeModal(previewModal)
  );
} else {
  console.error("Preview modal close button not found");
}

// Delete Modal Close Button Listener
const deleteModalCloseBtn = document.querySelector("#delete-modal-close-btn");
if (deleteModalCloseBtn) {
  deleteModalCloseBtn.addEventListener("click", () => closeModal(deleteModal));
} else {
  console.error("Delete modal close button not found");
}

// Add Card Modal Setup
const cardForm = document.querySelector("#card-form");
if (cardForm) {
  cardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.querySelector("#card-caption-input").value;
    const link = document.querySelector("#add-card-link-input").value;
    console.log("Name input:", document.querySelector("#card-caption-input"));
    console.log("Link input:", document.querySelector("#add-card-link-input"));

    // API call to add a new card
    api
      .addCard({ name, link })
      .then((cardData) => {
        const newCard = getCardElement(cardData); // Create card element from API response
        if (newCard) document.querySelector(".cards__list").prepend(newCard); // Prepend new card to list
        closeModal(cardModal); // Close the modal after adding
      })
      .catch((error) => console.error("Failed to add card:", error));
  });
} else {
  console.error("Card form not found");
}

// Profile Edit Form Submission
const editProfileForm = document.querySelector("#edit-profile-form");
if (editProfileForm) {
  const editProfileButton = editProfileForm.querySelector(".modal__submit-btn");

  editProfileForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showLoading(editProfileButton, true); // Show "Saving..."

    const name = document.querySelector("#profile-name-input").value;
    const description = document.querySelector(
      "#profile-description-input"
    ).value;

    api
      .editUserInfo({ name, about: description })
      .then((userData) => {
        document.querySelector(".profile__name").textContent = userData.name;
        document.querySelector(".profile__description").textContent =
          userData.about;
        closeModal(editModal);
      })
      .catch((error) => console.error("Failed to edit profile:", error))
      .finally(() => showLoading(editProfileButton, false)); // Revert button text
  });
} else {
  console.error("Profile edit form not found");
}

// Add Card Form Submission
const addCardForm = document.querySelector("#card-form");
if (addCardForm) {
  const addCardButton = addCardForm.querySelector(".modal__submit-btn");

  addCardForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showLoading(addCardButton, true); // Show "Saving..."

    const name = document.querySelector("#card-caption-input").value;
    const link = document.querySelector("#add-card-link-input").value;

    api
      .addCard({ name, link })
      .then((cardData) => {
        const newCard = getCardElement(cardData);
        document.querySelector(".cards__list").prepend(newCard);
        closeModal(cardModal);
      })
      .catch((error) => console.error("Failed to add card:", error))
      .finally(() => showLoading(addCardButton, false)); // Revert button text
  });
} else {
  console.error("Add card form not found");
}

// Avatar Edit Form Submission
const avatarForm = document.querySelector("#edit-avatar-form");
if (avatarForm) {
  const avatarSubmitButton = avatarForm.querySelector(".modal__submit-btn");

  avatarForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showLoading(avatarSubmitButton, true); // Show "Saving..."

    const avatarLink = document.querySelector("#profile-avatar-input").value;

    api
      .editAvatarInfo(avatarLink)
      .then((userData) => {
        document.querySelector(".profile__avatar").src = userData.avatar;
        closeModal(avatarModal);
      })
      .catch((error) => console.error("Failed to update avatar:", error))
      .finally(() => showLoading(avatarSubmitButton, false)); // Revert button text
  });
} else {
  console.error("Avatar form not found");
}

// Enable validation
enableValidation(settings);
