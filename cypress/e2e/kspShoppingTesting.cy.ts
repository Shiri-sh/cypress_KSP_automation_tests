/// <reference types="cypress" />
Cypress.on('uncaught:exception',(err) => {
   return false;
})
describe('KSP shopping Testing', () => {
  const categoryList = "div[class^='categories'] a";
  const productList = "div[class^='products'] div[class^='product']";
  const productLink="a[class^='productTitle']"; 
  const productName="h1[aria-label] span";
  const productPrice="div[class^='currentPrice']";
  const quantityIncreaseButton = "svg[aria-label='לחץ להגדלת כמות']";
  const productQuantityDisplay = "div[class^='quantity']";
  const addToCartButton = "div[class^='addToCart'] button";  
  const popUpAddToCart="span[tabindex='0']" ;
  
  const goToCartButton=".MuiButtonBase-root.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.MuiButton-root.MuiButton-text.MuiButton-textPrimary.MuiButton-sizeMedium.MuiButton-textSizeMedium.MuiButton-colorPrimary.button-0-3-82.muirtl-f9j014";
  
  const cartItems=".rtl-ydxmko div";
  const cartTotal =".rtl-or331j";
  const priceOfProductCart=".rtl-1iiwiev";
  const nameOfProductCart="a.rtl-1sivrne";
  const productQuantityDisplayCart="[name='quantity']";


  const items=[
        {categoryIndex:0,productindex: 1, quantity: 2,name:"",pricePerUnit:0,total:0},
        {categoryIndex:0,productindex: 1, quantity: 1,name:"",pricePerUnit:0,total:0},
        {categoryIndex:0,productindex: 1, quantity: 1,name:"",pricePerUnit:0,total:0},
    ]
  function addProduct(itemIndex: number,categoryIndex:number, productIndex: number, quantity: number) {
        cy.visit('https://ksp.co.il/web/world/5042');
        cy.wait(4000);
        
      return cy.get(categoryList).eq(categoryIndex).click({force: true})
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
          });
      })
      .then(() => {
        return cy.get(productList).eq(productIndex).find(productLink).invoke('text').then((text) => {
          items[itemIndex].name = text;
          cy.log('Name: ' + items[itemIndex].name);
        });
      })
      .then(() => {
        return cy.get(productList).eq(productIndex).find(productLink).click({force:true});
      })
      .then(() => {
        for (let j = 1; j < quantity; j++) {
          cy.get(quantityIncreaseButton).first().click();
        }

      })
      .then(() => {
        //cy.screenshot('cart', {capture: 'viewport'});
        cy.get(addToCartButton).first().click();
        cy.wait(1000);
        cy.get(popUpAddToCart).should('be.visible');
        //cy.screenshot('cart', {capture: 'viewport'});
      });
  }

  function compareItems(expected: any, actual: any){ 
    expect(actual.product.trim()).to.eq(expected.name.trim());
    expect(actual.price).to.eq(expected.pricePerUnit);
    expect(actual.quantity).to.eq(expected.quantity);
    expect(actual.total).to.eq(expected.total);
  }

  it('adds items to the cart', () => {
    
    const results: any[] = [];
    let expectedTotal = 0;

    for(let i=0;i<items.length;i++){
        addProduct(i,items[i].categoryIndex,items[i].productindex,items[i].quantity); 
    }

    cy.get(goToCartButton).click();


    cy.get(cartItems).should('have.length', items.length);

    cy.get(cartItems).each(($item, index) => {
        const cartName = $item.find(nameOfProductCart).text();
        const cartPrice = parseFloat(
            $item.find(priceOfProductCart).text().replace(/[^0-9.-]+/g, "")
        );
        //const cartQuantity = parseInt($item.find(productQuantityDisplayCart).invoke('val').text());
        let cartQuantity = 0;
        cy.wrap($item)
          .find(productQuantityDisplayCart)
          .invoke('val')
          .then(quantityValue => {
               cartQuantity = parseInt(quantityValue as string);
            // המשך הקוד שלך
          });

        expectedTotal += cartPrice * cartQuantity;

        const matchingItem = items.find(x => cartName.includes(x.name));

        const cartItem={
            product: cartName,
            price: cartPrice,
            quantity: cartQuantity,
            total: cartPrice * cartQuantity,
        }

        compareItems(matchingItem,cartItem);

        results.push({... cartItem});
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