import { restore } from "e2e/support/helpers";

describe("scenarios > admin > settings > API keys", () => {
  beforeEach(() => {
    restore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cy.signInAsAdmin();
    cy.visit("/admin/settings/authentication");
  });

  it("should allow creating an API key", () => {
    //
  });
  it("should allow deleting an API key", () => {
    //
  });
  it("should allow editing an API key", () => {
    //
  });
  it("should allow  an API key", () => {
    //
  });
});
