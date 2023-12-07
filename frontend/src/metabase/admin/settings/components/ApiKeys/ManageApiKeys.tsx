import { t } from "ttag";
import { useCallback, useEffect, useState } from "react";

import { Stack, Title, Text, Button, Group } from "metabase/ui";

import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";

import type { ApiKey } from "metabase-types/api";

import { CreateApiKeyModal } from "./CreateApiKeyModal";
import { EditApiKeyModal } from "./EditApiKeyModal";
import { DeleteApiKeyModal } from "./DeleteApiKeyModal";

const MOCK_ROWS: ApiKey[] = [
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
    group_id: 1,
    group_name: "All Users",
    creator_id: 1,
    masked_key: "asdfasdfa",
    created_at: "2010 Aug 10",
    updated_at: "2010 Aug 10",
  },
];

export const ManageApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<null | ApiKey[]>(null);
  const [modal, setModal] = useState<null | "create" | "edit" | "delete">(null);
  const [activeApiKey, setActiveApiKey] = useState<null | ApiKey>(null);

  const refreshList = useCallback(() => {
    setApiKeys(MOCK_ROWS);
    ApiKeysApi.list().then(setApiKeys);
  }, []);

  const handleClose = () => setModal(null);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  // TODO: Display <LoadingAndErrorWrapper isLoading={} error={}>

  const isTableEmpty = apiKeys?.length === 0;

  return (
    <>
      {modal === "create" ? (
        <CreateApiKeyModal onClose={handleClose} refreshList={refreshList} />
      ) : modal === "edit" && activeApiKey ? (
        <EditApiKeyModal
          onClose={handleClose}
          refreshList={refreshList}
          apiKey={activeApiKey}
        />
      ) : modal === "delete" && activeApiKey ? (
        <DeleteApiKeyModal
          apiKey={activeApiKey}
          onClose={handleClose}
          refreshList={refreshList}
        />
      ) : null}
      <Stack pl="md" spacing="lg">
        <Breadcrumbs
          crumbs={[
            [t`Authentication`, "/admin/settings/authentication"],
            [t`API Keys`],
          ]}
        />
        <Group align="end" position="apart">
          <Stack>
            <Title>{t`Manage API Keys`}</Title>
            {!isTableEmpty && (
              <Text color="text.1">{t`Allow users to use the API keys to authenticate their API calls.`}</Text>
            )}
          </Stack>
          <Button
            variant="filled"
            onClick={() => setModal("create")}
          >{t`Create API Key`}</Button>
        </Group>
        <table className="ContentTable border-bottom">
          <thead>
            <tr>
              <th>{t`Key name`}</th>
              <th>{t`Group`}</th>
              <th>{t`Key`}</th>
              <th>{t`Last Modified By`}</th>
              <th>{t`Last Modified On`}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {apiKeys?.map(apiKey => (
              <tr key={apiKey.id} className="border-bottom">
                <td className="text-bold">{apiKey.name}</td>
                <td>{apiKey.group_id}</td>
                <td>{apiKey.masked_key}</td>
                <td>{apiKey.creator_id}</td>
                <td>{apiKey.updated_at}</td>
                <td>
                  <Group spacing="md">
                    <Icon
                      name="pencil"
                      onClick={() => {
                        setActiveApiKey(apiKey);
                        setModal("edit");
                      }}
                      className="cursor-pointer"
                    />
                    <Icon
                      name="trash"
                      onClick={() => {
                        setActiveApiKey(apiKey);
                        setModal("delete");
                      }}
                      className="cursor-pointer"
                    />
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isTableEmpty && (
          <Stack h="40rem" align="center" justify="center" spacing="sm">
            <Title>{t`No API keys here yet`}</Title>
            <Text color="text.1">{t`Create API keys to programmatically authenticate their API calls.`}</Text>
          </Stack>
        )}
      </Stack>
    </>
  );
};
