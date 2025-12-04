/// <reference types="cypress" />
Cypress.on('uncaught:exception', (err) => {
  return false;
})
describe('KSP shopping Testing', () => {
  const categoryList = "div[class^='categories'] a";
  const productList = "div[class^='products'] div[class^='product']";
  const productLink = "a[class^='productTitle']";
  const productName = "h1[aria-label] span";
  const productPrice = "div[class^='currentPrice']";
  const quantityIncreaseButton = "svg[aria-label='לחץ להגדלת כמות']";
  const productQuantityDisplay = "div[class^='quantity']";
  const addToCartButton = "div[class^='addToCart'] button";
  const popUpAddToCart = "span[tabindex='0']";

  const goToCartButton = "[aria-label='עגלה']";
  const cartItems = "div[class^='MuiStack'] + div + div > div";//#cartRoot > div > div > div.rtl-1q26duc > div:nth-child(2) > div.MuiCardContent-root.rtl-4rkzdg > div.rtl-ydxmko > div:nth-child(1)
  const cartTotal = ".rtl-or331j";
  const priceOfProductCart = ".rtl-1iiwiev";
  const nameOfProductCart = "a.rtl-1sivrne";
  const productQuantityDisplayCart = "[name='quantity']";


  const items = [
    { categoryIndex: 0, productindex: 1, quantity: 2, name: "", pricePerUnit: 0, total: 0 },
    { categoryIndex: 3, productindex: 2, quantity: 1, name: "", pricePerUnit: 0, total: 0 },
    { categoryIndex: 4, productindex: 3, quantity: 1, name: "", pricePerUnit: 0, total: 0 },
  ]
  const results: any[] = [];
  let expectedTotal = 0;

  function addProduct(itemIndex: number, categoryIndex: number, productIndex: number, quantity: number) {
    cy.visit('https://ksp.co.il/web/world/5042');
    cy.wait(4000);

    return cy.get(categoryList).eq(categoryIndex).click({ force: true })
      .then(() => {
        return cy.get(productList)
          .eq(productIndex)
          .find(productPrice)
          .invoke('text')
          .then((text) => {
            const price = parseFloat(text.replace(/[^0-9.-]+/g, ""));
            items[itemIndex].pricePerUnit = price;
            items[itemIndex].total = price * quantity;
            cy.log('Total: ' + items[itemIndex].total, 'Price: ' + items[itemIndex].pricePerUnit);
            cy.wait(2000);
          });
      })
      .then(() => {
        return cy.get(productList).eq(productIndex).find(productLink).invoke('text').then((text) => {
          items[itemIndex].name = text;
          cy.log('Name: ' + items[itemIndex].name);
          cy.wait(1000);
        });
      })
      .then(() => {
        return cy.get(productList).eq(productIndex).find(productLink).click({ force: true });
      })
      .then(() => {
        for (let j = 1; j < quantity; j++) {
          cy.get(quantityIncreaseButton).first().click();
        }
        
      })
      .then(() => {
       // cy.screenshot('cart', {capture: 'viewport'});
        cy.get(addToCartButton).first().click();
        cy.wait(1000);
        cy.get(popUpAddToCart).should('be.visible');
        //cy.screenshot('cart', {capture: 'viewport'});
      });
  }

  function compareItems(expected: any, actual: any) {
    expect(actual.name).to.eq(expected.name);
    expect(actual.quantity).to.eq(expected.quantity);
  }
function cartValidation() {
  cy.wait(5000);
  cy.get(cartItems).should('have.length', items.length);

  cy.get(cartItems).each(($item) => {
    const cartName = $item.find(nameOfProductCart).text();
    cy.log('cartName: ' + cartName);
    const cartPrice = parseFloat(
      $item.find(priceOfProductCart).text().replace(/[^0-9.-]+/g, "")
    );

    cy.wrap($item)
      .find(productQuantityDisplayCart)
      .invoke('val')
      .then((quantityValue) => {
        const cartQuantity = parseInt(quantityValue as string);
        const itemTotal = cartPrice * cartQuantity;

        expectedTotal += itemTotal;

        const matchingItem = items.find((x) => cartName.includes(x.name));
        expect(matchingItem).to.exist;
        expect(matchingItem?.quantity).to.eq(cartQuantity);

        const cartItem = {
          quantity: cartQuantity,
          name: cartName,
          pricePerUnit: cartPrice,
          total: itemTotal,
        };

        cy.log(
          `${cartItem.name} quantity: ${cartItem.quantity} price: ${cartItem.pricePerUnit} total: ${cartItem.total}`
        );

        results.push({ ...cartItem });
      });
  });

  cy.get(cartTotal)
    .invoke("text")
    .then((totalText) => {
      const displayedTotal = parseFloat(totalText.replace(/[^0-9.-]+/g, ""));

      results.push({
        name: "TOTAL",
        quantity: "",
        pricePerUnit: "",
        total_expected: expectedTotal,
        total_displayed: displayedTotal,
        passed: displayedTotal === expectedTotal,
      });
    });
}
  function extractResults() {
    const csvLines = [
      "Product,Price,Quantity,Total,ExpectedTotal,DisplayedTotal,Passed",
      ...results.map(r =>
        `${r.name || ""},${r.pricePerUnit || ""},${r.quantity || ""},${r.total || ""},${r.total_expected || ""},${r.total_displayed || ""},${r.passed ?? ""}`
      )
    ];

    cy.writeFile("cypress/results/cart-results.csv", csvLines.join("\n"));
  }


  it('adds items to the cart', () => {

    for (let i = 0; i < items.length; i++) {
      addProduct(i, items[i].categoryIndex, items[i].productindex, items[i].quantity);
    }

    cy.visit('https://ksp.co.il/web/cart')

    cartValidation();
    extractResults();

  });

});
