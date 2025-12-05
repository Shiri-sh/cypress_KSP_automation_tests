/// <reference types="cypress" />
Cypress.on('uncaught:exception', (err) => false);

describe('KSP shopping Testing', () => {

  const categoryList = "div[class^='categories'] a";
  const productList = "div[class^='products'] div[class^='product']";
  const productLink = "a[class^='productTitle']";
  const productPrice = "div[class^='currentPrice']";
  const addToCartButton = "[aria-label='כפתור הוספה לעגלה. לחצו ENTER על מנת להוסיף את המוצר לעגלה']";

  const cartItems = "div[class^='MuiStack'] + div + div > div";
  const cartTotal = ".rtl-or331j";
  const priceOfProductCart = ".rtl-p597l3";
  const nameOfProductCart = "a.rtl-1sivrne";
  const productQuantityDisplayCart = "[name='quantity']";

  const items = [
    { categoryIndex: 0, productindex: 1, quantity: 2, name: "", pricePerUnit: 0, total: 0 },
    { categoryIndex: 2, productindex: 4, quantity: 1, name: "", pricePerUnit: 0, total: 0 },
    { categoryIndex: 5, productindex: 0, quantity: 1, name: "", pricePerUnit: 0, total: 0 },
  ];

  const results: any[] = [];

  function logLists() {
    cy.log("========= EXPECTED ITEMS =========");
    items.forEach((it, index) => {
      cy.log(`[${index}] Name: ${it.name}, Price: ${it.pricePerUnit}, Quantity: ${it.quantity}, Total: ${it.total}`);
    });

    cy.log("========= CART RESULTS =========");
    results.forEach((r, index) => {
      cy.log(
        `[${index}] Name: ${r?.name || ""}, Price: ${r?.pricePerUnit || ""}, Quantity: ${r?.quantity || ""}, Total: ${r?.total || ""}, ExpectedTotal: ${r?.total_expected || ""}, DisplayedTotal: ${r?.total_displayed || ""}, Passed: ${r?.passed || ""}`
      );
    });
  }

  function clickMultipleTimes(productIndex: number, times: number) {
    if (times <= 0) return;
    cy.get(productList)
      .eq(productIndex)
      .find(addToCartButton)
      .click({ force: true })
      .then(() => {
        cy.wait(2000);
        clickMultipleTimes(productIndex, times - 1);
      });
  }

  function addProduct(itemIndex: number, categoryIndex: number, productIndex: number, quantity: number) {
    // כניסה מחדש לכל קטגוריה (נדרשת)
    cy.visit('https://ksp.co.il/web/world/5042');
    cy.wait(4000);

    return cy.get(categoryList)
      .eq(categoryIndex)
      .click({ force: true })
      .then(() => {
        cy.wait(2000); // חכה לDOM להתעדכן
        return cy.get(productList)
          .eq(productIndex)
          .find(productPrice)
          .should('be.visible')
          .invoke('text')
          .then((text) => {
            const price = parseFloat(text.replace(/[^0-9.-]+/g, ""));
            items[itemIndex].pricePerUnit = price;
            items[itemIndex].total = price * quantity;
            cy.log('Price: ' + price, 'Total: ' + items[itemIndex].total);
          });
      })
      .then(() => {
        return cy.get(productList)
          .eq(productIndex)
          .find(productLink)
          .invoke('text')
          .then((text) => {
            items[itemIndex].name = text.trim();
            cy.log('Name: ' + items[itemIndex].name);
          });
      })
      .then(() => {
        cy.screenshot(`product-${itemIndex}`, { capture: 'viewport' });
        clickMultipleTimes(productIndex, quantity);
        cy.screenshot(`product-${itemIndex}-added`, { capture: 'viewport' });
      });
  }
  function compareItems(expected: any, actual: any) {
      expect(actual.quantity).to.eq(expected.quantity);
      expected(actual.pricePerUnit).to.eq(actual.pricePerUnit);
      expected(actual.total).to.eq(actual.total);
  } 
  function cartValidation() {
    let expectedTotal = 0;
    results.length = 0; // אפס את המערך לפני מילוי חדש

    cy.wait(5000);

    return cy.get(cartItems)
      .should('have.length', items.length)
      .each(($item) => {
        const cartName = $item.find(nameOfProductCart).text().trim();
        const cartPrice = parseFloat($item.find(priceOfProductCart).text().replace(/[^0-9.-]+/g, ""));

        cy.wrap($item)
          .find(productQuantityDisplayCart)
          .invoke('val')
          .then((quantityValue) => {
            const cartQuantity = parseInt(quantityValue as string);

            expectedTotal += cartPrice;
            const matchingItem = items.find((x) => cartName.includes(x.name)); 
            expect(matchingItem).to.exist; 
            
            const cartItem = {
              name: cartName,
              quantity: cartQuantity,
              pricePerUnit: cartPrice / cartQuantity,
              total: cartPrice,
            };
            compareItems(matchingItem, cartItem);
            results.push({ ...cartItem });
            cy.log('Name: ' + cartItem.name, 'Quantity: ' + cartItem.quantity, 'Total: ' + cartItem.total, 'Price: ' + cartItem.pricePerUnit);
          });
      })
      .then(() => {
        // הוסף את סך הכל אחרי שכל הפריטים נוספו
        cy.get(cartTotal)
          .invoke('text')
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
      });
  }

  function extractResults() {
    const lines: string[] = [];
    lines.push("EXPECTED ITEMS");
    lines.push("Name,Price,Quantity,Total");
    items.forEach(it => {
      lines.push(`${it.name},${it.pricePerUnit},${it.quantity},${it.total}`);
    });

    lines.push("");
    lines.push("CART ITEMS");
    lines.push("Name,Price,Quantity,Total,ExpectedTotal,DisplayedTotal,Passed");
    results.forEach(r => {
      lines.push(
        `${r.name || ""},${r.pricePerUnit || ""},${r.quantity || ""},${r.total || ""},${r.total_expected || ""},${r.total_displayed || ""},${r.passed ?? ""}`
      );
    });

    cy.writeFile("cypress/results/cart-results.csv", lines.join("\n"), { encoding: "utf-8" });
  }

  it('adds items to the cart', () => {
    return items
      .reduce<Cypress.Chainable>(
        (chain, item, i) => chain.then(() =>
          addProduct(i, item.categoryIndex, item.productindex, item.quantity)
        ),
        cy.wrap(null)
      )
      .then(() => cy.visit('https://ksp.co.il/web/cart'))
      .then(() => cartValidation())
      .then(() => logLists())
      .then(() => extractResults());
  });

});
