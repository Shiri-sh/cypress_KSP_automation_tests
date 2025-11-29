/// <reference types="cypress" />

describe('KSP shopping Testing', () => {
  const categoryList = "div[class^='categories'] a";
  const productList = "div[class^='products'] a";
  const quantityDecreaseButton = ".sign-0-3-460.sign-d6-0-3-589.null";
  const quantityIncreaseButton = ".sign-0-3-460.sign-d6-0-3-589.disabled-0-3-462";
  const quantityDisplay = ".quantity-0-3-461";
  const addToCartButton = ".MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedSecondary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorSecondary.MuiButton-root.MuiButton-contained.MuiButton-containedSecondary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorSecondary.muirtl-4w0j7a";
  const cartQuantityIcon=".MuiBadge-badge.MuiBadge-standard.MuiBadge-anchorOriginTopRight.MuiBadge-anchorOriginTopRightRectangular.MuiBadge-overlapRectangular.MuiBadge-colorSecondary.muirtl-yg8mj6";
  const popUpAddToCart="span[tabindex='0']" ;
  const goToCartButton=".MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.button-0-3-82.muirtl-f9j014";
  const cartItems=".rtl-17wlwch div";
  const cartTotal =".rtl-or331j";
  const priceOfProduct=".rtl-1xvycce";
  it('adds items to the cart', () => {
    const items=[
        {index:0,quantity:1}, 
        {index:1,quantity:2},
        {index:2,quantity:1}
    ]; 
    cy.wrap(items).each((i: {index: number, quantity: number}) => {
      cy.visit('https://ksp.co.il/web/world/5042'); // Replace with the actual URL of the page to be tested

      cy.get(categoryList).eq(i.index).click();
      cy.get(productList).eq(i.index).click();
        for (let j = 1; j < i.quantity; j++) {
            cy.get(quantityIncreaseButton).click();
        }
        cy.get(quantityDisplay).invoke('text').then((text) => {
            const preQuantityDisplay = parseInt(text);

            cy.get(addToCartButton).click();

            cy.get(popUpAddToCart).should('be.visible');

            cy.get(quantityDisplay).invoke('text').then((newText) => {
                const postQuantityDisplay = parseInt(newText);
                expect(postQuantityDisplay).to.eq(preQuantityDisplay+1);
            });       
        });
    });
    cy.get(goToCartButton).click();

    cy.get(cartItems).should('have.length', items.length);

    let expectedTotal = 0;
    cy.wrap(cartItems).each(($item, index) => {
        const priceText = $item.find(priceOfProduct).text();

        const price = parseFloat(priceText.replace(/[^0-9.-]+/g,""));
        const quantity = items[index].quantity;
        expectedTotal += price * quantity;
    });

    cy.get(cartTotal).invoke('text').then((totalText) => {
        const displayedTotal = parseFloat(totalText.replace(/[^0-9.-]+/g,""));
        expect(displayedTotal).to.eq(expectedTotal);
    });

  });
});