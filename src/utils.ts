/**
 * Ensures that all links within a board open in a new tab.
 *
 * @private
 * @param event
 */
export function openLinksInNewTabs(event: MouseEvent) {
	const target = event.target as HTMLElement;

	if (target.matches('a')) {
		target.setAttribute('target', '_blank');
		target.setAttribute('rel', 'noopener');
	}
}

/**
 * Makes properties lazy. Enables board creation via document.createElement.
 * https://web.dev/custom-elements-best-practices/#make-properties-lazy
 *
 * @private
 * @param object
 * @param property
 */
export function upgradeProperty(object: any, property: string) {
	if (object.hasOwnProperty(property)) {
		let value = object[property];
		delete object[property];
		object[property] = value;
	}
}

export const enum States {
	Pending = 'pending',
	Fulfilled = 'fulfilled',
	Rejected = 'rejected',
}

export class Deferred<T> {
	declare state: States;
	declare promise: Promise<T>;
	declare resolve: (value: T) => void;
	declare reject: (value: any) => void;

	constructor() {
		this.state = States.Pending;

		this.promise = new Promise((resolve, reject) => {
			this.resolve = (value: T) => {
				this.state = States.Fulfilled;
				resolve(value);
			};
			this.reject = (value: any) => {
				this.state = States.Rejected;
				reject(value);
			};
		});
	}

	get pending() {
		return this.state === States.Pending;
	}
}
