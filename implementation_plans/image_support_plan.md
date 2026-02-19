# Implementation Plan: Image Support for Sensiq AI

This plan outlines the steps to allow users to upload images alongside their text queries, enabling multimodal interactions.

## 1. UI Enhancements (ChatWindow.jsx)

### A. Add Image Upload Button
-   Add a new button (e.g., `Paperclip` or `Image` icon from `lucide-react`) to the input area, next to the microphone icon.
-   Include a hidden `<input type="file" accept="image/*" />` element.
-   Clicking the button triggers the hidden file input.

### B. Image Preview Area
-   Create a preview section above the text input field.
-   When an image is selected, display a small thumbnail of the image.
-   Include a "Remove" (X) button on the thumbnail to allow the user to cancel the selection.

## 2. State Management

-   `selectedImage`: State variable to store the currently selected image (Base64 string or file object).
-   `isUploading`: (Optional) State to handle processing time if resizing/compression is needed.

## 3. Functionality & Logic

### A. Image Selection Handler
-   `handleImageSelect(event)`:
    -   Validate file type (JPEG, PNG, WebP) and size (e.g., max 5MB).
    -   Convert the file to a Base64 string using `FileReader`.
    -   Set the `selectedImage` state.

### B. Message Sending Logic (`handleSend`)
-   Modify `handleSend` to check if `selectedImage` is present.
-   **Payload Structure**: Update the message `content` format to support multimodal input (standard OpenAI Vision format).
    -   **Current**: `content: "User message"`
    -   **New**:
        ```json
        content: [
          { "type": "text", "text": "User message" },
          { "type": "image_url", "image_url": { "url": "data:image/jpeg;base64,..." } }
        ]
        ```
-   Clear `selectedImage` after sending.

## 4. API Integration

-   Ensure the API call to Sarvam AI (`sarvam-m`) receives the correct payload format.
-   *Note*: Verify if `sarvam-m` supports standard vision payloads. If not, adjustments might be needed based on specific provider documentation.

## 5. Message Display

-   Update the message rendering loop to check for the presence of an image in the message history.
-   If a message contains an image, render it inside the chat bubble before the text.

---

## Step-by-Step Execution

1.  **Modify `InputArea`**: Add the file input and trigger button.
2.  **Add Preview Logic**: Implement state and preview UI.
3.  **Update `handleSend`**: Construct the multimodal payload.
4.  **Update Rendering**: Display sent images in the chat history.
