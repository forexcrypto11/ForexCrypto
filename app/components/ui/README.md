# UI Components

## Loading Components

### LoadingButton

A button component that shows a loading state and optionally a full-screen overlay when performing async operations.

#### Props

- `children`: ReactNode - The content of the button
- `onClick`: () => Promise<void> | void - The async function to execute when the button is clicked
- `isLoading`: boolean - External loading state (optional)
- `loadingMessage`: string - Message to display when loading (default: "Processing request...")
- `showOverlay`: boolean - Whether to show a full-screen overlay when loading (default: false)
- All other props from the Button component

#### Example Usage

```tsx
<LoadingButton
  onClick={async () => {
    await someAsyncFunction();
  }}
  loadingMessage="Saving changes..."
  variant="default"
>
  Save Changes
</LoadingButton>
```

### LoadingOverlay

A full-screen loading overlay component with a spinner and optional message.

#### Props

- `message`: string - The message to display (default: "Processing request...")

#### Example Usage

```tsx
<LoadingOverlay message="Loading data..." />
```

## How to Use Loading States on Buttons

1. **Basic Button with Loading State**:
   ```tsx
   import { Button } from "@/components/ui/button";
   
   <Button isLoading={isLoading}>
     Submit
   </Button>
   ```

2. **Button with Loading State and Custom Loading Text**:
   ```tsx
   <Button isLoading={isLoading} loadingText="Submitting...">
     Submit
   </Button>
   ```

3. **LoadingButton with Automatic Loading State Management**:
   ```tsx
   import { LoadingButton } from "@/app/components/ui";
   
   <LoadingButton
     onClick={async () => {
       // This will automatically show loading state
       await submitForm();
     }}
   >
     Submit
   </LoadingButton>
   ```

4. **LoadingButton with Full-Screen Overlay**:
   ```tsx
   <LoadingButton
     onClick={handleSubmit}
     showOverlay={true}
     loadingMessage="Submitting form..."
   >
     Submit
   </LoadingButton>
   ``` 