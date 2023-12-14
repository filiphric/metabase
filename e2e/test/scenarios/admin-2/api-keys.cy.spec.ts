import { restore } from "e2e/support/helpers";
import type { ApiKey } from "metabase-types/api";

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

const getRequestId = req =>
  parseInt(req.url.match(/api-key\/(\d+)/)?.[1] ?? "", 10);

describe("scenarios > admin > settings > API keys", () => {
  // TODO: replace intercepts below with actual requests to test backend
  let mockRows: ApiKey[] = [];

  beforeEach(() => {
    restore();
    mockRows = [...MOCK_ROWS];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cy.signInAsAdmin();
  });

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
    cy.intercept("GET", "/api/api-key", req => req.reply(200, mockRows));
    cy.visit("/admin/settings/authentication/api-keys");
    getApiKeysRows()
      .should("contain", "Development API Key")
      .and("contain", "Production API Key");
  });
  it("should allow creating an API key", () => {
    cy.intercept("GET", "/api/api-key", req => req.reply(200, mockRows)).as(
      "fetchKeys",
    );
    cy.intercept("POST", "/api/api-key", req => {
      mockRows.push(req.body);
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
    cy.intercept("GET", "/api/api-key", req => req.reply(200, mockRows)).as(
      "fetchKeys",
    );
    cy.intercept("DELETE", "/api/api-key/*", req => {
      const id = getRequestId(req);
      mockRows = mockRows.filter(row => row.id !== id);
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
    getApiKeysRows().should("not.contain", "Development API Key");
    cy.reload();
    getApiKeysRows().should("not.contain", "Development API Key");
  });
  it("should allow editing an API key", () => {
    cy.intercept("GET", "/api/api-key", req => req.reply(200, mockRows)).as(
      "fetchKeys",
    );
    cy.intercept("PUT", "/api/api-key/*", req => {
      const id = getRequestId(req);
      const rowI = mockRows.findIndex(row => row.id === id);
      const row = mockRows[rowI];
      mockRows[rowI] = { ...row, ...req.body };
      req.reply(200);
    }).as("saveKey");
    cy.visit("/admin/settings/authentication/api-keys");
    cy.wait("@fetchKeys");
    getApiKeysRows()
      .contains("Development API Key")
      .closest("tr")
      .icon("pencil")
      .click();
    cy.findByLabelText(/Key name/)
      .clear()
      .type("Different key name");
    cy.button("Save").click();
    cy.wait("@saveKey");
    cy.wait("@fetchKeys");
    getApiKeysRows()
      .should("not.contain", "Development API Key")
      .and("contain", "Different key name");
    cy.reload();
    getApiKeysRows()
      .should("not.contain", "Development API Key")
      .and("contain", "Different key name");
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
