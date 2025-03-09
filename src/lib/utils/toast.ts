import { toast as sonnerToast } from 'sonner';

// Safety timeout for loading toasts (10 seconds)
const LOADING_TOAST_TIMEOUT = 10000;

export const toast = {
  success: (message: string) => sonnerToast.success(message, { duration: 1000 }),
  error: (message: string) => sonnerToast.error(message, { duration: 1000 }),
  loading: (message: string) => {
    const id = sonnerToast.loading(message, { duration: 1000 });
    
    // Set a safety timeout to dismiss the toast after 10 seconds
    // This prevents loading toasts from getting stuck indefinitely
    setTimeout(() => {
      sonnerToast.dismiss(id);
    }, LOADING_TOAST_TIMEOUT);
    
    return id;
  },
  dismiss: sonnerToast.dismiss,
}; 