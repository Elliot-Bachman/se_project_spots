// Function to help all loading of buttons
export function showLoading(
  buttonElement,
  isLoading,
  loadingText = "Saving...",
  defaultText = "Save"
) {
  if (!buttonElement) return;

  if (isLoading) {
    buttonElement.textContent = loadingText;
    buttonElement.disabled = true;
  } else {
    buttonElement.textContent = defaultText;
    buttonElement.disabled = false;
  }
}
