import { restore } from "e2e/support/helpers";

const MOCK_ROWS = [
  {
    name: "Development API Key",
    id: 1,
    group_id: 1,
    group_name: "All Users",
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
  {
    name: "Production API Key",
    id: 2,
    group_id: 2,
    group_name: "All Users",
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
];

describe("scenarios > admin > settings > API keys", () => {
  beforeEach(() => {
    restore();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cy.signInAsAdmin();
  });
  // TODO: replace intercepts below with actual requests to test backend

  it("should show number of API keys on auth card", () => {
    cy.intercept("GET", "/api/api-key/count", req => req.reply(200, "5"));
    cy.visit("/admin/settings/authentication");
    getApiKeysCard()
      .findByTestId("card-badge")
      .should("have.text", "5 API Keys");

    cy.intercept("GET", "/api/api-key/count", req => req.reply(200, "1"));
    cy.reload();
    getApiKeysCard()
      .findByTestId("card-badge")
      .should("have.text", "1 API Key");

    cy.intercept("GET", "/api/api-key/count", req => req.reply(200, "0"));
    cy.reload();
    getApiKeysCard().findByTestId("card-badge").should("not.exist");
  });
  it("should list existing API keys", () => {
    cy.intercept("GET", "/api/api-key", req => req.reply(200, MOCK_ROWS));
    cy.visit("/admin/settings/authentication/api-keys");
    getApiKeysRows().contains("Development API Key").should("exist");
    getApiKeysRows().contains("Production API Key").should("exist");
  });
  it("should allow creating an API key", () => {
    const myRows = [...MOCK_ROWS];
    cy.intercept("GET", "/api/api-key", req => req.reply(200, myRows)).as(
      "fetchKeys",
    );
    cy.intercept("POST", "/api/api-key", req => {
      myRows.push(req.body);
      req.reply(200);
    });

    cy.visit("/admin/settings/authentication/api-keys");
    cy.wait("@fetchKeys");
    cy.button("Create API Key").click();
    cy.findByLabelText(/Key name/).type("New key");
    cy.findByLabelText(/Select a group/).click();
    cy.findByRole("listbox").findByText("Administrators").click();
    cy.button("Create").click();
    cy.wait("@fetchKeys");
    cy.button("Done").click();
    getApiKeysRows().contains("New key").should("exist");
    cy.reload();
    getApiKeysRows().contains("New key").should("exist");
  });
  it("should allow deleting an API key", () => {
    let myRows = [...MOCK_ROWS];
    cy.intercept("GET", "/api/api-key", req => req.reply(200, myRows)).as(
      "fetchKeys",
    );
    cy.intercept("DELETE", "/api/api-key/1", req => {
      myRows = myRows.filter(row => row.id !== 1);
      req.reply(200);
    }).as("deleteKey");
    cy.visit("/admin/settings/authentication/api-keys");
    cy.wait("@fetchKeys");
    getApiKeysRows()
      .contains("Development API Key")
      .closest("tr")
      .icon("trash")
      .click();
    cy.button("Delete API Key").click();
    cy.wait("@deleteKey");
    cy.wait("@fetchKeys");
    getApiKeysRows().contains("Development API Key").should("not.exist");
    cy.reload();
    getApiKeysRows().contains("Development API Key").should("not.exist");
  });
  it("should allow editing an API key", () => {
    //
  });
  it("should be notified when deleting a group with API keys", () => {
    //
  });
  it("should show API keys when viewing Group details", () => {
    //
  });
  it("should show when a question was last edited by an API key", () => {
    //
  });
});
const getApiKeysCard = () => cy.findByText("API Keys").parent().parent();

const getApiKeysRows = () =>
  cy.findByTestId("api-keys-table").find("tbody > tr");
