import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => sonnerToast.success(message, { duration: 1000 }),
  error: (message: string) => sonnerToast.error(message, { duration: 1000 }),
  loading: (message: string) => sonnerToast.loading(message, { duration: 1000 }),
  dismiss: sonnerToast.dismiss,
}; 