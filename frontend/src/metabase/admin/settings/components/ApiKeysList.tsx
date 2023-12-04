import { t } from "ttag";
import { useEffect, useState } from "react";

import { Modal, Button, Stack, Group } from "metabase/ui";

import Breadcrumbs from "metabase/components/Breadcrumbs";
import { ApiKeysApi } from "metabase/services";
import { Icon } from "metabase/core/components/Icon";
import { Form, FormProvider } from "metabase/forms";

export const ApiKeysList = () => {
  const [keyRows, setKeyRows] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // :name, :group_id, :created_at, :updated_at, and :masked_key
    ApiKeysApi.list().then(setKeyRows);
    setKeyRows([
      {
        name: "Development API Key",
        group_id: 1,
        creator_id: 1,
        masked_key: "asdfasdfa",
        created_at: "2010 Aug 10",
        updated_at: "2010 Aug 10",
      },
      {
        name: "Production API Key",
        group_id: 1,
        creator_id: 1,
        masked_key: "asdfasdfa",
        created_at: "2010 Aug 10",
        updated_at: "2010 Aug 10",
      },
    ]);
  }, []);

  return (
    <>
      <Modal
        padding="xl"
        opened={isCreating}
        onClose={() => setIsCreating(false)}
        title={t`Create a new API Key`}
      />
      <Modal
        padding="xl"
        opened={isEditing}
        onClose={() => setIsEditing(false)}
        title={t`Edit API Key`}
      />
      <Modal
        padding="xl"
        opened={isDeleting}
        onClose={() => setIsDeleting(false)}
        title={t`Delete API Key`}
      />
      <Stack pl="md">
        <Breadcrumbs
          className="mb3"
          crumbs={[
            [t`Authentication`, "/admin/settings/authentication"],
            [t`API Keys`],
          ]}
        />
        <Group align="end" position="apart">
          <Stack>
            <h2>{t`Manage API Keys`}</h2>
            <p>{t`Allow users to use the API keys to authenticate their API calls.`}</p>
          </Stack>
          <Button
            variant="filled"
            onClick={() => setIsCreating(true)}
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
            {keyRows.map(
              ({
                name,
                group_id,
                creator_id,
                masked_key,
                created_at,
                updated_at,
              }) => (
                <tr key={name} className="border-bottom">
                  <td>{name}</td>
                  <td>{group_id}</td>
                  <td>{masked_key}</td>
                  <td>{creator_id}</td>
                  <td>{updated_at}</td>
                  <td>
                    <Group spacing="md">
                      <Icon
                        name="pencil"
                        onClick={() => setIsEditing(true)}
                        className="cursor-pointer"
                      />
                      <Icon
                        name="trash"
                        onClick={() => setIsDeleting(true)}
                        className="cursor-pointer"
                      />
                    </Group>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </Stack>
    </>
  );
};
