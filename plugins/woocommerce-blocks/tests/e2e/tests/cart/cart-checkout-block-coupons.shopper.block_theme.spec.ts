/**
 * External dependencies
 */
import { expect, test as base } from '@woocommerce/e2e-playwright-utils';
import { cli } from '@woocommerce/e2e-utils';

/**
 * Internal dependencies
 */
import { REGULAR_PRICED_PRODUCT_NAME } from '../checkout/constants';
import { CheckoutPage } from '../checkout/checkout.page';

const test = base.extend< { checkoutPageObject: CheckoutPage } >( {
	checkoutPageObject: async ( { page }, use ) => {
		const pageObject = new CheckoutPage( {
			page,
		} );
		await use( pageObject );
	},
} );

test.describe( 'Shopper → Coupon', () => {
	test.beforeAll( async () => {
		await cli(
			`npm run wp-env run tests-cli -- wp wc shop_coupon create --code=testcoupon --discount_type=percent --amount=10 --usage_limit=1 --user=1`
		);
	} );

	test.afterAll( async () => {
		await cli(
			`npm run wp-env run tests-cli -- wp wc shop_coupon delete testcoupon`
		);
	} );

	test( 'Logged in user can apply single-use coupon and place order', async ( {
		checkoutPageObject,
		frontendUtils,
		page,
	} ) => {
		await frontendUtils.emptyCart();
		await frontendUtils.goToShop();
		await frontendUtils.addToCart( REGULAR_PRICED_PRODUCT_NAME );
		await frontendUtils.goToCart();
		await page.getByLabel( 'Add a coupon' ).click();
		await page.getByLabel( 'Enter code' ).fill( 'testcoupon' );
		await page.getByRole( 'button', { name: 'Apply' } ).click();

		await expect(
			page.getByLabel( 'Remove coupon "testcoupon"' )
		).toBeVisible();

		await page.getByLabel( 'Remove coupon "testcoupon"' ).click();

		await expect(
			page.getByLabel( 'Remove coupon "testcoupon"' )
		).toBeHidden();

		await frontendUtils.goToCheckout();
		await page.getByLabel( 'Add a coupon' ).click();
		await page.getByLabel( 'Enter code' ).fill( 'testcoupon' );
		await page.getByRole( 'button', { name: 'Apply' } ).click();

		await expect(
			page.getByLabel( 'Remove coupon "testcoupon"' )
		).toBeVisible();

		await checkoutPageObject.fillInCheckoutWithTestData();
		await checkoutPageObject.placeOrder();

		await expect(
			page.getByText( 'Thank you. Your order has been received.' )
		).toBeVisible();

		await expect(
			page.getByRole( 'rowheader', { name: 'Discount:' } )
		).toBeVisible();

		await expect(
			page.getByRole( 'cell', { name: '–$2.00' } )
		).toBeVisible();
	} );

	test( 'Logged in user cannot apply single-use coupon twice', async ( {} ) => {
		// Add a product to the cart.
		// Go to the cart page.
		// Apply the coupon.
		// Verify that the coupon cannot be applied again.
		// Go to the checkout page.
		// Apply the coupon.
		// Verify that the coupon cannot be applied again.
	} );
} );
