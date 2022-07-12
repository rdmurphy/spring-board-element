// packages
import { expect, type Locator, test } from '@playwright/test';

// types
import type SpringBoardElement from '../src/spring-board-element.js';

// local
import { publicKey } from './test-constants.js';

const testBoardUrl = `http://localhost:7000/${publicKey}`;

test.beforeEach(async ({ page }) => {
	await page.goto('/tests/fixtures/');
});

test.describe('element creation', () => {
	test('creates from document.createElement', async ({ page }) => {
		const elementHandle = await page.evaluateHandle(() =>
			document.createElement('spring-board'),
		);

		expect(await elementHandle.evaluate((element) => element.nodeName)).toBe(
			'SPRING-BOARD',
		);
	});

	test('creates from constructor', async ({ page }) => {
		const elementHandle = await page.evaluateHandle(() => {
			return new window.SpringBoardElement();
		});

		expect(await elementHandle.evaluate((element) => element.nodeName)).toBe(
			'SPRING-BOARD',
		);
	});
});

test.describe('after tree insertion', () => {
	test('can assign an href', async ({ page }) => {
		const locator = page.locator('spring-board');
		await loadBoardInElement(locator);

		expect(
			await locator.evaluate((element: SpringBoardElement) => element.href),
		).toBe(testBoardUrl);
	});

	test('can retreive the key', async ({ page }) => {
		const locator = page.locator('spring-board');
		await loadBoardInElement(locator);

		expect(
			await locator.evaluate((element: SpringBoardElement) => element.key),
		).toBe(publicKey);
	});

	test('can retrieve pubdate with getter', async ({ page }) => {
		const locator = page.locator('spring-board');
		await loadBoardInElement(locator);

		expect(
			await locator.evaluate((element: SpringBoardElement) =>
				element.pubdate?.toISOString(),
			),
		).toBe(await locator.locator('time').getAttribute('datetime'));
	});

	test('pubdate getter returns null in empty board', async ({ page }) => {
		const locator = page.locator('spring-board');

		expect(
			await locator.evaluate((element: SpringBoardElement) => element.pubdate),
		).toBeNull();
	});

	test('assert board contents', async ({ page }) => {
		const locator = page.locator('spring-board');
		const innerLocator = locator.locator('#number');

		await loadBoardInElement(locator);

		expect(await innerLocator.textContent()).toBe('83');
	});
});

function loadBoardInElement(locator: Locator) {
	return Promise.all([
		locator.evaluate(
			(element: SpringBoardElement, testBoardUrl) =>
				(element.href = testBoardUrl),
			testBoardUrl,
		),
		locator.evaluate((element: SpringBoardElement) => element.loaded),
	]);
}
