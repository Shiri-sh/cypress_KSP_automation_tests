/// <reference types="cypress" />

describe('KSP shopping Testing', () => {
  const categoryList = "div[class^='categories'] a";
  const productList = "div[class^='products'] a";
  const quantityDecreaseButton = ".sign-0-3-460.sign-d6-0-3-589.null";
  const quantityIncreaseButton = ".sign-0-3-460.sign-d6-0-3-589.disabled-0-3-462";
  const productQuantityDisplay = "div[class^='quantity']";
  const addToCartButton = ".MuiButtonBase-root.MuiButton-root.MuiButton-contained.MuiButton-containedSecondary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorSecondary.MuiButton-root.MuiButton-contained.MuiButton-containedSecondary.MuiButton-sizeMedium.MuiButton-containedSizeMedium.MuiButton-colorSecondary.muirtl-4w0j7a";
  const cartQuantityIcon="span.MuiBadge-badge.MuiBadge-standard.MuiBadge-anchorOriginTopRight.MuiBadge-anchorOriginTopRightRectangular.MuiBadge-overlapRectangular.MuiBadge-colorSecondary.muirtl-yg8mj6";
  const popUpAddToCart="span[tabindex='0']" ;
  const goToCartButton=".MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.button-0-3-82.muirtl-f9j014";
  const cartItems=".rtl-ydxmko div";
  const cartTotal =".rtl-or331j";
  const priceOfProduct=".rtl-1iiwiev";
  const nameOfProduct="a.rtl-1sivrne";
  it('adds items to the cart', () => {
    const items=[
        {index:0,quantity:1}, 
        {index:1,quantity:2},
        {index:2,quantity:1}
    ]; 
    const results: any[] = [];
    let expectedTotal = 0;

    cy.wrap(items).each((i: {index: number, quantity: number}) => {
      cy.visit('https://ksp.co.il/web/world/5042');
      cy.wait(1000);
      cy.get(categoryList).eq(i.index).click({force: true});
      cy.wait(1000);
      cy.get(productList).eq(i.index).click({force:true});
        for (let j = 1; j < i.quantity; j++) {
            cy.get(quantityIncreaseButton).click();
        }
        // cy.get(cartQuantityIcon).invoke('text').then((text) => {
        //     const preQuantityDisplay = parseInt(text);
            cy.screenshot('cart', {capture: 'viewport'});
            cy.get(addToCartButton).click();
            cy.wait(1000);
            cy.get(popUpAddToCart).should('be.visible');
            cy.wait(1000);
            cy.screenshot('cart', {capture: 'viewport'});


            // cy.get(cartQuantityIcon).invoke('text').then((newText) => {
            //     const postQuantityDisplay = parseInt(newText);
            //     expect(postQuantityDisplay).to.eq(preQuantityDisplay+1);
            // });       
        //});
    });
    cy.get(goToCartButton).click();

    cy.get(cartItems).should('have.length', items.length);

    cy.wrap(cartItems).each(($item, index) => {
        const name=$item.find(nameOfProduct).text();
        const priceText = $item.find(priceOfProduct).text();

        const price = parseFloat(priceText.replace(/[^0-9.-]+/g,""));
        const quantity = items[index].quantity;
        expectedTotal += price * quantity;
        results.push({
            product: name,
            price: price,
            quantity: quantity,
            total: price * quantity
        });
    });

    cy.get(cartTotal).invoke('text').then((totalText) => {
        const displayedTotal = parseFloat(totalText.replace(/[^0-9.-]+/g,""));
        expect(displayedTotal).to.eq(expectedTotal);

        results.push({
        product: "TOTAL",
        price: "",
        quantity: "",
        total_expected: expectedTotal,
        total_displayed: displayedTotal,
        passed: displayedTotal === expectedTotal
      });

      const csvLines = [
        "Product,Price,Quantity,Total,ExpectedTotal,DisplayedTotal,Passed",
        ...results.map(r =>
          `${r.product || ""},${r.price || ""},${r.quantity || ""},${r.total || ""},${r.total_expected || ""},${r.total_displayed || ""},${r.passed ?? ""}`
        )
      ];

      cy.writeFile("cypress/results/cart-results.csv", csvLines.join("\n"));

    });

  });
});