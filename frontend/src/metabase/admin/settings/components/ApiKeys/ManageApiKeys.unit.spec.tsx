import userEvent from "@testing-library/user-event";
import fetchMock from "fetch-mock";

import { renderWithProviders, screen, within } from "__support__/ui";
import {
  setupApiKeyEndpoints,
  setupGroupsEndpoint,
} from "__support__/server-mocks";
import { ManageApiKeys } from "metabase/admin/settings/components/ApiKeys/ManageApiKeys";
import { createMockGroup } from "metabase-types/api/mocks";

const GROUPS = [
  createMockGroup(),
  createMockGroup({ id: 2, name: "Administrators" }),
  createMockGroup({ id: 3, name: "foo" }),
  createMockGroup({ id: 4, name: "bar" }),
  createMockGroup({ id: 5, name: "flamingos" }),
];

function setup() {
  setupGroupsEndpoint(GROUPS);
  setupApiKeyEndpoints([
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
  ]);
  renderWithProviders(<ManageApiKeys />);
}
describe("ManageApiKeys", () => {
  it("should render the component", async () => {
    setup();
    expect(screen.getByText("Manage API Keys")).toBeInTheDocument();
  });
  it("should load API keys from api", async () => {
    setup();
    expect(await screen.findByText("Development API Key")).toBeInTheDocument();
  });
  it("should create a new API key", async () => {
    setup();
    userEvent.click(screen.getByText("Create API Key"));
    expect(await screen.findByText("Create a new API Key")).toBeInTheDocument();
    userEvent.type(screen.getByLabelText(/Key name/), "New key");
    userEvent.click(screen.getByLabelText(/Select a group/));
    userEvent.click(await screen.findByText("flamingos"));
    userEvent.click(screen.getByRole("button", { name: "Create" }));
    expect(
      await screen.findByText("Create a new API Key"),
    ).not.toBeInTheDocument();
    const lastRequest = await fetchMock
      .lastCall("path:/api/api-key", { method: "POST" })
      ?.request?.json();
    expect(lastRequest).toEqual({ name: "New key", group_id: 5 });
  });
  it("should regenerate an API key", async () => {
    setup();
    const REGEN_URL = "path:/api/api-key/1/regenerate";
    fetchMock.put(REGEN_URL, 200);

    userEvent.click(
      within(
        await screen.findByRole("row", {
          name: /development api key/i,
        }),
      ).getByRole("img", { name: /pencil/i }),
    );
    await screen.findByText("Edit API Key");
    userEvent.click(screen.getByRole("button", { name: "Regenerate API Key" }));
    userEvent.click(await screen.findByRole("button", { name: "Regenerate" }));

    await screen.findByText("Copy and save the API key");
    const lastRequest = await fetchMock
      .lastCall(REGEN_URL, { method: "PUT" })
      ?.request?.json();
    expect(lastRequest).toEqual({});
  });
  it("should edit API key", async () => {
    setup();
    const EDIT_URL = "path:/api/api-key/1";
    fetchMock.put(EDIT_URL, 200);

    userEvent.click(
      within(
        await screen.findByRole("row", {
          name: /development api key/i,
        }),
      ).getByRole("img", { name: /pencil/i }),
    );
    await screen.findByText("Edit API Key");

    const group = await screen.findByLabelText(
      "Select a group to inherit its permissions",
    );
    userEvent.click(group);
    userEvent.click(await screen.findByText("flamingos"));

    const keyName = screen.getByLabelText("Key name");
    userEvent.clear(keyName);
    userEvent.type(keyName, "My Key");

    userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByText("Edit API Key")).not.toBeInTheDocument();
    const lastRequest = await fetchMock
      .lastCall(EDIT_URL, { method: "PUT" })
      ?.request?.json();
    expect(lastRequest).toEqual({ group_id: 5, name: "My Key" });
  });
});
