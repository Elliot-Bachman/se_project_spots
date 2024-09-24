const initialCards = [
  {
    name: "Val Thorens",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/1-photo-by-moritz-feldmann-from-pexels.jpg",
  },
  {
    name: "Restaurant terrace",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/2-photo-by-ceiline-from-pexels.jpg",
  },
  {
    name: "An outdoor cafe",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/3-photo-by-tubanur-dogan-from-pexels.jpg",
  },
  {
    name: "A very long bridge, over the forest and through the trees",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/4-photo-by-maurice-laschet-from-pexels.jpg",
  },
  {
    name: "Tunnel with morning light",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/5-photo-by-van-anh-nguyen-from-pexels.jpg",
  },
  {
    name: "Mountain house",
    link: "https://practicum-content.s3.us-west-1.amazonaws.com/software-engineer/spots/6-photo-by-moritz-feldmann-from-pexels.jpg",
  },
];

// Profile elements
const profileEditButton = document.querySelector(".profile__edit-btn");
const profileCardModalButton = document.querySelector(".profile__add-btn");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");

// Form elements
const editModal = document.querySelector("#edit-modal");
const editFormElement = editModal.querySelector(".modal__form");
const editModalCloseBtn = editModal.querySelector(".modal__close-btn");
const editModalNameInput = editModal.querySelector("#profile-name-input");
const editModalDescriptionInput = editModal.querySelector(
  "#profile-description-input"
);

const cardModal = document.querySelector("#add-card-modal");
const cardModalCloseBtn = cardModal.querySelector(".modal__close-btn");
const cardModalSubmitBtn = cardModal.querySelector(".modal__submit-btn");
const cardNameInput = cardModal.querySelector("#add-card-name-input");
const cardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardForm = cardModal.querySelector(".modal__form");

const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");

// Select Preview Modal close button
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");

// Card-related elements
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

// Function to create card elements
function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeBtn = cardElement.querySelector(".card__like-btn");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-btn");

  // Set card name and image
  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  // Edit profile form submission
  editFormElement.addEventListener("submit", handleEditFormSubmit);

  // Toggle like button
  cardLikeBtn.addEventListener("click", () => {
    cardLikeBtn.classList.toggle("card__like-btn_liked");
  });

  // Remove card when clicking delete
  cardDeleteBtn.addEventListener("click", () => {
    cardElement.remove();
  });

  // Open preview modal when image is clicked
  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  return cardElement;
}

// Function to open modal
function openModal(modal) {
  modal.classList.add("modal_opened");
}

// Function to close modal
function closeModal(modal) {
  modal.classList.remove("modal_opened");
}

// Event listener to close Preview Modal
previewModalCloseBtn.addEventListener("click", () => {
  closeModal(previewModal);
});

// Function to handle the form submission for editing profile
function handleEditFormSubmit(event) {
  event.preventDefault();
  profileName.textContent = editModalNameInput.value;
  profileDescription.textContent = editModalDescriptionInput.value;
  closeModal(editModal);
}

// Handle the add card form submission
function handleAddCardFormSubmit(event) {
  event.preventDefault();
  disableButton(cardModalSubmitBtn, settings);

  // Create a new card object with the values from the input fields
  const cardData = {
    name: cardNameInput.value,
    link: cardLinkInput.value,
  };

  // Create a new card element based on the template
  const cardElement = getCardElement(cardData);

  // Prepend the new card to the top of the card list
  cardsList.prepend(cardElement);

  // Clear the input fields after adding the card
  cardNameInput.value = "";
  cardLinkInput.value = "";

  // Close the modal after submission
  closeModal(cardModal);
}

// Event listener to open profile edit modal
profileEditButton.addEventListener("click", () => {
  editModalNameInput.value = profileName.textContent;
  editModalDescriptionInput.value = profileDescription.textContent;
  resetValidation(
    editFormElement,
    [editModalNameInput, editModalDescriptionInput],
    settings
  );
  openModal(editModal);
});

// Event listener to close profile edit modal
editModalCloseBtn.addEventListener("click", () => {
  closeModal(editModal);
});

// Event listener to open the "Add Card" modal
profileCardModalButton.addEventListener("click", () => {
  openModal(cardModal);
});

// Event listener to submit the "Add Card" form
cardForm.addEventListener("submit", handleAddCardFormSubmit);

// Render initial cards on page load
initialCards.forEach((item) => {
  const cardElement = getCardElement(item);
  cardsList.append(cardElement);
});

// Event listener to close the "Add Card" modal
cardModalCloseBtn.addEventListener("click", () => {
  closeModal(cardModal);
});
