// packages
import { test, expect } from '@playwright/test';

// types
import type SpringBoardElement from '../src/spring-board-element.js';

// local
import { publicKey } from './test-constants.js';

const testBoardUrl = `http://localhost:3000/${publicKey}`;

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
		await locator.evaluate(
			(element: SpringBoardElement, testBoardUrl) =>
				(element.href = testBoardUrl),
			testBoardUrl,
		);

		expect(
			await locator.evaluate((element: SpringBoardElement) => element.href),
		).toBe(testBoardUrl);
	});

	test('can retreive the key', async ({ page }) => {
		const locator = page.locator('spring-board');
		await locator.evaluate(
			(element: SpringBoardElement, testBoardUrl) =>
				(element.href = testBoardUrl),
			testBoardUrl,
		);

		expect(
			await locator.evaluate((element: SpringBoardElement) => element.key),
		).toBe(publicKey);
	});
});
