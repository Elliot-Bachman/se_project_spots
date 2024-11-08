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

// Set initial image sources
document.querySelector(".header__logo").src = logoImage;
document.querySelector(".profile__avatar").src = avatarImage;
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

// Selectors
const editModal = document.querySelector("#edit-modal");
const cardModal = document.querySelector("#add-card-modal");
const avatarModal = document.querySelector("#avatar-modal");
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = document.querySelector("#delete-form");
const cardForm = document.querySelector("#card-form");
const avatarForm = document.querySelector("#edit-avatar-form");
const editProfileForm = document.querySelector("#edit-profile-form");
const previewModal = document.querySelector("#preview-modal");

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
    document.querySelector(".profile__avatar").src = userInfo.avatar;
    document.querySelector(".profile__name").textContent = userInfo.name;
    document.querySelector(".profile__description").textContent =
      userInfo.about;

    const cardsList = document.querySelector(".cards__list");
    cards
      .reverse()
      .forEach((cardData) => cardsList.prepend(createCardElement(cardData)));
  })
  .catch(console.error);

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
    const modalImage = previewModal.querySelector(".modal__image");
    const modalCaption = previewModal.querySelector(".modal__caption");

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
      .catch(console.error);
  });
}

// Function for Delete modal logic
function openDeleteModal(cardElement, cardId) {
  const deleteButton = deleteForm.querySelector(".modal__submit-btn");

  // Show the delete modal and reset button text
  showLoading(deleteButton, false, "Deleting...", "Delete");
  openModal(deleteModal);

  // Remove any previous submit event listeners
  const handleDeleteSubmit = (evt) => {
    evt.preventDefault();
    showLoading(deleteButton, true, "Deleting...", "Delete"); // Show "Deleting..." on submit

    api
      .deleteCard(cardId)
      .then(() => {
        cardElement.remove(); // Remove card from DOM on successful deletion
        closeModal(deleteModal);
      })
      .catch((error) => console.error("Failed to delete card:", error))
      .finally(() => showLoading(deleteButton, false, "Deleting...", "Delete")); // Reset button text
  };

  // Remove any existing submit listeners to prevent multiple deletions
  deleteForm.removeEventListener("submit", handleDeleteSubmit);

  // Add the submit event listener for the current card delete request
  deleteForm.addEventListener("submit", handleDeleteSubmit, { once: true }); // Use `once: true` for automatic removal
}

// Profile edit form submission
editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = editProfileForm.querySelector(".modal__submit-btn");
  showLoading(saveButton, true, "Saving...", "Save");

  const name = editProfileForm.querySelector("#profile-name-input").value;
  const about = editProfileForm.querySelector(
    "#profile-description-input"
  ).value;

  api
    .editUserInfo({ name, about })
    .then((userData) => {
      document.querySelector(".profile__name").textContent = userData.name;
      document.querySelector(".profile__description").textContent =
        userData.about;
      closeModal(editModal);
    })
    .finally(() => showLoading(saveButton, false, "Saving...", "Save"));
});

// New event listener to pre-fill the form when opening the profile modal
const editProfileButton = document.querySelector(".profile__edit-btn");
editProfileButton.addEventListener("click", () => {
  const editProfileForm = document.querySelector("#edit-profile-form");
  const inputList = Array.from(
    editProfileForm.querySelectorAll(settings.inputSelector)
  );
  // Clear validation errors and reset form state
  resetValidation(editProfileForm, inputList, settings);
  // Populate inputs with the current profile data
  document.querySelector("#profile-name-input").value =
    document.querySelector(".profile__name").textContent;
  document.querySelector("#profile-description-input").value =
    document.querySelector(".profile__description").textContent;

  openModal(editModal); // Open the modal after setting the input values
});

// Avatar form submission
avatarForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = avatarForm.querySelector(".modal__submit-btn");
  showLoading(saveButton, true);
  const avatarLink = avatarForm.querySelector("#profile-avatar-input").value;

  api
    .editAvatarInfo(avatarLink)
    .then((userData) => {
      document.querySelector(".profile__avatar").src = userData.avatar;
      closeModal(avatarModal);
    })
    .finally(() => showLoading(saveButton, false));
});

// Add card form submission
cardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();
  const saveButton = cardForm.querySelector(".modal__submit-btn");
  showLoading(saveButton, true, "Saving...", "Save");
  const name = cardForm.querySelector("#card-caption-input").value;
  const link = cardForm.querySelector("#add-card-link-input").value;

  api
    .addCard({ name, link })
    .then((cardData) => {
      // Add the new card to the cards list
      document
        .querySelector(".cards__list")
        .prepend(createCardElement(cardData));

      // Close the modal after adding
      closeModal(cardModal);

      // Reset the form fields and disable the button
      cardForm.reset(); // Clears the input fields
      disableButton(saveButton, settings); // Disable the save button

      // Reset validation state for a clean slate
      const inputList = Array.from(
        cardForm.querySelectorAll(settings.inputSelector)
      );
      resetValidation(cardForm, inputList, settings);
    })
    .finally(() => showLoading(saveButton, false, "Saving...", "Save"));
});

// Cancel button event listener to close delete modal without deleting
const deleteCancelButton = deleteModal.querySelector(
  ".modal__submit-btn_type_cancel"
);
if (deleteCancelButton) {
  deleteCancelButton.addEventListener("click", () => closeModal(deleteModal));
} else {
  console.error("Cancel button in delete modal not found");
}

// Open Add Card modal
const addCardButton = document.querySelector(".profile__add-btn");
addCardButton.addEventListener("click", () => openModal(cardModal));

// Open Edit Avatar modal
const editAvatarButton = document.querySelector(".profile__avatar-btn");
editAvatarButton.addEventListener("click", () => openModal(avatarModal));

// Initialize validation
enableValidation(settings);
