/**
 * Toast notification store for user feedback
 */

import { writable } from 'svelte/store';

export interface Toast {
	id: string;
	type: 'success' | 'error' | 'warning' | 'info';
	title: string;
	message?: string;
	duration?: number;
	dismissible?: boolean;
}

export const toasts = writable<Toast[]>([]);

let toastId = 0;

export const toastActions = {
	add(toast: Omit<Toast, 'id'>) {
		const id = `toast-${++toastId}`;
		const newToast: Toast = {
			id,
			duration: 5000,
			dismissible: true,
			...toast
		};

		toasts.update(current => [...current, newToast]);

		// Auto-dismiss after duration
		if (newToast.duration && newToast.duration > 0) {
			setTimeout(() => {
				toastActions.remove(id);
			}, newToast.duration);
		}

		return id;
	},

	remove(id: string) {
		toasts.update(current => current.filter(toast => toast.id !== id));
	},

	clear() {
		toasts.set([]);
	},

	success(title: string, message?: string, duration?: number) {
		return toastActions.add({
			type: 'success',
			title,
			message,
			duration
		});
	},

	error(title: string, message?: string, duration?: number) {
		return toastActions.add({
			type: 'error',
			title,
			message,
			duration: duration || 8000 // Errors stay longer
		});
	},

	warning(title: string, message?: string, duration?: number) {
		return toastActions.add({
			type: 'warning',
			title,
			message,
			duration
		});
	},

	info(title: string, message?: string, duration?: number) {
		return toastActions.add({
			type: 'info',
			title,
			message,
			duration
		});
	}
};