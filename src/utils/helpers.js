// Function to help all loading of buttons
export function showLoading(buttonElement, isLoading, defaultText = "Save") {
  if (isLoading) {
    buttonElement.textContent = "Saving...";
  } else {
    buttonElement.textContent = defaultText;
  }
}
