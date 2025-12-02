/// <reference types="cypress" />

describe("KSP Register Form Tests", () => {

  const url = "https://auth.ksp.co.il/register?redirect_url=https%3A%2F%2Fksp.co.il%2Fweb%2Faccount";
  const fnameField = "input[id=':R337bl6:']";
  const lnameField = "input[id=':R537bl6:']";
  const emailField = "input[id=':R57bl6:']";
  const phoneField = "input[id=':R77bl6:']";
  const fPassField = "input[id=':R97bl6:']";
  const sPassField = "input[id=':Rb7bl6:']";
  const submitButt = "[type='submit']";
  const helperText = "p[id$=-helper-text]";

  const fillAll = (fname: string, lname: string, email: string, phone: string, pass1: string, pass2: string) => {
    cy.get(fnameField).clear().type(fname);
    cy.get(lnameField).clear().type(lname);
    cy.get(emailField).clear().type(email);
    cy.get(phoneField).clear().type(phone);
    cy.get(fPassField).clear().type(pass1);
    cy.get(sPassField).clear().type(pass2);
  };

  const register = () => {
    cy.get(submitButt).click();
  };

  const helperDisplayed = () => {
    return cy.get(helperText).should("be.visible");
  };

  beforeEach(() => {
    cy.visit(url);
  });

  it("fill form with invalid email", () => {
    fillAll("shiri","shachor","shiri","0548483430","!Shiri123","!Shiri123");
    register();
    helperDisplayed();
  });

  it("fill form with invalid phone", () => {
    fillAll("shiri","shachor","shiril@gmail.com","0548483","!Shiri123","!Shiri123");
    register();
    helperDisplayed();
  });

  it("fill form with no fields", () => {
    register();
    helperDisplayed();
  });

  it("fill form with wrong second password", () => {
    fillAll("shiri","shachor","shirim@gmail.com","0548483430","!Shiri1234","!Shiri123");
    register();
    helperDisplayed();
  });

  it("fill form with invalid first name", () => {
    fillAll("s","shachor","shirik@gmail.com","0548483430","!Shiri123","!Shiri123");
    register();
    helperDisplayed();
  });

  it("fill form with invalid last name", () => {
    fillAll("shiri","s","shirij@gmail.com","0548483430","!Shiri123","!Shiri123");
    register();
    helperDisplayed();
  });

  it("fill form with valid data", () => {
    fillAll("shiri","shachor","shirish@gmail.com","0548483430","!Shiri123","!Shiri123");
    register();
    cy.get(helperText).should("not.exist");
  });

});
