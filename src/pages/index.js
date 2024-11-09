import {
  enableValidation,
  settings,
  disableButton,
  resetValidation,
} from "../scripts/validation.js";
import "./index.css";
import "../vendor/fonts.css";
import Api from "../utils/Api.js";
import { showLoading } from "../utils/helpers.js";

// Image file imports
import logoImage from "../images/logo.svg";
import avatarImage from "../images/avatar.jpg";
import pencilImage from "../images/pencil.svg";
import plusImage from "../images/plus.svg";
import whitePencilIcon from "../images/White-Pencil.png";

// Global variables for selected card deletion
let selectedCard;
let selectedCardId;

// Frequently accessed DOM elements
const headerLogo = document.querySelector(".header__logo");
const profileAvatar = document.querySelector(".profile__avatar");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const editProfileButton = document.querySelector(".profile__edit-btn");
const addCardButton = document.querySelector(".profile__add-btn");
const editAvatarButton = document.querySelector(".profile__avatar-btn");
const cardsList = document.querySelector(".cards__list");
const cardCaptionInput = document.querySelector("#card-caption-input");
const addCardLinkInput = document.querySelector("#add-card-link-input");
const profileAvatarInput = document.querySelector("#profile-avatar-input");
const profileNameInput = document.querySelector("#profile-name-input");
const profileDescriptionInput = document.querySelector(
  "#profile-description-input"
);

const editModal = document.querySelector("#edit-modal");
const cardModal = document.querySelector("#add-card-modal");
const avatarModal = document.querySelector("#avatar-modal");
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");
const cardForm = document.querySelector("#card-form");
const avatarForm = document.querySelector("#edit-avatar-form");
const editProfileForm = document.querySelector("#edit-profile-form");
const previewModal = document.querySelector("#preview-modal");
const modalImage = previewModal.querySelector(".modal__image");
const modalCaption = previewModal.querySelector(".modal__caption");

// Set initial image sources
headerLogo.src = logoImage;
profileAvatar.src = avatarImage;
document.querySelector(".profile__pencil-icon").src = pencilImage;
document.querySelector(".profile__plus-icon").src = plusImage;
document.querySelector(".white__pencil-icon").src = whitePencilIcon;

// Initialize API
const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "df56a4ed-ea57-4811-a86a-44f3045b99eb",
    "Content-Type": "application/json",
  },
});

// Open and close modal functions
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

// Helper to set up modal close buttons
function setUpCloseButtons() {
  document.querySelectorAll(".modal__close-btn").forEach((button) => {
    const modal = button.closest(".modal");
    button.addEventListener("click", () => closeModal(modal));
  });
}
setUpCloseButtons();

// Load user info and cards
api
  .getAppInfo()
  .then(([cards, userInfo]) => {
    profileAvatar.src = userInfo.avatar;
    profileName.textContent = userInfo.name;
    profileDescription.textContent = userInfo.about;

    cards.reverse().forEach((cardData) => {
      cardsList.prepend(createCardElement(cardData));
    });
  })
  .catch((error) => console.error("Failed to load initial app info:", error));

// Card creation function
function createCardElement(data) {
  const template = document.querySelector("#card-template");
  const cardElement = template.content.querySelector(".card").cloneNode(true);

  const cardImageEl = cardElement.querySelector(".card__image");
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardElement.querySelector(".card__title").textContent = data.name;

  setUpImagePreview(cardImageEl, data);
  setUpLikeButton(cardElement.querySelector(".card__like-btn"), data);
  cardElement
    .querySelector(".card__delete-btn")
    .addEventListener("click", () => openDeleteModal(cardElement, data._id));

  return cardElement;
}

// Helper function to set up image preview
function setUpImagePreview(imageElement, data) {
  imageElement.addEventListener("click", () => {
    modalImage.src = data.link;
    modalImage.alt = data.name;
    modalCaption.textContent = data.name;

    openModal(previewModal);
  });
}

// Function for Like button handler
function setUpLikeButton(likeButton, data) {
  if (data.isLiked) likeButton.classList.add("card__like-btn_liked");

  likeButton.addEventListener("click", () => {
    const isLiked = likeButton.classList.contains("card__like-btn_liked");
    api
      .handleLikeStatus(data._id, isLiked)
      .then((updatedData) =>
        likeButton.classList.toggle("card__like-btn_liked", updatedData.isLiked)
      )
      .catch((error) => console.error("Failed to update like status:", error));
  });
}

// Function for Delete modal logic
function openDeleteModal(cardElement, cardId) {
  selectedCard = cardElement;
  selectedCardId = cardId;
  openModal(deleteModal); // Open the delete modal
}

// Define the delete form submit handler only once
const handleDeleteSubmit = (evt) => {
  evt.preventDefault();
  const deleteButton = evt.submitter; // Moved inside the function to access `evt.submitter`
  showLoading(deleteButton, true, "Deleting...", "Delete");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch((error) => console.error("Failed to delete card:", error))
    .finally(() => showLoading(deleteButton, false, "Deleteing", "Delete..."));
};

// Attach the submit event listener to deleteForm only once
deleteForm.addEventListener("submit", handleDeleteSubmit);

// Profile edit form submission
editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = evt.submitter;
  showLoading(saveButton, true, "Saving...", "Save");

  // Use constants to retrieve input values
  const name = profileNameInput.value;
  const about = profileDescriptionInput.value;

  api
    .editUserInfo({ name, about })
    .then((userData) => {
      profileName.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModal(editModal);
    })
    .catch((error) => console.error("Failed to edit profile:", error))
    .finally(() => showLoading(saveButton, false, "Saving...", "Save"));
});

// New event listener to pre-fill the form when opening the profile modal
editProfileButton.addEventListener("click", () => {
  const inputList = Array.from(
    editProfileForm.querySelectorAll(settings.inputSelector)
  );
  // Clear validation errors and reset form state
  resetValidation(editProfileForm, inputList, settings);
  // Use the constants for pre-filling values
  profileNameInput.value = profileName.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  openModal(editModal); // Open the modal after setting the input values
});

// Avatar form submission
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = evt.submitter;
  showLoading(saveButton, true);
  const avatarLink = profileAvatarInput.value;

  api
    .editAvatarInfo(avatarLink)
    .then((userData) => {
      profileAvatar.src = userData.avatar;
      closeModal(avatarModal);
    })
    .catch((error) => console.error("Failed to update avatar:", error))
    .finally(() => showLoading(saveButton, false));
});

// Add card form submission
cardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = evt.submitter;
  showLoading(saveButton, true, "Saving...", "Save");
  const name = cardCaptionInput.value;
  const link = addCardLinkInput.value;

  api
    .addCard({ name, link })
    .then((cardData) => {
      cardsList.prepend(createCardElement(cardData));
      closeModal(cardModal);
      cardForm.reset(); // Clears the input fields
      disableButton(saveButton, settings); // Disables the submit button
    })
    .catch((error) => console.error("Failed to add card:", error))
    .finally(() => showLoading(saveButton, false, "Saving...", "Save"));
});
const deleteCancelButton = deleteModal.querySelector(
  ".modal__submit-btn_type_cancel"
);
if (deleteCancelButton) {
  deleteCancelButton.addEventListener("click", () => closeModal(deleteModal));
} else {
  console.error("Cancel button in delete modal not found");
}

// Open Add Card modal
addCardButton.addEventListener("click", () => openModal(cardModal));

// Open Edit Avatar modal
editAvatarButton.addEventListener("click", () => openModal(avatarModal));

// Initialize validation
enableValidation(settings);
